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
} from "firebase/firestore";
// import schedule from "node-schedule";

function PositionalSpread() {
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
  const [niftyQty, setNiftyQty] = useState(50);
  const [bnfQty, setBnfQty] = useState(15);

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
  const [refreshExistingOrder, setRefreshExistingOrder] = useState();

  const refreshOpenPos = () => {
    setRefreshExistingOrder(Math.random()); //
    // console.log(refreshExistingOrder);
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
            data.expiry === expiries?.niftyExpiryDates?.[1] &&
            data.strike === parseInt(niftyRounded) &&
            data.instrument_type === "PE"
          );
        }
      );
      const niftyLongStrikeBuy = niftyOptChainData?.niftyChain?.filter(
        (data) => {
          return (
            data.expiry === expiries?.niftyExpiryDates?.[1] &&
            data.strike === parseInt(niftyRounded) &&
            data.instrument_type === "CE"
          );
        }
      );

      const niftyShortStrikeSell = niftyOptChainData?.niftyChain?.filter(
        (data) => {
          return (
            data.expiry === expiries?.niftyExpiryDates?.[1] &&
            data.strike === parseInt(niftyRounded) &&
            data.instrument_type === "CE"
          );
        }
      );
      const niftyShortStrikeBuy = niftyOptChainData?.niftyChain?.filter(
        (data) => {
          return (
            data.expiry === expiries?.niftyExpiryDates?.[1] &&
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
          data.expiry === expiries?.bnfExpiryDates?.[1] &&
          data.strike === parseInt(bnfRounded) &&
          data.instrument_type === "PE"
        );
      });
      const bnfLongStrikeBuy = bnfOptChainData?.bnfChain?.filter((data) => {
        return (
          data.expiry === expiries?.bnfExpiryDates?.[1] &&
          data.strike === parseInt(bnfRounded) &&
          data.instrument_type === "CE"
        );
      });

      const bnfShortStrikeSell = bnfOptChainData?.bnfChain?.filter((data) => {
        return (
          data.expiry === expiries?.bnfExpiryDates?.[1] &&
          data.strike === parseInt(bnfRounded) &&
          data.instrument_type === "CE"
        );
      });
      const bnfShortStrikeBuy = bnfOptChainData?.bnfChain?.filter((data) => {
        return (
          data.expiry === expiries?.bnfExpiryDates?.[1] &&
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

  socket?.on(`30min${niftyFutData?.instrument_token}`, (data) => {
    setNiftyCandles(data);
  });
  socket?.on(`30min${bnfFutData?.instrument_token}`, (data) => {
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
    await axios
      .get(
        // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`
        `/api/placeOrderFno?tradingsymbol=${niftyLongCallBuy.tradingsymbol}&transaction_type=BUY&quantity=${niftyQty}&product=NRML&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response.data.order_id;
        await axios.get(`/api/orderInfo`).then(async (res) => {
          // console.log(res);
          let callLongId = res?.data?.filter((order) => {
            return order.order_id === orderId && order.status === "COMPLETE";
          });

          console.log(callLongId);
          let price;

          if (callLongId?.[0]?.average_price) {
            price = callLongId?.[0].average_price;
          } else {
            price = "";
          }

          await setDoc(
            doc(db, "user", "30niftyFutLong"),
            {
              callLong: {
                order_id: orderId,
                average_price: price,
                instrument_token: parseInt(niftyLongCallBuy?.instrument_token),
                trading_symbol: niftyLongCallBuy.tradingsymbol,
              },
            },
            { merge: true }
          )
            .then(() => {
              console.log("Order Updated Updated");
            })
            .catch((e) => {
              console.log("Error: ", e);
            });
        });
      });
    await axios
      .get(
        // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
        `/api/placeOrderFno?tradingsymbol=${niftyLongPutSell.tradingsymbol}&transaction_type=SELL&quantity=${niftyQty}&product=NRML&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response.data.order_id;
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
            slPoint = 100;
            tgtPoint = 210;
          } else {
            price = "";
            slPoint = "";
            tgtPoint = "";
          }

          await setDoc(
            doc(db, "user", "30niftyFutLong"),
            {
              entryPrice: niftyFutLtp,
              slPoints: slPoint,
              tgtPoints: tgtPoint,
              putShort: {
                order_id: orderId,
                average_price: price,
                instrument_token: parseInt(niftyLongPutSell?.instrument_token),
                trading_symbol: niftyLongPutSell.tradingsymbol,
              },
              entryLevel: deleteField(),
            },
            { merge: true }
          )
            .then(() => {
              console.log("Order Updated Updated");
            })
            .catch((e) => {
              console.log("Error: ", e);
            });
        });
      });
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "30niftyFutLong"), (doc) => {
      if (doc.data()) {
        console.log(doc.data());
      }
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
    await axios
      .get(
        // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

        `/api/placeOrderFno?tradingsymbol=${niftyShortPutBuy.tradingsymbol}&transaction_type=BUY&quantity=${niftyQty}&product=NRML&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response.data.order_id;
        await axios.get(`/api/orderInfo`).then(async (res) => {
          let putLongId = res?.data?.filter((order) => {
            return order.order_id === orderId && order.status === "COMPLETE";
          });

          console.log(putLongId);
          let price;

          if (putLongId?.[0]?.average_price) {
            price = putLongId?.[0].average_price;
          } else {
            price = "";
          }

          await setDoc(
            doc(db, "user", "30niftyFutShort"),
            {
              putLong: {
                order_id: orderId,
                average_price: price,
                instrument_token: parseInt(niftyShortPutBuy?.instrument_token),
                trading_symbol: niftyShortPutBuy?.tradingsymbol,
              },
            },
            { merge: true }
          )
            .then(() => {
              console.log("Order Updated Updated");
            })
            .catch((e) => {
              console.log("Error: ", e);
            });
        });
      });
    await axios
      .get(
        `/api/placeOrderFno?tradingsymbol=${niftyShortCallSell.tradingsymbol}&transaction_type=SELL&quantity=${niftyQty}&product=NRML&order_type=MARKET`
        // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response.data.order_id;
        await axios.get(`/api/orderInfo`).then(async (res) => {
          let callShortId = res?.data?.filter((order) => {
            return order.order_id === orderId && order.status === "COMPLETE";
          });
          console.log(callShortId);

          let price;
          let slpoint;
          let tgtPoint;
          if (callShortId?.[0]?.average_price) {
            price = callShortId?.[0].average_price;
            slpoint = 100;
            tgtPoint = 210;
          } else {
            price = "";
            slpoint = "";
            tgtPoint = "";
          }

          await setDoc(
            doc(db, "user", "30niftyFutShort"),
            {
              entryPrice: niftyFutLtp,
              slPoints: slpoint,
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
            .then(() => {
              console.log("Order Updated Updated");
            })
            .catch((e) => {
              console.log("Error: ", e);
            });
        });
      });
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "30niftyFutShort"), (doc) => {
      if (doc.data()) {
        console.log(doc.data());
      }
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
      if (callLongId.length > 0 && putShortId.length > 0) {
        await setDoc(
          doc(db, "user", "30niftyFutLong"),
          {
            callLong: {
              order_id: niftyLongOrderId?.callLong?.order_id,
              average_price: callLongId?.[0]?.average_price,
            },
            putShort: {
              order_id: niftyLongOrderId?.putShort?.order_id,
              average_price: putShortId?.[0]?.average_price,
            },
          },
          { merge: true }
        )
          .then(() => {
            console.log("Order Updated Updated");
          })
          .catch((e) => {
            console.log("Error: ", e);
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
      if (putLongId.length > 0 && callShortId.length > 0) {
        await setDoc(
          doc(db, "user", "30niftyFutShort"),
          {
            putLong: {
              order_id: niftyShortOrderId?.putLong?.order_id,
              average_price: putLongId?.[0]?.average_price,
            },
            callShort: {
              order_id: niftyShortOrderId?.callShort?.order_id,
              average_price: callShortId?.[0]?.average_price,
            },
          },
          { merge: true }
        )
          .then(() => {
            console.log("Order Updated Updated");
          })
          .catch((e) => {
            console.log("Error: ", e);
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
        doc(db, "user", "30niftyFutLong"),
        {
          slPoints: parseInt(slPoints),
        },
        { merge: true }
      );
    } else if (
      niftyShortOrderId?.putLong?.trading_symbol &&
      niftyShortOrderId?.callShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "user", "30niftyFutShort"),
        {
          slPoints: parseInt(slPoints),
        },
        { merge: true }
      );
    } else {
      console.log("No trades Found");
    }
  };

  const niftySetTG = async (tgtPoints) => {
    if (
      niftyLongOrderId?.callLong?.trading_symbol &&
      niftyLongOrderId?.putShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "user", "30niftyFutLong"),
        {
          tgtPoints: parseInt(tgtPoints),
        },
        { merge: true }
      );
    } else if (
      niftyShortOrderId?.putLong?.trading_symbol &&
      niftyShortOrderId?.callShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "user", "30niftyFutShort"),
        {
          tgtPoints: parseInt(tgtPoints),
        },
        { merge: true }
      );
    } else {
      console.log("No trades Found");
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

          `/api/placeOrderFno?tradingsymbol=${niftyLongOrderId?.callLong?.trading_symbol}&transaction_type=SELL&quantity=${niftyQty}&product=NRML&order_type=MARKET`
        )
        .then(async (response) => {
          // console.log(response);
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "user", "30niftyFutLong"), {
              callLong: deleteField(),
            });
          }
        });
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFno?tradingsymbol=${niftyLongOrderId?.putShort?.trading_symbol}&transaction_type=BUY&quantity=${niftyQty}&product=NRML&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "user", "30niftyFutLong"), {
              putShort: deleteField(),
              entryPrice: deleteField(),
              slPoints: deleteField(),
              tgtPoints: deleteField(),
            });
          }
        });
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

          `/api/placeOrderFno?tradingsymbol=${niftyShortOrderId?.putLong?.trading_symbol}&transaction_type=SELL&quantity=${niftyQty}&product=NRML&order_type=MARKET`
        )
        .then(async (response) => {
          // console.log(response);
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "user", "30niftyFutShort"), {
              putLong: deleteField(),
            });
          }
        });
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFno?tradingsymbol=${niftyShortOrderId?.callShort?.trading_symbol}&transaction_type=BUY&quantity=${niftyQty}&product=NRML&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "user", "30niftyFutShort"), {
              callShort: deleteField(),
              entryPrice: deleteField(),
              slPoints: deleteField(),
              tgtPoints: deleteField(),
            });
          }
        });
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
          console.log("Nifty Target Reached MTM");
        }
        if (niftyFutLtp <= sl_level || mtm <= -niftyLongOrderId?.slPoints) {
          await niftyLongExit();
          console.log("Nifty Stoploss Reached MTM");
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
          console.log("Nifty Target Reached LEVEL");
        }

        if (niftyFutLtp >= sl_level || mtm <= -niftyShortOrderId?.slPoints) {
          await niftyShortExit();
          console.log("Nifty Stoploss Reached LEVEL");
        }
      }
    };
    niftyShortSLManager();
  }, [tickerData, niftyShortOrderId]);

  //BNF

  const bnfLong = async () => {
    await axios
      .get(
        // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`
        `/api/placeOrderFnoBnf?tradingsymbol=${bnfLongCallBuy.tradingsymbol}&transaction_type=BUY&quantity=${bnfQty}&product=NRML&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response.data.order_id;
        await axios.get(`/api/orderInfo`).then(async (res) => {
          // console.log(res);
          let callLongId = res?.data?.filter((order) => {
            return order.order_id === orderId && order.status === "COMPLETE";
          });

          console.log(callLongId);
          let price;

          if (callLongId?.[0]?.average_price) {
            price = callLongId?.[0].average_price;
          } else {
            price = "";
          }

          await setDoc(
            doc(db, "user", "30bnfFutLong"),
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
            .then(() => {
              console.log("Order Updated Updated");
            })
            .catch((e) => {
              console.log("Error: ", e);
            });
        });
      });
    await axios
      .get(
        // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
        `/api/placeOrderFnoBnf?tradingsymbol=${bnfLongPutSell.tradingsymbol}&transaction_type=SELL&quantity=${bnfQty}&product=NRML&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response.data.order_id;
        await axios.get(`/api/orderInfo`).then(async (res) => {
          // console.log(res);
          let putShortId = res?.data?.filter((order) => {
            return order.order_id === orderId && order.status === "COMPLETE";
          });

          console.log(putShortId);
          let price;
          let slPoint;
          if (putShortId?.[0]?.average_price) {
            price = putShortId?.[0].average_price;
            slPoint = 350;
            tgtPoint = 730;
          } else {
            price = "";
            slPoint = "";
            tgtPoint = "";
          }

          await setDoc(
            doc(db, "user", "30bnfFutLong"),
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
            .then(() => {
              console.log("Order Updated Updated");
            })
            .catch((e) => {
              console.log("Error: ", e);
            });
        });
      });
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "30bnfFutLong"), (doc) => {
      if (doc.data()) {
        console.log(doc.data());
      }
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
    await axios
      .get(
        // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

        `/api/placeOrderFnoBnf?tradingsymbol=${bnfShortPutBuy.tradingsymbol}&transaction_type=BUY&quantity=${bnfQty}&product=NRML&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response.data.order_id;
        await axios.get(`/api/orderInfo`).then(async (res) => {
          let putLongId = res?.data?.filter((order) => {
            return order.order_id === orderId && order.status === "COMPLETE";
          });

          console.log(putLongId);
          let price;

          if (putLongId?.[0]?.average_price) {
            price = putLongId?.[0].average_price;
          } else {
            price = "";
          }

          await setDoc(
            doc(db, "user", "30bnfFutShort"),
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
            .then(() => {
              console.log("Order Updated Updated");
            })
            .catch((e) => {
              console.log("Error: ", e);
            });
        });
      });
    await axios
      .get(
        `/api/placeOrderFnoBnf?tradingsymbol=${bnfShortCallSell.tradingsymbol}&transaction_type=SELL&quantity=${bnfQty}&product=NRML&order_type=MARKET`
        // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response.data.order_id;
        await axios.get(`/api/orderInfo`).then(async (res) => {
          let callShortId = res?.data?.filter((order) => {
            return order.order_id === orderId && order.status === "COMPLETE";
          });
          console.log(callShortId);

          let price;
          let slPoint;
          if (callShortId?.[0]?.average_price) {
            price = callShortId?.[0].average_price;
            slPoint = 350;
            tgtPoint = 730;
          } else {
            price = "";
            slPoint = "";
            tgtPoint = "";
          }

          await setDoc(
            doc(db, "user", "30bnfFutShort"),
            {
              entryPrice: bnfFutLtp,
              slPoints: slPoint,
              tgtPoints: tgtPoint,
              callShort: {
                order_id: orderId,
                average_price: price,
                instrument_token: parseInt(bnfShortCallSell?.instrument_token),
                trading_symbol: bnfShortCallSell?.tradingsymbol,
              },
              entryLevel: deleteField(),
            },
            { merge: true }
          )
            .then(() => {
              console.log("Order Updated Updated");
            })
            .catch((e) => {
              console.log("Error: ", e);
            });
        });
      });
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "30bnfFutShort"), (doc) => {
      if (doc.data()) {
        console.log(doc.data());
      }
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

      if (callLongId.length > 0 && putShortId.length > 0) {
        await setDoc(
          doc(db, "user", "30bnfFutLong"),
          {
            callLong: {
              order_id: bnfLongOrderId?.callLong?.order_id,
              average_price: callLongId?.[0]?.average_price,
            },
            putShort: {
              order_id: bnfLongOrderId?.putShort?.order_id,
              average_price: putShortId?.[0]?.average_price,
            },
          },
          { merge: true }
        )
          .then(() => {
            console.log("Order Updated Updated");
          })
          .catch((e) => {
            console.log("Error: ", e);
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
      if (putLongId.length > 0 && callShortId.length > 0) {
        await setDoc(
          doc(db, "user", "30bnfFutShort"),
          {
            putLong: {
              order_id: bnfShortOrderId?.putLong?.order_id,
              average_price: putLongId?.[0]?.average_price,
            },
            callShort: {
              order_id: bnfShortOrderId?.callShort?.order_id,
              average_price: callShortId?.[0]?.average_price,
            },
          },
          { merge: true }
        )
          .then(() => {
            console.log("Order Updated Updated");
          })
          .catch((e) => {
            console.log("Error: ", e);
          });
      }
    });
  };

  const bnfSetSL = async (slPoints) => {
    if (
      bnfLongOrderId?.callLong?.trading_symbol &&
      bnfLongOrderId?.putShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "user", "30bnfFutLong"),
        {
          slPoints: parseInt(slPoints),
        },
        { merge: true }
      );
    } else if (
      bnfShortOrderId?.putLong?.trading_symbol &&
      bnfShortOrderId?.callShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "user", "30bnfFutShort"),
        {
          slPoints: parseInt(slPoints),
        },
        { merge: true }
      );
    } else {
      console.log("No trades Found");
    }
  };

  const bnfSetTG = async (tgtPoints) => {
    if (
      bnfLongOrderId?.callLong?.trading_symbol &&
      bnfLongOrderId?.putShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "user", "30bnfFutLong"),
        {
          tgtPoints: parseInt(tgtPoints),
        },
        { merge: true }
      );
    } else if (
      bnfShortOrderId?.putLong?.trading_symbol &&
      bnfShortOrderId?.callShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "user", "30bnfFutShort"),
        {
          tgtPoints: parseInt(tgtPoints),
        },
        { merge: true }
      );
    } else {
      console.log("No trades Found");
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

          `/api/placeOrderFnoBnf?tradingsymbol=${bnfLongOrderId?.callLong?.trading_symbol}&transaction_type=SELL&quantity=${bnfQty}&product=NRML&order_type=MARKET`
        )
        .then(async (response) => {
          // console.log(response);
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "user", "30bnfFutLong"), {
              callLong: deleteField(),
            });
          }
        });
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFnoBnf?tradingsymbol=${bnfLongOrderId?.putShort?.trading_symbol}&transaction_type=BUY&quantity=${bnfQty}&product=NRML&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "user", "30bnfFutLong"), {
              putShort: deleteField(),
              entryPrice: deleteField(),
              slPoints: deleteField(),
              tgtPoints: deleteField(),
            });
          }
        });
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

          `/api/placeOrderFnoBnf?tradingsymbol=${bnfShortOrderId?.putLong?.trading_symbol}&transaction_type=SELL&quantity=${bnfQty}&product=NRML&order_type=MARKET`
        )
        .then(async (response) => {
          // console.log(response);
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "user", "30bnfFutShort"), {
              putLong: deleteField(),
            });
          }
        });
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFnoBnf?tradingsymbol=${bnfShortOrderId?.callShort?.trading_symbol}&transaction_type=BUY&quantity=${bnfQty}&product=NRML&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "user", "30bnfFutShort"), {
              callShort: deleteField(),
              entryPrice: deleteField(),
              slPoints: deleteField(),
              tgtPoints: deleteField(),
            });
          }
        });
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
          console.log("BankNifty Target Reached");
        }
        if (bnfFutLtp <= sl_level || mtm <= -bnfLongOrderId?.slPoints) {
          await bnfLongExit();
          console.log("BankNifty Stoploss Reached");
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
          console.log("BankNifty Target Reached");
        }

        if (bnfFutLtp >= sl_level || mtm <= -bnfShortOrderId?.slPoints) {
          await bnfShortExit();
          console.log("BankNifty Stoploss Reached");
        }
      }
    };
    bnfShortSLManager();
  }, [tickerData, bnfShortOrderId]);

  const [nextCheck, setNextCheck] = useState();
  const [nextEntryCheck, setNextEntryCheck] = useState();

  useEffect(() => {
    const monitorNiftyShortTrailing = async () => {
      if (
        niftyShortOrderId?.putLong?.trading_symbol &&
        niftyShortOrderId?.callShort?.trading_symbol &&
        niftyShortOrderId?.entryPrice
      ) {
        if (
          (niftyFutLtp > nifty10SMA &&
            niftyFutLtp >= niftyShortOrderId?.entryPrice) ||
          niftyFutLtp > nifty20SMA
        ) {
          await niftyShortExit();
          console.log("NiftyShort Exit Done");
        } else {
          console.log("NiftyShort SL not hit yet");
        }
      } else {
        console.log("NiftyShort No positions");
      }
    };
    const monitorNiftyLongTrailing = async () => {
      if (
        niftyLongOrderId?.callLong?.trading_symbol &&
        niftyLongOrderId?.putShort?.trading_symbol &&
        niftyLongOrderId?.entryPrice
      ) {
        if (
          (niftyFutLtp < nifty10SMA &&
            niftyFutLtp <= niftyLongOrderId?.entryPrice) ||
          niftyFutLtp < nifty20SMA
        ) {
          await niftyLongExit();
          console.log("NiftyLong Exit Done");
        } else {
          console.log("NiftyLong SL not hit yet");
        }
      } else {
        console.log("NiftyLong No positions");
      }
    };

    const monitorBnfShortTrailing = async () => {
      if (
        bnfShortOrderId?.putLong?.trading_symbol &&
        bnfShortOrderId?.callShort?.trading_symbol &&
        bnfShortOrderId?.entryPrice
      ) {
        if (
          (bnfFutLtp > bnf10SMA && bnfFutLtp >= bnfShortOrderId?.entryPrice) ||
          bnfFutLtp > bnf20SMA
        ) {
          await bnfShortExit();
          console.log("BnfShort Exit Done");
        } else {
          console.log("BnfShort SL not hit yet");
        }
      } else {
        console.log("BnfShort No positions");
      }
    };
    const monitorBnfLongTrailing = async () => {
      if (
        bnfLongOrderId?.callLong?.trading_symbol &&
        bnfLongOrderId?.putShort?.trading_symbol &&
        bnfLongOrderId?.entryPrice
      ) {
        if (
          (bnfFutLtp < bnf10SMA && bnfFutLtp <= bnfLongOrderId?.entryPrice) ||
          bnfFutLtp < bnf20SMA
        ) {
          await bnfLongExit();
          console.log("BnfLong Exit Done");
        } else {
          console.log("BnfLong SL not hit yet");
        }
      } else {
        console.log("BnfLong No positions");
      }
    };

    monitorNiftyShortTrailing();
    monitorNiftyLongTrailing();
    monitorBnfShortTrailing();
    monitorBnfLongTrailing();
  }, [nextCheck]);

  const niftySetLongLevel = async (level) => {
    if (
      !niftyLongOrderId?.callLong?.trading_symbol &&
      !niftyLongOrderId?.putShort?.trading_symbol
    ) {
      if (level === 0 || !level || level === null) {
        await setDoc(
          doc(db, "user", "30niftyFutLong"),
          {
            entryLevel: deleteField(),
          },
          { merge: true }
        );
      } else {
        await setDoc(
          doc(db, "user", "30niftyFutLong"),
          {
            entryLevel: parseInt(level),
          },
          { merge: true }
        );
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
          doc(db, "user", "30niftyFutShort"),
          {
            entryLevel: deleteField(),
          },
          { merge: true }
        );
      } else {
        await setDoc(
          doc(db, "user", "30niftyFutShort"),
          {
            entryLevel: parseInt(level),
          },
          { merge: true }
        );
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
          doc(db, "user", "30bnfFutLong"),
          {
            entryLevel: deleteField(),
          },
          { merge: true }
        );
      } else {
        await setDoc(
          doc(db, "user", "30bnfFutLong"),
          {
            entryLevel: parseInt(level),
          },
          { merge: true }
        );
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
          doc(db, "user", "30bnfFutShort"),
          {
            entryLevel: deleteField(),
          },
          { merge: true }
        );
      } else {
        await setDoc(
          doc(db, "user", "30bnfFutShort"),
          {
            entryLevel: parseInt(level),
          },
          { merge: true }
        );
      }
    } else {
      console.log("Trades already open");
    }
  };

  useEffect(() => {
    const checkNiftyLongEntry = async () => {
      if (niftyLongOrderId?.entryLevel) {
        let entry = niftyLongOrderId?.entryLevel;
        let lastClose = niftyCandles?.[0]?.close;

        if (
          niftyFutLtp > entry &&
          niftyFutLtp - lastClose <= 28 &&
          niftyFutLtp > nifty20SMA
        ) {
          await niftyLong();
        } else if (niftyFutLtp < nifty20SMA) {
          await setDoc(
            doc(db, "user", "30niftyFutLong"),
            {
              entryLevel: deleteField(),
            },
            { merge: true }
          );
        } else {
          console.log("Nifty Long 30 Mins Entry not met");
        }
      } else {
        console.log("Nifty Long 30 Mins No level set");
      }
    };
    const checkNiftyShortEntry = async () => {
      if (niftyShortOrderId?.entryLevel) {
        let entry = niftyShortOrderId?.entryLevel;
        let lastClose = niftyCandles?.[0]?.close;

        if (
          niftyFutLtp < entry &&
          lastClose - niftyFutLtp <= 28 &&
          niftyFutLtp < nifty20SMA
        ) {
          await niftyShort();
        } else if (niftyFutLtp > nifty20SMA) {
          await setDoc(
            doc(db, "user", "30niftyFutShort"),
            {
              entryLevel: deleteField(),
            },
            { merge: true }
          );
        } else {
          console.log("Nifty Short 30 Mins Entry not met");
        }
      } else {
        console.log("Nifty Short 30 Mins No level set");
      }
    };
    const checkBnfLongEntry = async () => {
      if (bnfLongOrderId?.entryLevel) {
        let entry = bnfLongOrderId?.entryLevel;
        let lastClose = bnfCandles?.[0]?.close;

        if (
          bnfFutLtp > entry &&
          bnfFutLtp - lastClose <= 95 &&
          bnfFutLtp > bnf20SMA
        ) {
          await bnfLong();
        } else if (bnfFutLtp < bnf20SMA) {
          await setDoc(
            doc(db, "user", "30bnfFutLong"),
            {
              entryLevel: deleteField(),
            },
            { merge: true }
          );
        } else {
          console.log("Bank Nifty 30 Mins Long Entry not met");
        }
      } else {
        console.log("Bank Nifty 30 Mins Long No level set");
      }
    };
    const checkBnfShortEntry = async () => {
      if (bnfShortOrderId?.entryLevel) {
        let entry = bnfShortOrderId?.entryLevel;
        let lastClose = bnfCandles?.[0]?.close;

        if (
          bnfFutLtp < entry &&
          lastClose - bnfFutLtp <= 95 &&
          bnfFutLtp < bnf20SMA
        ) {
          await bnfShort();
        } else if (bnfFutLtp > bnf20SMA) {
          await setDoc(
            doc(db, "user", "30bnfFutShort"),
            {
              entryLevel: deleteField(),
            },
            { merge: true }
          );
        } else {
          console.log("Bank Nifty 30 Mins Short Entry not met");
        }
      } else {
        console.log("Bank Nifty 30 Mins Short No level set");
      }
    };
    checkNiftyLongEntry();
    checkNiftyShortEntry();
    checkBnfLongEntry();
    checkBnfShortEntry();
  }, [nextEntryCheck]);

  socket?.on("checkSl30m", (data) => {
    setNextCheck(data);
  });

  socket?.on("checkEntry30m", (data) => {
    setNextEntryCheck(data);
  });

  useEffect(() => {
    refreshOpenPos();
  }, [isSuccess]);

  useEffect(() => {
    const slTgtRefresh = () => {
      if (niftyLongOrderId?.slPoints || niftyLongOrderId?.tgtPoints) {
        document.getElementById("niftySl30m").value =
          niftyLongOrderId?.slPoints;
        document.getElementById("niftyTgt30m").value =
          niftyLongOrderId?.tgtPoints;
      } else if (niftyShortOrderId?.slPoints || niftyShortOrderId?.tgtPoints) {
        document.getElementById("niftySl30m").value =
          niftyShortOrderId?.slPoints;
        document.getElementById("niftyTgt30m").value =
          niftyShortOrderId?.tgtPoints;
      }

      if (bnfLongOrderId?.slPoints || bnfLongOrderId?.tgtPoints) {
        document.getElementById("bnfSl30m").value = bnfLongOrderId?.slPoints;
        document.getElementById("bnfTgt30m").value = bnfLongOrderId?.tgtPoints;
      } else if (bnfShortOrderId?.slPoints || bnfShortOrderId?.tgtPoints) {
        document.getElementById("bnfSl30m").value = bnfShortOrderId?.slPoints;
        document.getElementById("bnfTgt30m").value = bnfShortOrderId?.tgtPoints;
      }
    };

    const levelRefresh = () => {
      if (niftyLongOrderId?.entryLevel) {
        document.getElementById("niftyLongLevel30m").value =
          niftyLongOrderId?.entryLevel;
      } else if (niftyShortOrderId?.entryLevel) {
        document.getElementById("niftyShortLevel30m").value =
          niftyShortOrderId?.entryLevel;
      }

      if (bnfLongOrderId?.entryLevel) {
        document.getElementById("bnfLongLevel30m").value =
          bnfLongOrderId?.entryLevel;
      } else if (bnfShortOrderId?.entryLevel) {
        document.getElementById("bnfShortLevel30m").value =
          bnfShortOrderId?.entryLevel;
      }
    };
    slTgtRefresh();
    levelRefresh();
  }, [niftyLongOrderId, niftyShortOrderId, bnfLongOrderId, bnfShortOrderId]);

  // socket?.on("tickerSuccess", () => {
  //
  //   console.log("hi");
  // });

  useEffect(() => {
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
  }, [niftyLongOrderId, niftyLtp]);

  // console.log(formatDate(date));
  return (
    <>
      {/* <h1>{JSON.stringify(expiries)}</h1> */}
      {/* {niftyRounded}:{bnfRounded} */}

      <div className="w-full h-max p-2">
        <div className="innerNav w-full h-full bg-neutral rounded-2xl shadow-lg flex justify-between">
          <div className="nifty flex items-center">
            <div className="m-3 ml-6">
              Nifty Expiry: {expiries?.niftyExpiryDates?.[1]?.slice(0, 10)} ||
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
              BNF Expiry: {expiries?.bnfExpiryDates?.[1]?.slice(0, 10)} ||
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
              <div className="stat ">
                <div className="long text-xs text-slate-400">Long Strikes</div>
                <div className="stat-title">PE Sell</div>
                <div className="font-bold text-xl">
                  {niftyLongPutSell?.strike}
                  {niftyLongPutSell?.instrument_type}
                </div>
                <div className="text-sm">LTP: {niftyShortPutLtp}</div>
              </div>

              <div className="stat">
                <div className="long text-xs text-slate-400">Long Strikes</div>

                <div className="stat-title">CE Buy</div>
                <div className="font-bold text-xl">
                  {niftyLongCallBuy?.strike}
                  {niftyLongCallBuy?.instrument_type}
                </div>
                <div className="text-sm">LTP: {niftyLongCallLtp}</div>
              </div>
            </div>

            <div className="stats w-full shadow m-3 bg-neutral">
              <div className="stat ">
                <div className="long text-xs text-slate-400">Short Strikes</div>
                <div className="stat-title">PE Buy</div>
                <div className="font-bold text-xl">
                  {niftyShortPutBuy?.strike}
                  {niftyShortPutBuy?.instrument_type}
                </div>
                <div className="text-sm">LTP: {niftyShortPutLtp}</div>
              </div>

              <div className="stat">
                <div className="long text-xs text-slate-400">Short Strikes</div>

                <div className="stat-title">CE Sell</div>
                <div className="font-bold text-xl">
                  {niftyShortCallSell?.strike}
                  {niftyShortCallSell?.instrument_type}
                </div>
                <div className="text-sm">LTP: {niftyLongCallLtp}</div>
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
                <div className="stat-title">10 SMA</div>
                <div className="font-bold text-xl">{nifty10SMA}</div>
              </div>

              <div className="stat overflow-hidden">
                <div className="stat-title">20 SMA</div>
                <div className="font-bold text-xl">{nifty20SMA}</div>
              </div>
            </div>
          </div>

          {/*  */}
          {/* ENTRY LEVELS*/}
          {/*  */}

          <div className="setEntryLevels w-full flex justify-between p-3 pt-0">
            <div className="setLong join">
              <input
                type="number"
                id="niftyLongLevel30m"
                className="input input-bordered join-item input-md w-32"
              />
              <button
                className="btn btn-neutral join-item text-white"
                onClick={() => {
                  let longLevel =
                    document.getElementById("niftyLongLevel30m").value;
                  niftySetLongLevel(parseInt(longLevel));
                }}
              >
                Nifty Long
              </button>
            </div>
            <div className="setShort join">
              <input
                type="number"
                id="niftyShortLevel30m"
                className="input input-bordered join-item input-md w-32"
              />
              <button
                className="btn btn-neutral join-item text-white "
                onClick={() => {
                  let shortLevel =
                    document.getElementById("niftyShortLevel30m").value;
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
                id="niftySl30m"
                className="input input-bordered input-md w-32 join-item"
              />
              <button
                className="btn btn-secondary text-white join-item"
                onClick={() => {
                  let sl = document.getElementById("niftySl30m").value;
                  niftySetSL(sl);
                }}
              >
                SL Nifty
              </button>
            </div>
            <div className="setTgt join">
              <input
                type="number"
                id="niftyTgt30m"
                className="input input-bordered input-md w-32 join-item"
              />
              <button
                className="btn btn-secondary text-white join-item"
                onClick={() => {
                  let tgt = document.getElementById("niftyTgt30m").value;
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
                  niftyLongOrderId?.callLong?.trading_symbol &&
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
                          <div className="stat-title">Buy Strike</div>
                          <div className="font-bold text-xl">
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
                              (niftyLongCallLtp -
                                niftyLongOrderId?.callLong?.average_price +
                                niftyLongOrderId?.putShort?.average_price -
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
                  niftyShortOrderId?.putLong?.trading_symbol &&
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
                          <div className="stat-title">Buy Strike</div>
                          <div className="font-bold text-xl">
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
                              (niftyLongPutLtp -
                                niftyShortOrderId?.putLong?.average_price +
                                niftyShortOrderId?.callShort?.average_price -
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
              <div className="stat ">
                <div className="long text-xs text-slate-400">Long Strikes</div>

                <div className="stat-title">PE Sell</div>
                <div className="font-bold text-xl">
                  {bnfLongPutSell?.strike}
                  {bnfLongPutSell?.instrument_type}
                </div>
                <div className="text-sm">LTP: {bnfShortPutLtp}</div>
              </div>

              <div className="stat">
                <div className="long text-xs text-slate-400">Long Strikes</div>

                <div className="stat-title">CE Buy</div>
                <div className="font-bold text-xl">
                  {bnfLongCallBuy?.strike}
                  {bnfLongCallBuy?.instrument_type}
                </div>
                <div className="text-sm">LTP: {bnfLongCallLtp}</div>
              </div>
            </div>
            <div className="stats w-full shadow m-3 bg-neutral">
              <div className="stat ">
                <div className="long text-xs text-slate-400">Short Strikes</div>

                <div className="stat-title">PE Buy</div>
                <div className="font-bold text-xl">
                  {bnfShortPutBuy?.strike}
                  {bnfShortPutBuy?.instrument_type}
                </div>
                <div className="text-sm">LTP: {bnfLongPutLtp}</div>
              </div>

              <div className="stat">
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
                <div className="stat-title">10 SMA</div>
                <div className="font-bold text-xl">{bnf10SMA}</div>
              </div>

              <div className="stat overflow-hidden">
                <div className="stat-title">20 SMA</div>
                <div className="font-bold text-xl">{bnf20SMA}</div>
              </div>
            </div>
          </div>

          {/*  */}
          {/* ENTRY LEVELS*/}
          {/*  */}

          <div className="setEntryLevels w-full flex justify-between p-3 pt-0">
            <div className="setLong join">
              <input
                type="number"
                id="bnfLongLevel30m"
                className="input input-bordered join-item input-md w-32"
              />
              <button
                className="btn btn-neutral join-item text-white"
                onClick={() => {
                  let longLevel =
                    document.getElementById("bnfLongLevel30m").value;
                  bnfSetLongLevel(parseInt(longLevel));
                }}
              >
                Bank Nifty Long
              </button>
            </div>
            <div className="setShort join">
              <input
                type="number"
                id="bnfShortLevel30m"
                className="input input-bordered join-item input-md w-32"
              />
              <button
                className="btn btn-neutral join-item text-white "
                onClick={() => {
                  let shortLevel =
                    document.getElementById("bnfShortLevel30m").value;
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

          <div className="setSLTGT w-full flex justify-between p-3 pt-0">
            <div className="setSl join">
              <input
                type="number"
                id="bnfSl30m"
                className="input input-bordered input-md w-32 join-item"
              />
              <button
                className="btn btn-secondary join-item text-white"
                onClick={() => {
                  let sl = document.getElementById("bnfSl30m").value;
                  bnfSetSL(sl);
                }}
              >
                SL Bank Nifty
              </button>
            </div>
            <div className="setTgt join">
              <input
                type="number"
                id="bnfTgt30m"
                className="input input-bordered input-md w-32 join-item"
              />
              <button
                className="btn btn-secondary text-white join-item"
                onClick={() => {
                  let tgt = document.getElementById("bnfTgt30m").value;
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
                  bnfLongOrderId?.callLong?.trading_symbol &&
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
                          <div className="stat-title">Buy Strike</div>
                          <div className="font-bold text-xl">
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
                              (bnfLongCallLtp -
                                bnfLongOrderId?.callLong?.average_price +
                                bnfLongOrderId?.putShort?.average_price -
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
                          <div className="stat-title">Buy Strike</div>
                          <div className="font-bold text-xl">
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
                              (bnfLongPutLtp -
                                bnfShortOrderId?.putLong?.average_price +
                                bnfShortOrderId?.callShort?.average_price -
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

export default PositionalSpread;
