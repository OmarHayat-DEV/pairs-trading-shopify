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
  band: document.querySelector("#band-chart"),
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
  const longSpreadEntries = [];
  const shortSpreadEntries = [];
  const exits = [];
  const bands = {
    dates: Array(rows.length).fill(null),
    entryUpper: Array(rows.length).fill(null),
    entryLower: Array(rows.length).fill(null),
    exitUpper: Array(rows.length).fill(null),
    exitLower: Array(rows.length).fill(null),
  };
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
    const center = fit.gamma * row.logShopCad + fit.mu + historyMean;

    bands.dates[i] = row.date;
    bands.entryUpper[i] = Math.exp(center + entryZ * historyStdev);
    bands.entryLower[i] = Math.exp(center - entryZ * historyStdev);
    bands.exitUpper[i] = Math.exp(center + exitZ * historyStdev);
    bands.exitLower[i] = Math.exp(center - exitZ * historyStdev);

    if (position && Math.abs(z) <= exitZ) {
      exits.push(marker(row));
      position = null;
    } else if (!position && z <= -entryZ) {
      position = enter(row, 1);
      longSpreadEntries.push(marker(row));
    } else if (!position && z >= entryZ) {
      position = enter(row, -1);
      shortSpreadEntries.push(marker(row));
    }

    cumulativePnl[i] = pnl;
  }

  for (let i = 1; i < cumulativePnl.length; i += 1) {
    if (cumulativePnl[i] === 0 && i < lookback) continue;
    if (cumulativePnl[i] === 0) cumulativePnl[i] = cumulativePnl[i - 1];
  }

  return { dates, cumulativePnl, longSpreadEntries, shortSpreadEntries, exits, bands };
}

function enter(row, direction) {
  const leg = GROSS / 2;
  return {
    qtyA: direction * (leg / row.shopTo),
    qtyB: -direction * (leg / row.shopCad),
  };
}

function marker(row) {
  return { date: row.date, shop: row.shop, shopCad: row.shopCad, shopTo: row.shopTo };
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
    els.band,
    [
      line("SHOP.TO (CAD)", rows.map((row) => row.date), rows.map((row) => row.shopTo)),
      line("SHOP adjusted to CAD", rows.map((row) => row.date), rows.map((row) => row.shopCad)),
      bandLine("Entry upper", result.bands.dates, result.bands.entryUpper, "dash", "#666666"),
      bandLine("Entry lower", result.bands.dates, result.bands.entryLower, "dash", "#666666"),
      bandLine("Exit upper", result.bands.dates, result.bands.exitUpper, "dot", "#aaaaaa"),
      bandLine("Exit lower", result.bands.dates, result.bands.exitLower, "dot", "#aaaaaa"),
      dots("Long SHOP.TO", result.longSpreadEntries, "shopTo", "#15803d", false),
      dots("Short SHOP adjusted to CAD", result.longSpreadEntries, "shopCad", "#b91c1c", false),
      dots("Short SHOP.TO", result.shortSpreadEntries, "shopTo", "#b91c1c", false),
      dots("Long SHOP adjusted to CAD", result.shortSpreadEntries, "shopCad", "#15803d", false),
      dots("Exit SHOP.TO", result.exits, "shopTo", "#111111", false),
      dots("Exit SHOP adjusted to CAD", result.exits, "shopCad", "#111111", false),
      legendDot("Long", "#15803d"),
      legendDot("Short", "#b91c1c"),
      legendDot("Exit", "#111111"),
    ],
    layout("SHOP.TO Signal Bands", "Price (CAD)")
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

function bandLine(name, x, y, dash, color) {
  return {
    name,
    x,
    y,
    type: "scatter",
    mode: "lines",
    line: { color, dash, width: 1.5 },
  };
}

function dots(name, points, key, color, showlegend = true) {
  return {
    name,
    x: points.map((point) => point.date),
    y: points.map((point) => point[key]),
    type: "scatter",
    mode: "markers",
    marker: { color, size: 9 },
    showlegend,
  };
}

function legendDot(name, color) {
  return {
    name,
    x: [null],
    y: [null],
    type: "scatter",
    mode: "markers",
    marker: { color, size: 9 },
    showlegend: true,
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
