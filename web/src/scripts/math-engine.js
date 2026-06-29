export function usdToCad(usdPrice, cadUsd) {
  return usdPrice / cadUsd;
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
