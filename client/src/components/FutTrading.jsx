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

function FutTrading() {
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

  const [enable10SMAnifty, setEnable10SMAnifty] = useState(true);
  const [enable20SMAnifty, setEnable20SMAnifty] = useState(true);
  const [enable10SMAbnf, setEnable10SMAbnf] = useState(true);
  const [enable20SMAbnf, setEnable20SMAbnf] = useState(true);

  const [refreshExistingOrder, setRefreshExistingOrder] = useState();

  const refreshOpenPos = () => {
    setRefreshExistingOrder(Math.random()); //
    // console.log(refreshExistingOrder);
  };

  const toastHandler = (message) => {
    toast(message, {
      position: "top-left",
      autoClose: 2000,
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

    const niftyLongPut = tickerData?.filter((data) => {
      return (
        data.instrument_token === niftyShortOrderId?.putLong?.instrument_token
      );
    });
    const niftyShortCall = tickerData?.filter((data) => {
      return (
        data.instrument_token === niftyShortOrderId?.callShort?.instrument_token
      );
    });

    const niftyShortPut = tickerData?.filter((data) => {
      return (
        data.instrument_token === niftyLongOrderId?.putShort?.instrument_token
      );
    });
    const niftyLongCall = tickerData?.filter((data) => {
      return (
        data.instrument_token === niftyLongOrderId?.callLong?.instrument_token
      );
    });

    // BNF filter
    const bnfLongPut = tickerData?.filter((data) => {
      return (
        data.instrument_token === bnfShortOrderId?.putLong?.instrument_token
      );
    });
    const bnfShortCall = tickerData?.filter((data) => {
      return (
        data.instrument_token === bnfShortOrderId?.callShort?.instrument_token
      );
    });
    const bnfShortPut = tickerData?.filter((data) => {
      return (
        data.instrument_token === bnfLongOrderId?.putShort?.instrument_token
      );
    });
    const bnfLongCall = tickerData?.filter((data) => {
      return (
        data.instrument_token === bnfLongOrderId?.callLong?.instrument_token
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
    if (niftyLongPut.length > 0) {
      setNiftyLongPutLtp(niftyLongPut?.[0]?.last_price);
    }
    if (niftyShortCall.length > 0) {
      setNiftyShortCallLtp(niftyShortCall?.[0]?.last_price);
    }
    if (niftyShortPut.length > 0) {
      setNiftyShortPutLtp(niftyShortPut?.[0]?.last_price);
    }
    if (niftyLongCall.length > 0) {
      setNiftyLongCallLtp(niftyLongCall?.[0]?.last_price);
    }

    // BNF LTP

    if (bnfLongPut.length > 0) {
      setBnfLongPutLtp(bnfLongPut?.[0]?.last_price);
    }
    if (bnfShortCall.length > 0) {
      setBnfShortCallLtp(bnfShortCall?.[0]?.last_price);
    }
    if (bnfShortPut.length > 0) {
      setBnfShortPutLtp(bnfShortPut?.[0]?.last_price);
    }
    if (bnfLongCall.length > 0) {
      setBnfLongCallLtp(bnfLongCall?.[0]?.last_price);
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
      const niftyLongStrikeSell = niftyOptChainData?.niftyChain?.filter(
        (data) => {
          return (
            data.expiry === expiries?.niftyExpiryDates?.[0] &&
            data.strike === parseInt(niftyRounded) &&
            data.instrument_type === "PE"
          );
        }
      );
      const niftyLongStrikeBuy = niftyOptChainData?.niftyChain?.filter(
        (data) => {
          return (
            data.expiry === expiries?.niftyExpiryDates?.[0] &&
            data.strike === parseInt(niftyRounded) &&
            data.instrument_type === "CE"
          );
        }
      );

      const niftyShortStrikeSell = niftyOptChainData?.niftyChain?.filter(
        (data) => {
          return (
            data.expiry === expiries?.niftyExpiryDates?.[0] &&
            data.strike === parseInt(niftyRounded) &&
            data.instrument_type === "CE"
          );
        }
      );
      const niftyShortStrikeBuy = niftyOptChainData?.niftyChain?.filter(
        (data) => {
          return (
            data.expiry === expiries?.niftyExpiryDates?.[0] &&
            data.strike === parseInt(niftyRounded) &&
            data.instrument_type === "PE"
          );
        }
      );
      setNiftyShortPutBuy(niftyShortStrikeBuy?.[0]);
      setNiftyShortCallSell(niftyShortStrikeSell?.[0]);
      setNiftyLongCallBuy(niftyLongStrikeBuy?.[0]);
      setNiftyLongPutSell(niftyLongStrikeSell?.[0]);
    };

    const bnfStrikeSelect = () => {
      const bnfLongStrikeSell = bnfOptChainData?.bnfChain?.filter((data) => {
        return (
          data.expiry === expiries?.bnfExpiryDates?.[0] &&
          data.strike === parseInt(bnfRounded) &&
          data.instrument_type === "PE"
        );
      });
      const bnfLongStrikeBuy = bnfOptChainData?.bnfChain?.filter((data) => {
        return (
          data.expiry === expiries?.bnfExpiryDates?.[0] &&
          data.strike === parseInt(bnfRounded) &&
          data.instrument_type === "CE"
        );
      });

      const bnfShortStrikeSell = bnfOptChainData?.bnfChain?.filter((data) => {
        return (
          data.expiry === expiries?.bnfExpiryDates?.[0] &&
          data.strike === parseInt(bnfRounded) &&
          data.instrument_type === "CE"
        );
      });
      const bnfShortStrikeBuy = bnfOptChainData?.bnfChain?.filter((data) => {
        return (
          data.expiry === expiries?.bnfExpiryDates?.[0] &&
          data.strike === parseInt(bnfRounded) &&
          data.instrument_type === "PE"
        );
      });
      setBnfShortPutBuy(bnfShortStrikeBuy?.[0]);
      setBnfShortCallSell(bnfShortStrikeSell?.[0]);
      setBnfLongPutSell(bnfLongStrikeSell?.[0]);
      setBnfLongCallBuy(bnfLongStrikeBuy?.[0]);
    };

    niftyStrikeSelect();
    bnfStrikeSelect();
  }, [niftyRounded, bnfRounded]);

  const startStream = async () => {
    await socket?.emit("candleToken", [
      niftyFutData?.instrument_token,
      bnfFutData?.instrument_token,
    ]);

    await socket?.emit("defaultTokens", [
      niftyFutData?.instrument_token,
      bnfFutData?.instrument_token,
      fnfFutData?.instrument_token,
      niftySpotData?.instrument_token,
      bnfSpotData?.instrument_token,
      fnfSpotData?.instrument_token,
    ]);
  };
  socket?.on(niftyFutData?.instrument_token, (data) => {
    setNiftyCandles(data);
  });
  socket?.on(bnfFutData?.instrument_token, (data) => {
    setBnfCandles(data);
  });

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
  }, [niftyLtp, bnfLtp, niftyCandles, bnfCandles]);

  const niftyLong = async () => {
    if (!niftyLongOrderId.callLong) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`
          `/api/placeOrderFno?tradingsymbol=${niftyLongCallBuy.tradingsymbol}&transaction_type=BUY&quantity=${niftyQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          let orderId = response?.data?.order_id;
          if (orderId) {
            toastHandler(`CE placed OID: ${orderId}`);
          } else {
            toastHandler(`CE error ${response.data}`);
          }
          await axios.get(`/api/orderInfo`).then(async (res) => {
            // console.log(res);
            let callLongId = res?.data?.filter((order) => {
              return order.order_id === orderId && order.status === "COMPLETE";
            });

            let price;
            if (callLongId?.[0]?.average_price) {
              price = callLongId?.[0].average_price;
            } else {
              price = "";
            }

            await setDoc(
              doc(db, "futFiveMin", "niftyFutLong"),
              {
                callLong: {
                  order_id: orderId,
                  average_price: price,
                  instrument_token: parseInt(
                    niftyLongCallBuy?.instrument_token
                  ),
                  trading_symbol: niftyLongCallBuy.tradingsymbol,
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
    if (!niftyLongOrderId.putShort) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
          `/api/placeOrderFno?tradingsymbol=${niftyLongPutSell.tradingsymbol}&transaction_type=SELL&quantity=${niftyQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          let orderId = response?.data?.order_id;
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
              slPoint = 25;
              tgtPoint = 52;
            } else {
              price = "";
              slPoint = "";
              tgtPoint = "";
            }

            // let tradeCount;
            // let tradeCountKey;
            // if (allExecPositions?.callLegCount) {
            //   tradeCount = allExecPositions?.tradeCount + 1;
            //   tradeCountKey = "trade_" + (allExecPositions?.tradeCount + 1);
            // } else {
            //   tradeCount = 1;
            //   tradeCountKey = "trade_1";
            // }

            await setDoc(
              doc(db, "futFiveMin", "niftyFutLong"),
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
                entryLevel: deleteField(),
              },
              { merge: true }
            )
              .then((response) => {
                toastHandler(`Nifty long order updated`);
              })
              .catch((e) => {
                toastHandler(`Nifty long error at firebase ${e}`);
              });

            // await setDoc(
            //   doc(db, "futFiveMin", "niftyFutLongALLEXEC"),
            //   {
            //     tradeCount: tradeCount,
            //     [tradeCountKey]: {
            //       entryPrice: niftyFutLtp,
            //       slPoints: slPoint,
            //       tgtPoints: tgtPoint,
            //       putShort: {
            //         order_id: orderId,
            //         average_price: price,
            //         instrument_token: parseInt(
            //           niftyLongPutSell?.instrument_token
            //         ),
            //         trading_symbol: niftyLongPutSell.tradingsymbol,
            //       },
            //     },
            //   },
            //   { merge: true }
            // );
          });
        });
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "futFiveMin", "niftyFutLong"), (doc) => {
      setNiftyLongOrderId(doc.data());

      socket?.emit("niftyFutToken", [
        doc?.data()?.callLong?.instrument_token,
        doc?.data()?.putShort?.instrument_token,
      ]);
    });
  }, [refreshExistingOrder]);

  useEffect(() => {
    socket?.emit("niftyFutToken", [
      niftyLongOrderId?.callLong?.instrument_token,
      niftyLongOrderId?.putShort?.instrument_token,
    ]);
  }, [niftyLongOrderId, refreshExistingOrder]);

  const niftyShort = async () => {
    if (!niftyShortOrderId.putLong) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFno?tradingsymbol=${niftyShortPutBuy.tradingsymbol}&transaction_type=BUY&quantity=${niftyQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          let orderId = response?.data?.order_id;
          if (orderId) {
            toastHandler(`PE placed OID: ${orderId}`);
          } else {
            toastHandler(`PE error ${response.data}`);
          }
          await axios.get(`/api/orderInfo`).then(async (res) => {
            let putLongId = res?.data?.filter((order) => {
              return order.order_id === orderId && order.status === "COMPLETE";
            });

            let price;

            if (putLongId?.[0]?.average_price) {
              price = putLongId?.[0].average_price;
            } else {
              price = "";
            }

            await setDoc(
              doc(db, "futFiveMin", "niftyFutShort"),
              {
                putLong: {
                  order_id: orderId,
                  average_price: price,
                  instrument_token: parseInt(
                    niftyShortPutBuy?.instrument_token
                  ),
                  trading_symbol: niftyShortPutBuy?.tradingsymbol,
                },
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
              doc(db, "futFiveMin", "niftyFutShort"),
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
    const unsub = onSnapshot(doc(db, "futFiveMin", "niftyFutShort"), (doc) => {
      setNiftyShortOrderId(doc.data());
      socket?.emit("niftyFutToken", [
        doc?.data()?.putLong?.instrument_token,
        doc?.data()?.callShort?.instrument_token,
      ]);
    });
  }, [refreshExistingOrder]);

  useEffect(() => {
    socket?.emit("niftyFutToken", [
      niftyShortOrderId?.putLong?.instrument_token,
      niftyShortOrderId?.callShort?.instrument_token,
    ]);
  }, [niftyShortOrderId, refreshExistingOrder]);

  const updateOrderBookNifty = async () => {
    await axios.get(`/api/orderInfo`).then(async (response) => {
      // console.log(response);
      let callLongId = response?.data?.filter((order) => {
        return (
          order.order_id === niftyLongOrderId?.callLong?.order_id &&
          order.status === "COMPLETE"
        );
      });
      let putShortId = response?.data?.filter((order) => {
        return (
          order.order_id === niftyLongOrderId?.putShort?.order_id &&
          order.status === "COMPLETE"
        );
      });
      if (
        callLongId.length > 0 &&
        putShortId.length > 0 &&
        callLongId?.[0]?.average_price !== "" &&
        putShortId?.[0]?.average_price !== ""
      ) {
        await setDoc(
          doc(db, "futFiveMin", "niftyFutLong"),
          {
            callLong: {
              order_id: niftyLongOrderId?.callLong?.order_id,
              average_price: callLongId?.[0]?.average_price,
            },
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
            toastHandler(`Nifty long order book updated`);
          })
          .catch((e) => {
            toastHandler(`Nifty long order Book Error: ${e}`);
          });
      }
    });

    await axios.get(`/api/orderInfo`).then(async (response) => {
      // console.log(response);
      let putLongId = response?.data?.filter((order) => {
        return (
          order.order_id === niftyShortOrderId?.putLong?.order_id &&
          order.status === "COMPLETE"
        );
      });
      let callShortId = response?.data?.filter((order) => {
        return (
          order.order_id === niftyShortOrderId?.callShort?.order_id &&
          order.status === "COMPLETE"
        );
      });
      if (
        putLongId.length > 0 &&
        callShortId.length > 0 &&
        putLongId?.[0]?.average_price !== "" &&
        callShortId?.[0]?.average_price !== ""
      ) {
        await setDoc(
          doc(db, "futFiveMin", "niftyFutShort"),
          {
            putLong: {
              order_id: niftyShortOrderId?.putLong?.order_id,
              average_price: putLongId?.[0]?.average_price,
            },
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
            toastHandler(`Nifty short order book updated`);
          })
          .catch((e) => {
            toastHandler(`Nifty short order Book Error: ${e}`);
          });
      }
    });
  };

  const niftySetSL = async (slPoints) => {
    if (
      niftyLongOrderId?.callLong?.trading_symbol &&
      niftyLongOrderId?.putShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "futFiveMin", "niftyFutLong"),
        {
          slPoints: parseInt(slPoints),
        },
        { merge: true }
      );
      toastHandler(`Nifty Long SL points ${slPoints}`);
    } else if (
      niftyShortOrderId?.putLong?.trading_symbol &&
      niftyShortOrderId?.callShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "futFiveMin", "niftyFutShort"),
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
    if (
      niftyLongOrderId?.callLong?.trading_symbol &&
      niftyLongOrderId?.putShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "futFiveMin", "niftyFutLong"),
        {
          tgtPoints: parseInt(tgtPoints),
        },
        { merge: true }
      );
      toastHandler(`Nifty Long TGT points ${tgtPoints}`);
    } else if (
      niftyShortOrderId?.putLong?.trading_symbol &&
      niftyShortOrderId?.callShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "futFiveMin", "niftyFutShort"),
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
    if (
      niftyLongOrderId?.callLong?.trading_symbol &&
      niftyLongOrderId?.putShort?.trading_symbol
    ) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFno?tradingsymbol=${niftyLongOrderId?.callLong?.trading_symbol}&transaction_type=SELL&quantity=${niftyQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "futFiveMin", "niftyFutLong"), {
              callLong: deleteField(),
            });
          }
        });
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFno?tradingsymbol=${niftyLongOrderId?.putShort?.trading_symbol}&transaction_type=BUY&quantity=${niftyQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            toastHandler(`Nifty long exit done`);
            await updateDoc(doc(db, "futFiveMin", "niftyFutLong"), {
              putShort: deleteField(),
              entryPrice: deleteField(),
              slPoints: deleteField(),
              tgtPoints: deleteField(),
              slAdjusted_1: deleteField(),
              slAdjusted_2: deleteField(),
            });
          }
        });
    } else {
      toastHandler(`Nifty long no positions Found`);
    }
  };

  const niftyShortExit = async () => {
    if (
      niftyShortOrderId?.putLong?.trading_symbol &&
      niftyShortOrderId?.callShort?.trading_symbol
    ) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFno?tradingsymbol=${niftyShortOrderId?.putLong?.trading_symbol}&transaction_type=SELL&quantity=${niftyQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          // console.log(response);
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "futFiveMin", "niftyFutShort"), {
              putLong: deleteField(),
            });
          }
        });
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFno?tradingsymbol=${niftyShortOrderId?.callShort?.trading_symbol}&transaction_type=BUY&quantity=${niftyQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            toastHandler(`Nifty short exit done`);
            await updateDoc(doc(db, "futFiveMin", "niftyFutShort"), {
              callShort: deleteField(),
              entryPrice: deleteField(),
              slPoints: deleteField(),
              tgtPoints: deleteField(),
              slAdjusted_1: deleteField(),
              slAdjusted_2: deleteField(),
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
        niftyLongOrderId?.callLong?.trading_symbol &&
        niftyLongOrderId?.putShort?.trading_symbol &&
        niftyLongOrderId?.slPoints &&
        niftyLongOrderId?.tgtPoints &&
        niftyLongOrderId?.entryPrice
      ) {
        let sl_level =
          niftyLongOrderId?.entryPrice - niftyLongOrderId?.slPoints;
        let tgt_level =
          niftyLongOrderId?.entryPrice + niftyLongOrderId?.tgtPoints;
        let mtm =
          niftyLongCallLtp -
          niftyLongOrderId?.callLong?.average_price +
          niftyLongOrderId?.putShort?.average_price -
          niftyShortPutLtp;
        // console.log(mtm);
        // console.log(niftyLongCallLtp);
        // console.log(niftyShortPutLtp);

        if (niftyFutLtp >= tgt_level || mtm >= niftyLongOrderId?.tgtPoints) {
          await niftyLongExit();
          toastHandler(`Nifty long TGT reached`);
        }

        if (
          mtm >= niftyLongOrderId?.tgtPoints * 0.5 &&
          !niftyLongOrderId?.slAdjusted_1 &&
          niftyLongOrderId?.slAdjusted_1 !== true
        ) {
          await updateDoc(doc(db, "futFiveMin", "niftyFutLong"), {
            slPoints: niftyLongOrderId?.slPoints / 2,
            slAdjusted_1: true,
          });
          toastHandler(
            `Super Trend Bank Nifty long SL Trailed to ${
              niftyLongOrderId?.slPoints / 2
            }`
          );
        }

        if (
          mtm >= niftyLongOrderId?.tgtPoints * 0.75 &&
          !niftyLongOrderId?.slAdjusted_2 &&
          niftyLongOrderId?.slAdjusted_2 !== true
        ) {
          await updateDoc(doc(db, "futFiveMin", "niftyFutLong"), {
            slPoints: 1,
            slAdjusted_2: true,
          });
          toastHandler(`Super Trend Nifty long SL Trailed to 1`);
        }
        if (niftyFutLtp <= sl_level || mtm <= -niftyLongOrderId?.slPoints) {
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
        niftyShortOrderId?.putLong?.trading_symbol &&
        niftyShortOrderId?.callShort?.trading_symbol &&
        niftyShortOrderId?.slPoints &&
        niftyShortOrderId?.tgtPoints &&
        niftyShortOrderId?.entryPrice
      ) {
        let sl_level =
          niftyShortOrderId?.entryPrice + niftyShortOrderId?.slPoints;
        let tgt_level =
          niftyShortOrderId?.entryPrice - niftyShortOrderId?.tgtPoints;

        let mtm =
          niftyLongPutLtp -
          niftyShortOrderId?.putLong?.average_price +
          niftyShortOrderId?.callShort?.average_price -
          niftyShortCallLtp;

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
          mtm >= niftyShortOrderId?.tgtPoints * 0.5 &&
          !niftyShortOrderId?.slAdjusted_1 &&
          niftyShortOrderId?.slAdjusted_1 !== true
        ) {
          await updateDoc(doc(db, "futFiveMin", "niftyFutShort"), {
            slPoints: niftyShortOrderId?.slPoints / 2,
            slAdjusted_1: true,
          });
          toastHandler(
            `Super Trend Nifty short SL Trailed to ${
              niftyShortOrderId?.slPoints / 2
            }`
          );
        }

        if (
          mtm >= niftyShortOrderId?.tgtPoints * 0.75 &&
          !niftyShortOrderId?.slAdjusted_2 &&
          niftyShortOrderId?.slAdjusted_2 !== true
        ) {
          await updateDoc(doc(db, "futFiveMin", "niftyFutShort"), {
            slPoints: 1,
            slAdjusted_2: true,
          });
          toastHandler(`Super Trend Nifty short SL Trailed to 1`);
        }
        if (niftyFutLtp >= sl_level || mtm <= -niftyShortOrderId?.slPoints) {
          await niftyShortExit();
          toastHandler(`Nifty short SL reached`);
        }
      }
    };
    niftyShortSLManager();
  }, [tickerData, niftyShortOrderId]);

  //BNF

  const bnfLong = async () => {
    if (!bnfLongOrderId.callLong) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`
          `/api/placeOrderFnoBnf?tradingsymbol=${bnfLongCallBuy.tradingsymbol}&transaction_type=BUY&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          let orderId = response?.data?.order_id;
          if (orderId) {
            toastHandler(`CE placed OID: ${orderId}`);
          } else {
            toastHandler(`CE error ${response.data}`);
          }
          await axios.get(`/api/orderInfo`).then(async (res) => {
            // console.log(res);
            let callLongId = res?.data?.filter((order) => {
              return order.order_id === orderId && order.status === "COMPLETE";
            });

            let price;

            if (callLongId?.[0]?.average_price) {
              price = callLongId?.[0].average_price;
            } else {
              price = "";
            }

            await setDoc(
              doc(db, "futFiveMin", "bnfFutLong"),
              {
                callLong: {
                  order_id: orderId,
                  average_price: price,
                  instrument_token: parseInt(bnfLongCallBuy?.instrument_token),
                  trading_symbol: bnfLongCallBuy.tradingsymbol,
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
              doc(db, "futFiveMin", "bnfFutLong"),
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
                entryLevel: deleteField(),
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
    const unsub = onSnapshot(doc(db, "futFiveMin", "bnfFutLong"), (doc) => {
      setBnfLongOrderId(doc.data());

      socket?.emit("niftyFutToken", [
        doc?.data()?.callLong?.instrument_token,
        doc?.data()?.putShort?.instrument_token,
      ]);
    });
  }, [refreshExistingOrder]);

  useEffect(() => {
    socket?.emit("niftyFutToken", [
      bnfLongOrderId?.callLong?.instrument_token,
      bnfLongOrderId?.putShort?.instrument_token,
    ]);
  }, [bnfLongOrderId, refreshExistingOrder]);

  const bnfShort = async () => {
    if (!bnfShortOrderId.putLong) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFnoBnf?tradingsymbol=${bnfShortPutBuy.tradingsymbol}&transaction_type=BUY&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          let orderId = response.data.order_id;
          if (orderId) {
            toastHandler(`PE placed OID: ${orderId}`);
          } else {
            toastHandler(`PE error ${response.data}`);
          }
          await axios.get(`/api/orderInfo`).then(async (res) => {
            let putLongId = res?.data?.filter((order) => {
              return order.order_id === orderId && order.status === "COMPLETE";
            });

            let price;

            if (putLongId?.[0]?.average_price) {
              price = putLongId?.[0].average_price;
            } else {
              price = "";
            }

            await setDoc(
              doc(db, "futFiveMin", "bnfFutShort"),
              {
                putLong: {
                  order_id: orderId,
                  average_price: price,
                  instrument_token: parseInt(bnfShortPutBuy?.instrument_token),
                  trading_symbol: bnfShortPutBuy?.tradingsymbol,
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
              doc(db, "futFiveMin", "bnfFutShort"),
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
                entryLevel: deleteField(),
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
    const unsub = onSnapshot(doc(db, "futFiveMin", "bnfFutShort"), (doc) => {
      setBnfShortOrderId(doc.data());
      socket?.emit("bnfFutToken", [
        doc?.data()?.putLong?.instrument_token,
        doc?.data()?.callShort?.instrument_token,
      ]);
    });
  }, [refreshExistingOrder]);

  useEffect(() => {
    socket?.emit("niftyFutToken", [
      bnfShortOrderId?.putLong?.instrument_token,
      bnfShortOrderId?.callShort?.instrument_token,
    ]);
  }, [bnfShortOrderId, refreshExistingOrder]);

  const updateOrderBookBnf = async () => {
    await axios.get(`/api/orderInfo`).then(async (response) => {
      // console.log(response);
      let callLongId = response?.data?.filter((order) => {
        return (
          order.order_id === bnfLongOrderId?.callLong?.order_id &&
          order.status === "COMPLETE"
        );
      });
      let putShortId = response?.data?.filter((order) => {
        return (
          order.order_id === bnfLongOrderId?.putShort?.order_id &&
          order.status === "COMPLETE"
        );
      });

      if (
        callLongId.length > 0 &&
        putShortId.length > 0 &&
        callLongId?.[0]?.average_price !== "" &&
        putShortId?.[0]?.average_price !== ""
      ) {
        await setDoc(
          doc(db, "futFiveMin", "bnfFutLong"),
          {
            callLong: {
              order_id: bnfLongOrderId?.callLong?.order_id,
              average_price: callLongId?.[0]?.average_price,
            },
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
            toastHandler(`Bank Nifty long order book updated`);
          })
          .catch((e) => {
            toastHandler(`Bank Nifty long order Book Error: ${e}`);
          });
      }
    });

    await axios.get(`/api/orderInfo`).then(async (response) => {
      // console.log(response);
      let putLongId = response?.data?.filter((order) => {
        return (
          order.order_id === bnfShortOrderId?.putLong?.order_id &&
          order.status === "COMPLETE"
        );
      });
      let callShortId = response?.data?.filter((order) => {
        return (
          order.order_id === bnfShortOrderId?.callShort?.order_id &&
          order.status === "COMPLETE"
        );
      });
      if (
        putLongId.length > 0 &&
        callShortId.length > 0 &&
        putLongId?.[0]?.average_price !== "" &&
        callShortId?.[0]?.average_price !== ""
      ) {
        await setDoc(
          doc(db, "futFiveMin", "bnfFutShort"),
          {
            putLong: {
              order_id: bnfShortOrderId?.putLong?.order_id,
              average_price: putLongId?.[0]?.average_price,
            },
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
            toastHandler(`Bank Nifty short order book updated`);
          })
          .catch((e) => {
            toastHandler(`Bank Nifty short order Book Error: ${e}`);
          });
      }
    });
  };

  useEffect(() => {
    if (
      niftyLongOrderId?.putShort?.average_price == "" ||
      niftyLongOrderId?.callLong?.average_price == "" ||
      niftyShortOrderId?.callShort?.average_price == "" ||
      niftyShortOrderId?.putLong?.average_price == ""
    ) {
      updateOrderBookNifty();
    }
    if (
      bnfLongOrderId?.putShort?.average_price === "" ||
      bnfLongOrderId?.callLong?.average_price === "" ||
      bnfShortOrderId?.callShort?.average_price === "" ||
      bnfShortOrderId?.putLong?.average_price === ""
    ) {
      updateOrderBookBnf();
    }
  }, [tickerData]);

  const bnfSetSL = async (slPoints) => {
    if (
      bnfLongOrderId?.callLong?.trading_symbol &&
      bnfLongOrderId?.putShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "futFiveMin", "bnfFutLong"),
        {
          slPoints: parseInt(slPoints),
        },
        { merge: true }
      );
      toastHandler(`Bank Nifty Long SL points ${slPoints}`);
    } else if (
      bnfShortOrderId?.putLong?.trading_symbol &&
      bnfShortOrderId?.callShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "futFiveMin", "bnfFutShort"),
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
    if (
      bnfLongOrderId?.callLong?.trading_symbol &&
      bnfLongOrderId?.putShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "futFiveMin", "bnfFutLong"),
        {
          tgtPoints: parseInt(tgtPoints),
        },
        { merge: true }
      );
      toastHandler(`Bank Nifty Long TGT points ${tgtPoints}`);
    } else if (
      bnfShortOrderId?.putLong?.trading_symbol &&
      bnfShortOrderId?.callShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "futFiveMin", "bnfFutShort"),
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
    if (
      bnfLongOrderId?.callLong?.trading_symbol &&
      bnfLongOrderId?.putShort?.trading_symbol
    ) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFnoBnf?tradingsymbol=${bnfLongOrderId?.callLong?.trading_symbol}&transaction_type=SELL&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          // console.log(response);
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "futFiveMin", "bnfFutLong"), {
              callLong: deleteField(),
            });
          }
        });
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFnoBnf?tradingsymbol=${bnfLongOrderId?.putShort?.trading_symbol}&transaction_type=BUY&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            toastHandler(`Bank Nifty long exit done`);
            await updateDoc(doc(db, "futFiveMin", "bnfFutLong"), {
              putShort: deleteField(),
              entryPrice: deleteField(),
              slPoints: deleteField(),
              tgtPoints: deleteField(),
              slAdjusted_1: deleteField(),
              slAdjusted_2: deleteField(),
            });
          }
        });
    } else {
      toastHandler(`Bank Nifty long no positions Found`);
    }
  };

  const bnfShortExit = async () => {
    if (
      bnfShortOrderId?.putLong?.trading_symbol &&
      bnfShortOrderId?.callShort?.trading_symbol
    ) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFnoBnf?tradingsymbol=${bnfShortOrderId?.putLong?.trading_symbol}&transaction_type=SELL&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          // console.log(response);
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "futFiveMin", "bnfFutShort"), {
              putLong: deleteField(),
            });
          }
        });
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFnoBnf?tradingsymbol=${bnfShortOrderId?.callShort?.trading_symbol}&transaction_type=BUY&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            toastHandler(`Bank Nifty short exit done`);
            await updateDoc(doc(db, "futFiveMin", "bnfFutShort"), {
              callShort: deleteField(),
              entryPrice: deleteField(),
              slPoints: deleteField(),
              tgtPoints: deleteField(),
              slAdjusted_1: deleteField(),
              slAdjusted_2: deleteField(),
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
        bnfLongOrderId?.callLong?.trading_symbol &&
        bnfLongOrderId?.putShort?.trading_symbol &&
        bnfLongOrderId?.slPoints &&
        bnfLongOrderId?.tgtPoints &&
        bnfLongOrderId?.entryPrice
      ) {
        let sl_level = bnfLongOrderId?.entryPrice - bnfLongOrderId?.slPoints;
        let tgt_level = bnfLongOrderId?.entryPrice + bnfLongOrderId?.tgtPoints;
        let mtm =
          bnfLongCallLtp -
          bnfLongOrderId?.callLong?.average_price +
          bnfLongOrderId?.putShort?.average_price -
          bnfShortPutLtp;
        // console.log(mtm);

        if (bnfFutLtp >= tgt_level || mtm >= bnfLongOrderId?.tgtPoints) {
          await bnfLongExit();
          toastHandler(`Bank Nifty long TGT reached`);
        }
        if (
          mtm >= bnfLongOrderId?.tgtPoints * 0.5 &&
          !bnfLongOrderId?.slAdjusted_1 &&
          bnfLongOrderId?.slAdjusted_1 !== true
        ) {
          await updateDoc(doc(db, "futFiveMin", "bnfFutLong"), {
            slPoints: bnfLongOrderId?.slPoints / 2,
            slAdjusted_1: true,
          });
          toastHandler(
            `Super Trend Bank Nifty long SL Trailed to ${
              bnfLongOrderId?.slPoints / 2
            }`
          );
        }

        if (
          mtm >= bnfLongOrderId?.tgtPoints * 0.75 &&
          !bnfLongOrderId?.slAdjusted_2 &&
          bnfLongOrderId?.slAdjusted_2 !== true
        ) {
          await updateDoc(doc(db, "futFiveMin", "bnfFutLong"), {
            slPoints: 1,
            slAdjusted_2: true,
          });
          toastHandler(`Super Trend Bank Nifty long SL Trailed to 1`);
        }
        if (bnfFutLtp <= sl_level || mtm <= -bnfLongOrderId?.slPoints) {
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
        bnfShortOrderId?.putLong?.trading_symbol &&
        bnfShortOrderId?.callShort?.trading_symbol &&
        bnfShortOrderId?.slPoints &&
        bnfShortOrderId?.tgtPoints &&
        bnfShortOrderId?.entryPrice
      ) {
        let sl_level = bnfShortOrderId?.entryPrice + bnfShortOrderId?.slPoints;
        let tgt_level =
          bnfShortOrderId?.entryPrice - bnfShortOrderId?.tgtPoints;

        let mtm =
          bnfLongPutLtp -
          bnfShortOrderId?.putLong?.average_price +
          bnfShortOrderId?.callShort?.average_price -
          bnfShortCallLtp;

        // console.log("short", mtm);

        if (bnfFutLtp <= tgt_level || mtm >= bnfShortOrderId?.tgtPoints) {
          await bnfShortExit();
          toastHandler(`Bank Nifty short TGT reached`);
        }
        if (
          mtm >= bnfShortOrderId?.tgtPoints * 0.5 &&
          !bnfShortOrderId?.slAdjusted_1 &&
          bnfShortOrderId?.slAdjusted_1 !== true
        ) {
          await updateDoc(doc(db, "futFiveMin", "bnfFutShort"), {
            slPoints: bnfShortOrderId?.slPoints / 2,
            slAdjusted_1: true,
          });
          toastHandler(
            `Super Trend Bank Nifty short SL Trailed to ${
              bnfShortOrderId?.slPoints / 2
            }`
          );
        }

        if (
          mtm >= bnfShortOrderId?.tgtPoints * 0.75 &&
          !bnfShortOrderId?.slAdjusted_2 &&
          bnfShortOrderId?.slAdjusted_2 !== true
        ) {
          await updateDoc(doc(db, "futFiveMin", "bnfFutShort"), {
            slPoints: 1,
            slAdjusted_2: true,
          });
          toastHandler(`Super Trend Bank Nifty short SL Trailed to 1`);
        }
        if (bnfFutLtp >= sl_level || mtm <= -bnfShortOrderId?.slPoints) {
          await bnfShortExit();
          toastHandler(`Bank Nifty short SL reached`);
        }
      }
    };
    bnfShortSLManager();
  }, [tickerData, bnfShortOrderId]);

  const [nextCheck, setNextCheck] = useState(null);
  const [nextEntryCheck, setNextEntryCheck] = useState(null);
  const [exitAllCheck, setExitAllCheck] = useState(null);

  useEffect(() => {
    const monitorNiftyShortTrailing = async () => {
      if (
        niftyShortOrderId?.putLong?.trading_symbol &&
        niftyShortOrderId?.callShort?.trading_symbol &&
        niftyShortOrderId?.entryPrice &&
        nextCheck !== null
      ) {
        if (
          (niftyFutLtp > nifty10SMA &&
            niftyFutLtp >= niftyShortOrderId?.entryPrice) ||
          niftyFutLtp > nifty20SMA
        ) {
          await niftyShortExit();
          toastHandler(`Nifty short Trailing SL reached`);
        } else {
          toastHandler(`Nifty short TSL Not reached`);
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
          niftyFutLtp < nifty20SMA
        ) {
          await niftyLongExit();
          toastHandler(`Nifty long Trailing SL reached`);
        } else {
          toastHandler(`Nifty long TSL Not reached`);
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
          bnfFutLtp > bnf20SMA
        ) {
          bnfShortExit();
          toastHandler(`Bank Nifty short Trailing SL reached`);
        } else {
          toastHandler(`Bank Nifty short TSL Not reached`);
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
          bnfFutLtp < bnf20SMA
        ) {
          await bnfLongExit();
          toastHandler(`Bank Nifty long Trailing SL reached`);
        } else {
          toastHandler(`Bank Nifty long TSL Not reached`);
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

  // Nifty levels set
  const niftySetLongLevel = async (level) => {
    if (
      !niftyLongOrderId?.callLong?.trading_symbol &&
      !niftyLongOrderId?.putShort?.trading_symbol
    ) {
      if (level === 0 || !level || level === null) {
        await setDoc(
          doc(db, "futFiveMin", "niftyFutLong"),
          {
            entryLevel: deleteField(),
          },
          { merge: true }
        );
        toastHandler(`Nifty Long Level ${level} deleted`);
      } else {
        await setDoc(
          doc(db, "futFiveMin", "niftyFutLong"),
          {
            entryLevel: parseInt(level),
          },
          { merge: true }
        );
        toastHandler(`Nifty Long Level ${level} set`);
      }
    } else {
      console.log("Trades already open");
    }
  };
  const niftySetShortLevel = async (level) => {
    if (
      !niftyShortOrderId?.putLong?.trading_symbol &&
      !niftyShortOrderId?.callShort?.trading_symbol
    ) {
      if (level === 0 || !level || level === null) {
        await setDoc(
          doc(db, "futFiveMin", "niftyFutShort"),
          {
            entryLevel: deleteField(),
          },
          { merge: true }
        );
        toastHandler(`Nifty Short Level ${level} deleted`);
      } else {
        await setDoc(
          doc(db, "futFiveMin", "niftyFutShort"),
          {
            entryLevel: parseInt(level),
          },
          { merge: true }
        );
        toastHandler(`Nifty Short Level ${level} set`);
      }
    } else {
      console.log("Trades already open");
    }
  };
  const bnfSetLongLevel = async (level) => {
    if (
      !bnfLongOrderId?.callLong?.trading_symbol &&
      !bnfLongOrderId?.putShort?.trading_symbol
    ) {
      if (level === 0 || !level || level === null) {
        await setDoc(
          doc(db, "futFiveMin", "bnfFutLong"),
          {
            entryLevel: deleteField(),
          },
          { merge: true }
        );
        toastHandler(`Bank Nifty Long Level ${level} deleted`);
      } else {
        await setDoc(
          doc(db, "futFiveMin", "bnfFutLong"),
          {
            entryLevel: parseInt(level),
          },
          { merge: true }
        );
        toastHandler(`Bank Nifty Long Level ${level} set`);
      }
    } else {
      console.log("Trades already open");
    }
  };
  const bnfSetShortLevel = async (level) => {
    if (
      !bnfShortOrderId?.putLong?.trading_symbol &&
      !bnfShortOrderId?.callShort?.trading_symbol
    ) {
      if (level === 0 || !level || level === null) {
        await setDoc(
          doc(db, "futFiveMin", "bnfFutShort"),
          {
            entryLevel: deleteField(),
          },
          { merge: true }
        );
        toastHandler(`Bank Nifty Short Level ${level} deleted`);
      } else {
        await setDoc(
          doc(db, "futFiveMin", "bnfFutShort"),
          {
            entryLevel: parseInt(level),
          },
          { merge: true }
        );
        toastHandler(`Bank Nifty Short Level ${level} set`);
      }
    } else {
      console.log("Trades already open");
    }
  };

  useEffect(() => {
    const checkNiftyLongEntry = async () => {
      if (niftyLongOrderId?.entryLevel && nextEntryCheck !== null) {
        let entry = niftyLongOrderId?.entryLevel;
        let lastClose = niftyCandles?.[0]?.close;

        if (
          niftyFutLtp > entry &&
          niftyFutLtp - lastClose <= 25 &&
          niftyFutLtp > nifty20SMA
        ) {
          await niftyLong();
          toastHandler(`Nifty Long Auto Entry`);
        } else if (niftyFutLtp < nifty20SMA || niftyFutLtp - lastClose > 25) {
          await setDoc(
            doc(db, "futFiveMin", "niftyFutLong"),
            {
              entryLevel: deleteField(),
            },
            { merge: true }
          );
          toastHandler(
            `Nifty Long Level ${niftyLongOrderId?.entryLevel} voided`
          );
        } else {
          toastHandler(
            `Nifty Long Level ${niftyLongOrderId?.entryLevel} not met`
          );
        }
      } else {
        console.log("Nifty Long No level set");
      }
    };
    const checkNiftyShortEntry = async () => {
      if (niftyShortOrderId?.entryLevel && nextEntryCheck !== null) {
        let entry = niftyShortOrderId?.entryLevel;
        let lastClose = niftyCandles?.[0]?.close;

        if (
          niftyFutLtp < entry &&
          lastClose - niftyFutLtp <= 25 &&
          niftyFutLtp < nifty20SMA
        ) {
          await niftyShort();
          toastHandler(`Nifty Short Auto Entry`);
        } else if (niftyFutLtp > nifty20SMA || lastClose - niftyFutLtp > 25) {
          await setDoc(
            doc(db, "futFiveMin", "niftyFutShort"),
            {
              entryLevel: deleteField(),
            },
            { merge: true }
          );
          toastHandler(
            `Nifty Short Level ${niftyShortOrderId?.entryLevel} voided`
          );
        } else {
          toastHandler(
            `Nifty Short Level ${niftyShortOrderId?.entryLevel} not met`
          );
        }
      } else {
        console.log("Nifty Short No level set");
      }
    };
    const checkBnfLongEntry = async () => {
      if (bnfLongOrderId?.entryLevel && nextEntryCheck !== null) {
        let entry = bnfLongOrderId?.entryLevel;
        let lastClose = bnfCandles?.[0]?.close;

        if (
          bnfFutLtp > entry &&
          bnfFutLtp - lastClose <= 85 &&
          bnfFutLtp > bnf20SMA
        ) {
          await bnfLong();
          toastHandler(`Bank Nifty Long Auto Entry`);
        } else if (bnfFutLtp < bnf20SMA || bnfFutLtp - lastClose > 85) {
          await setDoc(
            doc(db, "futFiveMin", "bnfFutLong"),
            {
              entryLevel: deleteField(),
            },
            { merge: true }
          );
          toastHandler(
            `Bank Nifty Long Level ${bnfLongOrderId?.entryLevel} voided`
          );
        } else {
          toastHandler(
            `Bank Nifty Long Level ${bnfLongOrderId?.entryLevel} not met`
          );
        }
      } else {
        console.log("Bank Nifty Long No level set");
      }
    };
    const checkBnfShortEntry = async () => {
      if (bnfShortOrderId?.entryLevel && nextEntryCheck !== null) {
        let entry = bnfShortOrderId?.entryLevel;
        let lastClose = bnfCandles?.[0]?.close;

        if (
          bnfFutLtp < entry &&
          lastClose - bnfFutLtp <= 85 &&
          bnfFutLtp < bnf20SMA
        ) {
          await bnfShort();
          toastHandler(`Bank Nifty Short Auto Entry`);
        } else if (bnfFutLtp > bnf20SMA || lastClose - bnfFutLtp > 85) {
          await setDoc(
            doc(db, "futFiveMin", "bnfFutShort"),
            {
              entryLevel: deleteField(),
            },
            { merge: true }
          );
          toastHandler(
            `Bank Nifty Short Level ${bnfShortOrderId?.entryLevel} voided`
          );
        } else {
          toastHandler(
            `Bank Nifty Short Level ${bnfShortOrderId?.entryLevel} not met`
          );
        }
      } else {
        console.log("Bank Nifty Short No level set");
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
    startStream();
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
                  onClick={startStream}
                >
                  Start Stream
                </button>
              </div>
            )}
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
              <div className="stat ">
                <div className="text-xs long text-slate-400">Long Strikes</div>
                <div className="stat-title">PE Sell</div>
                <div className="text-xl font-bold">
                  {niftyLongPutSell?.strike}
                  {niftyLongPutSell?.instrument_type}
                </div>
                <div className="text-sm">LTP: {niftyShortPutLtp}</div>
              </div>

              <div className="stat">
                <div className="text-xs long text-slate-400">Long Strikes</div>

                <div className="stat-title">CE Buy</div>
                <div className="text-xl font-bold">
                  {niftyLongCallBuy?.strike}
                  {niftyLongCallBuy?.instrument_type}
                </div>
                <div className="text-sm">LTP: {niftyLongCallLtp}</div>
              </div>
            </div>

            <div className="w-full m-3 shadow stats bg-neutral">
              <div className="stat ">
                <div className="text-xs long text-slate-400">Short Strikes</div>
                <div className="stat-title">PE Buy</div>
                <div className="text-xl font-bold">
                  {niftyShortPutBuy?.strike}
                  {niftyShortPutBuy?.instrument_type}
                </div>
                <div className="text-sm">LTP: {niftyLongPutLtp}</div>
              </div>

              <div className="stat">
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
                <div className="stat-title">10 SMA</div>
                <div className="text-xl font-bold">{nifty10SMA}</div>
                {/* <button
                  className="mt-2 btn btn-xs btn-accent"
                  onClick={() => {
                    setEnable10SMAnifty(enable10SMAnifty ? false : true);
                  }}
                >
                  {enable10SMAnifty ? "Disable" : "Enable"}
                </button> */}
              </div>

              <div className="overflow-hidden stat">
                <div className="stat-title">20 SMA</div>
                <div className="text-xl font-bold">{nifty20SMA}</div>
                {/* <button
                  className="mt-2 btn btn-xs btn-accent"
                  onClick={() => {
                    setEnable20SMAnifty(enable20SMAnifty ? false : true);
                  }}
                >
                  {enable20SMAnifty ? "Disable" : "Enable"}
                </button> */}
              </div>
            </div>
          </div>

          {/*  */}
          {/* ENTRY LEVELS*/}
          {/*  */}

          <div className="flex justify-between w-full p-3 pt-0 setEntryLevels">
            <div className="setLong join">
              <input
                type="number"
                id="niftyLongLevel"
                className="w-32 input input-bordered join-item input-md"
              />
              <button
                className="text-white btn btn-neutral join-item"
                onClick={() => {
                  let longLevel =
                    document.getElementById("niftyLongLevel").value;
                  niftySetLongLevel(parseInt(longLevel));
                }}
              >
                Nifty Long
              </button>
            </div>
            <div className="setShort join">
              <input
                type="number"
                id="niftyShortLevel"
                className="w-32 input input-bordered join-item input-md"
              />
              <button
                className="text-white btn btn-neutral join-item "
                onClick={() => {
                  let shortLevel =
                    document.getElementById("niftyShortLevel").value;
                  niftySetShortLevel(parseInt(shortLevel));
                }}
              >
                Nifty Short
              </button>
            </div>
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
                id="niftySl"
                className="w-32 input input-bordered input-md join-item"
              />
              <button
                className="text-white btn btn-secondary join-item"
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
                className="w-32 input input-bordered input-md join-item"
              />
              <button
                className="text-white btn btn-secondary join-item"
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

          <div className="p-2 openPosition">
            <div className="w-full shadow-xl card bg-base-200">
              <div className="card-body">
                <h2 className="card-title">Open Position</h2>
                {/*  */}
                {/* Long POSITION */}
                {/*  */}
                {niftyLongOrderId?.entryPrice &&
                  niftyLongOrderId?.callLong?.trading_symbol &&
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
                          <div className="stat-title">Buy Strike</div>
                          <div className="text-xl font-bold">
                            {niftyLongOrderId?.callLong?.trading_symbol}
                          </div>
                          <div className="stat-desc">
                            PNL:
                            {(
                              (niftyLongCallLtp -
                                niftyLongOrderId?.callLong?.average_price) *
                              niftyQty
                            ).toFixed(2)}
                          </div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Sell Strike</div>
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
                              (niftyLongCallLtp -
                                niftyLongOrderId?.callLong?.average_price +
                                niftyLongOrderId?.putShort?.average_price -
                                niftyShortPutLtp) *
                              niftyQty
                            ).toFixed(2)}
                          </div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Total</div>
                          <div className="text-xl font-bold">
                            {(
                              (niftyLongCallLtp -
                                niftyLongOrderId?.callLong?.average_price +
                                niftyLongOrderId?.putShort?.average_price -
                                niftyShortPutLtp) *
                              niftyQty *
                              30
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
                  niftyShortOrderId?.putLong?.trading_symbol &&
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
                          <div className="stat-title">Buy Strike</div>
                          <div className="text-xl font-bold">
                            {niftyShortOrderId?.putLong?.trading_symbol}
                          </div>
                          <div className="stat-desc">
                            PNL:
                            {(
                              (niftyLongPutLtp -
                                niftyShortOrderId?.putLong?.average_price) *
                              niftyQty
                            ).toFixed(2)}
                          </div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Sell Strike</div>
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
                              (niftyLongPutLtp -
                                niftyShortOrderId?.putLong?.average_price +
                                niftyShortOrderId?.callShort?.average_price -
                                niftyShortCallLtp) *
                              niftyQty
                            ).toFixed(2)}
                          </div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Total</div>
                          <div className="text-xl font-bold">
                            {(
                              (niftyLongPutLtp -
                                niftyShortOrderId?.putLong?.average_price +
                                niftyShortOrderId?.callShort?.average_price -
                                niftyShortCallLtp) *
                              niftyQty *
                              30
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
              <div className="stat ">
                <div className="text-xs long text-slate-400">Long Strikes</div>

                <div className="stat-title">PE Sell</div>
                <div className="text-xl font-bold">
                  {bnfLongPutSell?.strike}
                  {bnfLongPutSell?.instrument_type}
                </div>
                <div className="text-sm">LTP: {bnfShortPutLtp}</div>
              </div>

              <div className="stat">
                <div className="text-xs long text-slate-400">Long Strikes</div>

                <div className="stat-title">CE Buy</div>
                <div className="text-xl font-bold">
                  {bnfLongCallBuy?.strike}
                  {bnfLongCallBuy?.instrument_type}
                </div>
                <div className="text-sm">LTP: {bnfLongCallLtp}</div>
              </div>
            </div>
            <div className="w-full m-3 shadow stats bg-neutral">
              <div className="stat ">
                <div className="text-xs long text-slate-400">Short Strikes</div>

                <div className="stat-title">PE Buy</div>
                <div className="text-xl font-bold">
                  {bnfShortPutBuy?.strike}
                  {bnfShortPutBuy?.instrument_type}
                </div>
                <div className="text-sm">LTP: {bnfLongPutLtp}</div>
              </div>

              <div className="stat">
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
                <div className="stat-title">10 SMA</div>
                <div className="text-xl font-bold">{bnf10SMA}</div>
              </div>

              <div className="overflow-hidden stat">
                <div className="stat-title">20 SMA</div>
                <div className="text-xl font-bold">{bnf20SMA}</div>
              </div>
            </div>
          </div>

          {/*  */}
          {/* ENTRY LEVELS*/}
          {/*  */}

          <div className="flex justify-between w-full p-3 pt-0 setEntryLevels">
            <div className="setLong join">
              <input
                type="number"
                id="bnfLongLevel"
                className="w-32 input input-bordered join-item input-md"
              />
              <button
                className="text-white btn btn-neutral join-item"
                onClick={() => {
                  let longLevel = document.getElementById("bnfLongLevel").value;
                  bnfSetLongLevel(parseInt(longLevel));
                }}
              >
                Bank Nifty Long
              </button>
            </div>
            <div className="setShort join">
              <input
                type="number"
                id="bnfShortLevel"
                className="w-32 input input-bordered join-item input-md"
              />
              <button
                className="text-white btn btn-neutral join-item "
                onClick={() => {
                  let shortLevel =
                    document.getElementById("bnfShortLevel").value;
                  bnfSetShortLevel(parseInt(shortLevel));
                }}
              >
                Bank Nifty Short
              </button>
            </div>
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
                id="bnfSl"
                className="w-32 input input-bordered input-md join-item"
              />
              <button
                className="text-white btn btn-secondary join-item"
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
                className="w-32 input input-bordered input-md join-item"
              />
              <button
                className="text-white btn btn-secondary join-item"
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

          <div className="p-2 openPosition">
            <div className="w-full shadow-xl card bg-base-200">
              <div className="card-body">
                <h2 className="card-title">Open Position</h2>
                {/*  */}
                {/* Long POSITION */}
                {/*  */}
                {bnfLongOrderId?.entryPrice &&
                  bnfLongOrderId?.callLong?.trading_symbol &&
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
                          <div className="stat-title">Buy Strike</div>
                          <div className="text-xl font-bold">
                            {bnfLongOrderId?.callLong?.trading_symbol}
                          </div>
                          <div className="stat-desc">
                            PNL:
                            {(
                              (bnfLongCallLtp -
                                bnfLongOrderId?.callLong?.average_price) *
                              bnfQty
                            ).toFixed(2)}
                          </div>
                        </div>
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
                              (bnfLongCallLtp -
                                bnfLongOrderId?.callLong?.average_price +
                                bnfLongOrderId?.putShort?.average_price -
                                bnfShortPutLtp) *
                              bnfQty
                            ).toFixed(2)}
                          </div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Total</div>
                          <div className="text-xl font-bold">
                            {(
                              (bnfLongCallLtp -
                                bnfLongOrderId?.callLong?.average_price +
                                bnfLongOrderId?.putShort?.average_price -
                                bnfShortPutLtp) *
                              bnfQty *
                              30
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
                          <div className="stat-title">Buy Strike</div>
                          <div className="text-xl font-bold">
                            {bnfShortOrderId?.putLong?.trading_symbol}
                          </div>
                          <div className="stat-desc">
                            PNL:
                            {(
                              (bnfLongPutLtp -
                                bnfShortOrderId?.putLong?.average_price) *
                              bnfQty
                            ).toFixed(2)}
                          </div>
                        </div>
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
                              (bnfLongPutLtp -
                                bnfShortOrderId?.putLong?.average_price +
                                bnfShortOrderId?.callShort?.average_price -
                                bnfShortCallLtp) *
                              bnfQty
                            ).toFixed(2)}
                          </div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Total</div>
                          <div className="text-xl font-bold">
                            {(
                              (bnfLongPutLtp -
                                bnfShortOrderId?.putLong?.average_price +
                                bnfShortOrderId?.callShort?.average_price -
                                bnfShortCallLtp) *
                              bnfQty *
                              30
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

export default FutTrading;
