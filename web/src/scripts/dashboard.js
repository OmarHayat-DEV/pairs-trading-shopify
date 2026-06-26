import Plotly from "plotly.js-dist-min";

const GROSS = 1000;
const DATA_URL = `${baseUrl()}data/shop_pairs_data_2yr.csv`;

const els = {
  lookback: document.querySelector("#lookback"),
  entry: document.querySelector("#entry-z"),
  exit: document.querySelector("#exit-z"),
  lookbackValue: document.querySelector("#lookback-value"),
  entryValue: document.querySelector("#entry-value"),
  exitValue: document.querySelector("#exit-value"),
  error: document.querySelector("#dashboard-error"),
  price: document.querySelector("#price-chart"),
  pnl: document.querySelector("#pnl-chart"),
};

let rows = [];

function baseUrl() {
  const base = import.meta.env.BASE_URL;
  return base.endsWith("/") ? base : `${base}/`;
}

function parseCsv(text) {
  return text
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [date, fx, shop, shopTo] = line.split(",");
      return {
        date,
        fx: Number(fx),
        shop: Number(shop),
        shopTo: Number(shopTo),
      };
    })
    .filter((d) => d.fx > 0 && d.shop > 0 && d.shopTo > 0)
    .map((d) => ({
      ...d,
      shopCad: d.shop / d.fx,
      logShopCad: Math.log(d.shop / d.fx),
      logShopTo: Math.log(d.shopTo),
    }));
}

function ols(window) {
  const n = window.length;
  const xMean = sum(window, "logShopCad") / n;
  const yMean = sum(window, "logShopTo") / n;
  let cov = 0;
  let variance = 0;

  for (const row of window) {
    const dx = row.logShopCad - xMean;
    cov += dx * (row.logShopTo - yMean);
    variance += dx * dx;
  }

  const gamma = variance === 0 ? 0 : cov / variance;
  return { gamma, mu: yMean - gamma * xMean };
}

function sum(values, key) {
  return values.reduce((total, row) => total + row[key], 0);
}

function mean(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function stdev(values, valueMean) {
  const variance = values.reduce((total, value) => total + (value - valueMean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function spread(row, fit) {
  return row.logShopTo - fit.gamma * row.logShopCad - fit.mu;
}

function simulate({ lookback, entryZ, exitZ }) {
  const dates = rows.map((row) => row.date);
  const cumulativePnl = Array(rows.length).fill(0);
  const longEntries = [];
  const shortEntries = [];
  const exits = [];
  let pnl = 0;
  let position = null;

  for (let i = lookback; i < rows.length; i += 1) {
    const row = rows[i];
    const prev = rows[i - 1];

    if (position) {
      pnl += position.qtyA * (row.shopTo - prev.shopTo) + position.qtyB * (row.shopCad - prev.shopCad);
    }

    const window = rows.slice(i - lookback, i);
    const fit = ols(window);
    const history = window.map((item) => spread(item, fit));
    const historyMean = mean(history);
    const historyStdev = stdev(history, historyMean);
    const z = historyStdev === 0 ? 0 : (spread(row, fit) - historyMean) / historyStdev;

    if (position && Math.abs(z) <= exitZ) {
      exits.push(marker(row));
      position = null;
    } else if (!position && z <= -entryZ) {
      position = enter(row, 1);
      longEntries.push(marker(row));
    } else if (!position && z >= entryZ) {
      position = enter(row, -1);
      shortEntries.push(marker(row));
    }

    cumulativePnl[i] = pnl;
  }

  for (let i = 1; i < cumulativePnl.length; i += 1) {
    if (cumulativePnl[i] === 0 && i < lookback) continue;
    if (cumulativePnl[i] === 0) cumulativePnl[i] = cumulativePnl[i - 1];
  }

  return { dates, cumulativePnl, longEntries, shortEntries, exits };
}

function enter(row, direction) {
  const leg = GROSS / 2;
  return {
    qtyA: direction * (leg / row.shopTo),
    qtyB: -direction * (leg / row.shopCad),
  };
}

function marker(row) {
  return { date: row.date, y: row.shopTo };
}

function draw() {
  const lookback = Number(els.lookback.value);
  const entryZ = Number(els.entry.value);
  const exitZ = Number(els.exit.value);
  const result = simulate({ lookback, entryZ, exitZ });

  els.lookbackValue.value = lookback;
  els.entryValue.value = entryZ.toFixed(1);
  els.exitValue.value = exitZ.toFixed(1);

  Plotly.react(
    els.price,
    [
      line("SHOP.TO (CAD)", rows.map((row) => row.date), rows.map((row) => row.shopTo)),
      line("SHOP (USD)", rows.map((row) => row.date), rows.map((row) => row.shop)),
      dots("Enter long", result.longEntries, "#15803d"),
      dots("Enter short", result.shortEntries, "#b91c1c"),
      dots("Exit", result.exits, "#111111"),
    ],
    layout("Raw Price Series", "Price in original currency")
  );

  Plotly.react(
    els.pnl,
    [line("Cumulative PnL", result.dates, result.cumulativePnl)],
    layout("Cumulative PnL", "CAD")
  );
}

function line(name, x, y) {
  return { name, x, y, type: "scatter", mode: "lines" };
}

function dots(name, points, color) {
  return {
    name,
    x: points.map((point) => point.date),
    y: points.map((point) => point.y),
    type: "scatter",
    mode: "markers",
    marker: { color, size: 9 },
  };
}

function layout(title, yTitle) {
  return {
    title,
    paper_bgcolor: "#fffdf7",
    plot_bgcolor: "#fffdf7",
    margin: { t: 48, r: 24, b: 48, l: 56 },
    legend: { orientation: "h" },
    xaxis: { gridcolor: "#eee6d8" },
    yaxis: { title: yTitle, gridcolor: "#eee6d8" },
  };
}

async function main() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Failed to load ${DATA_URL}`);
    rows = parseCsv(await response.text());
    draw();
    [els.lookback, els.entry, els.exit].forEach((input) => input.addEventListener("input", draw));
  } catch (error) {
    els.error.hidden = false;
    els.error.textContent = error.message;
  }
}

main();
