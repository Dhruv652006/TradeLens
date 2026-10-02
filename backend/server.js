const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());

let yahooFinance;

/*
==========================================================
START SERVER
==========================================================
*/

async function startServer() {
  try {
    /*
    ------------------------------------------------------
    Load yahoo-finance2
    ------------------------------------------------------
    */
    const YahooFinanceModule = await import("yahoo-finance2");

    const YahooFinance = YahooFinanceModule.default;

    yahooFinance = new YahooFinance();

    /*
    ------------------------------------------------------
    MongoDB Connection
    ------------------------------------------------------
    */

    if (process.env.MONGO_URI) {
      try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");
      } catch (error) {
        console.log("MongoDB connection failed:");
        console.log(error.message);
      }
    } else {
      console.log("MONGO_URI not found in .env");
    }

    /*
    ------------------------------------------------------
    ROOT ROUTE
    ------------------------------------------------------
    */

    app.get("/", (req, res) => {
      res.json({
        message: "Stock Market Dashboard Backend is running",
      });
    });

    /*
    ======================================================
    LIVE MARKET DATA
    ======================================================
    */

    app.get("/api/market", async (req, res) => {
      try {
        const symbols = [
          "^NSEI",
          "^BSESN",
          "^NSEBANK",
          "TCS.NS",
          "INFY.NS",
          "HDFCBANK.NS",
          "RELIANCE.NS",
        ];

        const quotes = await yahooFinance.quote(symbols);

        const findQuote = (symbol) => {
          return quotes.find((item) => item.symbol === symbol);
        };

        const nifty = findQuote("^NSEI");
        const sensex = findQuote("^BSESN");
        const bankNifty = findQuote("^NSEBANK");

        const stocks = [
          {
            name: "TCS",
            symbol: "TCS.NS",
            price: findQuote("TCS.NS")?.regularMarketPrice ?? null,
            change:
              findQuote("TCS.NS")?.regularMarketChangePercent ?? null,
            marketState:
              findQuote("TCS.NS")?.marketState ?? "UNKNOWN",
          },

          {
            name: "Infosys",
            symbol: "INFY.NS",
            price: findQuote("INFY.NS")?.regularMarketPrice ?? null,
            change:
              findQuote("INFY.NS")?.regularMarketChangePercent ?? null,
            marketState:
              findQuote("INFY.NS")?.marketState ?? "UNKNOWN",
          },

          {
            name: "HDFC Bank",
            symbol: "HDFCBANK.NS",
            price:
              findQuote("HDFCBANK.NS")?.regularMarketPrice ?? null,
            change:
              findQuote("HDFCBANK.NS")?.regularMarketChangePercent ??
              null,
            marketState:
              findQuote("HDFCBANK.NS")?.marketState ?? "UNKNOWN",
          },

          {
            name: "Reliance",
            symbol: "RELIANCE.NS",
            price:
              findQuote("RELIANCE.NS")?.regularMarketPrice ?? null,
            change:
              findQuote("RELIANCE.NS")
                ?.regularMarketChangePercent ?? null,
            marketState:
              findQuote("RELIANCE.NS")?.marketState ?? "UNKNOWN",
          },
        ];

        res.json({
          success: true,

          indices: {
            nifty: {
              name: "NIFTY 50",
              symbol: "^NSEI",
              price: nifty?.regularMarketPrice ?? null,
              change: nifty?.regularMarketChangePercent ?? null,
              marketState: nifty?.marketState ?? "UNKNOWN",
              previousClose:
                nifty?.regularMarketPreviousClose ?? null,
            },

            sensex: {
              name: "SENSEX",
              symbol: "^BSESN",
              price: sensex?.regularMarketPrice ?? null,
              change:
                sensex?.regularMarketChangePercent ?? null,
              marketState:
                sensex?.marketState ?? "UNKNOWN",
              previousClose:
                sensex?.regularMarketPreviousClose ?? null,
            },

            bankNifty: {
              name: "BANK NIFTY",
              symbol: "^NSEBANK",
              price:
                bankNifty?.regularMarketPrice ?? null,
              change:
                bankNifty?.regularMarketChangePercent ?? null,
              marketState:
                bankNifty?.marketState ?? "UNKNOWN",
              previousClose:
                bankNifty?.regularMarketPreviousClose ?? null,
            },
          },

          stocks,
        });
      } catch (error) {
        console.error("Market API error:", error);

        res.status(500).json({
          success: false,
          message: "Unable to fetch market data",
          error: error.message,
        });
      }
    });

    /*
    ======================================================
    STOCKS ONLY
    ======================================================
    */

    app.get("/api/stocks", async (req, res) => {
      try {
        const symbols = [
          "TCS.NS",
          "INFY.NS",
          "HDFCBANK.NS",
          "RELIANCE.NS",
        ];

        const quotes = await yahooFinance.quote(symbols);

        const stockNameMap = {
          "TCS.NS": "TCS",
          "INFY.NS": "Infosys",
          "HDFCBANK.NS": "HDFC Bank",
          "RELIANCE.NS": "Reliance",
        };

        const stocks = quotes.map((quote) => ({
          name: stockNameMap[quote.symbol] || quote.symbol,

          symbol: quote.symbol,

          price: quote.regularMarketPrice ?? null,

          change:
            quote.regularMarketChangePercent ?? null,

          marketState:
            quote.marketState ?? "UNKNOWN",
        }));

        res.json(stocks);
      } catch (error) {
        console.error("Stocks API error:", error);

        res.status(500).json({
          success: false,
          message: "Unable to fetch stock data",
          error: error.message,
        });
      }
    });

    /*
    ======================================================
    NIFTY 50 INTRADAY CHART
    ======================================================
    */

    app.get("/api/nifty/history", async (req, res) => {
      try {
        const now = new Date();

        const oneDayAgo = new Date(
          now.getTime() - 24 * 60 * 60 * 1000
        );

        const result = await yahooFinance.chart("^NSEI", {
          period1: oneDayAgo,
          period2: now,
          interval: "5m",
        });

        const chartData = result.quotes
          .filter(
            (item) =>
              item.close !== null &&
              item.close !== undefined
          )
          .map((item) => ({
            time: new Date(item.date).toLocaleTimeString(
              "en-IN",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            ),

            value: Number(item.close.toFixed(2)),
          }));

        res.json({
          success: true,
          data: chartData,
        });
      } catch (error) {
        console.error("NIFTY history error:", error);

        res.status(500).json({
          success: false,
          message: "Unable to fetch NIFTY chart data",
          error: error.message,
        });
      }
    });

    /*
    ======================================================
    SERVER START
    ======================================================
    */

    app.listen(PORT, () => {
      console.log(
        `Backend running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Server startup error:");
    console.error(error);
  }
}

startServer();