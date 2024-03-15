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

function FutTrading() {
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
  const [niftyQty, setNiftyQty] = useState(250);
  const [bnfQty, setBnfQty] = useState(75);

  // Saves LTP every second
  const [niftyLtp, setNiftyLtp] = useState();
  const [niftyFutLtp, setNiftyFutLtp] = useState();
  const [bnfLtp, setBnfLtp] = useState();
  const [bnfFutLtp, setBnfFutLtp] = useState();

  // Rounded to nearest Strike
  const [niftyRounded, setNiftyRounded] = useState();
  const [bnfRounded, setBnfRounded] = useState();

  const [niftyShortCallSell, setNiftyShortCallSell] = useState();
  const [niftyShortCallBuy, setNiftyShortCallBuy] = useState();

  const [niftyLongPutSell, setNiftyLongPutSell] = useState();
  const [niftyLongPutBuy, setNiftyLongPutBuy] = useState();

  const [bnfShortCallSell, setBnfShortCallSell] = useState();
  const [bnfShortCallBuy, setBnfShortCallBuy] = useState();

  const [bnfLongPutSell, setBnfLongPutSell] = useState();
  const [bnfLongPutBuy, setBnfLongPutBuy] = useState();

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
  const [niftyShortPutLtp, setNiftyShortPutLtp] = useState();

  // Holds Short position LTPS
  const [niftyLongCallLtp, setNiftyLongCallLtp] = useState();
  const [niftyShortCallLtp, setNiftyShortCallLtp] = useState();

  const [bnfLongOrderId, setBnfLongOrderId] = useState();
  const [bnfShortOrderId, setBnfShortOrderId] = useState();

  // Holds Long position LTPS
  const [bnfLongPutLtp, setBnfLongPutLtp] = useState();
  const [bnfShortPutLtp, setBnfShortPutLtp] = useState();

  // Holds Short position LTPS
  const [bnfLongCallLtp, setBnfLongCallLtp] = useState();
  const [bnfShortCallLtp, setBnfShortCallLtp] = useState();

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
        data.instrument_token === niftyLongOrderId?.putLong?.instrument_token
      );
    });
    const niftyShortPut = tickerData?.filter((data) => {
      return (
        data.instrument_token === niftyLongOrderId?.putShort?.instrument_token
      );
    });
    const niftyLongCall = tickerData?.filter((data) => {
      return (
        data.instrument_token === niftyShortOrderId?.callLong?.instrument_token
      );
    });
    const niftyShortCall = tickerData?.filter((data) => {
      return (
        data.instrument_token === niftyShortOrderId?.callShort?.instrument_token
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
    if (niftyShortPut.length > 0) {
      setNiftyShortPutLtp(niftyShortPut?.[0]?.last_price);
    }
    if (niftyLongCall.length > 0) {
      setNiftyLongCallLtp(niftyLongCall?.[0]?.last_price);
    }
    if (niftyShortCall.length > 0) {
      setNiftyShortCallLtp(niftyShortCall?.[0]?.last_price);
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
            data.expiry === expiries?.niftyExpiryDates[0] &&
            data.strike === parseInt(niftyRounded + 50) &&
            data.instrument_type === "PE"
          );
        }
      );
      const niftyLongStrikeBuy = niftyOptChainData?.niftyChain?.filter(
        (data) => {
          return (
            data.expiry === expiries?.niftyExpiryDates[0] &&
            data.strike === parseInt(niftyRounded - 50) &&
            data.instrument_type === "PE"
          );
        }
      );

      const niftyShortStrikeSell = niftyOptChainData?.niftyChain?.filter(
        (data) => {
          return (
            data.expiry === expiries?.niftyExpiryDates[0] &&
            data.strike === parseInt(niftyRounded - 50) &&
            data.instrument_type === "CE"
          );
        }
      );
      const niftyShortStrikeBuy = niftyOptChainData?.niftyChain?.filter(
        (data) => {
          return (
            data.expiry === expiries?.niftyExpiryDates[0] &&
            data.strike === parseInt(niftyRounded + 50) &&
            data.instrument_type === "CE"
          );
        }
      );
      setNiftyLongPutSell(niftyLongStrikeSell?.[0]);
      setNiftyLongPutBuy(niftyLongStrikeBuy?.[0]);
      setNiftyShortCallSell(niftyShortStrikeSell?.[0]);
      setNiftyShortCallBuy(niftyShortStrikeBuy?.[0]);
    };

    const bnfStrikeSelect = () => {
      const bnfLongStrikeSell = bnfOptChainData?.bnfChain?.filter((data) => {
        return (
          data.expiry === expiries?.bnfExpiryDates[0] &&
          data.strike === parseInt(bnfRounded + 100) &&
          data.instrument_type === "PE"
        );
      });
      const bnfLongStrikeBuy = bnfOptChainData?.bnfChain?.filter((data) => {
        return (
          data.expiry === expiries?.bnfExpiryDates[0] &&
          data.strike === parseInt(bnfRounded - 100) &&
          data.instrument_type === "PE"
        );
      });

      const bnfShortStrikeSell = bnfOptChainData?.bnfChain?.filter((data) => {
        return (
          data.expiry === expiries?.bnfExpiryDates[0] &&
          data.strike === parseInt(bnfRounded - 100) &&
          data.instrument_type === "CE"
        );
      });
      const bnfShortStrikeBuy = bnfOptChainData?.bnfChain?.filter((data) => {
        return (
          data.expiry === expiries?.bnfExpiryDates[0] &&
          data.strike === parseInt(bnfRounded + 100) &&
          data.instrument_type === "CE"
        );
      });
      setBnfLongPutSell(bnfLongStrikeSell?.[0]);
      setBnfLongPutBuy(bnfLongStrikeBuy?.[0]);
      setBnfShortCallSell(bnfShortStrikeSell?.[0]);
      setBnfShortCallBuy(bnfShortStrikeBuy?.[0]);
    };

    niftyStrikeSelect();
    bnfStrikeSelect();
  }, [niftyRounded, bnfRounded]);

  const startStream = () => {
    socket?.emit("candleToken", [
      niftySpotData?.instrument_token,
      bnfSpotData?.instrument_token,
    ]);
    socket?.emit("defaultTokens", [
      niftyFutData?.instrument_token,
      bnfFutData?.instrument_token,
      niftySpotData?.instrument_token,
      bnfSpotData?.instrument_token,
    ]);
  };
  socket?.on(niftySpotData?.instrument_token, (data) => {
    setNiftyCandles(data);
  });
  socket?.on(bnfSpotData?.instrument_token, (data) => {
    setBnfCandles(data);
  });

  useEffect(() => {
    const nifty10SMA = () => {
      let sumOf9Candles = 0;
      let nifty10SMAval;
      niftyCandles
        ?.slice(-9)
        .reverse()
        .forEach((candle) => {
          sumOf9Candles = sumOf9Candles + candle.close;
        });
      nifty10SMAval = parseFloat(((sumOf9Candles + niftyLtp) / 10).toFixed(2));
      setNifty10SMA(nifty10SMAval);
    };
    const nifty20SMA = () => {
      let sumOf19Candles = 0;
      let nifty20SMAval;
      niftyCandles
        ?.slice(-19)
        .reverse()
        .forEach((candle) => {
          sumOf19Candles = sumOf19Candles + candle.close;
          // console.log(sumOf19Candles);
        });
      nifty20SMAval = parseFloat(((sumOf19Candles + niftyLtp) / 20).toFixed(2));
      setNifty20SMA(nifty20SMAval);
    };
    const bnf10SMA = () => {
      let sumOf9Candles = 0;
      let bnf10SMAval;
      bnfCandles
        ?.slice(-9)
        .reverse()
        .forEach((candle) => {
          sumOf9Candles = sumOf9Candles + candle.close;
        });
      bnf10SMAval = parseFloat(((sumOf9Candles + bnfLtp) / 10).toFixed(2));
      setBnf10SMA(bnf10SMAval);
    };
    const bnf20SMA = () => {
      let sumOf19Candles = 0;
      let bnf20SMAval;
      bnfCandles
        ?.slice(-19)
        .reverse()
        .forEach((candle) => {
          sumOf19Candles = sumOf19Candles + candle.close;
        });
      bnf20SMAval = parseFloat(((sumOf19Candles + bnfLtp) / 20).toFixed(2));

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
        `/api/placeOrderFno?tradingsymbol=${niftyLongPutBuy.tradingsymbol}&transaction_type=BUY&quantity=${niftyQty}&product=MIS&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response.data.order_id;
        await axios.get(`/api/orderInfo`).then(async (res) => {
          console.log(res);
          let putLongId = res?.data?.filter((order) => {
            return order.order_id === orderId && order.status === "COMPLETE";
          });

          console.log(putLongId);
          let price;

          if (putLongId[0]?.average_price) {
            price = putLongId[0].average_price;
          } else {
            price = "";
          }

          await setDoc(
            doc(db, "user", "niftyFutLong"),
            {
              putLong: {
                order_id: orderId,
                average_price: price,
                instrument_token: parseInt(niftyLongPutBuy?.instrument_token),
                trading_symbol: niftyLongPutBuy.tradingsymbol,
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
        `/api/placeOrderFno?tradingsymbol=${niftyLongPutSell.tradingsymbol}&transaction_type=SELL&quantity=${niftyQty}&product=MIS&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response.data.order_id;
        await axios.get(`/api/orderInfo`).then(async (res) => {
          console.log(res);
          let putShortId = res?.data?.filter((order) => {
            return order.order_id === orderId && order.status === "COMPLETE";
          });

          console.log(putShortId);
          let price;
          if (putShortId[0]?.average_price) {
            price = putShortId[0].average_price;
          } else {
            price = "";
          }

          await setDoc(
            doc(db, "user", "niftyFutLong"),
            {
              entryPrice: niftyLtp,
              putShort: {
                order_id: orderId,
                average_price: price,
                instrument_token: parseInt(niftyLongPutSell?.instrument_token),
                trading_symbol: niftyLongPutSell.tradingsymbol,
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
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "niftyFutLong"), (doc) => {
      console.log(doc.data());
      setNiftyLongOrderId(doc.data());

      socket?.emit("niftyFutToken", [
        doc?.data()?.putLong?.instrument_token,
        doc?.data()?.putShort?.instrument_token,
      ]);
    });
  }, []);

  useEffect(() => {
    socket?.emit("niftyFutToken", [
      niftyLongOrderId?.putLong?.instrument_token,
      niftyLongOrderId?.putShort?.instrument_token,
    ]);
  }, [niftyLongOrderId]);

  const niftyShort = async () => {
    await axios
      .get(
        // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

        `/api/placeOrderFno?tradingsymbol=${niftyShortCallBuy.tradingsymbol}&transaction_type=BUY&quantity=${niftyQty}&product=MIS&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response.data.order_id;
        await axios.get(`/api/orderInfo`).then(async (res) => {
          console.log(res);
          let callLongId = res?.data?.filter((order) => {
            return order.order_id === orderId && order.status === "COMPLETE";
          });

          let price;

          if (callLongId[0]?.average_price) {
            price = callLongId[0].average_price;
          } else {
            price = "";
          }

          await setDoc(
            doc(db, "user", "niftyFutShort"),
            {
              callLong: {
                order_id: orderId,
                average_price: price,
                instrument_token: parseInt(niftyShortCallBuy?.instrument_token),
                trading_symbol: niftyShortCallBuy?.tradingsymbol,
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
        `/api/placeOrderFno?tradingsymbol=${niftyShortCallSell.tradingsymbol}&transaction_type=SELL&quantity=${niftyQty}&product=MIS&order_type=MARKET`
        // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response.data.order_id;
        await axios.get(`/api/orderInfo`).then(async (res) => {
          console.log(res);
          let callShortId = res?.data?.filter((order) => {
            return order.order_id === orderId && order.status === "COMPLETE";
          });

          let price;

          if (callShortId[0]?.average_price) {
            price = callShortId[0].average_price;
          } else {
            price = "";
          }

          await setDoc(
            doc(db, "user", "niftyFutShort"),
            {
              entryPrice: niftyLtp,
              callShort: {
                order_id: orderId,
                average_price: price,
                instrument_token: parseInt(
                  niftyShortCallSell?.instrument_token
                ),
                trading_symbol: niftyShortCallSell?.tradingsymbol,
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
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "niftyFutShort"), (doc) => {
      console.log(doc.data());
      setNiftyShortOrderId(doc.data());
      socket?.emit("niftyFutToken", [
        doc?.data()?.callLong?.instrument_token,
        doc?.data()?.callShort?.instrument_token,
      ]);
    });
  }, []);

  useEffect(() => {
    socket?.emit("niftyFutToken", [
      niftyShortOrderId?.callLong?.instrument_token,
      niftyShortOrderId?.callShort?.instrument_token,
    ]);
  }, [niftyShortOrderId]);

  const updateOrderBookNifty = async () => {
    await axios.get(`/api/orderInfo`).then(async (response) => {
      console.log(response);
      let putLongId = response?.data?.filter((order) => {
        return (
          order.order_id === niftyLongOrderId?.putLong?.order_id &&
          order.status === "COMPLETE"
        );
      });
      let putShortId = response?.data?.filter((order) => {
        return (
          order.order_id === niftyLongOrderId?.putShort?.order_id &&
          order.status === "COMPLETE"
        );
      });
      if (putLongId.length > 0 && putShortId.length > 0) {
        await setDoc(
          doc(db, "user", "niftyFutLong"),
          {
            putLong: {
              order_id: niftyLongOrderId?.putLong?.order_id,
              average_price: putLongId[0]?.average_price,
            },
            putShort: {
              order_id: niftyLongOrderId?.putShort?.order_id,
              average_price: putShortId[0]?.average_price,
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
      console.log(response);
      let callLongId = response?.data?.filter((order) => {
        return (
          order.order_id === niftyShortOrderId?.callLong?.order_id &&
          order.status === "REJECTED"
        );
      });
      let callShortId = response?.data?.filter((order) => {
        return (
          order.order_id === niftyShortOrderId?.callShort?.order_id &&
          order.status === "REJECTED"
        );
      });
      if (callLongId.length > 0 && callShortId.length > 0) {
        await setDoc(
          doc(db, "user", "niftyFutShort"),
          {
            callLong: {
              order_id: niftyShortOrderId?.callLong?.order_id,
              average_price: callLongId[0]?.average_price,
            },
            callShort: {
              order_id: niftyShortOrderId?.callShort?.order_id,
              average_price: callShortId[0]?.average_price,
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
      niftyLongOrderId?.putLong?.trading_symbol &&
      niftyLongOrderId?.putShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "user", "niftyFutLong"),
        {
          slPoints: parseInt(slPoints),
        },
        { merge: true }
      );
    } else if (
      niftyShortOrderId?.callLong?.trading_symbol &&
      niftyShortOrderId?.callShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "user", "niftyFutShort"),
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
      niftyLongOrderId?.putLong?.trading_symbol &&
      niftyLongOrderId?.putShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "user", "niftyFutLong"),
        {
          tgtPoints: parseInt(tgtPoints),
        },
        { merge: true }
      );
    } else if (
      niftyShortOrderId?.callLong?.trading_symbol &&
      niftyShortOrderId?.callShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "user", "niftyFutShort"),
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
      niftyLongOrderId?.putLong?.trading_symbol &&
      niftyLongOrderId?.putShort?.trading_symbol
    ) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
          `/api/placeOrderFno?tradingsymbol=${niftyLongOrderId?.putLong?.trading_symbol}&transaction_type=SELL&quantity=${niftyQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          console.log(response);
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "user", "niftyFutLong"), {
              putLong: deleteField(),
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
            await updateDoc(doc(db, "user", "niftyFutLong"), {
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
      niftyShortOrderId?.callLong?.trading_symbol &&
      niftyShortOrderId?.callShort?.trading_symbol
    ) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
          `/api/placeOrderFno?tradingsymbol=${niftyShortOrderId?.callLong?.trading_symbol}&transaction_type=SELL&quantity=${niftyQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          console.log(response);
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "user", "niftyFutShort"), {
              callLong: deleteField(),
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
            await updateDoc(doc(db, "user", "niftyFutShort"), {
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
    const niftyLongSLManager = () => {
      if (
        niftyLongOrderId?.putLong?.trading_symbol &&
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
          niftyLongPutLtp -
          niftyShortOrderId?.putLong?.average_price +
          niftyShortOrderId?.putShort?.average_price -
          niftyShortPutLtp;

        if (mtm >= niftyLongOrderId?.tgtPoints) {
          niftyShortExit();
          console.log("Nifty Target Reached");
        }

        if (mtm <= niftyLongOrderId?.slPoints) {
          niftyShortExit();
          console.log("Nifty Stoploss Reached");
        }

        if (niftyLtp >= tgt_level) {
          niftyLongExit();
          console.log("Nifty Target Reached");
        }
        if (niftyLtp <= sl_level) {
          niftyLongExit();
          console.log("Nifty Stoploss Reached");
        }
      }
    };
    niftyLongSLManager();
  }, [niftyLtp, niftyLongOrderId]);

  useEffect(() => {
    const niftyShortSLManager = () => {
      if (
        niftyShortOrderId?.callLong?.trading_symbol &&
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
          niftyLongCallLtp -
          niftyShortOrderId?.callLong?.average_price +
          niftyShortOrderId?.callShort?.average_price -
          niftyShortCallLtp;

        if (mtm >= niftyShortOrderId?.tgtPoints) {
          niftyShortExit();
          console.log("Nifty Target Reached");
        }

        if (mtm <= niftyShortOrderId?.slPoints) {
          niftyShortExit();
          console.log("Nifty Stoploss Reached");
        }

        if (niftyLtp <= tgt_level) {
          niftyShortExit();
          console.log("Nifty Target Reached");
        }

        if (niftyLtp >= sl_level) {
          niftyShortExit();
          console.log("Nifty Stoploss Reached");
        }
      }
    };
    niftyShortSLManager();
  }, [niftyLtp, niftyShortOrderId]);

  //BNF

  const bnfLong = async () => {
    await axios
      .get(
        // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`
        `/api/placeOrderFno?tradingsymbol=${bnfLongPutBuy.tradingsymbol}&transaction_type=BUY&quantity=${bnfQty}&product=MIS&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response.data.order_id;
        await axios.get(`/api/orderInfo`).then(async (res) => {
          console.log(res);
          let putLongId = res?.data?.filter((order) => {
            return order.order_id === orderId && order.status === "COMPLETE";
          });

          console.log(putLongId);
          let price;

          if (putLongId[0]?.average_price) {
            price = putLongId[0].average_price;
          } else {
            price = "";
          }

          await setDoc(
            doc(db, "user", "bnfFutLong"),
            {
              putLong: {
                order_id: orderId,
                average_price: price,
                instrument_token: parseInt(bnfLongPutBuy?.instrument_token),
                trading_symbol: bnfLongPutBuy.tradingsymbol,
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
        `/api/placeOrderFno?tradingsymbol=${bnfLongPutSell.tradingsymbol}&transaction_type=SELL&quantity=${bnfQty}&product=MIS&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response.data.order_id;
        await axios.get(`/api/orderInfo`).then(async (res) => {
          console.log(res);
          let putShortId = res?.data?.filter((order) => {
            return order.order_id === orderId && order.status === "COMPLETE";
          });

          console.log(putShortId);
          let price;
          if (putShortId[0]?.average_price) {
            price = putShortId[0].average_price;
          } else {
            price = "";
          }

          await setDoc(
            doc(db, "user", "bnfFutLong"),
            {
              entryPrice: bnfLtp,
              putShort: {
                order_id: orderId,
                average_price: price,
                instrument_token: parseInt(bnfLongPutSell?.instrument_token),
                trading_symbol: bnfLongPutSell.tradingsymbol,
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
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "bnfFutLong"), (doc) => {
      console.log(doc.data());
      setBnfLongOrderId(doc.data());

      socket?.emit("niftyFutToken", [
        doc?.data()?.putLong?.instrument_token,
        doc?.data()?.putShort?.instrument_token,
      ]);
    });
  }, []);

  useEffect(() => {
    socket?.emit("niftyFutToken", [
      bnfLongOrderId?.putLong?.instrument_token,
      bnfLongOrderId?.putShort?.instrument_token,
    ]);
  }, [bnfLongOrderId]);

  const bnfShort = async () => {
    await axios
      .get(
        // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

        `/api/placeOrderFno?tradingsymbol=${bnfShortCallBuy.tradingsymbol}&transaction_type=BUY&quantity=${bnfQty}&product=MIS&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response.data.order_id;
        await axios.get(`/api/orderInfo`).then(async (res) => {
          console.log(res);
          let callLongId = res?.data?.filter((order) => {
            return order.order_id === orderId && order.status === "COMPLETE";
          });

          let price;

          if (callLongId[0]?.average_price) {
            price = callLongId[0].average_price;
          } else {
            price = "";
          }

          await setDoc(
            doc(db, "user", "bnfFutShort"),
            {
              callLong: {
                order_id: orderId,
                average_price: price,
                instrument_token: parseInt(bnfShortCallBuy?.instrument_token),
                trading_symbol: bnfShortCallBuy?.tradingsymbol,
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
        `/api/placeOrderFno?tradingsymbol=${bnfShortCallSell.tradingsymbol}&transaction_type=SELL&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response.data.order_id;
        await axios.get(`/api/orderInfo`).then(async (res) => {
          console.log(res);
          let callShortId = res?.data?.filter((order) => {
            return order.order_id === orderId && order.status === "COMPLETE";
          });

          let price;

          if (callShortId[0]?.average_price) {
            price = callShortId[0].average_price;
          } else {
            price = "";
          }

          await setDoc(
            doc(db, "user", "bnfFutShort"),
            {
              entryPrice: bnfLtp,
              callShort: {
                order_id: orderId,
                average_price: price,
                instrument_token: parseInt(bnfShortCallSell?.instrument_token),
                trading_symbol: bnfShortCallSell?.tradingsymbol,
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
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "bnfFutShort"), (doc) => {
      console.log(doc.data());
      setBnfShortOrderId(doc.data());
      socket?.emit("bnfFutToken", [
        doc?.data()?.callLong?.instrument_token,
        doc?.data()?.callShort?.instrument_token,
      ]);
    });
  }, []);

  useEffect(() => {
    socket?.emit("niftyFutToken", [
      bnfShortOrderId?.callLong?.instrument_token,
      bnfShortOrderId?.callShort?.instrument_token,
    ]);
  }, [bnfShortOrderId]);

  const updateOrderBookBnf = async () => {
    await axios.get(`/api/orderInfo`).then(async (response) => {
      console.log(response);
      let putLongId = response?.data?.filter((order) => {
        return (
          order.order_id === bnfLongOrderId?.putLong?.order_id &&
          order.status === "COMPLETE"
        );
      });
      let putShortId = response?.data?.filter((order) => {
        return (
          order.order_id === bnfLongOrderId?.putShort?.order_id &&
          order.status === "COMPLETE"
        );
      });

      if (putLongId.length > 0 && putShortId.length > 0) {
        await setDoc(
          doc(db, "user", "bnfFutLong"),
          {
            putLong: {
              order_id: bnfLongOrderId?.putLong?.order_id,
              average_price: putLongId[0]?.average_price,
            },
            putShort: {
              order_id: bnfLongOrderId?.putShort?.order_id,
              average_price: putShortId[0]?.average_price,
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
      console.log(response);
      let callLongId = response?.data?.filter((order) => {
        return (
          order.order_id === bnfShortOrderId?.callLong?.order_id &&
          order.status === "REJECTED"
        );
      });
      let callShortId = response?.data?.filter((order) => {
        return (
          order.order_id === bnfShortOrderId?.callShort?.order_id &&
          order.status === "REJECTED"
        );
      });
      if (callLongId.length > 0 && callShortId.length > 0) {
        await setDoc(
          doc(db, "user", "bnfFutShort"),
          {
            callLong: {
              order_id: bnfShortOrderId?.callLong?.order_id,
              average_price: callLongId[0]?.average_price,
            },
            callShort: {
              order_id: bnfShortOrderId?.callShort?.order_id,
              average_price: callShortId[0]?.average_price,
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
      bnfLongOrderId?.putLong?.trading_symbol &&
      bnfLongOrderId?.putShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "user", "bnfFutLong"),
        {
          slPoints: parseInt(slPoints),
        },
        { merge: true }
      );
    } else if (
      bnfShortOrderId?.callLong?.trading_symbol &&
      bnfShortOrderId?.callShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "user", "bnfFutShort"),
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
      bnfLongOrderId?.putLong?.trading_symbol &&
      bnfLongOrderId?.putShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "user", "bnfFutLong"),
        {
          tgtPoints: parseInt(tgtPoints),
        },
        { merge: true }
      );
    } else if (
      bnfShortOrderId?.callLong?.trading_symbol &&
      bnfShortOrderId?.callShort?.trading_symbol
    ) {
      await setDoc(
        doc(db, "user", "bnfFutShort"),
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
      bnfLongOrderId?.putLong?.trading_symbol &&
      bnfLongOrderId?.putShort?.trading_symbol
    ) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFno?tradingsymbol=${bnfLongOrderId?.putLong?.trading_symbol}&transaction_type=SELL&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          console.log(response);
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "user", "bnfFutLong"), {
              putLong: deleteField(),
            });
          }
        });
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFno?tradingsymbol=${bnfLongOrderId?.putShort?.trading_symbol}&transaction_type=BUY&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "user", "bnfFutLong"), {
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
      bnfShortOrderId?.callLong?.trading_symbol &&
      bnfShortOrderId?.callShort?.trading_symbol
    ) {
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=SELL&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFno?tradingsymbol=${bnfShortOrderId?.callLong?.trading_symbol}&transaction_type=SELL&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          console.log(response);
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "user", "bnfFutShort"), {
              callLong: deleteField(),
            });
          }
        });
      await axios
        .get(
          // `/api/placeOrderFno?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`

          `/api/placeOrderFno?tradingsymbol=${bnfShortOrderId?.callShort?.trading_symbol}&transaction_type=BUY&quantity=${bnfQty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          if (response?.data?.order_id) {
            await updateDoc(doc(db, "user", "bnfFutShort"), {
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
    const bnfLongSLManager = () => {
      if (
        bnfLongOrderId?.putLong?.trading_symbol &&
        bnfLongOrderId?.putShort?.trading_symbol &&
        bnfLongOrderId?.slPoints &&
        bnfLongOrderId?.tgtPoints &&
        bnfLongOrderId?.entryPrice
      ) {
        let sl_level = bnfLongOrderId?.entryPrice - bnfLongOrderId?.slPoints;
        let tgt_level = bnfLongOrderId?.entryPrice + bnfLongOrderId?.tgtPoints;
        let mtm =
          bnfLongPutLtp -
          bnfShortOrderId?.putLong?.average_price +
          bnfShortOrderId?.putShort?.average_price -
          bnfShortPutLtp;

        if (bnfLtp >= tgt_level) {
          bnfLongExit();
          console.log("BankNifty Target Reached");
        }
        if (bnfLtp <= sl_level) {
          bnfLongExit();
          console.log("BankNifty Stoploss Reached");
        }
      }
    };
    bnfLongSLManager();
  }, [bnfLtp, bnfLongOrderId]);

  useEffect(() => {
    const bnfShortSLManager = () => {
      if (
        bnfShortOrderId?.callLong?.trading_symbol &&
        bnfShortOrderId?.callShort?.trading_symbol &&
        bnfShortOrderId?.slPoints &&
        bnfShortOrderId?.tgtPoints &&
        bnfShortOrderId?.entryPrice
      ) {
        let sl_level = bnfShortOrderId?.entryPrice + bnfShortOrderId?.slPoints;
        let tgt_level =
          bnfShortOrderId?.entryPrice - bnfShortOrderId?.tgtPoints;

        let mtm =
          bnfLongCallLtp -
          bnfShortOrderId?.callLong?.average_price +
          bnfShortOrderId?.callShort?.average_price -
          bnfShortCallLtp;

        if (mtm >= bnfShortOrderId?.tgtPoints) {
          bnfShortExit();
          console.log("Nifty Target Reached");
        }

        if (mtm <= bnfShortOrderId?.slPoints) {
          bnfShortExit();
          console.log("Nifty Stoploss Reached");
        }

        if (bnfLtp <= tgt_level) {
          bnfShortExit();
          console.log("Nifty Target Reached");
        }

        if (bnfLtp >= sl_level) {
          bnfShortExit();
          console.log("Nifty Stoploss Reached");
        }
      }
    };
    bnfShortSLManager();
  }, [bnfLtp, bnfShortOrderId]);

  const [nextCheck, setNextCheck] = useState();

  useEffect(() => {
    const monitorNiftyShortTrailing = () => {
      if (
        niftyShortOrderId?.callLong?.trading_symbol &&
        niftyShortOrderId?.callShort?.trading_symbol &&
        niftyShortOrderId?.entryPrice
      ) {
        if (
          (niftyLtp > nifty10SMA &&
            niftyLtp >= niftyShortOrderId?.entryPrice) ||
          niftyLtp > nifty20SMA
        ) {
          niftyShortExit();
          console.log("Exit Done");
        } else {
          console.log("SL not hit yet");
        }
      } else {
        console.log("No positions");
      }
    };
    const monitorNiftyLongTrailing = () => {
      if (
        niftyLongOrderId?.putLong?.trading_symbol &&
        niftyLongOrderId?.putShort?.trading_symbol &&
        niftyLongOrderId?.entryPrice
      ) {
        if (
          (niftyLtp < nifty10SMA && niftyLtp <= niftyLongOrderId?.entryPrice) ||
          niftyLtp < nifty20SMA
        ) {
          niftyLongExit();
          console.log("Exit Done");
        } else {
          console.log("SL not hit yet");
        }
      } else {
        console.log("No positions");
      }
    };

    const monitorBnfShortTrailing = () => {
      if (
        bnfShortOrderId?.callLong?.trading_symbol &&
        bnfShortOrderId?.callShort?.trading_symbol &&
        bnfShortOrderId?.entryPrice
      ) {
        if (
          (bnfLtp > bnf10SMA && bnfLtp >= bnfShortOrderId?.entryPrice) ||
          bnfLtp > bnf20SMA
        ) {
          bnfShortExit();
          console.log("Exit Done");
        } else {
          console.log("SL not hit yet");
        }
      } else {
        console.log("No positions");
      }
    };
    const monitorBnfLongTrailing = () => {
      if (
        bnfLongOrderId?.putLong?.trading_symbol &&
        bnfLongOrderId?.putShort?.trading_symbol &&
        bnfLongOrderId?.entryPrice
      ) {
        if (
          (bnfLtp < bnf10SMA && bnfLtp <= bnfLongOrderId?.entryPrice) ||
          bnfLtp < bnf20SMA
        ) {
          bnfLongExit();
          console.log("Exit Done");
        } else {
          console.log("SL not hit yet");
        }
      } else {
        console.log("No positions");
      }
    };

    monitorNiftyShortTrailing();
    monitorNiftyLongTrailing();
    monitorBnfShortTrailing();
    monitorBnfLongTrailing();
  }, [nextCheck]);

  socket?.on("checkSl", (data) => {
    setNextCheck(data);
  });

  useEffect(() => {
    // console.log(niftyCandles);
    // console.log(bnfCandles);
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

      {isSuccess === "ConnectionSuccessful" &&
        niftyFutData?.instrument_token &&
        bnfFutData?.instrument_token &&
        niftySpotData?.instrument_token &&
        bnfSpotData?.instrument_token && (
          <button
            className="m-auto left-0 right-0 w-40 top-16 absolute btn btn-primary text-white btn-lg"
            onClick={startStream}
          >
            Start Stream
          </button>
        )}
      <div className="text-center mt-3 text-xl">30 Mins Spread</div>
      <div className="flex justify-evenly w-full h-full ">
        <div className="nifty w-full h-full flex flex-col items-center justify-start p-2 ">
          <p>NIFTY</p>
          Selected Expiry: {expiries?.niftyExpiryDates[0]?.slice(0, 10)}
          <div className="strikeSelected w-full text-center">
            Strikes: {niftyShortCallSell?.expiry.slice(0, 10)}
          </div>
          <hr className="h-[1px] border-0 rounded-lg bg-primary w-2/5" />
          <div className="w-full text-center mt-3">Long Strikes</div>
          <div className="strikes flex">
            <div className="call mx-2">
              PE Sell: {niftyLongPutSell?.strike}
              {niftyLongPutSell?.instrument_type} <br />
              LTP:
              {niftyShortPutLtp}
            </div>
            <div className="put mx-2">
              PE Buy: {niftyLongPutBuy?.strike}
              {niftyLongPutBuy?.instrument_type} <br />
              LTP: {niftyLongPutLtp}
            </div>
          </div>
          <hr className="h-[1px] border-0 rounded-lg bg-primary w-2/5" />
          <div className="w-full text-center mt-3">Short Strikes</div>
          <div className="strikes flex">
            <div className="call mx-2">
              CE Sell: {niftyShortCallSell?.strike}
              {niftyShortCallSell?.instrument_type}
              <br />
              LTP:
              {niftyShortCallLtp}
            </div>
            <div className="put mx-2">
              CE Buy: {niftyShortCallBuy?.strike}
              {niftyShortCallBuy?.instrument_type}
              <br />
              LTP:
              {niftyLongCallLtp}
            </div>
          </div>
          <hr className="h-[1px] border-0 rounded-lg bg-primary w-2/5" />
          <div className="prices w-full flex justify-evenly mt-3">
            <div>Spot: {niftyLtp}</div>
            <div>Fut: {niftyFutLtp}</div>
          </div>
          <div className="prices w-full flex justify-evenly mt-3">
            <div>10 SMA: {nifty10SMA}</div>
            <div>20 SMA: {nifty20SMA}</div>
          </div>
          <div className="entryBtns flex justify-evenly w-full mt-5">
            <button
              className="btn btn-md w-32 btn-primary text-white"
              onClick={niftyLong}
            >
              Long Entry
            </button>
            <button
              className="btn btn-md w-32 btn-primary text-white"
              onClick={niftyShort}
            >
              Short Entry
            </button>
          </div>
          <div className="exitBtns  flex justify-evenly w-full mt-10">
            <button
              className="btn btn-md w-32 btn-primary text-white"
              onClick={niftyLongExit}
            >
              Long Exit
            </button>
            <button
              className="btn btn-md w-32 btn-primary text-white"
              onClick={niftyShortExit}
            >
              Short Exit
            </button>
          </div>
          <button
            className="btn btn-primary text-white w-3/5 mt-4"
            onClick={updateOrderBookNifty}
          >
            Refresh Order Book
          </button>
          <div className="sltg mt-3 flex justify-between w-3/5">
            <div className="setSl">
              <input
                type="number"
                id="niftySl"
                className="input input-bordered input-md w-28"
              />
              <button
                className="btn btn-primary mx-1"
                onClick={() => {
                  let sl = document.getElementById("niftySl").value;
                  niftySetSL(sl);
                }}
              >
                SL
              </button>
            </div>
            <div className="setTgt ">
              <input
                type="number"
                id="niftyTgt"
                className="input input-bordered input-md w-28"
              />
              <button
                className="btn btn-primary mx-1"
                onClick={() => {
                  let tgt = document.getElementById("niftyTgt").value;
                  niftySetTG(tgt);
                }}
              >
                TGT
              </button>
            </div>
          </div>
          <span className="mt-3">Open Position</span>
          <hr className="h-[1px] border-0 rounded-lg bg-primary w-2/5" />
          <div className="openPositions m-2 w-3/5 ">
            <br />
            Long : {niftyShortOrderId?.callLong?.trading_symbol}
            {niftyLongOrderId?.putLong?.trading_symbol}
            <br />
            Short : {niftyShortOrderId?.callShort?.trading_symbol}
            {niftyLongOrderId?.putShort?.trading_symbol}
            <br /> Pnl:{" "}
            <span>
              {(niftyLongPutLtp -
                niftyLongOrderId?.putLong?.average_price +
                niftyLongOrderId?.putShort?.average_price -
                niftyShortPutLtp) *
                niftyQty}
            </span>
            <span>
              {(niftyLongCallLtp -
                niftyShortOrderId?.callLong?.average_price +
                niftyShortOrderId?.callShort?.average_price -
                niftyShortCallLtp) *
                niftyQty}
            </span>
          </div>
        </div>
        <div className="nifty w-full h-full flex flex-col items-center justify-start p-2 ">
          <p>BANK NIFTY</p>
          Selected Expiry: {expiries?.bnfExpiryDates[0]?.slice(0, 10)}
          <div className="strikeSelected w-full text-center">
            Strikes: {bnfShortCallSell?.expiry.slice(0, 10)}
          </div>
          <hr className="h-[1px] border-0 rounded-lg bg-primary w-2/5" />
          <div className="w-full text-center mt-3">Long Strikes</div>
          <div className="strikes flex">
            <div className="call mx-2">
              PE Sell: {bnfLongPutSell?.strike}
              {bnfLongPutSell?.instrument_type} <br />
              LTP:
              {bnfShortPutLtp}
            </div>
            <div className="put mx-2">
              PE Buy: {bnfLongPutBuy?.strike}
              {bnfLongPutBuy?.instrument_type} <br />
              LTP: {bnfLongPutLtp}
            </div>
          </div>
          <hr className="h-[1px] border-0 rounded-lg bg-primary w-2/5" />
          <div className="w-full text-center mt-3">Short Strikes</div>
          <div className="strikes flex">
            <div className="call mx-2">
              CE Sell: {bnfShortCallSell?.strike}
              {bnfShortCallSell?.instrument_type}
              <br />
              LTP:
              {bnfShortCallLtp}
            </div>
            <div className="put mx-2">
              CE Buy: {bnfShortCallBuy?.strike}
              {bnfShortCallBuy?.instrument_type}
              <br />
              LTP:
              {bnfLongCallLtp}
            </div>
          </div>
          <hr className="h-[1px] border-0 rounded-lg bg-primary w-2/5" />
          <div className="prices w-full flex justify-evenly mt-3">
            <div>Spot: {bnfLtp}</div>
            <div>Fut: {bnfFutLtp}</div>
          </div>
          <div className="prices w-full flex justify-evenly mt-3">
            <div>10 SMA: {bnf10SMA}</div>
            <div>20 SMA: {bnf20SMA}</div>
          </div>
          <div className="entryBtns flex justify-evenly w-full mt-5">
            <button
              className="btn btn-md w-32 btn-primary text-white"
              onClick={bnfLong}
            >
              Long Entry
            </button>
            <button
              className="btn btn-md w-32 btn-primary text-white"
              onClick={bnfShort}
            >
              Short Entry
            </button>
          </div>
          <div className="exitBtns  flex justify-evenly w-full mt-10">
            <button
              className="btn btn-md w-32 btn-primary text-white"
              onClick={bnfLongExit}
            >
              Long Exit
            </button>
            <button
              className="btn btn-md w-32 btn-primary text-white"
              onClick={bnfShortExit}
            >
              Short Exit
            </button>
          </div>
          <button
            className="btn btn-primary text-white w-3/5 mt-4"
            onClick={updateOrderBookBnf}
          >
            Refresh Order Book
          </button>
          <div className="sltg mt-3 flex justify-between w-3/5">
            <div className="setSl">
              <input
                type="number"
                id="bnfSl"
                className="input input-bordered input-md w-28"
              />
              <button
                className="btn btn-primary mx-1"
                onClick={() => {
                  let sl = document.getElementById("bnfSl").value;
                  bnfSetSL(sl);
                }}
              >
                SL
              </button>
            </div>
            <div className="setTgt ">
              <input
                type="number"
                id="bnfTgt"
                className="input input-bordered input-md w-28"
              />
              <button
                className="btn btn-primary mx-1"
                onClick={() => {
                  let tgt = document.getElementById("bnfTgt").value;
                  bnfSetTG(tgt);
                }}
              >
                TGT
              </button>
            </div>
          </div>
          <span className="mt-3">Open Position</span>
          <hr className="h-[1px] border-0 rounded-lg bg-primary w-2/5" />
          <div className="openPositions m-2 w-3/5 ">
            <br />
            Long : {bnfShortOrderId?.callLong?.trading_symbol}
            {bnfLongOrderId?.putLong?.trading_symbol}
            <br />
            Short : {bnfShortOrderId?.callShort?.trading_symbol}
            {bnfLongOrderId?.putShort?.trading_symbol}
            <br /> Pnl:{" "}
            <span>
              {(bnfLongPutLtp -
                bnfLongOrderId?.putLong?.average_price +
                bnfLongOrderId?.putShort?.average_price -
                bnfShortPutLtp) *
                bnfQty}
            </span>
            <span>
              {(bnfLongCallLtp -
                bnfShortOrderId?.callLong?.average_price +
                bnfShortOrderId?.callShort?.average_price -
                bnfShortCallLtp) *
                bnfQty}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default FutTrading;
