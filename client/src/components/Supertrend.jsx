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
  const [niftyQty, setNiftyQty] = useState(200);
  const [bnfQty, setBnfQty] = useState(60);

  // Saves LTP every second
  const [niftyLtp, setNiftyLtp] = useState();
  const [niftyFutLtp, setNiftyFutLtp] = useState();
  const [bnfLtp, setBnfLtp] = useState();
  const [bnfFutLtp, setBnfFutLtp] = useState();

  // Rounded to nearest Strike
  const [niftyRounded, setNiftyRounded] = useState();
  const [bnfRounded, setBnfRounded] = useState();

  const [niftyShortCallSell, setNiftyShortCallSell] = useState();
  const [niftyShortPutBuy, setNiftyShortPutBuy] = useState();

  const [niftyLongPutSell, setNiftyLongPutSell] = useState();
  const [niftyLongCallBuy, setNiftyLongCallBuy] = useState();

  const [bnfShortCallSell, setBnfShortCallSell] = useState();
  const [bnfShortPutBuy, setBnfShortPutBuy] = useState();

  const [bnfLongPutSell, setBnfLongPutSell] = useState();
  const [bnfLongCallBuy, setBnfLongCallBuy] = useState();

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

  // Holds Long position LTPS
  const [niftyLongPutLtp, setNiftyLongPutLtp] = useState();
  const [niftyLongCallLtp, setNiftyLongCallLtp] = useState();

  // Holds Short position LTPS
  const [niftyShortCallLtp, setNiftyShortCallLtp] = useState();
  const [niftyShortPutLtp, setNiftyShortPutLtp] = useState();

  const [bnfLongOrderId, setBnfLongOrderId] = useState();
  const [bnfShortOrderId, setBnfShortOrderId] = useState();

  // Holds Long position LTPS
  const [bnfLongPutLtp, setBnfLongPutLtp] = useState();
  const [bnfLongCallLtp, setBnfLongCallLtp] = useState();

  // Holds Short position LTPS
  const [bnfShortCallLtp, setBnfShortCallLtp] = useState();
  const [bnfShortPutLtp, setBnfShortPutLtp] = useState();

  const [refreshExistingOrder, setRefreshExistingOrder] = useState();

  const refreshOpenPos = () => {
    setRefreshExistingOrder(Math.random()); //
    // console.log(refreshExistingOrder);
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
        data.instrument_token === bnfShortOrderId?.putShort?.instrument_token
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
      setNiftyLongPutLtp(niftyLong?.[0]?.last_price);
    }
    if (niftyShort.length > 0) {
      setNiftyShortCallLtp(niftyShort?.[0]?.last_price);
    }

    // BNF LTP

    if (bnfLong.length > 0) {
      setBnfLongPutLtp(bnfLong?.[0]?.last_price);
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
        console.log(doc.data());
      }
    );
    const unsub2 = onSnapshot(
      doc(db, "5minSupertrend", "bnfSuperTrend"),
      (doc) => {
        setBnfSuperTrend(doc.data());
        console.log(doc.data());
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
        let atrCalcTemp =
          (atr?.slice(-20)?.[i - 1] * (periods - 1) + tr) / periods;
        atrValue = atrCalcTemp;
        //   console.log(atrCalcTemp);
      }
      atr.push(atrValue);
      // console.log(atrValue, prices[i]?.open_time);
    }

    return atr[atr.length - 1];
  };
  useEffect(() => {
    const calculateSupertrendBnf = async () => {
      let atr = await calculateATR(bnfCandles?.slice(0, 20).reverse(), 10);
      let prevCandleHigh = bnfCandles?.[0]?.high;
      let prevCandleLow = bnfCandles?.[0]?.low;
      let prevCandleClose = bnfCandles?.[0]?.close;

      let upperBand = (prevCandleHigh + prevCandleLow) / 2 + 3 * atr;
      let lowerBand = (prevCandleHigh + prevCandleLow) / 2 - 3 * atr;

      if (
        upperBand < bnfSuperTrend?.supertrend_value &&
        prevCandleClose < bnfSuperTrend?.supertrend_value
      ) {
        await setDoc(doc(db, "5minSupertrend", "bnfSuperTrend"), {
          direction: "short",
          supertrend_value: upperBand,
        });
      } else {
        console.log("noChange");
      }
      if (
        lowerBand > bnfSuperTrend?.supertrend_value &&
        prevCandleClose > bnfSuperTrend?.supertrend_value
      ) {
        await setDoc(doc(db, "5minSupertrend", "bnfSuperTrend"), {
          direction: "long",
          supertrend_value: lowerBand,
        });
      } else {
        console.log("noChange");
      }

      if (
        bnfSuperTrend?.direction == "short" &&
        prevCandleClose > bnfSuperTrend?.supertrend_value
      ) {
        await setDoc(doc(db, "5minSupertrend", "bnfSuperTrend"), {
          direction: "long",
          supertrend_value: lowerBand,
        });
      } else if (
        bnfSuperTrend?.direction == "long" &&
        prevCandleClose < bnfSuperTrend?.supertrend_value
      ) {
        await setDoc(doc(db, "5minSupertrend", "bnfSuperTrend"), {
          direction: "long",
          supertrend_value: upperBand,
        });
      } else {
        console.log("No direction change");
      }
    };
    const calculateSupertrendNifty = async () => {
      let atr = await calculateATR(niftyCandles?.slice(0, 20).reverse(), 10);
      let prevCandleHigh = niftyCandles?.[0]?.high;
      let prevCandleLow = niftyCandles?.[0]?.low;
      let prevCandleClose = niftyCandles?.[0]?.close;

      let upperBand = (prevCandleHigh + prevCandleLow) / 2 + 3 * atr;
      let lowerBand = (prevCandleHigh + prevCandleLow) / 2 - 3 * atr;

      if (
        upperBand < niftySuperTrend?.supertrend_value &&
        prevCandleClose < niftySuperTrend?.supertrend_value
      ) {
        await setDoc(doc(db, "5minSupertrend", "niftySuperTrend"), {
          direction: "short",
          supertrend_value: upperBand,
        });
      } else {
        console.log("noChange");
      }
      if (
        lowerBand > niftySuperTrend?.supertrend_value &&
        prevCandleClose > niftySuperTrend?.supertrend_value
      ) {
        await setDoc(doc(db, "5minSupertrend", "niftySuperTrend"), {
          direction: "long",
          supertrend_value: lowerBand,
        });
      } else {
        console.log("noChange");
      }

      if (
        niftySuperTrend?.direction == "short" &&
        prevCandleClose > niftySuperTrend?.supertrend_value
      ) {
        await setDoc(doc(db, "5minSupertrend", "niftySuperTrend"), {
          direction: "long",
          supertrend_value: lowerBand,
        });
      } else if (
        niftySuperTrend?.direction == "long" &&
        prevCandleClose < niftySuperTrend?.supertrend_value
      ) {
        await setDoc(doc(db, "5minSupertrend", "niftySuperTrend"), {
          direction: "long",
          supertrend_value: upperBand,
        });
      } else {
        console.log("No direction change");
      }
    };
    calculateSupertrendBnf();
    calculateSupertrendNifty();
  }, [niftyCandles, bnfCandles]);

  const niftyLong = async () => {
    if (!niftyLongOrderId.putShort) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
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
                toastHandler(`Nifty long order updated`);
              })
              .catch((e) => {
                toastHandler(`Nifty long error at firebase ${e}`);
              });
          });
        });
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "5minSupertrend", "niftyLong"), (doc) => {
      if (doc?.data()?.putShort?.order_id) {
        toastHandler(`Nifty Long order present`);
      }
      setNiftyLongOrderId(doc.data());

      socket?.emit("niftyFutToken", [doc?.data()?.putShort?.instrument_token]);
    });
  }, [refreshExistingOrder]);

  useEffect(() => {
    socket?.emit("niftyFutToken", [
      niftyLongOrderId?.putShort?.instrument_token,
    ]);
  }, [niftyLongOrderId, refreshExistingOrder]);

  const niftyShort = async () => {
    if (!niftyShortOrderId.callShort) {
      await axios
        .get(
          `/api/placeOrderFno?tradingsymbol=${niftyShortCallSell.tradingsymbol}&transaction_type=SELL&quantity=${niftyQty}&product=MIS&order_type=MARKET`
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          let orderId = response?.data?.order_id;
          if (orderId) {
            toastHandler(`CE placed OID: ${orderId}`);
          } else {
            toastHandler(`CE error ${response.data}`);
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
                toastHandler(`Nifty short order updated`);
              })
              .catch((e) => {
                toastHandler(`Nifty short error at firebase ${e}`);
              });
          });
        });
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "5minSupertrend", "niftyShort"), (doc) => {
      if (doc?.data()?.callShort?.order_id) {
        toastHandler(`Nifty Short order present`);
      }
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
      if (putShortId.length > 0) {
        await setDoc(
          doc(db, "5minSupertrend", "niftyLong"),
          {
            putShort: {
              order_id: niftyLongOrderId?.putShort?.order_id,
              average_price: putShortId?.[0]?.average_price,
            },
          },
          { merge: true }
        )
          .then(() => {
            toastHandler(`Nifty long order book updated`);
          })
          .catch((e) => {
            toastHandler(`Nifty long order Book Error: ${e}`);
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
      if (callShortId.length > 0) {
        await setDoc(
          doc(db, "5minSupertrend", "niftyShort"),
          {
            callShort: {
              order_id: niftyShortOrderId?.callShort?.order_id,
              average_price: callShortId?.[0]?.average_price,
            },
          },
          { merge: true }
        )
          .then(() => {
            toastHandler(`Nifty short order book updated`);
          })
          .catch((e) => {
            toastHandler(`Nifty short order Book Error: ${e}`);
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
      toastHandler(`Nifty Long SL points ${slPoints}`);
    } else if (niftyShortOrderId?.callShort?.trading_symbol) {
      await setDoc(
        doc(db, "5minSupertrend", "niftyShort"),
        {
          slPoints: parseInt(slPoints),
        },
        { merge: true }
      );
      toastHandler(`Nifty Short SL points ${slPoints}`);
    } else {
      toastHandler(`Nifty no trades found`);
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
      toastHandler(`Nifty Long TGT points ${tgtPoints}`);
    } else if (niftyShortOrderId?.callShort?.trading_symbol) {
      await setDoc(
        doc(db, "5minSupertrend", "niftyShort"),
        {
          tgtPoints: parseInt(tgtPoints),
        },
        { merge: true }
      );
      toastHandler(`Nifty Short TGT points ${tgtPoints}`);
    } else {
      toastHandler(`Nifty no trades found`);
    }
  };

  const niftyLongExit = async () => {
    if (niftyLongOrderId?.putShort?.trading_symbol) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFno?tradingsymbol=${niftyLongOrderId?.putShort?.trading_symbol}&transaction_type=BUY&quantity=${niftyQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            toastHandler(`Nifty long exit done`);
            await updateDoc(doc(db, "5minSupertrend", "niftyLong"), {
              putShort: deleteField(),
              entryPrice: deleteField(),
              slPoints: deleteField(),
              tgtPoints: deleteField(),
            });
          }
        });
    } else {
      toastHandler(`Nifty long no positions Found`);
    }
  };

  const niftyShortExit = async () => {
    if (niftyShortOrderId?.callShort?.trading_symbol) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFno?tradingsymbol=${niftyShortOrderId?.callShort?.trading_symbol}&transaction_type=BUY&quantity=${niftyQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            toastHandler(`Nifty short exit done`);
            await updateDoc(doc(db, "5minSupertrend", "niftyShort"), {
              callShort: deleteField(),
              entryPrice: deleteField(),
              slPoints: deleteField(),
              tgtPoints: deleteField(),
            });
          }
        });
    } else {
      toastHandler(`Nifty Short no positions Found`);
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
        // console.log(mtm);
        // console.log(niftyLongCallLtp);
        // console.log(niftyShortPutLtp);

        if (niftyFutLtp >= tgt_level || mtm >= niftyLongOrderId?.tgtPoints) {
          await niftyLongExit();
          toastHandler(`Nifty long TGT reached`);
        }
        if (
          niftyFutLtp <= sl_level ||
          mtm <= -niftyLongOrderId?.slPoints ||
          mtm <= -relativeSl
        ) {
          await niftyLongExit();
          toastHandler(`Nifty long SL reached`);
        }
      }
    };
    niftyLongSLManager();
  }, [tickerData, niftyLongOrderId]);

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
          toastHandler(`Nifty short TGT reached`);
        }

        if (
          niftyFutLtp >= sl_level ||
          mtm <= -niftyShortOrderId?.slPoints ||
          mtm <= -relativeSl
        ) {
          await niftyShortExit();
          toastHandler(`Nifty short SL reached`);
        }
      }
    };
    niftyShortSLManager();
  }, [tickerData, niftyShortOrderId]);

  //BNF

  const bnfLong = async () => {
    if (!bnfLongOrderId.putShort) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
          `/api/placeOrderFnoBnf?tradingsymbol=${bnfLongPutSell.tradingsymbol}&transaction_type=SELL&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          let orderId = response.data.order_id;
          if (orderId) {
            toastHandler(`PE placed OID: ${orderId}`);
          } else {
            toastHandler(`PE error ${response.data}`);
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
                toastHandler(`Bank Nifty long order updated`);
              })
              .catch((e) => {
                toastHandler(`Bank Nifty long error at firebase ${e}`);
              });
          });
        });
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "5minSupertrend", "bnfLong"), (doc) => {
      if (doc?.data()?.putShort?.order_id) {
        toastHandler(`Bank Nifty Long order present`);
      }
      setBnfLongOrderId(doc.data());

      socket?.emit("niftyFutToken", [doc?.data()?.putShort?.instrument_token]);
    });
  }, [refreshExistingOrder]);

  useEffect(() => {
    socket?.emit("niftyFutToken", [bnfLongOrderId?.putShort?.instrument_token]);
  }, [bnfLongOrderId, refreshExistingOrder]);

  const bnfShort = async () => {
    if (!bnfShortOrderId.callShort) {
      await axios
        .get(
          `/api/placeOrderFnoBnf?tradingsymbol=${bnfShortCallSell.tradingsymbol}&transaction_type=SELL&quantity=${bnfQty}&product=MIS&order_type=MARKET`
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          let orderId = response.data.order_id;
          if (orderId) {
            toastHandler(`CE placed OID: ${orderId}`);
          } else {
            toastHandler(`CE error ${response.data}`);
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
                toastHandler(`Bank Nifty short order updated`);
              })
              .catch((e) => {
                toastHandler(`Bank Nifty short error at firebase ${e}`);
              });
          });
        });
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "5minSupertrend", "bnfShort"), (doc) => {
      if (doc?.data()?.callShort?.order_id) {
        toastHandler(`Bank Nifty Short order present`);
      }
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

      if (putShortId.length > 0) {
        await setDoc(
          doc(db, "5minSupertrend", "bnfLong"),
          {
            putShort: {
              order_id: bnfLongOrderId?.putShort?.order_id,
              average_price: putShortId?.[0]?.average_price,
            },
          },
          { merge: true }
        )
          .then(() => {
            toastHandler(`Bank Nifty long order book updated`);
          })
          .catch((e) => {
            toastHandler(`Bank Nifty long order Book Error: ${e}`);
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
      if (callShortId.length > 0) {
        await setDoc(
          doc(db, "5minSupertrend", "bnfShort"),
          {
            callShort: {
              order_id: bnfShortOrderId?.callShort?.order_id,
              average_price: callShortId?.[0]?.average_price,
            },
          },
          { merge: true }
        )
          .then(() => {
            toastHandler(`Bank Nifty short order book updated`);
          })
          .catch((e) => {
            toastHandler(`Bank Nifty short order Book Error: ${e}`);
          });
      }
    });
  };

  const bnfSetSL = async (slPoints) => {
    if (bnfLongOrderId?.putShort?.trading_symbol) {
      await setDoc(
        doc(db, "5minSupertrend", "bnfLong"),
        {
          slPoints: parseInt(slPoints),
        },
        { merge: true }
      );
      toastHandler(`Bank Nifty Long SL points ${slPoints}`);
    } else if (bnfShortOrderId?.callShort?.trading_symbol) {
      await setDoc(
        doc(db, "5minSupertrend", "bnfShort"),
        {
          slPoints: parseInt(slPoints),
        },
        { merge: true }
      );
      toastHandler(`Bank Nifty Short SL points ${slPoints}`);
    } else {
      toastHandler(`Bank Nifty no trades found`);
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
      toastHandler(`Bank Nifty Long TGT points ${tgtPoints}`);
    } else if (bnfShortOrderId?.callShort?.trading_symbol) {
      await setDoc(
        doc(db, "5minSupertrend", "bnfShort"),
        {
          tgtPoints: parseInt(tgtPoints),
        },
        { merge: true }
      );
      toastHandler(`Bank Nifty Short TGT points ${tgtPoints}`);
    } else {
      toastHandler(`Bank Nifty no trades found`);
    }
  };

  const bnfLongExit = async () => {
    if (bnfLongOrderId?.putShort?.trading_symbol) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`
          `/api/placeOrderFnoBnf?tradingsymbol=${bnfLongOrderId?.putShort?.trading_symbol}&transaction_type=BUY&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            toastHandler(`Bank Nifty long exit done`);
            await updateDoc(doc(db, "5minSupertrend", "bnfLong"), {
              putShort: deleteField(),
              entryPrice: deleteField(),
              slPoints: deleteField(),
              tgtPoints: deleteField(),
            });
          }
        });
    } else {
      toastHandler(`Bank Nifty long no positions Found`);
    }
  };

  const bnfShortExit = async () => {
    if (bnfShortOrderId?.callShort?.trading_symbol) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`
          `/api/placeOrderFnoBnf?tradingsymbol=${bnfShortOrderId?.callShort?.trading_symbol}&transaction_type=BUY&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            toastHandler(`Bank Nifty short exit done`);
            await updateDoc(doc(db, "5minSupertrend", "bnfShort"), {
              callShort: deleteField(),
              entryPrice: deleteField(),
              slPoints: deleteField(),
              tgtPoints: deleteField(),
            });
          }
        });
    } else {
      toastHandler(`Bank Nifty long no positions Found`);
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
          toastHandler(`Bank Nifty long TGT reached`);
        }
        if (
          bnfFutLtp <= sl_level ||
          mtm <= -bnfLongOrderId?.slPoints ||
          mtm <= -relativeSl
        ) {
          await bnfLongExit();
          toastHandler(`Bank Nifty long SL reached`);
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
          toastHandler(`Bank Nifty short TGT reached`);
        }

        if (
          bnfFutLtp >= sl_level ||
          mtm <= -bnfShortOrderId?.slPoints ||
          mtm <= -relativeSl
        ) {
          await bnfShortExit();
          toastHandler(`Bank Nifty short SL reached`);
        }
      }
    };
    bnfShortSLManager();
  }, [tickerData, bnfShortOrderId]);

  const [nextCheck, setNextCheck] = useState(null);
  const [nextEntryCheck, setNextEntryCheck] = useState(null);
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
          toastHandler(`Nifty short Trailing SL reached`);
        } else {
          toastHandler(`Nifty short TSL No reached`);
        }
      } else {
        console.log("NiftyShort No positions");
      }
    };
    const monitorNiftyLongTrailing = async () => {
      if (
        niftyLongOrderId?.callLong?.trading_symbol &&
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
          toastHandler(`Nifty long Trailing SL reached`);
        } else {
          toastHandler(`Nifty long TSL No reached`);
        }
      } else {
        console.log("NiftyLong No positions");
      }
    };

    const monitorBnfShortTrailing = async () => {
      if (
        bnfShortOrderId?.putLong?.trading_symbol &&
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
          toastHandler(`Bank Nifty short Trailing SL reached`);
        } else {
          toastHandler(`Bank Nifty short TSL No reached`);
        }
      } else {
        console.log("BnfShort No positions");
      }
    };
    const monitorBnfLongTrailing = async () => {
      if (
        bnfLongOrderId?.callLong?.trading_symbol &&
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
          toastHandler(`Bank Nifty long Trailing SL reached`);
        } else {
          toastHandler(`Bank Nifty long TSL No reached`);
        }
      } else {
        console.log("BnfLong No positions");
      }
    };
    if (nextCheck !== null) {
      monitorNiftyShortTrailing();
      monitorNiftyLongTrailing();
      monitorBnfShortTrailing();
      monitorBnfLongTrailing();
    }
  }, [nextCheck]);

  useEffect(() => {
    const checkNiftyLongEntry = async () => {
      if (!niftyLongOrderId?.putShort && nextEntryCheck !== null) {
        if (niftyFutLtp > niftySuperTrend?.supertrend_value) {
          await niftyLong();
          toastHandler(`Nifty Long Auto Entry`);
        } else {
          console.log("SuperTrend Long Entry not met");
        }
      } else {
        toastHandler("Supertrend Long still open");
      }
    };
    const checkNiftyShortEntry = async () => {
      if (!niftyShortOrderId?.callShort && nextEntryCheck !== null) {
        if (niftyFutLtp < niftySuperTrend?.supertrend_value) {
          await niftyShort();
          toastHandler(`Nifty Short Auto Entry`);
        } else {
          console.log("SuperTrend Short Entry not met");
        }
      } else {
        toastHandler("Supertrend Short still open");
      }
    };
    const checkBnfLongEntry = async () => {
      if (!bnfLongOrderId?.putShort && nextEntryCheck !== null) {
        if (bnfFutLtp > bnfSuperTrend?.supertrend_value) {
          await bnfLong();
          toastHandler(`Bank Nifty Long Auto Entry`);
        } else {
          console.log("Bank Nifty SuperTrend Long Entry not met");
        }
      } else {
        toastHandler("Bank Nifty Supertrend Long still open");
      }
    };
    const checkBnfShortEntry = async () => {
      if (!bnfShortOrderId?.callShort && nextEntryCheck !== null) {
        if (bnfFutLtp < bnfSuperTrend?.supertrend_value) {
          await bnfShort();
          toastHandler(`Bank Nifty Short Auto Entry`);
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

  socket?.on("checkSl", (data) => {
    setNextCheck(data);
  });
  socket?.on("checkEntry", (data) => {
    setNextEntryCheck(data);
  });

  useEffect(() => {
    refreshOpenPos();
  }, [isSuccess]);

  useEffect(() => {
    const slTgtRefresh = () => {
      if (niftyLongOrderId?.slPoints || niftyLongOrderId?.tgtPoints) {
        document.getElementById("niftySl").value = niftyLongOrderId?.slPoints;
        document.getElementById("niftyTgt").value = niftyLongOrderId?.tgtPoints;
      } else if (niftyShortOrderId?.slPoints || niftyShortOrderId?.tgtPoints) {
        document.getElementById("niftySl").value = niftyShortOrderId?.slPoints;
        document.getElementById("niftyTgt").value =
          niftyShortOrderId?.tgtPoints;
      } else {
        document.getElementById("niftySl").value = "";
        document.getElementById("niftyTgt").value = "";
      }

      if (bnfLongOrderId?.slPoints || bnfLongOrderId?.tgtPoints) {
        document.getElementById("bnfSl").value = bnfLongOrderId?.slPoints;
        document.getElementById("bnfTgt").value = bnfLongOrderId?.tgtPoints;
      } else if (bnfShortOrderId?.slPoints || bnfShortOrderId?.tgtPoints) {
        document.getElementById("bnfSl").value = bnfShortOrderId?.slPoints;
        document.getElementById("bnfTgt").value = bnfShortOrderId?.tgtPoints;
      } else {
        document.getElementById("bnfSl").value = "";
        document.getElementById("bnfTgt").value = "";
      }
    };
    const levelRefresh = () => {
      if (niftyLongOrderId?.entryLevel) {
        document.getElementById("niftyLongLevel").value =
          niftyLongOrderId?.entryLevel;
      } else {
        document.getElementById("niftyLongLevel").value = "";
      }
      if (niftyShortOrderId?.entryLevel) {
        document.getElementById("niftyShortLevel").value =
          niftyShortOrderId?.entryLevel;
      } else {
        document.getElementById("niftyShortLevel").value = "";
      }
      if (bnfLongOrderId?.entryLevel) {
        document.getElementById("bnfLongLevel").value =
          bnfLongOrderId?.entryLevel;
      } else {
        document.getElementById("bnfLongLevel").value = "";
      }
      if (bnfShortOrderId?.entryLevel) {
        document.getElementById("bnfShortLevel").value =
          bnfShortOrderId?.entryLevel;
      } else {
        document.getElementById("bnfShortLevel").value = "";
      }
    };
    slTgtRefresh();
    levelRefresh();
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

      <div className="w-full h-max p-2">
        <div className="innerNav w-full h-full bg-neutral rounded-2xl shadow-lg flex justify-between">
          <div className="nifty flex items-center">
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
                  className="btn btn-accent mr-4 text-black "
                  onClick={refreshOpenPos}
                >
                  Refresh Position
                </button>
              </div>
            )}
          <div className="bnf flex items-center">
            <div className="m-3 mr-6">
              BNF Expiry: {expiries?.bnfExpiryDates?.[0]?.slice(0, 10)} ||
              Strike Expiry: {bnfShortCallSell?.expiry.slice(0, 10)} ||
              Quantity: {bnfQty}
            </div>
          </div>
        </div>
      </div>

      <div className="strikes flex flex-row justify-evenly items-center w-full ">
        <div className="niftySection self-start">
          <div className="Strikes flex justify-between ">
            <div className="stats w-full shadow bg-neutral m-3">
              <div className="stat text-center">
                <div className="long text-xs text-slate-400 ">Long Strikes</div>
                <div className="stat-title">PE Sell</div>
                <div className="font-bold text-xl">
                  {niftyLongPutSell?.strike}
                  {niftyLongPutSell?.instrument_type}
                </div>
                <div className="text-sm">LTP: {niftyShortPutLtp}</div>
              </div>
            </div>

            <div className="stats w-full shadow m-3 bg-neutral">
              <div className="stat text-center">
                <div className="long text-xs text-slate-400">Short Strikes</div>

                <div className="stat-title">CE Sell</div>
                <div className="font-bold text-xl">
                  {niftyShortCallSell?.strike}
                  {niftyShortCallSell?.instrument_type}
                </div>
                <div className="text-sm">LTP: {niftyShortCallLtp}</div>
              </div>
            </div>
          </div>
          {/* SPOT AND FUT */}
          <div className="ltps flex justify-between ">
            <div className="stats shadow m-3 bg-neutral w-full overflow-hidden">
              <div className="stat overflow-hidden">
                <div className="stat-title">Spot</div>
                <div className="font-bold text-xl">{niftyLtp}</div>
              </div>

              <div className="stat overflow-hidden">
                <div className="stat-title">Future</div>
                <div className="font-bold text-xl">{niftyFutLtp}</div>
              </div>
            </div>
            <div className="stats shadow m-3 bg-neutral w-full overflow-hidden">
              <div className="stat overflow-hidden">
                <div className="stat-title">Long ST</div>
                <div className="font-bold text-xl">
                  {niftySuperTrend?.direction === "long"
                    ? niftySuperTrend?.supertrend_value
                    : "None"}
                </div>
              </div>

              <div className="stat overflow-hidden">
                <div className="stat-title">Short ST</div>
                <div className="font-bold text-xl">
                  {niftySuperTrend?.direction === "short"
                    ? niftySuperTrend?.supertrend_value
                    : "None"}
                </div>
              </div>
            </div>
          </div>

          {/*  */}
          {/* ENTRY BUTTONS */}
          {/*  */}

          <div className="entryButtons flex w-full justify-between">
            <button
              className="btn btn-secondary text-white w-48 m-3 "
              onClick={niftyLong}
            >
              Long Nifty
            </button>
            <button
              className="short btn btn-secondary text-white w-48 m-3"
              onClick={niftyShort}
            >
              Short Nifty
            </button>
          </div>

          {/*  */}
          {/* EXIT BUTTONS */}
          {/*  */}

          <div className="exitButtons flex w-full justify-between">
            <button
              className="btn  text-white w-48 m-3"
              onClick={niftyLongExit}
            >
              Exit Long Nifty
            </button>
            <button
              className="short btn  text-white w-48 m-3"
              onClick={niftyShortExit}
            >
              Exit Short Nifty
            </button>
          </div>

          {/*  */}
          {/* REFRESH ORDER */}
          {/*  */}

          <div className="refreshOrder w-full p-3">
            <button
              className="btn btn-secondary w-full text-white"
              onClick={updateOrderBookNifty}
            >
              Refresh Order Book Nifty
            </button>
          </div>

          {/*  */}
          {/* SL TGT SETTER */}
          {/*  */}

          <div className="setSLTGT w-full flex justify-between p-3 pt-0">
            <div className="setSl join">
              <input
                type="number"
                id="niftySl"
                className="input input-bordered input-md w-32 join-item"
              />
              <button
                className="btn btn-secondary text-white join-item"
                onClick={() => {
                  let sl = document.getElementById("niftySl").value;
                  niftySetSL(sl);
                }}
              >
                SL Nifty
              </button>
            </div>
            <div className="setTgt join ">
              <input
                type="number"
                id="niftyTgt"
                className="input input-bordered input-md w-32 join-item"
              />
              <button
                className="btn btn-secondary text-white join-item"
                onClick={() => {
                  let tgt = document.getElementById("niftyTgt").value;
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

          <div className="openPosition p-2">
            <div className="card w-full bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Open Position</h2>
                {/*  */}
                {/* Long POSITION */}
                {/*  */}
                {niftyLongOrderId?.entryPrice &&
                  niftyLongOrderId?.putShort?.trading_symbol && (
                    <div className="long flex flex-col items-center">
                      <div className="stats shadow mb-3 mt-3">
                        <div className="stat">
                          <div className="stat-title">Direction</div>
                          <div className="font-bold text-xl">Long</div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Entry Price</div>
                          <div className="font-bold text-xl">
                            {niftyLongOrderId?.entryPrice}
                          </div>
                        </div>
                      </div>
                      <div className="stats shadow mb-3">
                        <div className="stat">
                          <div className="stat-title">Strike</div>
                          <div className="font-bold text-xl">
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
                      <div className="stats shadow">
                        <div className="stat">
                          <div className="stat-title">Total</div>
                          <div className="font-bold text-xl">
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
                    <div className="short flex flex-col items-center">
                      <div className="stats shadow mb-3 mt-3">
                        <div className="stat">
                          <div className="stat-title">Direction</div>
                          <div className="font-bold text-xl">Short</div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Entry Price</div>
                          <div className="font-bold text-xl">
                            {niftyShortOrderId?.entryPrice}
                          </div>
                        </div>
                      </div>
                      <div className="stats shadow mb-3">
                        <div className="stat">
                          <div className="stat-title">Strike</div>
                          <div className="font-bold text-xl">
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
                      <div className="stats shadow">
                        <div className="stat">
                          <div className="stat-title">Total</div>
                          <div className="font-bold text-xl">
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
        <div className="bnfSection self-start">
          <div className="Strikes flex justify-between">
            <div className="stats w-full shadow bg-neutral m-3">
              <div className="stat text-center">
                <div className="long text-xs text-slate-400">Long Strikes</div>

                <div className="stat-title">PE Sell</div>
                <div className="font-bold text-xl">
                  {bnfLongPutSell?.strike}
                  {bnfLongPutSell?.instrument_type}
                </div>
                <div className="text-sm">LTP: {bnfShortPutLtp}</div>
              </div>
            </div>
            <div className="stats w-full shadow m-3 bg-neutral">
              <div className="stat text-center">
                <div className="long text-xs text-slate-400">Short Strikes</div>

                <div className="stat-title">CE Sell</div>
                <div className="font-bold text-xl">
                  {bnfShortCallSell?.strike}
                  {bnfShortCallSell?.instrument_type}
                </div>
                <div className="text-sm">LTP: {bnfShortCallLtp}</div>
              </div>
            </div>
          </div>
          {/* SPOT AND FUT */}
          <div className="ltps flex justify-between ">
            <div className="stats shadow m-3 bg-neutral w-full overflow-hidden">
              <div className="stat overflow-hidden">
                <div className="stat-title">Spot</div>
                <div className="font-bold text-xl">{bnfLtp}</div>
              </div>

              <div className="stat overflow-hidden">
                <div className="stat-title">Future</div>
                <div className="font-bold text-xl">{bnfFutLtp}</div>
              </div>
            </div>
            <div className="stats shadow m-3 bg-neutral w-full overflow-hidden">
              <div className="stat overflow-hidden">
                <div className="stat-title">Long ST</div>
                <div className="font-bold text-xl">
                  {" "}
                  {bnfSuperTrend?.direction === "long"
                    ? bnfSuperTrend?.supertrend_value
                    : "None"}
                </div>
              </div>

              <div className="stat overflow-hidden">
                <div className="stat-title">Short ST</div>
                <div className="font-bold text-xl">
                  {" "}
                  {bnfSuperTrend?.direction === "short"
                    ? bnfSuperTrend?.supertrend_value
                    : "None"}
                </div>
              </div>
            </div>
          </div>

          {/*  */}
          {/* ENTRY BUTTONS */}
          {/*  */}

          <div className="entryButtons flex w-full justify-between">
            <button
              className="btn btn-secondary text-white w-48 m-3"
              onClick={bnfLong}
            >
              Long Bank Nifty
            </button>
            <button
              className="short btn btn-secondary text-white w-48 m-3"
              onClick={bnfShort}
            >
              Short Bank Nifty
            </button>
          </div>

          {/*  */}
          {/* EXIT BUTTONS */}
          {/*  */}

          <div className="exitButtons flex w-full justify-between">
            <button className="btn  text-white w-48 m-3" onClick={bnfLongExit}>
              Exit Long Bank Nifty
            </button>
            <button
              className="short btn  text-white w-48 m-3"
              onClick={bnfShortExit}
            >
              Exit Short Bank Nifty
            </button>
          </div>

          {/*  */}
          {/* REFRESH ORDER */}
          {/*  */}

          <div className="refreshOrder w-full p-3">
            <button
              className="btn btn-secondary w-full text-white"
              onClick={updateOrderBookBnf}
            >
              Refresh Order Book Bank Nifty
            </button>
          </div>

          {/*  */}
          {/* SL TGT SETTER */}
          {/*  */}

          <div className="setSLTGT w-full flex justify-between p-3 pt-0 ">
            <div className="setSl join">
              <input
                type="number"
                id="bnfSl"
                className="input input-bordered input-md w-32 join-item"
              />
              <button
                className="btn btn-secondary join-item text-white"
                onClick={() => {
                  let sl = document.getElementById("bnfSl").value;
                  bnfSetSL(sl);
                }}
              >
                SL Bank Nifty
              </button>
            </div>
            <div className="setTgt join">
              <input
                type="number"
                id="bnfTgt"
                className="input input-bordered input-md w-32 join-item"
              />
              <button
                className="btn btn-secondary text-white join-item"
                onClick={() => {
                  let tgt = document.getElementById("bnfTgt").value;
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

          <div className="openPosition p-2">
            <div className="card w-full bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Open Position</h2>
                {/*  */}
                {/* Long POSITION */}
                {/*  */}
                {bnfLongOrderId?.entryPrice &&
                  bnfLongOrderId?.putShort?.trading_symbol && (
                    <div className="long flex flex-col items-center">
                      <div className="stats shadow mb-3 mt-3">
                        <div className="stat">
                          <div className="stat-title">Direction</div>
                          <div className="font-bold text-xl">Long</div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Entry Price</div>
                          <div className="font-bold text-xl">
                            {bnfLongOrderId?.entryPrice}
                          </div>
                        </div>
                      </div>
                      <div className="stats shadow mb-3">
                        <div className="stat">
                          <div className="stat-title">Sell Strike</div>
                          <div className="font-bold text-xl">
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
                      <div className="stats shadow">
                        <div className="stat">
                          <div className="stat-title">Total</div>
                          <div className="font-bold text-xl">
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
                  bnfShortOrderId?.putLong?.trading_symbol &&
                  bnfShortOrderId?.callShort?.trading_symbol && (
                    <div className="short flex flex-col items-center">
                      <div className="stats shadow mb-3 mt-3">
                        <div className="stat">
                          <div className="stat-title">Direction</div>
                          <div className="font-bold text-xl">Short</div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Entry Price</div>
                          <div className="font-bold text-xl">
                            {bnfShortOrderId?.entryPrice}
                          </div>
                        </div>
                      </div>
                      <div className="stats shadow mb-3">
                        <div className="stat">
                          <div className="stat-title">Sell Strike</div>
                          <div className="font-bold text-xl">
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
                      <div className="stats shadow">
                        <div className="stat">
                          <div className="stat-title">Total</div>
                          <div className="font-bold text-xl">
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
