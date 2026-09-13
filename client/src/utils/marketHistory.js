const TIMEFRAME_CONFIG = {
  '24H': { count: 12, unit: 'hours', step: 2 },
  '7D': { count: 7, unit: 'days', step: 1 },
  '1M': { count: 20, unit: 'days', step: 1.5 },
  '3M': { count: 24, unit: 'days', step: 3.75 },
  '1Y': { count: 26, unit: 'weeks', step: 2 },
};

/**
 * Generates financial-grade historical and intraday mandi data.
 * Includes modal price, min price, max price, and arrival volume.
 */
export function getHistoricalData(basePrice, period = '1M', trend = 'up') {
  const config = TIMEFRAME_CONFIG[period] || TIMEFRAME_CONFIG['1M'];
  const safePrice = Math.max(100, Number(basePrice) || 2480);
  const today = new Date();
  const direction = trend === 'down' ? -1 : 1;
  const count = config.count;

  // Intraday 24H format: '06:00', '08:00', etc.
  if (period === '24H') {
    const hours = [
      '06:00',
      '07:30',
      '09:00',
      '10:30',
      '12:00',
      '13:30',
      '15:00',
      '16:30',
      '18:00',
      '19:30',
      '21:00',
      'Live',
    ];
    return hours.map((timeLabel, index) => {
      const progress = index / (hours.length - 1);
      const wave = Math.sin(index * 1.3) * (safePrice * 0.025);
      const drift = (progress - 0.5) * (safePrice * 0.04) * direction;
      const pointPrice = Math.round(
        index === hours.length - 1 ? safePrice : safePrice + drift + wave
      );
      const arrival = Math.round(750 + ((index * 149) % 850) + index * 40);
      return {
        date: timeLabel,
        rawDate: timeLabel,
        price: pointPrice,
        min: Math.round(pointPrice * 0.94),
        max: Math.round(pointPrice * 1.06),
        volume: arrival,
        arrival,
      };
    });
  }

  const driftStep = (safePrice * 0.0025 * direction) * (30 / count);
  let currentSimPrice = safePrice - driftStep * (count - 1);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    const daysAgo = Math.round((count - 1 - index) * config.step);
    date.setDate(today.getDate() - daysAgo);

    const wave = Math.sin(index * 0.95 + safePrice % 10) * (safePrice * 0.035);
    currentSimPrice = Math.max(
      safePrice * 0.75,
      currentSimPrice + driftStep + (index % 2 === 0 ? wave * 0.4 : -wave * 0.3)
    );
    const pointPrice = Math.round(
      index === count - 1 ? safePrice : currentSimPrice
    );
    const arrival = Math.round(920 + ((index * 183) % 940) + ((pointPrice % 70) * 8));

    const formattedDate = date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: period === '1Y' ? 'short' : 'short',
      year: period === '1Y' ? '2-digit' : undefined,
    });

    return {
      date: formattedDate,
      rawDate: date.toISOString().split('T')[0],
      price: pointPrice,
      min: Math.round(pointPrice * 0.93),
      max: Math.round(pointPrice * 1.07),
      volume: arrival,
      arrival,
    };
  });
}

