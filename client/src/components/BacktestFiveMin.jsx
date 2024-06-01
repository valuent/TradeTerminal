import React from "react";
import { DataContext } from "../utils/DataContext";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { db } from "../utils/config";
import {
  doc,
  updateDoc,
  setDoc,
  onSnapshot,
  deleteDoc,
  deleteField,
  documentId,
} from "firebase/firestore";

function BacktestFiveMin() {
  const {
    expiries,
    niftyOptChainData,
    bnfOptChainData,
    fnfOptChainData,
    socket,
    tickerData,
    niftyFutData,
    bnfFutData,
    fnfFutData,
    niftySpotData,
    bnfSpotData,
    fnfSpotData,
    isSuccess,
  } = useContext(DataContext);

  // const [tokens, setTokens] = useState([256265, 260105]);
  const [tokens, setTokens] = useState([260105]);

  const btResults = [];

  const [data, setData] = useState([]);

  const fetchSaveData = async () => {
    setData([]);
    tokens.forEach(async (token) => {
      let toDate = new Date();
      let fromDate = new Date(new Date().getTime() - 100 * 24 * 60 * 60 * 1000);

      let loopCount = 2;
      let dataArray = [];
      console.time("save data");
      for (let i = 0; i < loopCount; i++) {
        await axios
          .get(
            `/api/histData?insToken=${token}&interval=${"5minute"}&fromDate=${
              fromDate.toISOString().split("T")[0]
            }&toDate=${toDate.toISOString().split("T")[0]}`
          )
          .then((response) => {
            let data = response.data;

            data.forEach((candle) => {
              candle.date = new Date(
                new Date(candle.date).toLocaleString(undefined, {
                  timeZone: "Asia/Kolkata",
                })
              );
              dataArray.push(candle);
            });
          });

        toDate = new Date(fromDate.getTime() - 1 * 24 * 60 * 60 * 1000);

        fromDate = new Date(fromDate.getTime() - 100 * 24 * 60 * 60 * 1000);
      }
      console.timeEnd("save data");

      let sortedDataArray = dataArray.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      setData((data) => [...data, sortedDataArray]);
    });
  };

  const backtest = () => {
    console.time("backtest");
    data?.forEach((instData) => {
      let arrayForSma = [];
      let sma10 = 0;
      let sma20 = 0;

      let above20SmaHigh = 0;
      let retracementCandleCountLong = 0;

      let longPosition = false;
      let longEntryPrice = 0;
      let longExitPrice = 0;

      let tradeCounter = 0;

      let trades = [];
      instData?.forEach((candle) => {
        arrayForSma.push(candle.close);
        let sma10Total = arrayForSma
          .slice(-10)
          .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        let sma20Total = arrayForSma
          .slice(-20)
          .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        sma10 = sma10Total / 10;
        sma20 = sma20Total / 20;

        let candleHour = new Date(candle.date).getHours();

        let slPoints = -85;
        let tgtPoitns = 177;

        let tradeKey = "trade_" + tradeCounter;

        if (candleHour >= 9 && candleHour <= 15) {
          if (
            longPosition === true &&
            candle.high - longEntryPrice > -slPoints
          ) {
            slPoints = slPoints / 2;
          }

          if (
            longPosition === true &&
            candle.high - longEntryPrice > -(slPoints * 1.5)
          ) {
            slPoints = 1;
          }

          if (candle.close < sma20) {
            above20SmaHigh = 0;
            retracementCandleCountLong = 0;
          }

          if (
            longPosition &&
            longEntryPrice > 0 &&
            candle.high - longEntryPrice >= tgtPoitns
          ) {
            trades[tradeCounter] = {
              ...trades[tradeCounter],
              exit: { price: longEntryPrice + tgtPoitns, time: candle.date },
            };
            above20SmaHigh = 0;
            retracementCandleCountLong = 0;
            longPosition = false;
            longEntryPrice = 0;
            longExitPrice = candle.close;
          }
          if (
            longPosition &&
            longEntryPrice > 0 &&
            candle.low - longEntryPrice <= slPoints
          ) {
            trades[tradeCounter] = {
              ...trades[tradeCounter],
              exit: { price: longEntryPrice + slPoints, time: candle.date },
            };
            above20SmaHigh = 0;
            retracementCandleCountLong = 0;
            longPosition = false;
            longEntryPrice = 0;
            longExitPrice = candle.close;
          }

          if (longPosition && candle.close < sma20) {
            above20SmaHigh = 0;
            retracementCandleCountLong = 0;
            longPosition = false;
            longEntryPrice = 0;
            longExitPrice = candle.close;
            trades[tradeCounter] = {
              ...trades[tradeCounter],
              exit: { price: candle.close, time: candle.date },
            };
          }
          if (
            longPosition &&
            candle.close < sma10 &&
            candle.close < longEntryPrice
          ) {
            above20SmaHigh = 0;
            longPosition = false;
            longEntryPrice = 0;
            longExitPrice = candle.close;
            trades[tradeCounter] = {
              ...trades[tradeCounter],
              exit: { price: candle.close, time: candle.date },
            };
          }

          if (longPosition && candleHour == 15) {
            above20SmaHigh = 0;
            retracementCandleCountLong = 0;
            longPosition = false;
            longEntryPrice = 0;
            longExitPrice = candle.close;
            trades[tradeCounter] = {
              ...trades[tradeCounter],
              exit: { price: candle.close, time: candle.date },
            };
          }

          if (
            longPosition === false &&
            above20SmaHigh > 0 &&
            retracementCandleCountLong >= 3 &&
            candle.close > sma20 &&
            candleHour < 15 &&
            candle.close > above20SmaHigh + 5
          ) {
            longPosition = true;
            longEntryPrice = candle.close;
            longExitPrice = 0;
            tradeCounter = tradeCounter + 1;
            trades[tradeCounter] = {
              entry: { price: candle.close, time: candle.date, sma: sma20 },
            };
          } else if (
            longPosition === false &&
            candle.close > sma20 &&
            candle.close > above20SmaHigh &&
            retracementCandleCountLong < 3
          ) {
            retracementCandleCountLong = 0;
            above20SmaHigh = 0;
          }

          if (
            candle.close > above20SmaHigh &&
            longPosition === false &&
            candle.close > sma20
          ) {
            above20SmaHigh = candle.close;
          } else if (
            longPosition === false &&
            candle.close > sma20 &&
            candle.close < above20SmaHigh
          ) {
            retracementCandleCountLong = retracementCandleCountLong + 1;
          }
        }

        if (longPosition) {
          console.log(longEntryPrice, longExitPrice, candle.date, tradeCounter);
        }
      });

      btResults.push({ trades });
    });
    console.log(btResults);
    console.timeEnd("backtest");
  };

  const calculatePoints = () => {
    let pnl = 0;
    let wins = 0;
    let losses = 0;
    let averageWins = 0;
    let averageLosses = 0;
    btResults?.[0]?.trades?.forEach((trade) => {
      let entry = trade.entry.price;
      let exit = trade.exit.price;

      if (exit - entry > 0) {
        wins = wins + 1;
        averageWins = averageWins + (exit - entry);
        // console.log(exit - entry);
      }

      if (exit - entry < 0) {
        losses = losses + 1;
        averageLosses = averageLosses + (exit - entry);
        // console.log(averageLosses);
      }

      // console.log(averageWins, averageLosses);

      pnl = pnl + (exit - entry);
      console.log(pnl);
    });

    console.log(pnl);
    console.log("wins", wins);
    console.log("losses", losses);

    console.log("Avg. wins", averageWins / wins);
    console.log("Avg. losses", averageLosses / losses);
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div id="backtest5Min">
      <p>{JSON.stringify(btResults)}</p>
      <button
        className="btn"
        onClick={() => {
          fetchSaveData();
        }}
      >
        Get Hist Data
      </button>
      <button
        className="btn"
        onClick={() => {
          backtest();
        }}
      >
        Backtest
      </button>
      <button
        className="btn"
        onClick={() => {
          calculatePoints();
        }}
      >
        Backtest
      </button>
    </div>
  );
}

export default BacktestFiveMin;
