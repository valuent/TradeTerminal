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
import { toast } from "react-toastify";

function Supertrend() {
  const {
    expiries,
    niftyOptChainData,
    bnfOptChainData,
    socket,
    tickerData,
    niftyFutData,
    bnfFutData,
    niftySpotData,
    bnfSpotData,
    isSuccess,
  } = useContext(DataContext);

  // Cannot be dynamicall set
  const [niftyQty, setNiftyQty] = useState(100);
  const [bnfQty, setBnfQty] = useState(30);

  // Saves LTP every second
  const [niftyLtp, setNiftyLtp] = useState();
  const [niftyFutLtp, setNiftyFutLtp] = useState();
  const [bnfLtp, setBnfLtp] = useState();
  const [bnfFutLtp, setBnfFutLtp] = useState();

  // Rounded to nearest Strike
  const [niftyRounded, setNiftyRounded] = useState();
  const [bnfRounded, setBnfRounded] = useState();

  const [niftyShortCallSell, setNiftyShortCallSell] = useState();

  const [niftyLongPutSell, setNiftyLongPutSell] = useState();

  const [bnfShortCallSell, setBnfShortCallSell] = useState();

  const [bnfLongPutSell, setBnfLongPutSell] = useState();

  const [niftyCandles, setNiftyCandles] = useState();
  const [bnfCandles, setBnfCandles] = useState();

  const [nifty10SMA, setNifty10SMA] = useState();
  const [nifty20SMA, setNifty20SMA] = useState();

  const [bnf10SMA, setBnf10SMA] = useState();
  const [bnf20SMA, setBnf20SMA] = useState();

  const [niftySuperTrend, setNiftySuperTrend] = useState();
  const [bnfSuperTrend, setBnfSuperTrend] = useState();

  const [niftyLongOrderId, setNiftyLongOrderId] = useState();
  const [niftyShortOrderId, setNiftyShortOrderId] = useState();

  // Holds Short position LTPS
  const [niftyShortCallLtp, setNiftyShortCallLtp] = useState();
  const [niftyShortPutLtp, setNiftyShortPutLtp] = useState();

  const [bnfLongOrderId, setBnfLongOrderId] = useState();
  const [bnfShortOrderId, setBnfShortOrderId] = useState();

  // Holds Short position LTPS
  const [bnfShortCallLtp, setBnfShortCallLtp] = useState();
  const [bnfShortPutLtp, setBnfShortPutLtp] = useState();

  const [refreshExistingOrder, setRefreshExistingOrder] = useState();

  const refreshOpenPos = () => {
    setRefreshExistingOrder(Math.random()); //
  };

  const toastHandler = (message) => {
    toast(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  useEffect(() => {
    const niftyLastPrice = tickerData?.filter((data) => {
      return data.instrument_token === niftySpotData?.instrument_token;
    });
    const niftyFutLastPrice = tickerData?.filter((data) => {
      return data.instrument_token === niftyFutData?.instrument_token;
    });
    const bnfLastPrice = tickerData?.filter((data) => {
      return data.instrument_token === bnfSpotData?.instrument_token;
    });
    const bnfFutLastPrice = tickerData?.filter((data) => {
      return data.instrument_token === bnfFutData?.instrument_token;
    });

    const niftyLong = tickerData?.filter((data) => {
      return (
        data.instrument_token === niftyLongOrderId?.putShort?.instrument_token
      );
    });
    const niftyShort = tickerData?.filter((data) => {
      return (
        data.instrument_token === niftyShortOrderId?.callShort?.instrument_token
      );
    });

    // BNF filter
    const bnfLong = tickerData?.filter((data) => {
      return (
        data.instrument_token === bnfLongOrderId?.putShort?.instrument_token
      );
    });
    const bnfShort = tickerData?.filter((data) => {
      return (
        data.instrument_token === bnfShortOrderId?.callShort?.instrument_token
      );
    });

    if (niftyLastPrice.length > 0) {
      setNiftyLtp(niftyLastPrice?.[0]?.last_price);
    }

    if (niftyFutLastPrice.length > 0) {
      setNiftyFutLtp(niftyFutLastPrice?.[0]?.last_price);
    }

    if (bnfLastPrice.length > 0) {
      setBnfLtp(bnfLastPrice?.[0]?.last_price);
    }

    if (bnfFutLastPrice.length > 0) {
      setBnfFutLtp(bnfFutLastPrice?.[0]?.last_price);
    }

    if (niftyLong.length > 0) {
      setNiftyShortPutLtp(niftyLong?.[0]?.last_price);
    }
    if (niftyShort.length > 0) {
      setNiftyShortCallLtp(niftyShort?.[0]?.last_price);
    }

    // BNF LTP

    if (bnfLong.length > 0) {
      setBnfShortPutLtp(bnfLong?.[0]?.last_price);
    }
    if (bnfShort.length > 0) {
      setBnfShortCallLtp(bnfShort?.[0]?.last_price);
    }
  }, [tickerData]);

  useEffect(() => {
    const niftyRound = () => {
      const rounded = Math.round(niftyLtp / 50);
      const result = rounded * 50;
      setNiftyRounded(result);
    };
    const bnfRound = () => {
      const rounded = Math.round(bnfLtp / 100);
      const result = rounded * 100;
      setBnfRounded(result);
    };

    niftyRound();
    bnfRound();
  }, [niftyLtp, bnfLtp]);

  useEffect(() => {
    const niftyStrikeSelect = () => {
      const niftyLongStrike = niftyOptChainData?.niftyChain?.filter((data) => {
        return (
          data.expiry === expiries?.niftyExpiryDates?.[0] &&
          data.strike === parseInt(niftyRounded) &&
          data.instrument_type === "PE"
        );
      });

      const niftyShortStrike = niftyOptChainData?.niftyChain?.filter((data) => {
        return (
          data.expiry === expiries?.niftyExpiryDates?.[0] &&
          data.strike === parseInt(niftyRounded) &&
          data.instrument_type === "CE"
        );
      });

      setNiftyShortCallSell(niftyShortStrike?.[0]);
      setNiftyLongPutSell(niftyLongStrike?.[0]);
    };

    const bnfStrikeSelect = () => {
      const bnfLongStrike = bnfOptChainData?.bnfChain?.filter((data) => {
        return (
          data.expiry === expiries?.bnfExpiryDates?.[0] &&
          data.strike === parseInt(bnfRounded) &&
          data.instrument_type === "PE"
        );
      });

      const bnfShortStrike = bnfOptChainData?.bnfChain?.filter((data) => {
        return (
          data.expiry === expiries?.bnfExpiryDates?.[0] &&
          data.strike === parseInt(bnfRounded) &&
          data.instrument_type === "CE"
        );
      });
      setBnfShortCallSell(bnfShortStrike?.[0]);
      setBnfLongPutSell(bnfLongStrike?.[0]);
    };

    niftyStrikeSelect();
    bnfStrikeSelect();
  }, [niftyRounded, bnfRounded]);

  socket?.on(niftyFutData?.instrument_token, (data) => {
    setNiftyCandles(data);
  });
  socket?.on(bnfFutData?.instrument_token, (data) => {
    setBnfCandles(data);
  });

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "5minSupertrend", "niftySuperTrend"),
      (doc) => {
        setNiftySuperTrend(doc.data());
      }
    );
    const unsub2 = onSnapshot(
      doc(db, "5minSupertrend", "bnfSuperTrend"),
      (doc) => {
        setBnfSuperTrend(doc.data());
      }
    );
  }, []);

  useEffect(() => {
    const nifty10SMA = () => {
      let sumOf9Candles = 0;
      let nifty10SMAval;
      niftyCandles?.slice(0, 9).forEach((candle) => {
        sumOf9Candles = sumOf9Candles + candle.close;
      });
      nifty10SMAval = parseFloat(
        ((sumOf9Candles + niftyFutLtp) / 10).toFixed(2)
      );
      setNifty10SMA(nifty10SMAval);
    };
    const nifty20SMA = () => {
      let sumOf19Candles = 0;
      let nifty20SMAval;
      niftyCandles?.slice(0, 19).forEach((candle) => {
        sumOf19Candles = sumOf19Candles + candle.close;
        // console.log(sumOf19Candles);
      });
      nifty20SMAval = parseFloat(
        ((sumOf19Candles + niftyFutLtp) / 20).toFixed(2)
      );
      setNifty20SMA(nifty20SMAval);
    };
    const bnf10SMA = () => {
      let sumOf9Candles = 0;
      let bnf10SMAval;
      bnfCandles?.slice(0, 9).forEach((candle) => {
        sumOf9Candles = sumOf9Candles + candle.close;
      });
      bnf10SMAval = parseFloat(((sumOf9Candles + bnfFutLtp) / 10).toFixed(2));
      setBnf10SMA(bnf10SMAval);
    };
    const bnf20SMA = () => {
      let sumOf19Candles = 0;
      let bnf20SMAval;
      bnfCandles?.slice(0, 19).forEach((candle) => {
        sumOf19Candles = sumOf19Candles + candle.close;
      });
      bnf20SMAval = parseFloat(((sumOf19Candles + bnfFutLtp) / 20).toFixed(2));

      setBnf20SMA(bnf20SMAval);
    };
    nifty10SMA();
    nifty20SMA();
    bnf10SMA();
    bnf20SMA();
  }, [niftyFutLtp, bnfFutLtp, niftyCandles, bnfCandles]);

  const calculateATR = async (prices, periods) => {
    let atr = [];

    for (let i = 0; i < prices?.length; i++) {
      // Calculate the true range (TR)
      let tr = Math.max(
        prices[i]?.high - prices[i].low,
        Math.abs(prices[i]?.high - prices[i - 1]?.close),
        Math.abs(prices[i]?.low - prices[i - 1]?.close)
      );

      // Calculate the ATR
      let atrValue;
      if (i < periods) {
        atrValue = tr;
      } else {
        let atrCalcTemp = (atr?.[i - 1] * (periods - 1) + tr) / periods;
        atrValue = atrCalcTemp;
        //   console.log(atrCalcTemp);
      }
      atr.push(atrValue);
      // console.log(atrValue, prices[i]?.open_time);
      console.log(atrValue, prices[i]?.open_time);
    }

    return atr[atr.length - 1];
  };
  useEffect(() => {
    const calculateSupertrendBnf = async () => {
      let atr = await calculateATR(bnfCandles?.slice(0, 45).reverse(), 10);
      let prevCandleHigh = bnfCandles?.[0]?.high;
      let prevCandleLow = bnfCandles?.[0]?.low;
      let prevCandleClose = bnfCandles?.[0]?.close;

      let upperBand = (prevCandleHigh + prevCandleLow) / 2 + 3 * atr;
      let lowerBand = (prevCandleHigh + prevCandleLow) / 2 - 3 * atr;

      if (
        bnfSuperTrend?.direction == "short" &&
        upperBand < bnfSuperTrend?.supertrend_value &&
        prevCandleClose < bnfSuperTrend?.supertrend_value
      ) {
        await setDoc(
          doc(db, "5minSupertrend", "bnfSuperTrend"),
          {
            direction: "short",
            supertrend_value: upperBand,
          },
          { merge: true }
        );
      }
      if (
        bnfSuperTrend?.direction == "long" &&
        lowerBand > bnfSuperTrend?.supertrend_value &&
        prevCandleClose > bnfSuperTrend?.supertrend_value
      ) {
        await setDoc(
          doc(db, "5minSupertrend", "bnfSuperTrend"),
          {
            direction: "long",
            supertrend_value: lowerBand,
          },
          { merge: true }
        );
      }
      if (
        bnfSuperTrend?.direction == "short" &&
        prevCandleClose > bnfSuperTrend?.supertrend_value
      ) {
        await setDoc(
          doc(db, "5minSupertrend", "bnfSuperTrend"),
          {
            direction: "long",
            supertrend_value: lowerBand,
          },
          { merge: true }
        );
      }
      if (
        bnfSuperTrend?.direction == "long" &&
        prevCandleClose < bnfSuperTrend?.supertrend_value
      ) {
        await setDoc(
          doc(db, "5minSupertrend", "bnfSuperTrend"),
          {
            direction: "short",
            supertrend_value: upperBand,
          },
          { merge: true }
        );
      }
    };
    const calculateSupertrendNifty = async () => {
      let atr = await calculateATR(niftyCandles?.slice(0, 100).reverse(), 10);
      let prevCandleHigh = niftyCandles?.[0]?.high;
      let prevCandleLow = niftyCandles?.[0]?.low;

      let prevCandleClose = niftyCandles?.[0]?.close;
      let upperBand = (prevCandleHigh + prevCandleLow) / 2 + 3 * atr;
      let lowerBand = (prevCandleHigh + prevCandleLow) / 2 - 3 * atr;

      if (
        niftySuperTrend?.direction == "short" &&
        upperBand < niftySuperTrend?.supertrend_value &&
        prevCandleClose < niftySuperTrend?.supertrend_value
      ) {
        await setDoc(
          doc(db, "5minSupertrend", "niftySuperTrend"),
          {
            direction: "short",
            supertrend_value: upperBand,
          },
          { merge: true }
        );
      }
      if (
        niftySuperTrend?.direction == "long" &&
        lowerBand > niftySuperTrend?.supertrend_value &&
        prevCandleClose > niftySuperTrend?.supertrend_value
      ) {
        await setDoc(
          doc(db, "5minSupertrend", "niftySuperTrend"),
          {
            direction: "long",
            supertrend_value: lowerBand,
          },
          { merge: true }
        );
      }

      if (
        niftySuperTrend?.direction == "short" &&
        prevCandleClose > niftySuperTrend?.supertrend_value
      ) {
        await setDoc(
          doc(db, "5minSupertrend", "niftySuperTrend"),
          {
            direction: "long",
            supertrend_value: lowerBand,
          },
          { merge: true }
        );
      }
      if (
        niftySuperTrend?.direction == "long" &&
        prevCandleClose < niftySuperTrend?.supertrend_value
      ) {
        await setDoc(
          doc(db, "5minSupertrend", "niftySuperTrend"),
          {
            direction: "short",
            supertrend_value: upperBand,
          },
          { merge: true }
        );
      }
    };
    calculateSupertrendBnf();
    calculateSupertrendNifty();
  }, [niftyCandles, bnfCandles]);

  let endTime = new Date();
  endTime.setHours(15, 0, 0);
  const niftyLong = async () => {
    let now = new Date();

    if (!niftyLongOrderId.putShort && now < endTime) {
      await axios
        .get(
          // `/api/placeOrderFnoBnf?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
          `/api/placeOrderFno?tradingsymbol=${niftyLongPutSell.tradingsymbol}&transaction_type=SELL&quantity=${niftyQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          let orderId = response?.data?.order_id;
          if (orderId) {
            toastHandler(`Supertrend PE placed OID: ${orderId}`);
          } else {
            toastHandler(`SuperTrend PE error ${response.data}`);
          }
          await axios.get(`/api/orderInfo`).then(async (res) => {
            // console.log(res);
            let putShortId = res?.data?.filter((order) => {
              return order.order_id === orderId && order.status === "COMPLETE";
            });

            let price;
            let slPoint;
            let tgtPoint;
            if (putShortId?.[0]?.average_price) {
              price = putShortId?.[0].average_price;
              slPoint = 25;
              tgtPoint = 52;
            } else {
              price = "";
              slPoint = "";
              tgtPoint = "";
            }

            await setDoc(
              doc(db, "5minSupertrend", "niftyLong"),
              {
                entryPrice: niftyFutLtp,
                slPoints: slPoint,
                tgtPoints: tgtPoint,
                putShort: {
                  order_id: orderId,
                  average_price: price,
                  instrument_token: parseInt(
                    niftyLongPutSell?.instrument_token
                  ),
                  trading_symbol: niftyLongPutSell.tradingsymbol,
                },
              },
              { merge: true }
            )
              .then((response) => {
                toastHandler(`Super Trend Nifty long order updated`);
              })
              .catch((e) => {
                toastHandler(`Super Trend Nifty long error at firebase ${e}`);
              });
          });
        });
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "5minSupertrend", "niftyLong"), (doc) => {
      setNiftyLongOrderId(doc.data());
      //   console.log(doc.data());

      socket?.emit("niftyFutToken", [doc?.data()?.putShort?.instrument_token]);
    });
  }, [refreshExistingOrder]);

  useEffect(() => {
    socket?.emit("niftyFutToken", [
      niftyLongOrderId?.putShort?.instrument_token,
    ]);
  }, [niftyLongOrderId, refreshExistingOrder]);

  const niftyShort = async () => {
    let now = new Date();
    if (!niftyShortOrderId.callShort && now < endTime) {
      await axios
        .get(
          `/api/placeOrderFno?tradingsymbol=${niftyShortCallSell.tradingsymbol}&transaction_type=SELL&quantity=${niftyQty}&product=MIS&order_type=MARKET`
          // `/api/placeOrderFnoBnf?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          let orderId = response?.data?.order_id;
          if (orderId) {
            toastHandler(`Super Trend CE placed OID: ${orderId}`);
          } else {
            toastHandler(`Super Trend CE error ${response.data}`);
          }
          await axios.get(`/api/orderInfo`).then(async (res) => {
            let callShortId = res?.data?.filter((order) => {
              return order.order_id === orderId && order.status === "COMPLETE";
            });

            let price;
            let slPoint;
            let tgtPoint;
            if (callShortId?.[0]?.average_price) {
              price = callShortId?.[0].average_price;
              slPoint = 25;
              tgtPoint = 52;
            } else {
              price = "";
              slPoint = "";
              tgtPoint = "";
            }

            await setDoc(
              doc(db, "5minSupertrend", "niftyShort"),
              {
                entryPrice: niftyFutLtp,
                slPoints: slPoint,
                tgtPoints: tgtPoint,
                callShort: {
                  order_id: orderId,
                  average_price: price,
                  instrument_token: parseInt(
                    niftyShortCallSell?.instrument_token
                  ),
                  trading_symbol: niftyShortCallSell?.tradingsymbol,
                },
                entryLevel: deleteField(),
              },
              { merge: true }
            )
              .then((response) => {
                toastHandler(`Super Trend Nifty short order updated`);
              })
              .catch((e) => {
                toastHandler(`Super Trend Nifty short error at firebase ${e}`);
              });
          });
        });
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "5minSupertrend", "niftyShort"), (doc) => {
      setNiftyShortOrderId(doc.data());
      socket?.emit("niftyFutToken", [doc?.data()?.callShort?.instrument_token]);
    });
  }, [refreshExistingOrder]);

  useEffect(() => {
    socket?.emit("niftyFutToken", [
      niftyShortOrderId?.callShort?.instrument_token,
    ]);
  }, [niftyShortOrderId, refreshExistingOrder]);

  const updateOrderBookNifty = async () => {
    await axios.get(`/api/orderInfo`).then(async (response) => {
      // console.log(response);
      let putShortId = response?.data?.filter((order) => {
        return (
          order.order_id === niftyLongOrderId?.putShort?.order_id &&
          order.status === "COMPLETE"
        );
      });
      if (putShortId.length > 0 && putShortId?.[0]?.average_price !== "") {
        await setDoc(
          doc(db, "5minSupertrend", "niftyLong"),
          {
            putShort: {
              order_id: niftyLongOrderId?.putShort?.order_id,
              average_price: putShortId?.[0]?.average_price,
            },
            slPoints: 25,
            tgtPoints: 52,
          },
          { merge: true }
        )
          .then(() => {
            toastHandler(`Super Trend Nifty long order book updated`);
          })
          .catch((e) => {
            toastHandler(`Super Trend Nifty long order Book Error: ${e}`);
          });
      }
    });

    await axios.get(`/api/orderInfo`).then(async (response) => {
      // console.log(response);
      let callShortId = response?.data?.filter((order) => {
        return (
          order.order_id === niftyShortOrderId?.callShort?.order_id &&
          order.status === "COMPLETE"
        );
      });
      if (callShortId.length > 0 && callShortId?.[0]?.average_price !== "") {
        await setDoc(
          doc(db, "5minSupertrend", "niftyShort"),
          {
            callShort: {
              order_id: niftyShortOrderId?.callShort?.order_id,
              average_price: callShortId?.[0]?.average_price,
            },
            slPoints: 25,
            tgtPoints: 52,
          },
          { merge: true }
        )
          .then(() => {
            toastHandler(`Super Trend Nifty short order book updated`);
          })
          .catch((e) => {
            toastHandler(`Super Trend Nifty short order Book Error: ${e}`);
          });
      }
    });
  };

  const niftySetSL = async (slPoints) => {
    if (niftyLongOrderId?.putShort?.trading_symbol) {
      await setDoc(
        doc(db, "5minSupertrend", "niftyLong"),
        {
          slPoints: parseInt(slPoints),
        },
        { merge: true }
      );
      toastHandler(`Super Trend Nifty Long SL points ${slPoints}`);
    } else if (niftyShortOrderId?.callShort?.trading_symbol) {
      await setDoc(
        doc(db, "5minSupertrend", "niftyShort"),
        {
          slPoints: parseInt(slPoints),
        },
        { merge: true }
      );
      toastHandler(`Super Trend Nifty Short SL points ${slPoints}`);
    } else {
      toastHandler(`Super Trend Nifty no trades found`);
    }
  };

  const niftySetTG = async (tgtPoints) => {
    if (niftyLongOrderId?.putShort?.trading_symbol) {
      await setDoc(
        doc(db, "5minSupertrend", "niftyLong"),
        {
          tgtPoints: parseInt(tgtPoints),
        },
        { merge: true }
      );
      toastHandler(`Super Trend Nifty Long TGT points ${tgtPoints}`);
    } else if (niftyShortOrderId?.callShort?.trading_symbol) {
      await setDoc(
        doc(db, "5minSupertrend", "niftyShort"),
        {
          tgtPoints: parseInt(tgtPoints),
        },
        { merge: true }
      );
      toastHandler(`Super Trend Nifty Short TGT points ${tgtPoints}`);
    } else {
      toastHandler(`Super Trend Nifty no trades found`);
    }
  };

  const niftyLongExit = async () => {
    if (niftyLongOrderId?.putShort?.trading_symbol) {
      await axios
        .get(
          // `/api/placeOrderFnoBnf?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFno?tradingsymbol=${niftyLongOrderId?.putShort?.trading_symbol}&transaction_type=BUY&quantity=${niftyQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            toastHandler(`Super Trend Nifty long exit done`);
            await updateDoc(doc(db, "5minSupertrend", "niftyLong"), {
              putShort: deleteField(),
              entryPrice: deleteField(),
              slPoints: deleteField(),
              tgtPoints: deleteField(),
            });
          } else {
            toastHandler(response?.data);
          }
        });
    } else {
      toastHandler(`Super Trend Nifty long no positions Found`);
    }
  };

  const niftyShortExit = async () => {
    if (niftyShortOrderId?.callShort?.trading_symbol) {
      await axios
        .get(
          // `/api/placeOrderFnoBnf?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFno?tradingsymbol=${niftyShortOrderId?.callShort?.trading_symbol}&transaction_type=BUY&quantity=${niftyQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            toastHandler(`Super Trend Nifty short exit done`);
            await updateDoc(doc(db, "5minSupertrend", "niftyShort"), {
              callShort: deleteField(),
              entryPrice: deleteField(),
              slPoints: deleteField(),
              tgtPoints: deleteField(),
            });
          }
        });
    } else {
      toastHandler(response?.data);
    }
  };

  useEffect(() => {
    const niftyLongSLManager = async () => {
      if (
        niftyLongOrderId?.putShort?.trading_symbol &&
        niftyLongOrderId?.slPoints &&
        niftyLongOrderId?.tgtPoints &&
        niftyLongOrderId?.entryPrice
      ) {
        let sl_level =
          niftyLongOrderId?.entryPrice - niftyLongOrderId?.slPoints;
        let tgt_level =
          niftyLongOrderId?.entryPrice + niftyLongOrderId?.tgtPoints;
        let relativeSl = niftyLongOrderId?.putShort?.average_price * 0.4;
        let mtm = niftyLongOrderId?.putShort?.average_price - niftyShortPutLtp;

        // console.log(niftyLongCallLtp);
        // console.log(niftyShortPutLtp);

        if (niftyFutLtp >= tgt_level || mtm >= niftyLongOrderId?.tgtPoints) {
          await niftyLongExit();
          toastHandler(`Super Trend Nifty long TGT reached`);
        }
        if (
          niftyFutLtp <= sl_level ||
          mtm <= -niftyLongOrderId?.slPoints ||
          mtm <= -relativeSl
        ) {
          // let num = 1;
          // for (let i = 0; i < 10000000000; i++) {
          //   num = num + 1;
          // }
          // console.log(num);
          await niftyLongExit();
          toastHandler(`Super Trend Nifty long SL reached`);
        }
      }
    };
    niftyLongSLManager();
  }, [tickerData, niftyLongOrderId, niftyShortPutLtp]);

  useEffect(() => {
    const niftyShortSLManager = async () => {
      if (
        niftyShortOrderId?.callShort?.trading_symbol &&
        niftyShortOrderId?.slPoints &&
        niftyShortOrderId?.tgtPoints &&
        niftyShortOrderId?.entryPrice
      ) {
        let sl_level =
          niftyShortOrderId?.entryPrice + niftyShortOrderId?.slPoints;
        let tgt_level =
          niftyShortOrderId?.entryPrice - niftyShortOrderId?.tgtPoints;
        let relativeSl = niftyShortOrderId?.callShort?.average_price * 0.4;
        let mtm =
          niftyShortOrderId?.callShort?.average_price - niftyShortCallLtp;

        // console.log(mtm);
        // console.log("SL", sl_level);
        // console.log("tgt", tgt_level);
        // console.log(mtm);
        // console.log(niftyLongPutLtp);
        // console.log(niftyShortCallLtp);

        if (niftyFutLtp <= tgt_level || mtm >= niftyShortOrderId?.tgtPoints) {
          await niftyShortExit();
          toastHandler(`Super Trend Nifty short TGT reached`);
        }

        if (
          niftyFutLtp >= sl_level ||
          mtm <= -niftyShortOrderId?.slPoints ||
          mtm <= -relativeSl
        ) {
          await niftyShortExit();
          toastHandler(`Super Trend Nifty short SL reached`);
        }
      }
    };
    niftyShortSLManager();
  }, [tickerData, niftyShortOrderId, niftyShortCallLtp]);

  //BNF

  const bnfLong = async () => {
    let now = new Date();

    if (!bnfLongOrderId.putShort && now < endTime) {
      await axios
        .get(
          // `/api/placeOrderFnoBnf?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
          `/api/placeOrderFnoBnf?tradingsymbol=${bnfLongPutSell.tradingsymbol}&transaction_type=SELL&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          let orderId = response.data.order_id;
          if (orderId) {
            toastHandler(`Super Trend PE placed OID: ${orderId}`);
          } else {
            toastHandler(`Super Trend PE error ${response.data}`);
          }
          await axios.get(`/api/orderInfo`).then(async (res) => {
            // console.log(res);
            let putShortId = res?.data?.filter((order) => {
              return order.order_id === orderId && order.status === "COMPLETE";
            });

            let price;
            let slPoint;
            let tgtPoint;
            if (putShortId?.[0]?.average_price) {
              price = putShortId?.[0].average_price;
              slPoint = 85;
              tgtPoint = 177;
            } else {
              price = "";
              slPoint = "";
              tgtPoint = "";
            }

            await setDoc(
              doc(db, "5minSupertrend", "bnfLong"),
              {
                entryPrice: bnfFutLtp,
                slPoints: slPoint,
                tgtPoints: tgtPoint,
                putShort: {
                  order_id: orderId,
                  average_price: price,
                  instrument_token: parseInt(bnfLongPutSell?.instrument_token),
                  trading_symbol: bnfLongPutSell.tradingsymbol,
                },
              },
              { merge: true }
            )
              .then((response) => {
                toastHandler(`Super Trend Bank Nifty long order updated`);
              })
              .catch((e) => {
                toastHandler(
                  `Super Trend Bank Nifty long error at firebase ${e}`
                );
              });
          });
        });
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "5minSupertrend", "bnfLong"), (doc) => {
      setBnfLongOrderId(doc.data());

      socket?.emit("niftyFutToken", [doc?.data()?.putShort?.instrument_token]);
    });
  }, [refreshExistingOrder]);

  useEffect(() => {
    socket?.emit("niftyFutToken", [bnfLongOrderId?.putShort?.instrument_token]);
  }, [bnfLongOrderId, refreshExistingOrder]);

  const bnfShort = async () => {
    let now = new Date();

    if (!bnfShortOrderId.callShort && now < endTime) {
      await axios
        .get(
          `/api/placeOrderFnoBnf?tradingsymbol=${bnfShortCallSell.tradingsymbol}&transaction_type=SELL&quantity=${bnfQty}&product=MIS&order_type=MARKET`
          // `/api/placeOrderFnoBnf?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          let orderId = response.data.order_id;
          if (orderId) {
            toastHandler(`Super Trend CE placed OID: ${orderId}`);
          } else {
            toastHandler(`Super Trend CE error ${response.data}`);
          }
          await axios.get(`/api/orderInfo`).then(async (res) => {
            let callShortId = res?.data?.filter((order) => {
              return order.order_id === orderId && order.status === "COMPLETE";
            });

            let price;
            let slPoint;
            let tgtPoint;
            if (callShortId?.[0]?.average_price) {
              price = callShortId?.[0].average_price;
              slPoint = 85;
              tgtPoint = 177;
            } else {
              price = "";
              slPoint = "";
              tgtPoint = "";
            }

            await setDoc(
              doc(db, "5minSupertrend", "bnfShort"),
              {
                entryPrice: bnfFutLtp,
                slPoints: slPoint,
                tgtPoints: tgtPoint,
                callShort: {
                  order_id: orderId,
                  average_price: price,
                  instrument_token: parseInt(
                    bnfShortCallSell?.instrument_token
                  ),
                  trading_symbol: bnfShortCallSell?.tradingsymbol,
                },
              },
              { merge: true }
            )
              .then((response) => {
                toastHandler(`Super Trend Bank Nifty short order updated`);
              })
              .catch((e) => {
                toastHandler(
                  `Super Trend Bank Nifty short error at firebase ${e}`
                );
              });
          });
        });
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "5minSupertrend", "bnfShort"), (doc) => {
      setBnfShortOrderId(doc.data());
      socket?.emit("bnfFutToken", [doc?.data()?.callShort?.instrument_token]);
    });
  }, [refreshExistingOrder]);

  useEffect(() => {
    socket?.emit("niftyFutToken", [
      bnfShortOrderId?.callShort?.instrument_token,
    ]);
  }, [bnfShortOrderId, refreshExistingOrder]);

  const updateOrderBookBnf = async () => {
    await axios.get(`/api/orderInfo`).then(async (response) => {
      // console.log(response);
      let putShortId = response?.data?.filter((order) => {
        return (
          order.order_id === bnfLongOrderId?.putShort?.order_id &&
          order.status === "COMPLETE"
        );
      });

      if (putShortId.length > 0 && putShortId?.[0]?.average_price !== "") {
        await setDoc(
          doc(db, "5minSupertrend", "bnfLong"),
          {
            putShort: {
              order_id: bnfLongOrderId?.putShort?.order_id,
              average_price: putShortId?.[0]?.average_price,
            },
            slPoints: 85,
            tgtPoints: 177,
          },
          { merge: true }
        )
          .then(() => {
            toastHandler(`Super Trend Bank Nifty long order book updated`);
          })
          .catch((e) => {
            toastHandler(`Super Trend Bank Nifty long order Book Error: ${e}`);
          });
      }
    });

    await axios.get(`/api/orderInfo`).then(async (response) => {
      // console.log(response);
      let callShortId = response?.data?.filter((order) => {
        return (
          order.order_id === bnfShortOrderId?.callShort?.order_id &&
          order.status === "COMPLETE"
        );
      });
      if (callShortId.length > 0 && callShortId?.[0]?.average_price !== "") {
        await setDoc(
          doc(db, "5minSupertrend", "bnfShort"),
          {
            callShort: {
              order_id: bnfShortOrderId?.callShort?.order_id,
              average_price: callShortId?.[0]?.average_price,
            },
            slPoints: 85,
            tgtPoints: 177,
          },
          { merge: true }
        )
          .then(() => {
            toastHandler(`Super Trend Bank Nifty short order book updated`);
          })
          .catch((e) => {
            toastHandler(`Super Trend Bank Nifty short order Book Error: ${e}`);
          });
      }
    });
  };

  useEffect(() => {
    if (
      (niftyLongOrderId?.putShort?.orderId &&
        !niftyLongOrderId?.putShort?.average_price) ||
      (niftyShortOrderId?.callShort?.orderId &&
        !niftyShortOrderId?.callShort?.average_price)
    ) {
      updateOrderBookNifty();
    }
    if (
      (bnfLongOrderId?.putShort?.orderId &&
        !bnfLongOrderId?.putShort?.average_price) ||
      (bnfShortOrderId?.callShort?.orderId &&
        !bnfShortOrderId?.callShort?.average_price)
    ) {
      updateOrderBookBnf();
    }
  }, [tickerData]);

  const bnfSetSL = async (slPoints) => {
    if (bnfLongOrderId?.putShort?.trading_symbol) {
      await setDoc(
        doc(db, "5minSupertrend", "bnfLong"),
        {
          slPoints: parseInt(slPoints),
        },
        { merge: true }
      );
      toastHandler(`Super Trend Bank Nifty Long SL points ${slPoints}`);
    } else if (bnfShortOrderId?.callShort?.trading_symbol) {
      await setDoc(
        doc(db, "5minSupertrend", "bnfShort"),
        {
          slPoints: parseInt(slPoints),
        },
        { merge: true }
      );
      toastHandler(`Super Trend Bank Nifty Short SL points ${slPoints}`);
    } else {
      toastHandler(`Super Trend Bank Nifty no trades found`);
    }
  };

  const bnfSetTG = async (tgtPoints) => {
    if (bnfLongOrderId?.putShort?.trading_symbol) {
      await setDoc(
        doc(db, "5minSupertrend", "bnfLong"),
        {
          tgtPoints: parseInt(tgtPoints),
        },
        { merge: true }
      );
      toastHandler(`Super Trend Bank Nifty Long TGT points ${tgtPoints}`);
    } else if (bnfShortOrderId?.callShort?.trading_symbol) {
      await setDoc(
        doc(db, "5minSupertrend", "bnfShort"),
        {
          tgtPoints: parseInt(tgtPoints),
        },
        { merge: true }
      );
      toastHandler(`Super Trend Bank Nifty Short TGT points ${tgtPoints}`);
    } else {
      toastHandler(`Super Trend Bank Nifty no trades found`);
    }
  };

  const bnfLongExit = async () => {
    if (bnfLongOrderId?.putShort?.trading_symbol) {
      await axios
        .get(
          // `/api/placeOrderFnoBnf?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`
          `/api/placeOrderFnoBnf?tradingsymbol=${bnfLongOrderId?.putShort?.trading_symbol}&transaction_type=BUY&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            toastHandler(`Super Trend Bank Nifty long exit done`);
            await updateDoc(doc(db, "5minSupertrend", "bnfLong"), {
              putShort: deleteField(),
              entryPrice: deleteField(),
              slPoints: deleteField(),
              tgtPoints: deleteField(),
            });
          }
        });
    } else {
      toastHandler(`Super Trend Bank Nifty long no positions Found`);
    }
  };

  const bnfShortExit = async () => {
    if (bnfShortOrderId?.callShort?.trading_symbol) {
      await axios
        .get(
          // `/api/placeOrderFnoBnf?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`
          `/api/placeOrderFnoBnf?tradingsymbol=${bnfShortOrderId?.callShort?.trading_symbol}&transaction_type=BUY&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            toastHandler(`Super Trend Bank Nifty short exit done`);
            await updateDoc(doc(db, "5minSupertrend", "bnfShort"), {
              callShort: deleteField(),
              entryPrice: deleteField(),
              slPoints: deleteField(),
              tgtPoints: deleteField(),
            });
          }
        });
    } else {
      toastHandler(`Super Trend Bank Nifty long no positions Found`);
    }
  };

  useEffect(() => {
    const bnfLongSLManager = async () => {
      if (
        bnfLongOrderId?.putShort?.trading_symbol &&
        bnfLongOrderId?.slPoints &&
        bnfLongOrderId?.tgtPoints &&
        bnfLongOrderId?.entryPrice
      ) {
        let sl_level = bnfLongOrderId?.entryPrice - bnfLongOrderId?.slPoints;
        let tgt_level = bnfLongOrderId?.entryPrice + bnfLongOrderId?.tgtPoints;
        let relativeSl = bnfLongOrderId?.average_price * 0.4;
        let mtm = bnfLongOrderId?.putShort?.average_price - bnfShortPutLtp;
        // console.log(mtm);

        if (bnfFutLtp >= tgt_level || mtm >= bnfLongOrderId?.tgtPoints) {
          await bnfLongExit();
          toastHandler(`Super Trend Bank Nifty long TGT reached`);
        }
        if (
          bnfFutLtp <= sl_level ||
          mtm <= -bnfLongOrderId?.slPoints ||
          mtm <= -relativeSl
        ) {
          await bnfLongExit();
          toastHandler(`Super Trend Bank Nifty long SL reached`);
        }
      }
    };
    bnfLongSLManager();
  }, [tickerData, bnfLongOrderId]);

  useEffect(() => {
    const bnfShortSLManager = async () => {
      if (
        bnfShortOrderId?.callShort?.trading_symbol &&
        bnfShortOrderId?.slPoints &&
        bnfShortOrderId?.tgtPoints &&
        bnfShortOrderId?.entryPrice
      ) {
        let sl_level = bnfShortOrderId?.entryPrice + bnfShortOrderId?.slPoints;
        let tgt_level =
          bnfShortOrderId?.entryPrice - bnfShortOrderId?.tgtPoints;
        let relativeSl = bnfShortOrderId?.average_price * 0.4;
        let mtm = bnfShortOrderId?.callShort?.average_price - bnfShortCallLtp;

        // console.log("short", mtm);

        if (bnfFutLtp <= tgt_level || mtm >= bnfShortOrderId?.tgtPoints) {
          await bnfShortExit();
          toastHandler(`Super Trend Bank Nifty short TGT reached`);
        }

        if (
          bnfFutLtp >= sl_level ||
          mtm <= -bnfShortOrderId?.slPoints ||
          mtm <= -relativeSl
        ) {
          await bnfShortExit();
          toastHandler(`Super Trend Bank Nifty short SL reached`);
        }
      }
    };
    bnfShortSLManager();
  }, [tickerData, bnfShortOrderId]);

  const [nextCheck, setNextCheck] = useState(null);
  const [nextEntryCheck, setNextEntryCheck] = useState(null);
  const [exitAllCheck, setExitAllCheck] = useState(null);
  //   Monitoring Real time
  //
  //
  //  Start
  useEffect(() => {
    const monitorNiftyShortTrailing = async () => {
      if (
        niftyShortOrderId?.callShort?.trading_symbol &&
        niftyShortOrderId?.entryPrice &&
        nextCheck !== null
      ) {
        if (
          (niftyFutLtp > nifty10SMA &&
            niftyFutLtp >= niftyShortOrderId?.entryPrice) ||
          niftyFutLtp > nifty20SMA ||
          niftyFutLtp > niftySuperTrend?.supertrend_value
        ) {
          await niftyShortExit();
          toastHandler(`Super Trend Nifty short Trailing SL reached`);
        } else {
          toastHandler(`Super Trend Nifty short TSL No reached`);
        }
      } else {
        console.log("Super Trend Nifty Short No positions");
      }
    };
    const monitorNiftyLongTrailing = async () => {
      if (
        niftyLongOrderId?.putShort?.trading_symbol &&
        niftyLongOrderId?.entryPrice &&
        nextCheck !== null
      ) {
        if (
          (niftyFutLtp < nifty10SMA &&
            niftyFutLtp <= niftyLongOrderId?.entryPrice) ||
          niftyFutLtp < nifty20SMA ||
          niftyFutLtp < niftySuperTrend?.supertrend_value
        ) {
          await niftyLongExit();
          toastHandler(`Super Trend Nifty long Trailing SL reached`);
        } else {
          toastHandler(`Super Trend Nifty long TSL No reached`);
        }
      } else {
        console.log("Super Trend Nifty Long No positions");
      }
    };

    const monitorBnfShortTrailing = async () => {
      if (
        bnfShortOrderId?.callShort?.trading_symbol &&
        bnfShortOrderId?.entryPrice &&
        nextCheck !== null
      ) {
        if (
          (bnfFutLtp > bnf10SMA && bnfFutLtp >= bnfShortOrderId?.entryPrice) ||
          bnfFutLtp > bnf20SMA ||
          bnfFutLtp > bnfSuperTrend?.supertrend_value
        ) {
          bnfShortExit();
          toastHandler(`Super Trend Bank Nifty short Trailing SL reached`);
        } else {
          toastHandler(`Super Trend Bank Nifty short TSL No reached`);
        }
      } else {
        console.log("Super Trend BnfShort No positions");
      }
    };
    const monitorBnfLongTrailing = async () => {
      if (
        bnfLongOrderId?.putShort?.trading_symbol &&
        bnfLongOrderId?.entryPrice &&
        nextCheck !== null
      ) {
        if (
          (bnfFutLtp < bnf10SMA && bnfFutLtp <= bnfLongOrderId?.entryPrice) ||
          bnfFutLtp < bnf20SMA ||
          bnfFutLtp < bnfSuperTrend?.supertrend_value
        ) {
          await bnfLongExit();
          toastHandler(`Super Trend Bank Nifty long Trailing SL reached`);
        } else {
          toastHandler(`Super Trend Bank Nifty long TSL No reached`);
        }
      } else {
        console.log("Super Trend BnfLong No positions");
      }
    };
    if (nextCheck !== null) {
      monitorNiftyShortTrailing();
      monitorNiftyLongTrailing();
      monitorBnfShortTrailing();
      monitorBnfLongTrailing();
    }
  }, [nextCheck]);

  const monitorSideChangeNifty = async (side) => {
    await updateDoc(doc(db, "5minSupertrend", "niftySuperTrend"), {
      monitorSide: side,
    });
  };
  const monitorSideChangeBnf = async (side) => {
    await updateDoc(doc(db, "5minSupertrend", "bnfSuperTrend"), {
      monitorSide: side,
    });
  };

  useEffect(() => {
    const checkNiftyLongEntry = async () => {
      if (!niftyLongOrderId?.putShort && nextEntryCheck !== null) {
        let lastClose = niftyCandles?.[0]?.close;
        if (
          niftyFutLtp > niftySuperTrend?.supertrend_value &&
          niftySuperTrend?.monitorSide === "long" &&
          niftyFutLtp - lastClose <= 30
        ) {
          await niftyLong();
          await monitorSideChangeNifty("short");
          toastHandler(`Super Trend Nifty Monitor Only Short`);
        } else if (niftyFutLtp - lastClose > 30) {
          await monitorSideChangeNifty("short");
        } else {
          console.log("SuperTrend Long Entry not met");
        }
      } else {
        toastHandler("NIFTY Supertrend Long still open");
      }
    };
    const checkNiftyShortEntry = async () => {
      if (!niftyShortOrderId?.callShort && nextEntryCheck !== null) {
        let lastClose = niftyCandles?.[0]?.close;
        if (
          niftyFutLtp < niftySuperTrend?.supertrend_value &&
          niftySuperTrend?.monitorSide === "short" &&
          lastClose - niftyFutLtp <= 30
        ) {
          await niftyShort();
          await monitorSideChangeNifty("long");
          toastHandler(`Super Trend Nifty Monitor Only Long`);
        } else if (lastClose - niftyFutLtp > 30) {
          await monitorSideChangeNifty("long");
        } else {
          console.log("SuperTrend Short Entry not met");
        }
      } else {
        toastHandler("NIFTY Supertrend Short still open");
      }
    };
    const checkBnfLongEntry = async () => {
      if (!bnfLongOrderId?.putShort && nextEntryCheck !== null) {
        let lastClose = bnfCandles?.[0]?.close;
        if (
          bnfFutLtp > bnfSuperTrend?.supertrend_value &&
          bnfSuperTrend?.monitorSide === "long" &&
          bnfFutLtp - lastClose <= 100
        ) {
          await bnfLong();
          await monitorSideChangeBnf("short");
          toastHandler(`Super Trend Bank Nifty Monitor Only Short`);
        } else if (bnfFutLtp - lastClose > 100) {
          await monitorSideChangeBnf("short");
        } else {
          console.log("Bank Nifty SuperTrend Long Entry not met");
        }
      } else {
        toastHandler("Bank Nifty Supertrend Long still open");
      }
    };
    const checkBnfShortEntry = async () => {
      if (!bnfShortOrderId?.callShort && nextEntryCheck !== null) {
        let lastClose = bnfCandles?.[0]?.close;
        if (
          bnfFutLtp < bnfSuperTrend?.supertrend_value &&
          bnfSuperTrend?.monitorSide === "short" &&
          lastClose - bnfFutLtp <= 100
        ) {
          await bnfShort();
          await monitorSideChangeBnf("long");
          toastHandler(`Super Trend Bank Nifty Montior Only Long`);
        } else if (lastClose - bnfFutLtp > 100) {
          await monitorSideChangeBnf("long");
        } else {
          console.log("Bank Nifty SuperTrend Short Entry not met");
        }
      } else {
        toastHandler("Bank Nifty Supertrend Short still open");
      }
    };
    if (nextEntryCheck !== null) {
      checkNiftyLongEntry();
      checkNiftyShortEntry();
      checkBnfLongEntry();
      checkBnfShortEntry();
    }
  }, [nextEntryCheck]);

  useEffect(() => {
    const exitAllPositions = () => {
      if (exitAllCheck === "exitTimeNow") {
        niftyLongExit();
        niftyShortExit();
        bnfLongExit();
        bnfShortExit();
      }
    };
    if (exitAllCheck === "exitTimeNow") {
      exitAllPositions();
    }
  }, [exitAllCheck]);

  socket?.on("checkSl", (data) => {
    setNextCheck(data);
  });
  socket?.on("checkEntry", (data) => {
    setNextEntryCheck(data);
  });

  socket?.on("exitAll", (data) => {
    setExitAllCheck(data);
  });

  useEffect(() => {
    refreshOpenPos();
  }, [isSuccess]);

  useEffect(() => {
    const slTgtRefresh = () => {
      if (niftyLongOrderId?.slPoints || niftyLongOrderId?.tgtPoints) {
        document.getElementById("supertrendniftySl").value =
          niftyLongOrderId?.slPoints;
        document.getElementById("supertrendniftyTgt").value =
          niftyLongOrderId?.tgtPoints;
      } else if (niftyShortOrderId?.slPoints || niftyShortOrderId?.tgtPoints) {
        document.getElementById("supertrendniftySl").value =
          niftyShortOrderId?.slPoints;
        document.getElementById("supertrendniftyTgt").value =
          niftyShortOrderId?.tgtPoints;
      } else {
        document.getElementById("supertrendniftySl").value = "";
        document.getElementById("supertrendniftyTgt").value = "";
      }

      if (bnfLongOrderId?.slPoints || bnfLongOrderId?.tgtPoints) {
        document.getElementById("supertrendbnfSl").value =
          bnfLongOrderId?.slPoints;
        document.getElementById("supertrendbnfTgt").value =
          bnfLongOrderId?.tgtPoints;
      } else if (bnfShortOrderId?.slPoints || bnfShortOrderId?.tgtPoints) {
        document.getElementById("supertrendbnfSl").value =
          bnfShortOrderId?.slPoints;
        document.getElementById("supertrendbnfTgt").value =
          bnfShortOrderId?.tgtPoints;
      } else {
        document.getElementById("supertrendbnfSl").value = "";
        document.getElementById("supertrendbnfTgt").value = "";
      }
    };

    slTgtRefresh();
  }, [niftyLongOrderId, niftyShortOrderId, bnfLongOrderId, bnfShortOrderId]);

  useEffect(() => {
    // console.log(nextEntryCheck);
    // console.log(niftyCandles?.slice(0, 19));
    // console.log(bnfCandles?.slice(0, 19));
    // console.log(niftyCandles);
    // console.log(bnfCandles);
    // console.log(nifty10SMA);
    // console.log(nifty20SMA);
    // console.log(bnf10SMA);
    // console.log(bnf20SMA);
    // console.log(niftyLongPutBuy);
    // console.log(niftyLongOrderId);
    // console.log(nextCheck == null);
  }, [niftyLongOrderId, niftyLtp, nextEntryCheck]);

  // console.log(formatDate(date));
  return (
    <>
      {/* <h1>{JSON.stringify(expiries)}</h1> */}
      {/* {niftyRounded}:{bnfRounded} */}

      <div className="w-full p-2 h-max">
        <div className="flex justify-between w-full h-full shadow-lg innerNav bg-neutral rounded-2xl">
          <div className="flex items-center nifty">
            <div className="m-3 ml-6">
              Nifty Expiry: {expiries?.niftyExpiryDates?.[0]?.slice(0, 10)} ||
              Strike Expiry: {niftyShortCallSell?.expiry.slice(0, 10)} ||
              Quantity: {niftyQty}
            </div>
          </div>

          {isSuccess &&
            niftyFutData?.instrument_token &&
            bnfFutData?.instrument_token &&
            niftySpotData?.instrument_token &&
            bnfSpotData?.instrument_token && (
              <div className="flex justify-end m-1">
                <button
                  className="mr-4 text-black btn btn-accent "
                  onClick={refreshOpenPos}
                >
                  Refresh Position
                </button>
              </div>
            )}
          <div className="flex items-center bnf">
            <div className="m-3 mr-6">
              BNF Expiry: {expiries?.bnfExpiryDates?.[0]?.slice(0, 10)} ||
              Strike Expiry: {bnfShortCallSell?.expiry.slice(0, 10)} ||
              Quantity: {bnfQty}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center w-full strikes justify-evenly ">
        <div className="self-start niftySection">
          <div className="flex justify-between Strikes ">
            <div className="w-full m-3 shadow stats bg-neutral">
              <div className="text-center stat">
                <div className="text-xs long text-slate-400 ">Long Strikes</div>
                <div className="stat-title">PE Sell</div>
                <div className="text-xl font-bold">
                  {niftyLongPutSell?.strike}
                  {niftyLongPutSell?.instrument_type}
                </div>
                <div className="text-sm">LTP: {niftyShortPutLtp}</div>
              </div>
            </div>

            <div className="w-full m-3 shadow stats bg-neutral">
              <div className="text-center stat">
                <div className="text-xs long text-slate-400">Short Strikes</div>

                <div className="stat-title">CE Sell</div>
                <div className="text-xl font-bold">
                  {niftyShortCallSell?.strike}
                  {niftyShortCallSell?.instrument_type}
                </div>
                <div className="text-sm">LTP: {niftyShortCallLtp}</div>
              </div>
            </div>
          </div>
          {/* SPOT AND FUT */}
          <div className="flex justify-between ltps ">
            <div className="w-full m-3 overflow-hidden shadow stats bg-neutral">
              <div className="overflow-hidden stat">
                <div className="stat-title">Spot</div>
                <div className="text-xl font-bold">{niftyLtp}</div>
              </div>

              <div className="overflow-hidden stat">
                <div className="stat-title">Future</div>
                <div className="text-xl font-bold">{niftyFutLtp}</div>
              </div>
            </div>
            <div className="w-full m-3 overflow-hidden shadow stats bg-neutral">
              <div className="overflow-hidden stat">
                <div className="stat-title">Long ST</div>
                <div className="text-xl font-bold">
                  {niftySuperTrend?.direction === "long"
                    ? niftySuperTrend?.supertrend_value.toFixed(2)
                    : "None"}
                </div>
              </div>

              <div className="overflow-hidden stat">
                <div className="stat-title">Short ST</div>
                <div className="text-xl font-bold">
                  {niftySuperTrend?.direction === "short"
                    ? niftySuperTrend?.supertrend_value.toFixed(2)
                    : "None"}
                </div>
              </div>
            </div>
          </div>
          {/*  */}
          {/* TOGGLE MONITOR SIDE*/}
          {/*  */}

          <div className="flex items-center justify-between mx-3 toggleMonitor">
            <button
              className="text-white bg-opacity-100 bg-neutral btn monitorSide"
              onClick={() => {
                if (niftySuperTrend?.monitorSide === "long") {
                  monitorSideChangeNifty("short");
                } else if (niftySuperTrend?.monitorSide === "short") {
                  monitorSideChangeNifty("long");
                }
              }}
            >
              Monitoring: {niftySuperTrend?.monitorSide}
            </button>
            <button className="text-white bg-opacity-100 btn-disabled bg-neutral btn monitorSide">
              Current Side: {niftySuperTrend?.direction}
            </button>
          </div>

          {/*  */}
          {/* ENTRY BUTTONS */}
          {/*  */}

          <div className="flex justify-between w-full entryButtons">
            <button
              className="w-48 m-3 text-white btn btn-secondary "
              onClick={niftyLong}
            >
              Long Nifty
            </button>
            <button
              className="w-48 m-3 text-white short btn btn-secondary"
              onClick={niftyShort}
            >
              Short Nifty
            </button>
          </div>

          {/*  */}
          {/* EXIT BUTTONS */}
          {/*  */}

          <div className="flex justify-between w-full exitButtons">
            <button className="w-48 m-3 text-white btn" onClick={niftyLongExit}>
              Exit Long Nifty
            </button>
            <button
              className="w-48 m-3 text-white short btn"
              onClick={niftyShortExit}
            >
              Exit Short Nifty
            </button>
          </div>

          {/*  */}
          {/* REFRESH ORDER */}
          {/*  */}

          <div className="w-full p-3 refreshOrder">
            <button
              className="w-full text-white btn btn-secondary"
              onClick={updateOrderBookNifty}
            >
              Refresh Order Book Nifty
            </button>
          </div>

          {/*  */}
          {/* SL TGT SETTER */}
          {/*  */}

          <div className="flex justify-between w-full p-3 pt-0 setSLTGT">
            <div className="setSl join">
              <input
                type="number"
                id="supertrendniftySl"
                className="w-32 input input-bordered input-md join-item"
              />
              <button
                className="text-white btn btn-secondary join-item"
                onClick={() => {
                  let sl = document.getElementById("supertrendniftySl").value;
                  niftySetSL(sl);
                }}
              >
                SL Nifty
              </button>
            </div>
            <div className="setTgt join ">
              <input
                type="number"
                id="supertrendniftyTgt"
                className="w-32 input input-bordered input-md join-item"
              />
              <button
                className="text-white btn btn-secondary join-item"
                onClick={() => {
                  let tgt = document.getElementById("supertrendniftyTgt").value;
                  niftySetTG(tgt);
                }}
              >
                TGT Nifty
              </button>
            </div>
          </div>

          {/*  */}
          {/* POSITION CARD*/}
          {/*  */}

          <div className="p-2 openPosition">
            <div className="w-full shadow-xl card bg-base-200">
              <div className="card-body">
                <h2 className="card-title">Open Position</h2>
                {/*  */}
                {/* Long POSITION */}
                {/*  */}
                {niftyLongOrderId?.entryPrice &&
                  niftyLongOrderId?.putShort?.trading_symbol && (
                    <div className="flex flex-col items-center long">
                      <div className="mt-3 mb-3 shadow stats">
                        <div className="stat">
                          <div className="stat-title">Direction</div>
                          <div className="text-xl font-bold">Long</div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Entry Price</div>
                          <div className="text-xl font-bold">
                            {niftyLongOrderId?.entryPrice}
                          </div>
                        </div>
                      </div>
                      <div className="mb-3 shadow stats">
                        <div className="stat">
                          <div className="stat-title">Strike</div>
                          <div className="text-xl font-bold">
                            {niftyLongOrderId?.putShort?.trading_symbol}
                          </div>
                          <div className="stat-desc">
                            PNL:{" "}
                            {(
                              (niftyLongOrderId?.putShort?.average_price -
                                niftyShortPutLtp) *
                              niftyQty
                            ).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="shadow stats">
                        <div className="stat">
                          <div className="stat-title">Total</div>
                          <div className="text-xl font-bold">
                            {(
                              (niftyLongOrderId?.putShort?.average_price -
                                niftyShortPutLtp) *
                              niftyQty
                            ).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                {/*  */}
                {/* SHORT POSITION */}
                {/*  */}
                {niftyShortOrderId?.entryPrice &&
                  niftyShortOrderId?.callShort?.trading_symbol && (
                    <div className="flex flex-col items-center short">
                      <div className="mt-3 mb-3 shadow stats">
                        <div className="stat">
                          <div className="stat-title">Direction</div>
                          <div className="text-xl font-bold">Short</div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Entry Price</div>
                          <div className="text-xl font-bold">
                            {niftyShortOrderId?.entryPrice}
                          </div>
                        </div>
                      </div>
                      <div className="mb-3 shadow stats">
                        <div className="stat">
                          <div className="stat-title">Strike</div>
                          <div className="text-xl font-bold">
                            {niftyShortOrderId?.callShort?.trading_symbol}
                          </div>
                          <div className="stat-desc">
                            PNL:
                            {(
                              (niftyShortOrderId?.callShort?.average_price -
                                niftyShortCallLtp) *
                              niftyQty
                            ).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="shadow stats">
                        <div className="stat">
                          <div className="stat-title">Total</div>
                          <div className="text-xl font-bold">
                            {(
                              (niftyShortOrderId?.callShort?.average_price -
                                niftyShortCallLtp) *
                              niftyQty
                            ).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
        {/*  */}
        {/* BNF  */}
        {/*  */}
        <div className="self-start bnfSection">
          <div className="flex justify-between Strikes">
            <div className="w-full m-3 shadow stats bg-neutral">
              <div className="text-center stat">
                <div className="text-xs long text-slate-400">Long Strikes</div>

                <div className="stat-title">PE Sell</div>
                <div className="text-xl font-bold">
                  {bnfLongPutSell?.strike}
                  {bnfLongPutSell?.instrument_type}
                </div>
                <div className="text-sm">LTP: {bnfShortPutLtp}</div>
              </div>
            </div>
            <div className="w-full m-3 shadow stats bg-neutral">
              <div className="text-center stat">
                <div className="text-xs long text-slate-400">Short Strikes</div>

                <div className="stat-title">CE Sell</div>
                <div className="text-xl font-bold">
                  {bnfShortCallSell?.strike}
                  {bnfShortCallSell?.instrument_type}
                </div>
                <div className="text-sm">LTP: {bnfShortCallLtp}</div>
              </div>
            </div>
          </div>
          {/* SPOT AND FUT */}
          <div className="flex justify-between ltps ">
            <div className="w-full m-3 overflow-hidden shadow stats bg-neutral">
              <div className="overflow-hidden stat">
                <div className="stat-title">Spot</div>
                <div className="text-xl font-bold">{bnfLtp}</div>
              </div>

              <div className="overflow-hidden stat">
                <div className="stat-title">Future</div>
                <div className="text-xl font-bold">{bnfFutLtp}</div>
              </div>
            </div>
            <div className="w-full m-3 overflow-hidden shadow stats bg-neutral">
              <div className="overflow-hidden stat">
                <div className="stat-title">Long ST</div>
                <div className="text-xl font-bold">
                  {" "}
                  {bnfSuperTrend?.direction === "long"
                    ? bnfSuperTrend?.supertrend_value.toFixed(2)
                    : "None"}
                </div>
              </div>

              <div className="overflow-hidden stat">
                <div className="stat-title">Short ST</div>
                <div className="text-xl font-bold">
                  {" "}
                  {bnfSuperTrend?.direction === "short"
                    ? bnfSuperTrend?.supertrend_value.toFixed(2)
                    : "None"}
                </div>
              </div>
            </div>
          </div>
          {/*  */}
          {/* TOGGLE MONITOR SIDE*/}
          {/*  */}

          <div className="flex items-center justify-between mx-3 toggleMonitor">
            <button
              className="text-white bg-opacity-100 bg-neutral btn monitorSide"
              onClick={() => {
                if (bnfSuperTrend?.monitorSide === "long") {
                  monitorSideChangeBnf("short");
                } else if (bnfSuperTrend?.monitorSide === "short") {
                  monitorSideChangeBnf("long");
                }
              }}
            >
              Monitoring: {bnfSuperTrend?.monitorSide}
            </button>
            <button className="text-white bg-opacity-100 btn-disabled bg-neutral btn monitorSide">
              Current Side: {bnfSuperTrend?.direction}
            </button>
          </div>

          {/*  */}
          {/* ENTRY BUTTONS */}
          {/*  */}

          <div className="flex justify-between w-full entryButtons">
            <button
              className="w-48 m-3 text-white btn btn-secondary"
              onClick={bnfLong}
            >
              Long Bank Nifty
            </button>
            <button
              className="w-48 m-3 text-white short btn btn-secondary"
              onClick={bnfShort}
            >
              Short Bank Nifty
            </button>
          </div>

          {/*  */}
          {/* EXIT BUTTONS */}
          {/*  */}

          <div className="flex justify-between w-full exitButtons">
            <button className="w-48 m-3 text-white btn" onClick={bnfLongExit}>
              Exit Long Bank Nifty
            </button>
            <button
              className="w-48 m-3 text-white short btn"
              onClick={bnfShortExit}
            >
              Exit Short Bank Nifty
            </button>
          </div>

          {/*  */}
          {/* REFRESH ORDER */}
          {/*  */}

          <div className="w-full p-3 refreshOrder">
            <button
              className="w-full text-white btn btn-secondary"
              onClick={updateOrderBookBnf}
            >
              Refresh Order Book Bank Nifty
            </button>
          </div>

          {/*  */}
          {/* SL TGT SETTER */}
          {/*  */}

          <div className="flex justify-between w-full p-3 pt-0 setSLTGT ">
            <div className="setSl join">
              <input
                type="number"
                id="supertrendbnfSl"
                className="w-32 input input-bordered input-md join-item"
              />
              <button
                className="text-white btn btn-secondary join-item"
                onClick={() => {
                  let sl = document.getElementById("supertrendbnfSl").value;
                  bnfSetSL(sl);
                }}
              >
                SL Bank Nifty
              </button>
            </div>
            <div className="setTgt join">
              <input
                type="number"
                id="supertrendbnfTgt"
                className="w-32 input input-bordered input-md join-item"
              />
              <button
                className="text-white btn btn-secondary join-item"
                onClick={() => {
                  let tgt = document.getElementById("supertrendbnfTgt").value;
                  bnfSetTG(tgt);
                }}
              >
                TGT Bank Nifty
              </button>
            </div>
          </div>

          {/*  */}
          {/* POSITION CARD*/}
          {/*  */}

          <div className="p-2 openPosition">
            <div className="w-full shadow-xl card bg-base-200">
              <div className="card-body">
                <h2 className="card-title">Open Position</h2>
                {/*  */}
                {/* Long POSITION */}
                {/*  */}
                {bnfLongOrderId?.entryPrice &&
                  bnfLongOrderId?.putShort?.trading_symbol && (
                    <div className="flex flex-col items-center long">
                      <div className="mt-3 mb-3 shadow stats">
                        <div className="stat">
                          <div className="stat-title">Direction</div>
                          <div className="text-xl font-bold">Long</div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Entry Price</div>
                          <div className="text-xl font-bold">
                            {bnfLongOrderId?.entryPrice}
                          </div>
                        </div>
                      </div>
                      <div className="mb-3 shadow stats">
                        <div className="stat">
                          <div className="stat-title">Sell Strike</div>
                          <div className="text-xl font-bold">
                            {bnfLongOrderId?.putShort?.trading_symbol}
                          </div>
                          <div className="stat-desc">
                            PNL:{" "}
                            {(
                              (bnfLongOrderId?.putShort?.average_price -
                                bnfShortPutLtp) *
                              bnfQty
                            ).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="shadow stats">
                        <div className="stat">
                          <div className="stat-title">Total</div>
                          <div className="text-xl font-bold">
                            {(
                              (bnfLongOrderId?.putShort?.average_price -
                                bnfShortPutLtp) *
                              bnfQty
                            ).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                {/*  */}
                {/* SHORT POSITION */}
                {/*  */}
                {bnfShortOrderId?.entryPrice &&
                  bnfShortOrderId?.callShort?.trading_symbol && (
                    <div className="flex flex-col items-center short">
                      <div className="mt-3 mb-3 shadow stats">
                        <div className="stat">
                          <div className="stat-title">Direction</div>
                          <div className="text-xl font-bold">Short</div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Entry Price</div>
                          <div className="text-xl font-bold">
                            {bnfShortOrderId?.entryPrice}
                          </div>
                        </div>
                      </div>
                      <div className="mb-3 shadow stats">
                        <div className="stat">
                          <div className="stat-title">Sell Strike</div>
                          <div className="text-xl font-bold">
                            {bnfShortOrderId?.callShort?.trading_symbol}
                          </div>
                          <div className="stat-desc">
                            PNL:
                            {(
                              (bnfShortOrderId?.callShort?.average_price -
                                bnfShortCallLtp) *
                              bnfQty
                            ).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="shadow stats">
                        <div className="stat">
                          <div className="stat-title">Total</div>
                          <div className="text-xl font-bold">
                            {(
                              (bnfShortOrderId?.callShort?.average_price -
                                bnfShortCallLtp) *
                              bnfQty
                            ).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Supertrend;
