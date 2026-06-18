from pathlib import Path

import yfinance as yf


OUT_DIR = Path("data")
OUT_FILE = OUT_DIR / "shop_pairs_data.csv"
TICKERS = {
    "SHOP.TO": "shop_to_close",
    "SHOP": "shop_close",
    "CADUSD=X": "cad_usd_close",
}


def main():
    data = yf.download(
        list(TICKERS),
        period="5y",
        interval="1d",
        auto_adjust=False,
        progress=False,
        threads=False,
        timeout=30,
    )

    closes = data["Close"].rename(columns=TICKERS)
    if closes.empty:
        raise RuntimeError("No close data returned from yfinance.")

    closes.index.name = "date"

    OUT_DIR.mkdir(exist_ok=True)
    closes.to_csv(OUT_FILE)

    print(f"Saved {len(closes)} rows to {OUT_FILE}")


if __name__ == "__main__":
    main()
