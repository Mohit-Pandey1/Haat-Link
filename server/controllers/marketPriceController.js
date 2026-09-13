// ── Constants ──────────────────────────────────────────────────
const DATA_GOV_BASE_URL = 'https://api.data.gov.in/resource';
const DATA_GOV_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 500;
const REQUEST_TIMEOUT_MS = 15000;

// ── Helpers ────────────────────────────────────────────────────

/**
 * Normalise a single government API record into the HaatLink format.
 * snake_case → camelCase for date/price fields; others pass through unchanged.
 */
function normaliseRecord(record) {
  return {
    state: record.state ?? null,
    district: record.district ?? null,
    market: record.market ?? null,
    commodity: record.commodity ?? null,
    variety: record.variety ?? null,
    grade: record.grade ?? null,
    arrivalDate: record.arrival_date ?? null,
    minPrice: record.min_price != null ? Number(record.min_price) : null,
    maxPrice: record.max_price != null ? Number(record.max_price) : null,
    modalPrice: record.modal_price != null ? Number(record.modal_price) : null,
  };
}

/**
 * Validate and parse an integer query param.
 * Returns { value, error } — error is a string if invalid.
 */
function parsePositiveInt(raw, name, defaultValue, max = null) {
  if (raw === undefined || raw === null || raw === '') {
    return { value: defaultValue, error: null };
  }

  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return { value: null, error: `${name} must be a non-negative integer.` };
  }

  if (name === 'limit' && parsed === 0) {
    return { value: null, error: `${name} must be greater than 0.` };
  }

  if (max !== null && parsed > max) {
    return { value: null, error: `${name} must not exceed ${max}.` };
  }

  return { value: parsed, error: null };
}

// ── Controller ─────────────────────────────────────────────────

/**
 * GET /api/market-prices
 *
 * Secure proxy to the Government of India data.gov.in mandi price API.
 * Scope is always locked to Maharashtra — the client cannot override this.
 *
 * Required query params : region (district), crop (commodity)
 * Optional query params : mandi (market), limit, offset
 */
export async function getMarketPrices(req, res) {
  // 1. Check API key availability
  const apiKey = process.env.DATA_GOV_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      success: false,
      message: 'Market price service is not configured. DATA_GOV_API_KEY is missing.',
    });
  }

  // 2. Extract and validate client-supplied filter params.
  //    'state' is intentionally ignored — Maharashtra is always enforced server-side.
  const region = (req.query.region || '').trim() || null;
  const crop = (req.query.crop || '').trim() || null;
  const mandi = (req.query.mandi || '').trim() || null;

  // 3. Require region and crop — do not silently fetch all Maharashtra data.
  if (!region || !crop) {
    return res.status(400).json({
      success: false,
      message: 'region and crop are required',
    });
  }

  // 4. Validate limit and offset
  const limitResult = parsePositiveInt(req.query.limit, 'limit', DEFAULT_LIMIT, MAX_LIMIT);
  if (limitResult.error) {
    return res.status(400).json({ success: false, message: limitResult.error });
  }

  const offsetResult = parsePositiveInt(req.query.offset, 'offset', 0, null);
  if (offsetResult.error) {
    return res.status(400).json({ success: false, message: offsetResult.error });
  }

  const limit = limitResult.value;
  const offset = offsetResult.value;

  // 5. Build data.gov.in URL.
  //    state.keyword is always Maharashtra — the client cannot change this.
  const params = new URLSearchParams();
  params.set('api-key', apiKey);
  params.set('format', 'json');
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  params.set('filters[state.keyword]', 'Maharashtra');
  params.set('filters[district]', region);
  params.set('filters[commodity]', crop);
  if (mandi) params.set('filters[market]', mandi);

  const govUrl = `${DATA_GOV_BASE_URL}/${DATA_GOV_RESOURCE_ID}?${params.toString()}`;

  // 5. Fetch from data.gov.in with a timeout
  let govResponse;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    govResponse = await fetch(govUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
  } catch (fetchErr) {
    if (fetchErr.name === 'AbortError') {
      console.error('[marketPriceController] Government API timed out.');
      return res.status(504).json({
        success: false,
        message: 'The government mandi price service did not respond in time. Please try again.',
      });
    }

    console.error('[marketPriceController] Network error reaching government API:', fetchErr.message);
    return res.status(502).json({
      success: false,
      message: 'Unable to reach the government mandi price service. Please try again later.',
    });
  }

  // 6. Check HTTP status from government API
  if (!govResponse.ok) {
    console.error(
      `[marketPriceController] Government API returned HTTP ${govResponse.status}.`
    );
    return res.status(502).json({
      success: false,
      message: `Government mandi price service returned an error (HTTP ${govResponse.status}).`,
    });
  }

  // 7. Parse the JSON body
  let govData;
  try {
    govData = await govResponse.json();
  } catch (parseErr) {
    console.error('[marketPriceController] Failed to parse government API response:', parseErr.message);
    return res.status(502).json({
      success: false,
      message: 'Received an unexpected response from the government mandi price service.',
    });
  }

  // 8. Validate the response shape
  if (!govData || !Array.isArray(govData.records)) {
    console.error('[marketPriceController] Unexpected government API response shape:', JSON.stringify(govData).slice(0, 200));
    return res.status(502).json({
      success: false,
      message: 'Government mandi price service returned data in an unexpected format.',
    });
  }

  // 9. Normalise records
  const records = govData.records.map(normaliseRecord);

  // 10. Return clean HaatLink response
  return res.json({
    success: true,
    source: 'data.gov.in',
    count: records.length,
    total: govData.total != null ? Number(govData.total) : null,
    limit,
    offset,
    records,
  });
}
