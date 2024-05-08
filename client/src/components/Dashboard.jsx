import React from "react";
import { DataContext } from "../utils/DataContext";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { db } from "../utils/config";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  doc,
  updateDoc,
  setDoc,
  onSnapshot,
  deleteDoc,
  deleteField,
  documentId,
} from "firebase/firestore";

function Dashboard() {
  const [niftyThreeMinLong, setNiftyThreeMinLong] = useState();
  const [niftyThreeMinShort, setNiftyThreeMinShort] = useState();
  const [bnfThreeMinLong, setBnfThreeMinLong] = useState();
  const [bnfThreeMinShort, setBnfThreeMinShort] = useState();

  const [niftyFiveMinLong, setNiftyFiveMinLong] = useState();
  const [niftyFiveMinShort, setNiftyFiveMinShort] = useState();
  const [bnfFiveMinLong, setBnfFiveMinLong] = useState();
  const [bnfFiveMinShort, setBnfFiveMinShort] = useState();

  const [strategy, setStrategy] = useState("");
  const [tableData, setTableData] = useState();
  const [numOfTrades, setNumOfTrades] = useState(0);

  const [onDisplay, setOnDisplay] = useState("table");

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "futThreeMin", "niftyFutLongALLEXEC"),
      (doc) => {
        setNiftyThreeMinLong(doc.data());
      }
    );
    const unsub2 = onSnapshot(
      doc(db, "futThreeMin", "niftyFutShortALLEXEC"),
      (doc) => {
        setNiftyThreeMinShort(doc.data());
      }
    );
    const unsub3 = onSnapshot(
      doc(db, "futThreeMin", "bnfFutLongALLEXEC"),
      (doc) => {
        setBnfThreeMinLong(doc.data());
      }
    );
    const unsub4 = onSnapshot(
      doc(db, "futThreeMin", "bnfFutShortALLEXEC"),
      (doc) => {
        setBnfThreeMinShort(doc.data());
      }
    );
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "futFiveMin", "niftyFutLongALLEXEC"),
      (doc) => {
        setNiftyFiveMinLong(doc.data());
      }
    );
    const unsub2 = onSnapshot(
      doc(db, "futFiveMin", "niftyFutShortALLEXEC"),
      (doc) => {
        setNiftyFiveMinShort(doc.data());
      }
    );
    const unsub3 = onSnapshot(
      doc(db, "futFiveMin", "bnfFutLongALLEXEC"),
      (doc) => {
        setBnfFiveMinLong(doc.data());
      }
    );
    const unsub4 = onSnapshot(
      doc(db, "futFiveMin", "bnfFutShortALLEXEC"),
      (doc) => {
        setBnfFiveMinShort(doc.data());
      }
    );
  }, []);

  const tradesToArray = (data) => {
    let tradeCount = data?.tradeCount;
    let tradesArray = [];

    for (let i = 1; i <= tradeCount; i++) {
      let tradeTag = "trade_" + i;
      if (data?.[tradeTag]?.exit) {
        tradesArray.push(data?.[tradeTag]);
      }
    }
    let sortedArrayTrades = tradesArray.sort(
      (a, b) =>
        new Date(b.entry.entryTime.seconds * 1000) -
        new Date(a.entry.entryTime.seconds * 1000)
    );
    return sortedArrayTrades;
  };

  const mergeArray = (concatedArray) => {
    let sortedArrayTrades = concatedArray.sort(
      (a, b) =>
        new Date(b.entry.entryTime.seconds * 1000) -
        new Date(a.entry.entryTime.seconds * 1000)
    );
    setNumOfTrades(sortedArrayTrades.length);
    return sortedArrayTrades;
  };

  const updateTradeBookLongFiveMin = async (tradeData) => {
    await axios.get(`/api/orderInfo`).then(async (response) => {
      let tradeCountKey = "trade_" + tradeData?.tradeCount;

      let LongCallEntry = response?.data?.filter((order) => {
        return (
          order.order_id ===
            tradeData?.[tradeCountKey]?.entry?.callLong?.order_id &&
          order.status === "COMPLETE"
        );
      });
      let LongPutEntry = response?.data?.filter((order) => {
        return (
          order.order_id ===
            tradeData?.[tradeCountKey]?.entry?.putShort?.order_id &&
          order.status === "COMPLETE"
        );
      });

      let LongCallExit = response?.data?.filter((order) => {
        return (
          order.order_id ===
            tradeData?.[tradeCountKey]?.exit?.callLongExit?.order_id &&
          order.status === "COMPLETE"
        );
      });
      let LongPutExit = response?.data?.filter((order) => {
        return (
          order.order_id ===
            tradeData?.[tradeCountKey]?.exit?.putShortExit?.order_id &&
          order.status === "COMPLETE"
        );
      });

      let indexData;
      if (tradeData?.[tradeCountKey]?.entry?.index === "NIFTY") {
        indexData = "niftyFutLongALLEXEC";
      } else if (tradeData?.[tradeCountKey]?.entry?.index === "BANKNIFTY") {
        indexData = "bnfFutLongALLEXEC";
      }
      if (
        LongCallEntry.length > 0 &&
        LongPutEntry.length > 0 &&
        LongCallExit?.length > 0 &&
        LongPutExit?.length > 0
      ) {
        await setDoc(
          doc(db, "futFiveMin", indexData),
          {
            [tradeCountKey]: {
              entry: {
                callLong: {
                  average_price: LongCallEntry?.[0]?.average_price,
                },
                putShort: {
                  average_price: LongPutEntry?.[0]?.average_price,
                },
              },
              exit: {
                callLongExit: {
                  average_price: LongCallExit?.[0]?.average_price,
                },
                putShortExit: {
                  average_price: LongPutExit?.[0]?.average_price,
                },
              },
            },
          },
          { merge: true }
        );
      }
    });
  };

  const updateTradeBookShortFiveMin = async (tradeData) => {
    await axios.get(`/api/orderInfo`).then(async (response) => {
      let tradeCountKey = "trade_" + tradeData?.tradeCount;
      let ShortCallEntry = response?.data?.filter((order) => {
        return (
          order.order_id ===
            tradeData?.[tradeCountKey]?.entry?.callShort?.order_id &&
          order.status === "COMPLETE"
        );
      });
      let ShortPutEntry = response?.data?.filter((order) => {
        return (
          order.order_id ===
            tradeData?.[tradeCountKey]?.entry?.putLong?.order_id &&
          order.status === "COMPLETE"
        );
      });

      let ShortCallExit = response?.data?.filter((order) => {
        return (
          order.order_id ===
            tradeData?.[tradeCountKey]?.exit?.callShortExit?.order_id &&
          order.status === "COMPLETE"
        );
      });
      let ShortPutExit = response?.data?.filter((order) => {
        return (
          order.order_id ===
            tradeData?.[tradeCountKey]?.exit?.putLongExit?.order_id &&
          order.status === "COMPLETE"
        );
      });

      let indexData;
      if (tradeData?.[tradeCountKey]?.entry?.index === "NIFTY") {
        indexData = "niftyFutShortALLEXEC";
      } else if (tradeData?.[tradeCountKey]?.entry?.index === "BANKNIFTY") {
        indexData = "bnfFutShortALLEXEC";
      }

      if (
        ShortCallEntry.length > 0 &&
        ShortPutEntry.length > 0 &&
        ShortCallExit?.length > 0 &&
        ShortPutExit?.length > 0
      ) {
        await setDoc(
          doc(db, "futFiveMin", indexData),
          {
            [tradeCountKey]: {
              entry: {
                callShort: {
                  average_price: ShortCallEntry?.[0]?.average_price,
                },
                putLong: {
                  average_price: ShortPutEntry?.[0]?.average_price,
                },
              },
              exit: {
                callShortExit: {
                  average_price: ShortCallExit?.[0]?.average_price,
                },
                putLongExit: {
                  average_price: ShortPutExit?.[0]?.average_price,
                },
              },
            },
          },
          { merge: true }
        );
      }
    });
  };

  const updateTradeBookLongThreeMin = async (tradeData) => {
    await axios.get(`/api/orderInfo`).then(async (response) => {
      let tradeCountKey = "trade_" + tradeData?.tradeCount;

      let LongCallEntry = response?.data?.filter((order) => {
        return (
          order.order_id ===
            tradeData?.[tradeCountKey]?.entry?.callLong?.order_id &&
          order.status === "COMPLETE"
        );
      });
      let LongPutEntry = response?.data?.filter((order) => {
        return (
          order.order_id ===
            tradeData?.[tradeCountKey]?.entry?.putShort?.order_id &&
          order.status === "COMPLETE"
        );
      });

      let LongCallExit = response?.data?.filter((order) => {
        return (
          order.order_id ===
            tradeData?.[tradeCountKey]?.exit?.callLongExit?.order_id &&
          order.status === "COMPLETE"
        );
      });
      let LongPutExit = response?.data?.filter((order) => {
        return (
          order.order_id ===
            tradeData?.[tradeCountKey]?.exit?.putShortExit?.order_id &&
          order.status === "COMPLETE"
        );
      });

      let indexData;
      if (tradeData?.[tradeCountKey]?.entry?.index === "NIFTY") {
        indexData = "niftyFutLongALLEXEC";
      } else if (tradeData?.[tradeCountKey]?.entry?.index === "BANKNIFTY") {
        indexData = "bnfFutLongALLEXEC";
      }

      if (
        LongCallEntry.length > 0 &&
        LongPutEntry.length > 0 &&
        LongCallExit?.length > 0 &&
        LongPutExit?.length > 0
      ) {
        await setDoc(
          doc(db, "futThreeMin", indexData),
          {
            [tradeCountKey]: {
              entry: {
                callLong: {
                  average_price: LongCallEntry?.[0]?.average_price,
                },
                putShort: {
                  average_price: LongPutEntry?.[0]?.average_price,
                },
              },
              exit: {
                callLongExit: {
                  average_price: LongCallExit?.[0]?.average_price,
                },
                putShortExit: {
                  average_price: LongPutExit?.[0]?.average_price,
                },
              },
            },
          },
          { merge: true }
        );
      }
    });
  };

  const updateTradeBookShortThreeMin = async (tradeData) => {
    await axios.get(`/api/orderInfo`).then(async (response) => {
      let tradeCountKey = "trade_" + tradeData?.tradeCount;
      let ShortCallEntry = response?.data?.filter((order) => {
        return (
          order.order_id ===
            tradeData?.[tradeCountKey]?.entry?.callShort?.order_id &&
          order.status === "COMPLETE"
        );
      });
      let ShortPutEntry = response?.data?.filter((order) => {
        return (
          order.order_id ===
            tradeData?.[tradeCountKey]?.entry?.putLong?.order_id &&
          order.status === "COMPLETE"
        );
      });

      let ShortCallExit = response?.data?.filter((order) => {
        return (
          order.order_id ===
            tradeData?.[tradeCountKey]?.exit?.callShortExit?.order_id &&
          order.status === "COMPLETE"
        );
      });
      let ShortPutExit = response?.data?.filter((order) => {
        return (
          order.order_id ===
            tradeData?.[tradeCountKey]?.exit?.putLongExit?.order_id &&
          order.status === "COMPLETE"
        );
      });

      let indexData;
      if (tradeData?.[tradeCountKey]?.entry?.index === "NIFTY") {
        indexData = "niftyFutShortALLEXEC";
      } else if (tradeData?.[tradeCountKey]?.entry?.index === "BANKNIFTY") {
        indexData = "bnfFutShortALLEXEC";
      }

      if (
        ShortCallEntry.length > 0 &&
        ShortPutEntry.length > 0 &&
        ShortCallExit?.length > 0 &&
        ShortPutExit?.length > 0
      ) {
        await setDoc(
          doc(db, "futThreeMin", indexData),
          {
            [tradeCountKey]: {
              entry: {
                callShort: {
                  average_price: ShortCallEntry?.[0]?.average_price,
                },
                putLong: {
                  average_price: ShortPutEntry?.[0]?.average_price,
                },
              },
              exit: {
                callShortExit: {
                  average_price: ShortCallExit?.[0]?.average_price,
                },
                putLongExit: {
                  average_price: ShortPutExit?.[0]?.average_price,
                },
              },
            },
          },
          { merge: true }
        );
      }
    });
  };

  useEffect(() => {
    updateTradeBookLongFiveMin(niftyFiveMinLong);
  }, [niftyFiveMinLong]);
  useEffect(() => {
    updateTradeBookShortFiveMin(niftyFiveMinShort);
  }, [niftyFiveMinShort]);
  useEffect(() => {
    updateTradeBookLongThreeMin(niftyThreeMinLong);
  }, [niftyThreeMinLong]);
  useEffect(() => {
    updateTradeBookShortThreeMin(niftyThreeMinShort);
  }, [niftyThreeMinShort]);
  useEffect(() => {
    updateTradeBookLongFiveMin(bnfFiveMinLong);
  }, [bnfFiveMinLong]);
  useEffect(() => {
    updateTradeBookShortFiveMin(bnfFiveMinShort);
  }, [bnfFiveMinShort]);
  useEffect(() => {
    updateTradeBookLongThreeMin(bnfThreeMinLong);
  }, [bnfThreeMinLong]);
  useEffect(() => {
    updateTradeBookShortThreeMin(bnfThreeMinShort);
  }, [bnfThreeMinShort]);

  const calculateTotalPnl = () => {
    let currentPnl;
    let totalPnl = 0;
    tableData?.forEach((trade) => {
      if (trade?.entry?.putLong) {
        currentPnl =
          (trade?.exit?.putLongExit?.average_price -
            trade?.entry?.putLong?.average_price +
            trade?.entry?.callShort?.average_price -
            trade?.exit?.callShortExit?.average_price) *
          trade?.entry?.qty;
      } else {
        currentPnl = (
          (trade?.exit?.callLongExit?.average_price -
            trade?.entry?.callLong?.average_price +
            trade?.entry?.putShort?.average_price -
            trade?.exit?.putShortExit?.average_price) *
          trade?.entry?.qty
        ).toFixed(2);
      }
      totalPnl = totalPnl + parseFloat(currentPnl);
    });
    return totalPnl;
  };

  const calculateTotalPnlArray = () => {
    console.time("pnlArray");
    let currentPnl;
    let totalPnlArray = [];
    tableData
      ?.slice()
      ?.reverse()
      ?.forEach((trade) => {
        if (trade?.entry?.putLong) {
          currentPnl =
            (trade?.exit?.putLongExit?.average_price -
              trade?.entry?.putLong?.average_price +
              trade?.entry?.callShort?.average_price -
              trade?.exit?.callShortExit?.average_price) *
            trade?.entry?.qty;
        } else {
          currentPnl = (
            (trade?.exit?.callLongExit?.average_price -
              trade?.entry?.callLong?.average_price +
              trade?.entry?.putShort?.average_price -
              trade?.exit?.putShortExit?.average_price) *
            trade?.entry?.qty
          ).toFixed(2);
        }
        if (totalPnlArray.length > 0) {
          totalPnlArray.push(
            parseFloat(currentPnl) +
              parseFloat(totalPnlArray[totalPnlArray?.length - 1])
          );
        } else {
          totalPnlArray.push(parseFloat(currentPnl));
        }
      });

    let chartDataArray = [];
    totalPnlArray?.forEach((cumulative, i) => {
      chartDataArray.push({
        tradeNumber: i,
        pnl: parseFloat(cumulative.toFixed(2)),
      });
    });

    console.timeEnd("pnlArray");
    return chartDataArray;
  };

  const calculateAverageProfit = () => {
    let arrayOfProfits = [];
    tableData?.forEach((trade) => {
      let currentPnl = 0;
      if (trade?.entry?.putLong) {
        currentPnl =
          (trade?.exit?.putLongExit?.average_price -
            trade?.entry?.putLong?.average_price +
            trade?.entry?.callShort?.average_price -
            trade?.exit?.callShortExit?.average_price) *
          trade?.entry?.qty;
      } else {
        currentPnl =
          (trade?.exit?.callLongExit?.average_price -
            trade?.entry?.callLong?.average_price +
            trade?.entry?.putShort?.average_price -
            trade?.exit?.putShortExit?.average_price) *
          trade?.entry?.qty;
      }

      if (currentPnl > 0) {
        arrayOfProfits.push(currentPnl);
      }
    });

    let totalProfits = arrayOfProfits.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
    let averageProfit = totalProfits / arrayOfProfits.length;

    return averageProfit;
  };

  const calculateAverageLoss = () => {
    let arrayOfLosses = [];
    tableData?.forEach((trade) => {
      let currentPnl = 0;
      if (trade?.entry?.putLong) {
        currentPnl =
          (trade?.exit?.putLongExit?.average_price -
            trade?.entry?.putLong?.average_price +
            trade?.entry?.callShort?.average_price -
            trade?.exit?.callShortExit?.average_price) *
          trade?.entry?.qty;
      } else {
        currentPnl =
          (trade?.exit?.callLongExit?.average_price -
            trade?.entry?.callLong?.average_price +
            trade?.entry?.putShort?.average_price -
            trade?.exit?.putShortExit?.average_price) *
          trade?.entry?.qty;
      }

      if (currentPnl < 0) {
        arrayOfLosses.push(currentPnl);
      }
    });

    let totalLosses = arrayOfLosses.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
    let averageLoss = totalLosses / arrayOfLosses.length;

    return averageLoss;
  };

  const calculateEquityHigh = () => {
    let arrayOfPnl = [];
    let cumulativePnl = 0; // Cumulative profit and loss
    let equityHigh = -Infinity; // Start with a very low value to find the maximum
    tableData?.forEach((trade) => {
      let currentPnl = 0;
      if (trade?.entry?.putLong) {
        currentPnl =
          (trade?.exit?.putLongExit?.average_price -
            trade?.entry?.putLong?.average_price +
            trade?.entry?.callShort?.average_price -
            trade?.exit?.callShortExit?.average_price) *
          trade?.entry?.qty;
      } else {
        currentPnl =
          (trade?.exit?.callLongExit?.average_price -
            trade?.entry?.callLong?.average_price +
            trade?.entry?.putShort?.average_price -
            trade?.exit?.putShortExit?.average_price) *
          trade?.entry?.qty;
      }
      arrayOfPnl.push(currentPnl);
    });
    const pnlArray = arrayOfPnl.slice().reverse();
    for (let pnl of pnlArray) {
      cumulativePnl += pnl; // Update the cumulative PnL

      // Update the equity high if the current cumulative PnL is greater than the previous equity high
      if (cumulativePnl > equityHigh) {
        equityHigh = cumulativePnl; // Set the new equity high
      }
    }
    return equityHigh;
  };

  const calculateWinCount = () => {
    let numOfWins = 0;
    tableData?.forEach((trade) => {
      let currentPnl = 0;
      if (trade?.entry?.putLong) {
        currentPnl =
          (trade?.exit?.putLongExit?.average_price -
            trade?.entry?.putLong?.average_price +
            trade?.entry?.callShort?.average_price -
            trade?.exit?.callShortExit?.average_price) *
          trade?.entry?.qty;
      } else {
        currentPnl =
          (trade?.exit?.callLongExit?.average_price -
            trade?.entry?.callLong?.average_price +
            trade?.entry?.putShort?.average_price -
            trade?.exit?.putShortExit?.average_price) *
          trade?.entry?.qty;
      }

      if (currentPnl > 0) {
        numOfWins = numOfWins + 1;
      }
    });

    return numOfWins;
  };

  const calculateLossCount = () => {
    let numOfLoss = 0;
    tableData?.forEach((trade) => {
      let currentPnl = 0;
      if (trade?.entry?.putLong) {
        currentPnl =
          (trade?.exit?.putLongExit?.average_price -
            trade?.entry?.putLong?.average_price +
            trade?.entry?.callShort?.average_price -
            trade?.exit?.callShortExit?.average_price) *
          trade?.entry?.qty;
      } else {
        currentPnl =
          (trade?.exit?.callLongExit?.average_price -
            trade?.entry?.callLong?.average_price +
            trade?.entry?.putShort?.average_price -
            trade?.exit?.putShortExit?.average_price) *
          trade?.entry?.qty;
      }

      if (currentPnl < 0) {
        numOfLoss = numOfLoss + 1;
      }
    });

    return numOfLoss;
  };

  const calculateMaxProfit = () => {
    let maxProfit = 0;
    tableData?.forEach((trade) => {
      let currentPnl = 0;
      if (trade?.entry?.putLong) {
        currentPnl =
          (trade?.exit?.putLongExit?.average_price -
            trade?.entry?.putLong?.average_price +
            trade?.entry?.callShort?.average_price -
            trade?.exit?.callShortExit?.average_price) *
          trade?.entry?.qty;
      } else {
        currentPnl =
          (trade?.exit?.callLongExit?.average_price -
            trade?.entry?.callLong?.average_price +
            trade?.entry?.putShort?.average_price -
            trade?.exit?.putShortExit?.average_price) *
          trade?.entry?.qty;
      }

      if (currentPnl > maxProfit) {
        maxProfit = currentPnl;
      }
    });

    return maxProfit;
  };

  const calculateMaxLoss = () => {
    let maxLoss = 0;
    tableData?.forEach((trade) => {
      let currentPnl = 0;
      if (trade?.entry?.putLong) {
        currentPnl =
          (trade?.exit?.putLongExit?.average_price -
            trade?.entry?.putLong?.average_price +
            trade?.entry?.callShort?.average_price -
            trade?.exit?.callShortExit?.average_price) *
          trade?.entry?.qty;
      } else {
        currentPnl =
          (trade?.exit?.callLongExit?.average_price -
            trade?.entry?.callLong?.average_price +
            trade?.entry?.putShort?.average_price -
            trade?.exit?.putShortExit?.average_price) *
          trade?.entry?.qty;
      }

      if (currentPnl < maxLoss) {
        maxLoss = currentPnl;
      }
    });

    return maxLoss;
  };

  const calculateMaxDD = () => {
    let arrayOfPnl = [];
    let cumulativePnl = 0;
    let equityHigh = 0;
    let equityLow = 0;
    tableData?.forEach((trade) => {
      let currentPnl = 0;
      if (trade?.entry?.putLong) {
        currentPnl =
          (trade?.exit?.putLongExit?.average_price -
            trade?.entry?.putLong?.average_price +
            trade?.entry?.callShort?.average_price -
            trade?.exit?.callShortExit?.average_price) *
          trade?.entry?.qty;
      } else {
        currentPnl =
          (trade?.exit?.callLongExit?.average_price -
            trade?.entry?.callLong?.average_price +
            trade?.entry?.putShort?.average_price -
            trade?.exit?.putShortExit?.average_price) *
          trade?.entry?.qty;
      }
      arrayOfPnl.push(currentPnl);
    });
    const pnlArray = arrayOfPnl.reverse();
    for (let pnl of pnlArray) {
      cumulativePnl += pnl;

      if (cumulativePnl > equityHigh) {
        equityHigh = cumulativePnl;
      }

      if (equityHigh > cumulativePnl && equityLow > cumulativePnl) {
        equityLow = equityHigh - cumulativePnl;
      }
    }
    return -equityLow;
  };

  const calculateExpectancy = () => {
    let expectancy =
      (calculateWinCount() / numOfTrades) *
        (calculateAverageProfit() / -calculateAverageLoss()) -
      (1 - calculateWinCount() / numOfTrades);

    return expectancy;
  };

  const calculateAvgPnlDaily = () => {
    let dates = [];
    tableData?.forEach((trade) => {
      let tempDate = new Date(trade?.entry?.entryTime?.seconds * 1000);
      dates.push(
        tempDate.getDate() +
          "/" +
          tempDate.getMonth() +
          "/" +
          tempDate.getFullYear()
      );
    });
    let setOfDates = new Set(dates);
    setOfDates = Array.from(setOfDates);

    let dailyPnlArray = [];
    setOfDates?.forEach((date) => {
      let cumulativePnl = 0;
      tableData?.forEach((trade) => {
        let tradeDate = new Date(trade?.entry?.entryTime?.seconds * 1000);
        let UniqueTradeDate =
          tradeDate.getDate() +
          "/" +
          tradeDate.getMonth() +
          "/" +
          tradeDate.getFullYear();

        if (UniqueTradeDate === date) {
          if (trade?.entry?.putLong) {
            cumulativePnl =
              cumulativePnl +
              (trade?.exit?.putLongExit?.average_price -
                trade?.entry?.putLong?.average_price +
                trade?.entry?.callShort?.average_price -
                trade?.exit?.callShortExit?.average_price) *
                trade?.entry?.qty;
          } else {
            cumulativePnl =
              cumulativePnl +
              (trade?.exit?.callLongExit?.average_price -
                trade?.entry?.callLong?.average_price +
                trade?.entry?.putShort?.average_price -
                trade?.exit?.putShortExit?.average_price) *
                trade?.entry?.qty;
          }
        }
      });
      dailyPnlArray.push(cumulativePnl);
    });

    let averageDailyPnlData = dailyPnlArray.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
    averageDailyPnlData = averageDailyPnlData / dailyPnlArray.length;

    return {
      averageDailyPnlData: averageDailyPnlData,
      dayCount: dailyPnlArray.length,
    };
  };

  const calculateAvgProfitDaily = () => {
    let dates = [];
    tableData?.forEach((trade) => {
      let tempDate = new Date(trade?.entry?.entryTime?.seconds * 1000);
      dates.push(
        tempDate.getDate() +
          "/" +
          tempDate.getMonth() +
          "/" +
          tempDate.getFullYear()
      );
    });
    let setOfDates = new Set(dates);
    setOfDates = Array.from(setOfDates);

    let dailyProfitArray = [];
    setOfDates?.forEach((date) => {
      let cumulativePnl = 0;
      tableData?.forEach((trade) => {
        let tradeDate = new Date(trade?.entry?.entryTime?.seconds * 1000);
        let UniqueTradeDate =
          tradeDate.getDate() +
          "/" +
          tradeDate.getMonth() +
          "/" +
          tradeDate.getFullYear();

        if (UniqueTradeDate === date) {
          if (trade?.entry?.putLong) {
            cumulativePnl =
              cumulativePnl +
              (trade?.exit?.putLongExit?.average_price -
                trade?.entry?.putLong?.average_price +
                trade?.entry?.callShort?.average_price -
                trade?.exit?.callShortExit?.average_price) *
                trade?.entry?.qty;
          } else {
            cumulativePnl =
              cumulativePnl +
              (trade?.exit?.callLongExit?.average_price -
                trade?.entry?.callLong?.average_price +
                trade?.entry?.putShort?.average_price -
                trade?.exit?.putShortExit?.average_price) *
                trade?.entry?.qty;
          }
        }
      });
      if (cumulativePnl > 0) {
        dailyProfitArray.push(cumulativePnl);
      }
    });

    let averageDailyProfitData = dailyProfitArray.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
    averageDailyProfitData = averageDailyProfitData / dailyProfitArray.length;

    return {
      averageDailyProfitData: averageDailyProfitData,
      winDayCount: dailyProfitArray.length,
    };
  };

  const calculateAvgLossDaily = () => {
    let dates = [];
    tableData?.forEach((trade) => {
      let tempDate = new Date(trade?.entry?.entryTime?.seconds * 1000);
      dates.push(
        tempDate.getDate() +
          "/" +
          tempDate.getMonth() +
          "/" +
          tempDate.getFullYear()
      );
    });
    let setOfDates = new Set(dates);
    setOfDates = Array.from(setOfDates);

    let dailyLossArray = [];
    setOfDates?.forEach((date) => {
      let cumulativePnl = 0;
      tableData?.forEach((trade) => {
        let tradeDate = new Date(trade?.entry?.entryTime?.seconds * 1000);
        let UniqueTradeDate =
          tradeDate.getDate() +
          "/" +
          tradeDate.getMonth() +
          "/" +
          tradeDate.getFullYear();

        if (UniqueTradeDate === date) {
          if (trade?.entry?.putLong) {
            cumulativePnl =
              cumulativePnl +
              (trade?.exit?.putLongExit?.average_price -
                trade?.entry?.putLong?.average_price +
                trade?.entry?.callShort?.average_price -
                trade?.exit?.callShortExit?.average_price) *
                trade?.entry?.qty;
          } else {
            cumulativePnl =
              cumulativePnl +
              (trade?.exit?.callLongExit?.average_price -
                trade?.entry?.callLong?.average_price +
                trade?.entry?.putShort?.average_price -
                trade?.exit?.putShortExit?.average_price) *
                trade?.entry?.qty;
          }
        }
      });
      if (cumulativePnl < 0) {
        dailyLossArray.push(cumulativePnl);
      }
    });

    let averageDailyLossData = dailyLossArray.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
    averageDailyLossData = averageDailyLossData / dailyLossArray.length;

    return {
      averageDailyLossData: averageDailyLossData,
      lossDayCount: dailyLossArray.length,
    };
  };

  const calculateDailyExpectancy = () => {
    let expectancy =
      (calculateAvgProfitDaily()?.winDayCount /
        calculateAvgPnlDaily()?.dayCount) *
        (calculateAvgProfitDaily()?.averageDailyProfitData /
          -calculateAvgLossDaily()?.averageDailyLossData) -
      (1 -
        calculateAvgProfitDaily()?.winDayCount /
          calculateAvgPnlDaily()?.dayCount);

    return expectancy;
  };

  const closeDashboard = () => {
    let cont = document.getElementById("dashContainer");
    cont.classList.add("top-full");
    cont.classList.remove("top-0");
  };

  return (
    <>
      <div
        id="dashContainer"
        className="fixed z-50 flex flex-col items-center w-full h-full transition-all duration-200 ease-in-out bg-black top-full dashboard-container bg-opacity-40 backdrop-blur-lg "
      >
        <button
          id="closeDash"
          className="absolute right-3 top-3 btn-sm btn-secondary btn btn-circle"
          onClick={closeDashboard}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <span className="self-start mt-2 mb-1 ml-5">SELECTION MENU</span>
        <div className="flex justify-between w-full">
          <div className="w-1/3 m-3 mt-0 selects join">
            <select
              id="strategy"
              className="w-full max-w-xs select select-bordered join-item"
              onChange={(e) => {
                document.getElementById("index").value = null;
                let selectedStratData;
                if (e.target.value === "fut3min") {
                  selectedStratData = mergeArray([
                    ...tradesToArray(niftyThreeMinShort),
                    ...tradesToArray(niftyThreeMinLong),
                    ...tradesToArray(bnfThreeMinShort),
                    ...tradesToArray(bnfThreeMinLong),
                  ]);
                } else if (e.target.value === "fut5min") {
                  selectedStratData = mergeArray([
                    ...tradesToArray(niftyFiveMinShort),
                    ...tradesToArray(niftyFiveMinLong),
                    ...tradesToArray(bnfFiveMinShort),
                    ...tradesToArray(bnfFiveMinLong),
                  ]);
                } else if (e.target.value === "all") {
                  selectedStratData = mergeArray([
                    ...tradesToArray(niftyFiveMinShort),
                    ...tradesToArray(niftyFiveMinLong),
                    ...tradesToArray(bnfFiveMinShort),
                    ...tradesToArray(bnfFiveMinLong),
                    ...tradesToArray(niftyThreeMinShort),
                    ...tradesToArray(niftyThreeMinLong),
                    ...tradesToArray(bnfThreeMinShort),
                    ...tradesToArray(bnfThreeMinLong),
                  ]);
                }
                setStrategy(e.target.value);
                setTableData(selectedStratData);
              }}
            >
              <option disabled selected>
                SELECT STRATEGY
              </option>
              <option value={"fut5min"}>FUTURES 5 MINS</option>
              <option value={"fut3min"}>FUTURES 3 MINS</option>
              <option value={"all"}>ALL TRADES</option>
            </select>
            <select
              id="index"
              className="w-full max-w-xs select select-bordered join-item"
              onChange={(e) => {
                let selectedStratData;
                if (e.target.value === "nifty" && strategy === "fut3min") {
                  selectedStratData = mergeArray([
                    ...tradesToArray(niftyThreeMinShort),
                    ...tradesToArray(niftyThreeMinLong),
                  ]);
                } else if (e.target.value === "bnf" && strategy === "fut3min") {
                  selectedStratData = mergeArray([
                    ...tradesToArray(bnfThreeMinShort),
                    ...tradesToArray(bnfThreeMinLong),
                  ]);
                }
                if (e.target.value === "nifty" && strategy === "fut5min") {
                  selectedStratData = mergeArray([
                    ...tradesToArray(niftyFiveMinShort),
                    ...tradesToArray(niftyFiveMinLong),
                  ]);
                } else if (e.target.value === "bnf" && strategy === "fut5min") {
                  selectedStratData = mergeArray([
                    ...tradesToArray(bnfFiveMinShort),
                    ...tradesToArray(bnfFiveMinLong),
                  ]);
                } else if (strategy === "" && e.target.value === "bnf") {
                  selectedStratData = mergeArray([
                    ...tradesToArray(bnfThreeMinShort),
                    ...tradesToArray(bnfThreeMinLong),
                    ...tradesToArray(bnfFiveMinShort),
                    ...tradesToArray(bnfFiveMinLong),
                  ]);
                } else if (strategy === "" && e.target.value === "nifty") {
                  selectedStratData = mergeArray([
                    ...tradesToArray(niftyThreeMinShort),
                    ...tradesToArray(niftyThreeMinLong),
                    ...tradesToArray(niftyFiveMinShort),
                    ...tradesToArray(niftyFiveMinLong),
                  ]);
                } else if (
                  strategy === "fut3min" &&
                  e.target.value === "allIndex"
                ) {
                  selectedStratData = mergeArray([
                    ...tradesToArray(niftyThreeMinShort),
                    ...tradesToArray(niftyThreeMinLong),

                    ...tradesToArray(bnfThreeMinShort),
                    ...tradesToArray(bnfThreeMinLong),
                  ]);
                } else if (
                  strategy === "fut5min" &&
                  e.target.value === "allIndex"
                ) {
                  selectedStratData = mergeArray([
                    ...tradesToArray(niftyFiveMinShort),
                    ...tradesToArray(niftyFiveMinLong),

                    ...tradesToArray(bnfFiveMinShort),
                    ...tradesToArray(bnfFiveMinLong),
                  ]);
                }
                setTableData(selectedStratData);
                setIndex(e.target.value);
              }}
            >
              <option disabled selected>
                SELECT INDEX
              </option>
              <option value={"nifty"}>NIFTY</option>
              <option value={"bnf"}>BANK NIFTY</option>
              <option value={"allIndex"}>ALL INDICES</option>
            </select>

            <button
              className="text-white join-item btn btn-secondary"
              onClick={async () => {
                console.time("updateOrders");
                await updateTradeBookLongFiveMin(niftyFiveMinLong);
                await updateTradeBookShortFiveMin(niftyFiveMinShort);
                await updateTradeBookLongThreeMin(niftyThreeMinLong);
                await updateTradeBookShortThreeMin(niftyThreeMinShort);
                await updateTradeBookLongFiveMin(bnfFiveMinLong);
                await updateTradeBookShortFiveMin(bnfFiveMinShort);
                await updateTradeBookLongThreeMin(bnfThreeMinLong);
                await updateTradeBookShortThreeMin(bnfThreeMinShort);
                console.timeEnd("updateOrders");
              }}
            >
              Update Trade Book
            </button>
          </div>
          <div className="mr-16 join">
            <button
              id="fut5min"
              className={
                onDisplay === "table"
                  ? "join-item btn btn-secondary btn-md text-white"
                  : "join-item btn btn-accent btn-md"
              }
              onClick={() => {
                setOnDisplay("table");
              }}
            >
              Table
            </button>
            <button
              id="fut1min"
              className={
                onDisplay === "stats"
                  ? "join-item btn btn-secondary btn-md text-white"
                  : "join-item btn btn-accent btn-md"
              }
              onClick={() => {
                setOnDisplay("stats");
              }}
            >
              Stats
            </button>
            <button
              id="strangle"
              className={
                onDisplay === "charts"
                  ? "join-item btn btn-secondary btn-md text-white"
                  : "join-item btn btn-accent btn-md"
              }
              onClick={() => {
                setOnDisplay("charts");
              }}
            >
              Charts
            </button>
          </div>
        </div>

        {onDisplay === "table" ? (
          <>
            <div className="w-2/3 p-3 overflow-x-auto overflow-y-auto rounded-t-2xl bg-base-300 max-h-3/4 ">
              <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    <th>Date Time</th>
                    <th>Index</th>
                    <th>Direction</th>
                    <th>Entry price</th>
                    <th>Exit Price</th>
                    <th>Index Points</th>
                    <th>Collected Points</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {/* row 1 */}
                  {tableData?.map((trade) => {
                    let date =
                      new Date(trade.entry.entryTime.seconds * 1000).getDate() +
                      "/" +
                      new Date(
                        trade.entry.entryTime.seconds * 1000
                      ).getMonth() +
                      "/" +
                      new Date(
                        trade.entry.entryTime.seconds * 1000
                      ).getFullYear() +
                      " " +
                      new Date(
                        trade.entry.entryTime.seconds * 1000
                      ).getHours() +
                      ":" +
                      new Date(
                        trade.entry.entryTime.seconds * 1000
                      ).getMinutes() +
                      ":" +
                      new Date(
                        trade.entry.entryTime.seconds * 1000
                      ).getSeconds();
                    let indexPoints;
                    if (trade?.entry?.putLong) {
                      indexPoints = (
                        trade?.entry?.entryPrice - trade?.exit?.exitPrice
                      ).toFixed(2);
                    } else {
                      indexPoints = (
                        trade?.exit?.exitPrice - trade?.entry?.entryPrice
                      ).toFixed(2);
                    }

                    let currentPnl;
                    if (trade?.entry?.putLong) {
                      currentPnl = (
                        (trade?.exit?.putLongExit?.average_price -
                          trade?.entry?.putLong?.average_price +
                          trade?.entry?.callShort?.average_price -
                          trade?.exit?.callShortExit?.average_price) *
                        trade?.entry?.qty
                      ).toFixed(2);
                    } else {
                      currentPnl = (
                        (trade?.exit?.callLongExit?.average_price -
                          trade?.entry?.callLong?.average_price +
                          trade?.entry?.putShort?.average_price -
                          trade?.exit?.putShortExit?.average_price) *
                        trade?.entry?.qty
                      ).toFixed(2);
                    }

                    return (
                      <tr>
                        <th>{date}</th>
                        <td>{trade?.entry?.index}</td>
                        <td>{trade?.entry?.putLong ? "Short" : "Long"}</td>
                        <td>{trade?.entry?.entryPrice}</td>
                        <td>{trade?.exit?.exitPrice}</td>
                        <td
                          className={
                            indexPoints > 0 ? "text-green-400" : "text-red-400"
                          }
                        >
                          {indexPoints}
                        </td>
                        <td
                          className={
                            currentPnl / trade?.entry?.qty > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {(currentPnl / trade?.entry?.qty).toFixed(2)}
                        </td>
                        <td
                          className={
                            currentPnl > 0 ? "text-green-400" : "text-red-400"
                          }
                        >
                          {currentPnl}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex w-2/3 p-3 border-t-2 border-neutral-700 total justify-evenly rounded-b-2xl bg-base-300">
              <div className="left">No. of trades: {numOfTrades}</div>
              <div
                className={
                  calculateTotalPnl() > 0 ? "text-green-400" : "text-red-400"
                }
              >
                Total: {calculateTotalPnl().toFixed(2)}
              </div>
            </div>
          </>
        ) : null}

        {onDisplay === "stats" ? (
          <>
            <div className="w-4/5 mt-3 shadow stats">
              <div className="stat place-items-center">
                <div className="stat-title">Total Capital</div>
                <div className="stat-value">74,00,000</div>
              </div>

              <div className="stat place-items-center">
                <div className="stat-title">Total PnL</div>
                <div
                  className={
                    calculateTotalPnl() > 0
                      ? "stat-value text-green-400 "
                      : "stat-value text-red-400 "
                  }
                >
                  {calculateTotalPnl().toFixed(2)}
                </div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">ROI</div>
                <div
                  className={
                    calculateTotalPnl() / 7400000 > 0
                      ? "stat-value text-green-400 "
                      : "stat-value text-red-400 "
                  }
                >
                  {((calculateTotalPnl() / 7400000) * 100).toFixed(2)}%
                </div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Avg. PnL</div>
                <div className="stat-value">
                  {(calculateTotalPnl() / tableData.length).toFixed(2)}
                </div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Avg. Profit</div>
                <div className="stat-value">
                  {calculateAverageProfit().toFixed(2)}
                </div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Avg. Loss</div>
                <div className="stat-value ">
                  {calculateAverageLoss().toFixed(2)}
                </div>
              </div>
            </div>

            <div className="w-4/5 mt-3 shadow stats">
              <div className="stat place-items-center">
                <div className="stat-title">No. of trades</div>
                <div className="stat-value">{tableData?.length}</div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Winning Trades</div>
                <div className="stat-value">{calculateWinCount()}</div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Losing Trades</div>
                <div className="stat-value">{calculateLossCount()}</div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Accuracy</div>
                <div
                  className={
                    calculateExpectancy() > 0
                      ? "stat-value text-green-400 "
                      : "stat-value text-red-400 "
                  }
                >
                  {((calculateWinCount() / numOfTrades) * 100).toFixed(2)}%
                </div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Risk Reward ratio</div>
                <div
                  className={
                    calculateExpectancy() > 0
                      ? "stat-value text-green-400 "
                      : "stat-value text-red-400 "
                  }
                >
                  {(calculateAverageProfit() / -calculateAverageLoss()).toFixed(
                    2
                  )}
                </div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Expectancy </div>
                <div
                  className={
                    calculateExpectancy() > 0
                      ? "stat-value text-green-400 "
                      : "stat-value text-red-400 "
                  }
                >
                  {calculateExpectancy().toFixed(2)}
                </div>
              </div>
            </div>

            <div className="w-4/5 mt-3 shadow stats">
              <div className="stat place-items-center">
                <div className="stat-title">Equity High</div>
                <div className="stat-value">
                  {calculateEquityHigh().toFixed(2)}
                </div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Max Profit/trade</div>
                <div className="stat-value">
                  {calculateMaxProfit().toFixed(2)}
                </div>
              </div>

              <div className="stat place-items-center">
                <div className="stat-title">Max Loss/trade</div>
                <div className="stat-value">
                  {calculateMaxLoss().toFixed(2)}
                </div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Current DD</div>
                <div
                  className={
                    -(calculateEquityHigh() - calculateTotalPnl()) == 0
                      ? "stat-value text-green-400 "
                      : "stat-value text-red-400 "
                  }
                >
                  {-(calculateEquityHigh() - calculateTotalPnl()).toFixed(2)}
                </div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Max DD</div>
                <div
                  className={
                    calculateMaxDD() == 0
                      ? "stat-value text-green-400 "
                      : "stat-value text-red-400 "
                  }
                >
                  {calculateMaxDD().toFixed(2)}
                </div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Return to MDD </div>
                <div
                  className={
                    calculateTotalPnl() / -calculateMaxDD() == 0
                      ? "stat-value text-green-400 "
                      : "stat-value text-red-400 "
                  }
                >
                  {(calculateTotalPnl() / -calculateMaxDD()).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="w-4/5 mt-3 shadow stats">
              <div className="stat place-items-center">
                <div className="stat-title">Avg Pnl</div>
                <div
                  className={
                    calculateAvgPnlDaily().averageDailyPnlData > 0
                      ? "stat-value text-green-400 "
                      : "stat-value text-red-400 "
                  }
                >
                  {calculateAvgPnlDaily().averageDailyPnlData?.toFixed(2)}
                </div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Avg. Profit/Day</div>
                <div className="stat-value">
                  {calculateAvgProfitDaily().averageDailyProfitData?.toFixed(2)}
                </div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Avg. Loss/Day</div>
                <div className="stat-value">
                  {calculateAvgLossDaily().averageDailyLossData?.toFixed(2)}
                </div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Accuracy/Day</div>
                <div
                  className={
                    calculateDailyExpectancy() > 0
                      ? "stat-value text-green-400 "
                      : "stat-value text-red-400 "
                  }
                >
                  {(
                    (calculateAvgProfitDaily()?.winDayCount /
                      calculateAvgPnlDaily()?.dayCount) *
                    100
                  ).toFixed(2)}
                  %
                </div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">R:R/Day</div>
                <div
                  className={
                    calculateDailyExpectancy() > 0
                      ? "stat-value text-green-400 "
                      : "stat-value text-red-400 "
                  }
                >
                  {(
                    calculateAvgProfitDaily()?.averageDailyProfitData /
                    -calculateAvgLossDaily()?.averageDailyLossData
                  ).toFixed(2)}
                </div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Daily Expectancy </div>
                <div
                  className={
                    calculateDailyExpectancy() > 0
                      ? "stat-value text-green-400 "
                      : "stat-value text-red-400 "
                  }
                >
                  {calculateDailyExpectancy().toFixed(2)}
                </div>
              </div>
            </div>
          </>
        ) : null}

        {onDisplay === "charts" ? (
          <>
            <div className="headButton join">
              <button className="btn btn-accent btn-sm join-item">
                Cumulative P&L
              </button>
              <button className="btn btn-accent btn-sm join-item">
                Draw Down
              </button>
              <button className="btn btn-accent btn-sm join-item">
                Strategy-wise
              </button>
            </div>

            <div className="p-3 pt-0 mt-5 bg-base-300 rounded-2xl pnlChart ">
              <div className="pt-5 pb-3 text-xl text-center">P&L Chart</div>
              <LineChart
                width={1200}
                height={600}
                data={calculateTotalPnlArray()}
              >
                <Line
                  type="monotone"
                  dataKey="pnl"
                  stroke="#8884d8"
                  strokeWidth={3}
                />
                <CartesianGrid stroke="#ccc" strokeDasharray="1 1" />
                <XAxis dataKey="tradeNumber" />
                <YAxis dataKey="pnl" />
                <Tooltip />
              </LineChart>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

export default Dashboard;
