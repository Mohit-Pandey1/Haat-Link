import Market from '../models/Market.js';
import Buyer from '../models/Buyer.js';

function cleanText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export async function getMarkets(req, res) {
  try {
    const markets = await Market.find().sort({ crop: 1 });
    res.json(markets);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch market data.', error: err.message });
  }
}

export async function getMarketByCrop(req, res) {
  try {
    const { crop } = req.params;
    const market = await Market.findOne({ crop: new RegExp(`^${crop}$`, 'i') });

    if (!market) {
      return res.status(404).json({ message: `No market data found for crop: ${crop}` });
    }

    res.json(market);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch market data.', error: err.message });
  }
}

export async function getMarketAnalysis(req, res) {
  try {
    const state = cleanText(req.body?.state, 'Maharashtra');
    const district = cleanText(req.body?.district, 'Nashik');
    const location = cleanText(req.body?.location, `${district}, ${state}`);
    const [markets, buyers] = await Promise.all([
      Market.find().sort({ crop: 1 }).lean(),
      Buyer.find({ verified: true }).sort({ trust: -1 }).limit(8).lean(),
    ]);

    const sourceMarkets = markets.filter(
      (market) => market?.crop && Number.isFinite(Number(market.average))
    );
    const trendingCrops = sourceMarkets.map((market) => ({
      name: market.crop,
      price: `₹${Number(market.average).toLocaleString('en-IN')}`,
      trend: Number(market.change) >= 0 ? 'up' : 'down',
      demand: cleanText(market.demand, 'Moderate'),
    }));
    const mandis = sourceMarkets
      .flatMap((market) => market.markets || [])
      .filter((mandi) => mandi?.name)
      .reduce((unique, mandi) => {
        if (!unique.some((item) => item.name === mandi.name)) {
          unique.push({
            name: mandi.name,
            distance: cleanText(mandi.distance, 'Nearby'),
            bestFor: sourceMarkets
              .filter((market) => market.markets?.some((item) => item.name === mandi.name))
              .map((market) => market.crop)
              .slice(0, 3)
              .join(', '),
          });
        }
        return unique;
      }, [])
      .slice(0, 8);
    const buyerRecords = buyers.map((buyer) => ({
      name: cleanText(buyer.name, 'Verified buyer'),
      type: buyer.pickup ? 'Wholesaler' : 'Retailer',
      contact: cleanText(buyer.phone, 'Contact through HaatLink'),
      requirements: `${buyer.required || 0} quintals of ${cleanText(buyer.crop, 'fresh produce')}`,
    }));

    res.json({
      trendingCrops,
      mandis,
      buyers: buyerRecords,
      advisory: `In ${location}, compare at least two mandi quotes before selling. ${
        trendingCrops[0]?.name || 'Your strongest crop'
      } is currently showing ${trendingCrops[0]?.trend === 'down' ? 'softening' : 'healthy'} demand.`,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to analyze market data.', error: err.message });
  }
}
