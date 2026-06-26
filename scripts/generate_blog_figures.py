from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "web" / "public" / "images"
DATASETS = {
    "5yr": ROOT / "web" / "public" / "data" / "shop_pairs_data_5yr.csv",
    "2yr": ROOT / "web" / "public" / "data" / "shop_pairs_data_2yr.csv",
}


def load_data(path):
    df = pd.read_csv(path, parse_dates=["date"])
    df = df.dropna(subset=["cad_usd_close", "shop_close", "shop_to_close"])
    df["shop_cad"] = df["shop_close"] / df["cad_usd_close"]
    df["log_shop_cad"] = np.log(df["shop_cad"])
    df["log_shop_to"] = np.log(df["shop_to_close"])
    return df


def save_price_overlay(df, label):
    fig, ax = plt.subplots(figsize=(9, 4.5))
    ax.plot(df["date"], df["shop_to_close"], label="SHOP.TO")
    ax.plot(df["date"], df["shop_cad"], label="SHOP adjusted to CAD")
    ax.set_title("SHOP.TO vs SHOP Adjusted to CAD")
    ax.set_ylabel("Price (CAD)")
    ax.legend(frameon=False)
    fig.tight_layout()
    fig.savefig(OUT / f"adjusted-price-series-{label}.svg")
    plt.close(fig)


def save_raw_prices(df, label):
    fig, ax = plt.subplots(figsize=(9, 4.5))
    ax.plot(df["date"], df["shop_to_close"], label="SHOP.TO (CAD)")
    ax.plot(df["date"], df["shop_close"], label="SHOP (USD)")
    ax.set_title("Raw SHOP Price Series")
    ax.set_ylabel("Price")
    ax.legend(frameon=False)
    fig.tight_layout()
    fig.savefig(OUT / f"raw-price-series-{label}.svg")
    plt.close(fig)


def save_fx_series(df, label):
    fig, ax = plt.subplots(figsize=(9, 4.5))
    ax.plot(df["date"], df["cad_usd_close"])
    ax.set_title("CAD/USD Exchange Rate")
    ax.set_ylabel("CAD/USD")
    fig.tight_layout()
    fig.savefig(OUT / f"raw-fx-series-{label}.svg")
    plt.close(fig)


def save_log_prices(df, label):
    fig, ax = plt.subplots(figsize=(9, 4.5))
    ax.plot(df["date"], df["log_shop_to"], label="log SHOP.TO")
    ax.plot(df["date"], df["log_shop_cad"], label="log SHOP adjusted to CAD")
    ax.set_title("Log Price Series")
    ax.set_ylabel("Log price")
    ax.legend(frameon=False)
    fig.tight_layout()
    fig.savefig(OUT / f"log-price-series-{label}.svg")
    plt.close(fig)


def save_raw_spread(df, label):
    spread = df["shop_to_close"] - df["shop_cad"]

    fig, ax = plt.subplots(figsize=(9, 4.5))
    ax.plot(df["date"], spread)
    ax.axhline(0, color="black", linewidth=0.8)
    ax.set_title("Full-Sample OLS Regression Raw Price Spread")
    ax.set_ylabel("SHOP.TO - SHOP adjusted to CAD")
    fig.tight_layout()
    fig.savefig(OUT / f"raw-spread-series-{label}.svg")
    plt.close(fig)


def save_model_spread(df, label):
    gamma, mu = np.polyfit(df["log_shop_cad"], df["log_shop_to"], 1)
    spread = df["log_shop_to"] - gamma * df["log_shop_cad"] - mu

    fig, ax = plt.subplots(figsize=(9, 4.5))
    ax.plot(df["date"], spread)
    ax.axhline(0, color="black", linewidth=0.8)
    ax.set_title("Full-Sample OLS Regression Log Spread")
    ax.set_ylabel("Residual")
    fig.tight_layout()
    fig.savefig(OUT / f"model-spread-series-{label}.svg")
    plt.close(fig)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for label, path in DATASETS.items():
        df = load_data(path)
        save_raw_prices(df, label)
        save_fx_series(df, label)
        save_price_overlay(df, label)
        save_raw_spread(df, label)
        save_log_prices(df, label)
        save_model_spread(df, label)


if __name__ == "__main__":
    main()
