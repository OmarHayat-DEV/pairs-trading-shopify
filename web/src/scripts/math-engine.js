export function usdToCad(usdPrice, cadUsd) {
  return usdPrice / cadUsd;
}

export function sum(values, key) {
  return values.reduce((total, value) => total + value[key], 0);
}

export function mean(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function stdev(values, valueMean) {
  const variance = values.reduce((total, value) => total + (value - valueMean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function ols(rows) {
  const n = rows.length;
  const xMean = sum(rows, "logShopCad") / n;
  const yMean = sum(rows, "logShopTo") / n;
  let cov = 0;
  let variance = 0;

  for (const row of rows) {
    const dx = row.logShopCad - xMean;
    cov += dx * (row.logShopTo - yMean);
    variance += dx * dx;
  }

  const gamma = variance === 0 ? 0 : cov / variance;
  return { gamma, mu: yMean - gamma * xMean };
}

export function spread(row, fit) {
  return row.logShopTo - fit.gamma * row.logShopCad - fit.mu;
}

export function positionSize(notional, price) {
  return notional / price;
}

export function enter(row, direction, gross) {
  const leg = gross / 2;
  return {
    qtyA: direction * positionSize(leg, row.shopTo),
    qtyB: -direction * positionSize(leg, row.shopCad),
  };
}

export function legPnl(quantity, entryPrice, exitPrice) {
  return quantity * (exitPrice - entryPrice);
}

export function pairPnl({ cadQuantity, cadEntry, cadExit, usdQuantity, usdEntry, usdExit, entryCadUsd, exitCadUsd }) {
  return (
    legPnl(cadQuantity, cadEntry, cadExit) +
    legPnl(usdQuantity, usdToCad(usdEntry, entryCadUsd), usdToCad(usdExit, exitCadUsd))
  );
}
