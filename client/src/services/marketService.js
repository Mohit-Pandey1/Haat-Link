import { request } from './api.js';

/** Fetch all crop market records. */
export const getMarkets = () => request('/markets');

/** Fetch market data for a specific crop name. */
export const getMarketByCrop = (crop) =>
  request(`/markets/${encodeURIComponent(crop)}`);

/** Fetch location-aware market trends from the v1 analysis API. */
export const getMarketAnalysis = (location) =>
  request('/v1/market/analysis', {
    method: 'POST',
    body: JSON.stringify({ ...location, language: 'en' }),
  });

export const reverseGeocode = async (latitude, longitude) => {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
  );
  if (!response.ok) throw new Error('Reverse geocoding failed.');
  const data = await response.json();
  return {
    state: data.principalSubdivision,
    district: data.locality || data.city,
  };
};
