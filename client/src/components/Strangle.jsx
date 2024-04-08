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

function Strangle() {
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

  const [currentIndex, setCurrentIndex] = useState();
  const [indexLtp, setIndexLtp] = useState();
  const [indexQuantity, setIndexQuantity] = useState({
    NIFTY: 50,
    BANKNIFTY: 15,
    FINNIFTY: 40,
  });

  const [roundedLtp, setRoundedLtp] = useState();

  const [optionChainPut, setOptionChainPut] = useState();
  const [optionChainCall, setOptionChainCall] = useState();

  const [manualPutSelect, setManualPutSelect] = useState();
  const [manualCallSelect, setManualCallSelect] = useState();

  const [selectedPutLtp, setSelectedPutLtp] = useState();
  const [selectedCallLtp, setSelectedCallLtp] = useState();

  const [openPositions, setOpenPositions] = useState();

  const [adjustmentQty, setAdjustmentQty] = useState(
    indexQuantity?.[currentIndex]
  );

  const [oneStepRiskOnPE, setOneStepRiskOnPE] = useState();
  const [twoStepRiskOnPE, setTwoStepRiskOnPE] = useState();

  const [oneStepRiskOnCE, setOneStepRiskOnCE] = useState();
  const [twoStepRiskOnCE, setTwoStepRiskOnCE] = useState();

  const [oneStepRiskOffPE, setOneStepRiskOffPE] = useState();
  const [twoStepRiskOffPE, setTwoStepRiskOffPE] = useState();

  const [oneStepRiskOffCE, setOneStepRiskOffCE] = useState();
  const [twoStepRiskOffCE, setTwoStepRiskOffCE] = useState();

  const [currentStrikePutLtp, setCurrentStrikePutLtp] = useState();
  const [currentStrikeCallLtp, setCurrentStrikeCallLtp] = useState();

  const [oneStepAwayPutLtp, setOneStepAwayPutLtp] = useState();
  const [twoStepAwayPutLtp, setTwoStepAwayPutLtp] = useState();

  const [oneStepAwayCallLtp, setOneStepAwayCallLtp] = useState();
  const [twoStepAwayCallLtp, setTwoStepAwayCallLtp] = useState();

  const [oneStepClosePutLtp, setOneStepClosePutLtp] = useState();
  const [twoStepClosePutLtp, setTwoStepClosePutLtp] = useState();

  const [oneStepCloseCallLtp, setOneStepCloseCallLtp] = useState();
  const [twoStepCloseCallLtp, setTwoStepCloseCallLtp] = useState();

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
    const indexLtpStream = () => {
      if (currentIndex === "NIFTY") {
        const currentLtp = tickerData?.filter((data) => {
          return data.instrument_token === niftySpotData?.instrument_token;
        });
        if (currentLtp?.length > 0) {
          setIndexLtp(currentLtp?.[0]?.last_price);
        }
      } else if (currentIndex === "BANKNIFTY") {
        const currentLtp = tickerData?.filter((data) => {
          return data.instrument_token === bnfSpotData?.instrument_token;
        });
        if (currentLtp?.length > 0) {
          setIndexLtp(currentLtp?.[0]?.last_price);
        }
      } else if (currentIndex === "FINNIFTY") {
        const currentLtp = tickerData?.filter((data) => {
          return data.instrument_token === fnfSpotData?.instrument_token;
        });
        if (currentLtp?.length > 0) {
          setIndexLtp(currentLtp?.[0]?.last_price);
        }
      }
    };
    indexLtpStream();
  }, [tickerData, currentIndex]);
  useEffect(() => {
    socket?.emit("defaultTokens", [
      niftySpotData?.instrument_token,
      bnfSpotData?.instrument_token,
      fnfSpotData?.instrument_token,
    ]);
  }, [currentIndex]);

  useEffect(() => {
    const round = () => {
      if (currentIndex === "NIFTY" || currentIndex === "FINNIFTY") {
        const rounded = Math.round(indexLtp / 50);
        const result = rounded * 50;
        setRoundedLtp(result);
      } else if (currentIndex === "BANKNIFTY") {
        const rounded = Math.round(indexLtp / 100);
        const result = rounded * 100;
        setRoundedLtp(result);
      }
    };
    round();
  }, [indexLtp, currentIndex]);

  useEffect(() => {
    const filterNiftyChain = () => {
      let upperRange = indexLtp + 700;
      let lowerRange = indexLtp - 700;
      const niftyChainFilterPut = niftyOptChainData?.niftyChain?.filter(
        (data) => {
          return (
            data.strike >= lowerRange &&
            data.strike <= roundedLtp &&
            data.instrument_type === "PE" &&
            data.expiry === expiries?.niftyExpiryDates?.[0]
          );
        }
      );
      let sortedStrikesPuts = niftyChainFilterPut?.sort(
        (a, b) => b.strike - a.strike
      );
      const niftyChainFilterCall = niftyOptChainData?.niftyChain?.filter(
        (data) => {
          return (
            data.strike <= upperRange &&
            data.strike >= roundedLtp &&
            data.instrument_type === "CE" &&
            data.expiry === expiries?.niftyExpiryDates?.[0]
          );
        }
      );

      let sortedStrikesCalls = niftyChainFilterCall?.sort(
        (a, b) => a.strike - b.strike
      );

      setOptionChainPut(sortedStrikesPuts);
      setOptionChainCall(sortedStrikesCalls);
    };
    const filterBnfChain = () => {
      let upperRange = indexLtp + 1400;
      let lowerRange = indexLtp - 1400;
      const bnfChainFilterPut = bnfOptChainData?.bnfChain?.filter((data) => {
        return (
          data.strike >= lowerRange &&
          data.strike <= roundedLtp &&
          data.instrument_type === "PE" &&
          data.expiry === expiries?.bnfExpiryDates?.[0]
        );
      });
      let sortedStrikesPuts = bnfChainFilterPut?.sort(
        (a, b) => b.strike - a.strike
      );
      const bnfChainFilterCall = bnfOptChainData?.bnfChain?.filter((data) => {
        return (
          data.strike <= upperRange &&
          data.strike >= roundedLtp &&
          data.instrument_type === "CE" &&
          data.expiry === expiries?.bnfExpiryDates?.[0]
        );
      });

      let sortedStrikesCalls = bnfChainFilterCall?.sort(
        (a, b) => a.strike - b.strike
      );

      setOptionChainPut(sortedStrikesPuts);
      setOptionChainCall(sortedStrikesCalls);
    };
    const filterFnfChain = () => {
      let upperRange = indexLtp + 700;
      let lowerRange = indexLtp - 700;
      const fnfChainFilterPut = fnfOptChainData?.fnfChain?.filter((data) => {
        return (
          data.strike >= lowerRange &&
          data.strike <= roundedLtp &&
          data.instrument_type === "PE" &&
          data.expiry === expiries?.fnfExpiryDates?.[0]
        );
      });
      let sortedStrikesPuts = fnfChainFilterPut?.sort(
        (a, b) => b.strike - a.strike
      );
      const fnfChainFilterCall = fnfOptChainData?.fnfChain?.filter((data) => {
        return (
          data.strike <= upperRange &&
          data.strike >= roundedLtp &&
          data.instrument_type === "CE" &&
          data.expiry === expiries?.fnfExpiryDates?.[0]
        );
      });

      let sortedStrikesCalls = fnfChainFilterCall?.sort(
        (a, b) => a.strike - b.strike
      );

      setOptionChainPut(sortedStrikesPuts);
      setOptionChainCall(sortedStrikesCalls);
    };

    if (currentIndex === "NIFTY") {
      filterNiftyChain();
    } else if (currentIndex === "BANKNIFTY") {
      filterBnfChain();
    } else if (currentIndex === "FINNIFTY") {
      filterFnfChain();
    }
  }, [roundedLtp, currentIndex]);

  useEffect(() => {
    const sendOptionChainTokens = () => {
      if (optionChainCall?.length > 0 && optionChainPut?.length > 0) {
        let tokenArray = [];
        let callTokens = optionChainCall?.map((data) => {
          let token = data.instrument_token;
          return token;
        });
        let putTokens = optionChainPut?.map((data) => {
          let token = data.instrument_token;
          return token;
        });

        callTokens?.forEach((token) => {
          tokenArray.push(parseInt(token));
        });
        putTokens?.forEach((token) => {
          tokenArray.push(parseInt(token));
        });

        if (tokenArray.length > 0) {
          socket?.emit("defaultTokens", tokenArray);
        }
      }
    };
    sendOptionChainTokens();
  }, [optionChainCall]);

  useEffect(() => {
    const selectedPutTicks = tickerData?.filter((data) => {
      return (
        data?.instrument_token === parseInt(manualPutSelect?.instrument_token)
      );
    });
    const selectedCallTicks = tickerData?.filter((data) => {
      return (
        data?.instrument_token === parseInt(manualCallSelect?.instrument_token)
      );
    });

    if (selectedPutTicks.length > 0) {
      setSelectedPutLtp(selectedPutTicks?.[0]?.last_price);
    }
    if (selectedCallTicks.length > 0) {
      setSelectedCallLtp(selectedCallTicks?.[0]?.last_price);
    }
  }, [
    tickerData,
    manualPutSelect,
    manualCallSelect,
    currentIndex,
    openPositions,
  ]);

  useEffect(() => {
    if (currentIndex) {
      const unsub = onSnapshot(
        doc(db, "strangleExpiry", currentIndex),
        (doc) => {
          setOpenPositions(doc.data());
          console.log(doc.data());
        }
      );
    }
  }, [currentIndex]);

  useEffect(() => {
    const setRiskOffStrikesPE = () => {
      if (openPositions?.putShort) {
        if (currentIndex === "BANKNIFTY") {
          let oneStepAwayPut = optionChainPut?.filter((data) => {
            return data.strike === openPositions?.putShort?.strike - 100;
          });
          let twoStepAwayPut = optionChainPut?.filter((data) => {
            return data.strike === openPositions?.putShort?.strike - 200;
          });
          setOneStepRiskOffPE(oneStepAwayPut?.[0]);
          setTwoStepRiskOffPE(twoStepAwayPut?.[0]);
        } else if (currentIndex === "NIFTY" || currentIndex === "FINNIFTY") {
          let oneStepAwayPut = optionChainPut?.filter((data) => {
            return data.strike === openPositions?.putShort?.strike - 50;
          });
          let twoStepAwayPut = optionChainPut?.filter((data) => {
            return data.strike === openPositions?.putShort?.strike - 100;
          });
          setOneStepRiskOffPE(oneStepAwayPut?.[0]);
          setTwoStepRiskOffPE(twoStepAwayPut?.[0]);
        }
      }
    };
    const setRiskOnStrikesPE = () => {
      if (openPositions?.putShort) {
        if (currentIndex === "BANKNIFTY") {
          let oneStepClosePut = optionChainPut?.filter((data) => {
            return data.strike === openPositions?.putShort?.strike + 100;
          });
          let twoStepClosePut = optionChainPut?.filter((data) => {
            return data.strike === openPositions?.putShort?.strike + 200;
          });
          setOneStepRiskOnPE(oneStepClosePut?.[0]);
          setTwoStepRiskOnPE(twoStepClosePut?.[0]);
        } else if (currentIndex === "NIFTY" || currentIndex === "FINNIFTY") {
          let oneStepClosePut = optionChainPut?.filter((data) => {
            return data.strike === openPositions?.putShort?.strike + 50;
          });
          let twoStepClosePut = optionChainPut?.filter((data) => {
            return data.strike === openPositions?.putShort?.strike + 100;
          });
          setOneStepRiskOnPE(oneStepClosePut?.[0]);
          setTwoStepRiskOnPE(twoStepClosePut?.[0]);
        }
      }
    };
    // CE
    // CE
    // CE
    const setRiskOffStrikesCE = () => {
      if (openPositions?.callShort) {
        if (currentIndex === "BANKNIFTY") {
          let oneStepAwayCall = optionChainCall?.filter((data) => {
            return data.strike === openPositions?.callShort?.strike + 100;
          });
          let twoStepAwayCall = optionChainCall?.filter((data) => {
            return data.strike === openPositions?.callShort?.strike + 200;
          });
          setOneStepRiskOffCE(oneStepAwayCall?.[0]);
          setTwoStepRiskOffCE(twoStepAwayCall?.[0]);
        } else if (currentIndex === "NIFTY" || currentIndex === "FINNIFTY") {
          let oneStepAwayCall = optionChainCall?.filter((data) => {
            return data.strike === openPositions?.callShort?.strike + 50;
          });
          let twoStepAwayCall = optionChainCall?.filter((data) => {
            return data.strike === openPositions?.callShort?.strike + 100;
          });
          setOneStepRiskOffCE(oneStepAwayCall?.[0]);
          setTwoStepRiskOffCE(twoStepAwayCall?.[0]);
        }
      }
    };
    const setRiskOnStrikesCE = () => {
      if (openPositions?.callShort) {
        if (currentIndex === "BANKNIFTY") {
          let oneStepCloseCall = optionChainCall?.filter((data) => {
            return data.strike === openPositions?.callShort?.strike - 100;
          });
          let twoStepCloseCall = optionChainCall?.filter((data) => {
            return data.strike === openPositions?.callShort?.strike - 200;
          });
          setOneStepRiskOnCE(oneStepCloseCall?.[0]);
          setTwoStepRiskOnCE(twoStepCloseCall?.[0]);
        } else if (currentIndex === "NIFTY" || currentIndex === "FINNIFTY") {
          let oneStepCloseCall = optionChainCall?.filter((data) => {
            return data.strike === openPositions?.callShort?.strike - 50;
          });
          let twoStepCloseCall = optionChainCall?.filter((data) => {
            return data.strike === openPositions?.callShort?.strike - 100;
          });
          setOneStepRiskOnCE(oneStepCloseCall?.[0]);
          setTwoStepRiskOnCE(twoStepCloseCall?.[0]);
        }
      }
    };
    setRiskOffStrikesPE();
    setRiskOnStrikesPE();
    setRiskOffStrikesCE();
    setRiskOnStrikesCE();
    // console.log(oneStepRiskOffCE);
  }, [openPositions, currentIndex, optionChainCall, optionChainPut]);

  useEffect(() => {
    const currentStrikePELtp = tickerData?.filter((data) => {
      return (
        data?.instrument_token ===
        parseInt(openPositions?.putShort?.instrument_token)
      );
    });
    const currentStrikeCELtp = tickerData?.filter((data) => {
      return (
        data?.instrument_token ===
        parseInt(openPositions?.callShort?.instrument_token)
      );
    });

    // Away Stikes Filter
    const oneStepAwayPutLtp = tickerData?.filter((data) => {
      return (
        data?.instrument_token === parseInt(oneStepRiskOffPE?.instrument_token)
      );
    });
    const twoStepAwayPutLtp = tickerData?.filter((data) => {
      return (
        data?.instrument_token === parseInt(twoStepRiskOffPE?.instrument_token)
      );
    });
    const oneStepAwayCallLtp = tickerData?.filter((data) => {
      return (
        data?.instrument_token === parseInt(oneStepRiskOffCE?.instrument_token)
      );
    });
    const twoStepAwayCallLtp = tickerData?.filter((data) => {
      return (
        data?.instrument_token === parseInt(twoStepRiskOffCE?.instrument_token)
      );
    });

    // Close strikes Filter
    const oneStepClosePutLtp = tickerData?.filter((data) => {
      return (
        data?.instrument_token === parseInt(oneStepRiskOnPE?.instrument_token)
      );
    });
    const twoStepClosePutLtp = tickerData?.filter((data) => {
      return (
        data?.instrument_token === parseInt(twoStepRiskOnPE?.instrument_token)
      );
    });
    const oneStepCloseCallLtp = tickerData?.filter((data) => {
      return (
        data?.instrument_token === parseInt(oneStepRiskOnCE?.instrument_token)
      );
    });
    const twoStepCloseCallLtp = tickerData?.filter((data) => {
      return (
        data?.instrument_token === parseInt(twoStepRiskOnCE?.instrument_token)
      );
    });

    if (currentStrikePELtp?.length > 0) {
      setCurrentStrikePutLtp(currentStrikePELtp?.[0]);
    }
    if (currentStrikeCELtp?.length > 0) {
      setCurrentStrikeCallLtp(currentStrikeCELtp?.[0]);
    }

    // Away Strikes Setters
    if (oneStepAwayPutLtp.length > 0) {
      setOneStepAwayPutLtp(oneStepAwayPutLtp?.[0]?.last_price);
    }
    if (twoStepAwayPutLtp.length > 0) {
      setTwoStepAwayPutLtp(twoStepAwayPutLtp?.[0]?.last_price);
    }
    if (oneStepAwayCallLtp.length > 0) {
      setOneStepAwayCallLtp(oneStepAwayCallLtp?.[0]?.last_price);
    }
    if (twoStepAwayCallLtp.length > 0) {
      setTwoStepAwayCallLtp(twoStepAwayCallLtp?.[0]?.last_price);
    }

    // Close Strikes setters
    if (oneStepClosePutLtp.length > 0) {
      setOneStepClosePutLtp(oneStepClosePutLtp?.[0]?.last_price);
    }
    if (twoStepClosePutLtp.length > 0) {
      setTwoStepClosePutLtp(twoStepClosePutLtp?.[0]?.last_price);
    }
    if (oneStepCloseCallLtp.length > 0) {
      setOneStepCloseCallLtp(oneStepCloseCallLtp?.[0]?.last_price);
    }
    if (twoStepCloseCallLtp.length > 0) {
      setTwoStepCloseCallLtp(twoStepCloseCallLtp?.[0]?.last_price);
    }
  }, [
    tickerData,
    currentIndex,
    optionChainCall,
    optionChainPut,
    openPositions,
  ]);

  useEffect(() => {
    setManualCallSelect(null);
    setManualPutSelect(null);
    setSelectedPutLtp(null);
    setSelectedCallLtp(null);
    setAdjustmentQty(indexQuantity?.[currentIndex]);
  }, [currentIndex, openPositions]);

  const putShort = async (putInfo, qty) => {
    await axios
      .get(
        // `/api/placeOrderStranglePut?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`
        `/api/placeOrderStranglePut?tradingsymbol=${putInfo?.tradingsymbol}&transaction_type=SELL&quantity=${qty}&product=MIS&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
        let orderId = response?.data?.order_id;
        if (orderId) {
          toastHandler(`PE placed OID: ${orderId}`);
        } else {
          toastHandler(`PE error ${response.data}`);
        }
        await axios.get(`/api/orderInfo`).then(async (res) => {
          let putShortId = res?.data?.filter((order) => {
            return order.order_id === orderId && order.status === "COMPLETE";
          });

          let price;
          if (putShortId?.[0]?.average_price) {
            price = putShortId?.[0].average_price;
          } else {
            price = "";
          }

          await setDoc(
            doc(db, "strangleExpiry", currentIndex),
            {
              putShort: {
                order_id: orderId,
                average_price: price,
                instrument_token: parseInt(putInfo?.instrument_token),
                tradingsymbol: putInfo?.tradingsymbol,
                strike: putInfo?.strike,
              },
            },
            { merge: true }
          )
            .then(() => {
              toastHandler(`${currentIndex} PUT SHORT order updated`);
            })
            .catch((e) => {
              toastHandler(`${currentIndex} error at firebase ${e}`);
            });
        });
      });
  };
  const putLong = async (putInfo, qty) => {
    if (!openPositions?.putLong) {
      await axios
        .get(
          // `/api/placeOrderStranglePut?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`
          `/api/placeOrderStranglePut?tradingsymbol=${putInfo?.tradingsymbol}&transaction_type=BUY&quantity=${qty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          console.log(response);
          let orderId = response?.data?.order_id;
          if (orderId) {
            toastHandler(`PE BUY placed OID: ${orderId}`);
          } else {
            toastHandler(`PE BUY error ${response.data}`);
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
              doc(db, "strangleExpiry", currentIndex),
              {
                putLong: {
                  order_id: orderId,
                  average_price: price,
                  instrument_token: parseInt(putInfo?.instrument_token),
                  tradingsymbol: putInfo?.tradingsymbol,
                },
              },
              { merge: true }
            )
              .then(() => {
                toastHandler(`${currentIndex} PUT LONG order updated`);
              })
              .catch((e) => {
                toastHandler(`${currentIndex} error at firebase ${e}`);
              });
          });
        });
    }
  };
  const putShortExit = async (putInfo, qty) => {
    if (openPositions?.putShort) {
      await axios
        .get(
          // `/api/placeOrderStranglePut?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`
          `/api/placeOrderStranglePut?tradingsymbol=${putInfo?.tradingsymbol}&transaction_type=BUY&quantity=${qty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          console.log(response);
          let orderId = response?.data?.order_id;
          if (orderId) {
            toastHandler(`PE BUY placed OID: ${orderId}`);
          } else {
            toastHandler(`PE BUY error ${response.data}`);
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
              doc(db, "strangleExpiry", currentIndex),
              {
                putShort: deleteField(),
              },
              { merge: true }
            )
              .then(() => {
                toastHandler(`${currentIndex} PUT LONG order updated`);
              })
              .catch((e) => {
                toastHandler(`${currentIndex} error at firebase ${e}`);
              });
          });
        });
    }
  };

  const callShort = async (callInfo, qty) => {
    await axios
      .get(
        // `/api/placeOrderStranglePut?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`
        `/api/placeOrderStrangleCall?tradingsymbol=${callInfo?.tradingsymbol}&transaction_type=SELL&quantity=${qty}&product=MIS&order_type=MARKET`
      )
      .then(async (response) => {
        console.log(response);
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
          if (callShortId?.[0]?.average_price) {
            price = callShortId?.[0].average_price;
          } else {
            price = "";
          }

          await setDoc(
            doc(db, "strangleExpiry", currentIndex),
            {
              callShort: {
                order_id: orderId,
                average_price: price,
                instrument_token: parseInt(callInfo?.instrument_token),
                tradingsymbol: callInfo?.tradingsymbol,
                strike: callInfo?.strike,
              },
            },
            { merge: true }
          )
            .then(() => {
              toastHandler(`${currentIndex} CALL SHORT order updated`);
            })
            .catch((e) => {
              toastHandler(`${currentIndex} error at firebase ${e}`);
            });
        });
      });
  };
  const callLong = async (callInfo, qty) => {
    if (!openPositions?.callLong) {
      await axios
        .get(
          // `/api/placeOrderStranglePut?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`
          `/api/placeOrderStrangleCall?tradingsymbol=${callInfo?.tradingsymbol}&transaction_type=BUY&quantity=${qty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          console.log(response);
          let orderId = response?.data?.order_id;
          if (orderId) {
            toastHandler(`CE placed OID: ${orderId}`);
          } else {
            toastHandler(`CE error ${response.data}`);
          }
          await axios.get(`/api/orderInfo`).then(async (res) => {
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
              doc(db, "strangleExpiry", currentIndex),
              {
                callLong: {
                  order_id: orderId,
                  average_price: price,
                  instrument_token: parseInt(callInfo?.instrument_token),
                  tradingsymbol: callInfo?.tradingsymbol,
                },
              },
              { merge: true }
            )
              .then(() => {
                toastHandler(`${currentIndex} CALL LONG order updated`);
              })
              .catch((e) => {
                toastHandler(`${currentIndex} error at firebase ${e}`);
              });
          });
        });
    }
  };
  const callShortExit = async (callInfo, qty) => {
    if (openPositions?.callShort) {
      await axios
        .get(
          // `/api/placeOrderStranglePut?tradingsymbol=ICICIBANK&transaction_type=BUY&quantity=1&product=MIS&order_type=MARKET`
          `/api/placeOrderStrangleCall?tradingsymbol=${callInfo?.tradingsymbol}&transaction_type=BUY&quantity=${qty}&product=MIS&order_type=MARKET`
        )
        .then(async (response) => {
          console.log(response);
          let orderId = response?.data?.order_id;
          if (orderId) {
            toastHandler(`CE placed OID: ${orderId}`);
          } else {
            toastHandler(`CE error ${response.data}`);
          }
          await axios.get(`/api/orderInfo`).then(async (res) => {
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
              doc(db, "strangleExpiry", currentIndex),
              {
                callShort: deleteField(),
              },
              { merge: true }
            )
              .then(() => {
                toastHandler(`${currentIndex} CALL LONG order updated`);
              })
              .catch((e) => {
                toastHandler(`${currentIndex} error at firebase ${e}`);
              });
          });
        });
    }
  };

  const setPutSL = () => {};
  const setPutTGT = () => {};
  const setCallSL = () => {};
  const setCallTGT = () => {};

  const toggleAdjustmentQty = () => {
    if (adjustmentQty === indexQuantity?.[currentIndex]) {
      if (currentIndex == "NIFTY") {
        setAdjustmentQty(
          Math.round(indexQuantity?.[currentIndex] / 2 / 50) * 50
        );
      } else if (currentIndex == "FINNIFTY") {
        setAdjustmentQty(
          Math.round(indexQuantity?.[currentIndex] / 2 / 40) * 40
        );
      } else if (currentIndex == "BANKNIFTY") {
        setAdjustmentQty(
          Math.round(indexQuantity?.[currentIndex] / 2 / 15) * 15
        );
      }
    } else {
      setAdjustmentQty(indexQuantity?.[currentIndex]);
    }
  };

  useEffect(() => {
    console.log(currentStrikePutLtp);
  }, [currentStrikePutLtp]);

  return (
    <>
      {/* {selectedPutLtp}
      {selectedCallLtp} */}
      {/* {roundedLtp} */}
      {/* {optionChainPut?.map((e) => {
        return (
          <>
            <h3>{e.strike}</h3>
            <br />
          </>
        );
      })}
      {optionChainCall?.map((e) => {
        return (
          <>
            <h3>{e.strike}</h3>
            <br />
          </>
        );
      })} */}
      <div className="w-full p-2 h-max">
        <div className="flex justify-between w-full h-full shadow-lg innerNav bg-neutral rounded-2xl">
          <div className="flex items-center justify-center w-full">
            <select
              className="select select-md select-accent"
              name="index"
              id="index"
              onChange={(e) => {
                setCurrentIndex(e.target.value);
              }}
            >
              <option value="">Please Select Index</option>
              <option className="m-3" value="NIFTY">
                NIFTY
              </option>
              <option value="BANKNIFTY">BANKNIFTY</option>
              <option value="FINNIFTY">FINNIFTY</option>
            </select>
          </div>
          <div className="flex items-center justify-center w-full selectionInfo">
            Index: {currentIndex} || Expiry:{" "}
            {optionChainCall?.[0]?.expiry?.slice(0, 10)}
          </div>
        </div>
      </div>

      {/*  */}
      {/* TERMINAL */}
      {/*  */}

      <div className="flex w-full terminal justify-evenly">
        {/*  */}
        {/* PUT SIDE TERMINAL */}
        {/*  */}
        <div className="flex flex-col items-center justify-start w-full puts">
          <div className="strikeSelection join">
            <div className="flex items-center justify-center p-3 text-center join-item bg-neutral w-fit">
              Select PUT
            </div>
            <select
              className="select select-bordered join-item"
              name="puts"
              id="putStrike"
              onChange={(e) => {
                if (e.target.value !== "") {
                  setManualPutSelect(JSON.parse(e.target.value));
                }
              }}
            >
              <option key={null} value="">
                Select Strike
              </option>
              {optionChainPut?.map((e) => {
                return (
                  <>
                    <option key={e.instrument_token} value={JSON.stringify(e)}>
                      {e.strike} {e.instrument_type}
                    </option>
                  </>
                );
              })}
            </select>
            <div className="flex items-center justify-center p-3 text-center join-item bg-neutral w-fit">
              LTP: {selectedPutLtp}
            </div>
            <button
              className="text-white btn btn-secondary join-item"
              onClick={() => {
                putShort(manualPutSelect, indexQuantity?.[currentIndex]);
              }}
            >
              {" "}
              SELL Selected Put
            </button>
            <button
              className="text-white btn btn-neutral join-item"
              onClick={() => {
                putLong(manualPutSelect, indexQuantity?.[currentIndex]);
              }}
            >
              {" "}
              BUY Selected Put
            </button>
          </div>

          {/*  */}
          {/* CURRENT STRIKE */}
          {/*  */}
          <div className="strikeQty join">
            <div className="flex flex-col items-center justify-center w-64 h-12 mt-3 rounded-lg shadow-sm join-item currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                Current Strike: {openPositions?.putShort?.strike} PE
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP: {currentStrikePutLtp?.last_price}
              </span>
            </div>
            <button
              className="h-12 mt-3 btn btn-accent toggleAdjustQty join-item"
              onClick={() => {
                toggleAdjustmentQty();
              }}
            >
              Adjustment QTY: {adjustmentQty}
            </button>
          </div>

          {/*  */}
          {/* RISK OFF STRIKES */}
          {/*  */}

          <span className="p-3 py-0 mt-1 font-light rounded-t bg-neutral">
            Risk Off Strikes
          </span>
          <div className="riskOff join">
            <div className="flex flex-col items-center justify-center w-64 rounded-lg shadow-sm join-item h-fit currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                One Step : {oneStepRiskOffPE?.strike} PE
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP: {oneStepAwayPutLtp}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center w-64 rounded-lg shadow-sm join-item h-fit currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                Two Step : {twoStepRiskOffPE?.strike} PE
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP: {twoStepAwayPutLtp}
              </span>
            </div>
          </div>

          {/*  */}
          {/* RISK ON STRIKES */}
          {/*  */}
          <span className="p-3 py-0 mt-1 font-light rounded-t bg-neutral">
            Risk On Strikes
          </span>
          <div className="riskOn join">
            <div className="flex flex-col items-center justify-center w-64 rounded-lg shadow-sm join-item h-fit currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                One Step : {oneStepRiskOnPE?.strike} PE
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP: {oneStepClosePutLtp}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center w-64 rounded-lg shadow-sm join-item h-fit currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                Two Step : {twoStepRiskOnPE?.strike} PE
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP: {twoStepClosePutLtp}
              </span>
            </div>
          </div>

          {/*  */}
          {/* ADJUSTMENT QTY */}
          {/*  */}

          {/* value={() => {
                return indexQuantity?.[currentIndex] / 2;
              }} */}
          {/*  */}
          {/* RISK OFF BUTTONS */}
          {/*  */}

          <div className="flex w-4/5 mt-3 enterPuts justify-evenly">
            <button
              className="text-white btn btn-secondary "
              onClick={async () => {
                if (openPositions?.putShort) {
                  await putShortExit(openPositions?.putShort, adjustmentQty);
                  await putShort(oneStepRiskOffPE, adjustmentQty);
                }
              }}
            >
              {" "}
              RISK OFF ONE STEP
            </button>
            <button
              className="text-white btn btn-secondary "
              onClick={async () => {
                if (openPositions?.putShort) {
                  await putShortExit(openPositions?.putShort, adjustmentQty);
                  await putShort(twoStepRiskOffPE, adjustmentQty);
                }
              }}
            >
              {" "}
              RISK OFF TWO STEPS
            </button>
          </div>

          {/*  */}
          {/* RISK ON BUTTONS */}
          {/*  */}

          <div className="flex w-4/5 mt-3 enterPuts justify-evenly">
            <button
              className="text-black btn btn-accent "
              onClick={async () => {
                if (openPositions?.putShort) {
                  await putShortExit(openPositions?.putShort, adjustmentQty);
                  await putShort(oneStepRiskOnPE, adjustmentQty);
                }
              }}
            >
              {" "}
              RISK ON ONE STEP
            </button>
            <button
              className="text-black btn btn-accent "
              onClick={async () => {
                if (openPositions?.putShort) {
                  await putShortExit(openPositions?.putShort, adjustmentQty);
                  await putShort(twoStepRiskOnPE, adjustmentQty);
                }
              }}
            >
              {" "}
              RISK ON TWO STEPS
            </button>
          </div>

          {/*  */}
          {/* EXIT ALL BUTTON */}
          {/*  */}

          <button
            className="mt-2 text-black btn btn-accent btn-wide"
            onClick={async () => {
              await putShortExit(openPositions?.putShort, adjustmentQty);
            }}
          >
            {" "}
            EXIT PUTS
          </button>

          {/*  */}
          {/* SET SL TGT */}
          {/*  */}

          <div className="flex w-4/5 px-3 mt-3 SLTGT justify-evenly">
            <div className="sl join">
              <input
                className="w-24 input input-bordered join-item"
                type="number"
                name="sl"
                id="putSl"
              />
              <button className="btn btn-neutral join-item">Put SL</button>
            </div>
            <div className="tgt join">
              <input
                className="w-24 input input-bordered join-item"
                type="number"
                name="tgt"
                id="putTgt"
              />
              <button className="btn btn-neutral join-item">Put TGT</button>
            </div>
          </div>
        </div>

        {/*  */}
        {/* CALL SIDE TERMINAL */}
        {/*  */}

        <div className="flex flex-col items-center justify-start w-full calls">
          <div className="strikeSelection join">
            <div className="flex items-center justify-center p-3 text-center join-item bg-neutral w-fit">
              Select CALL
            </div>
            <select
              className="select select-bordered join-item"
              name="call"
              id="callStrike"
              onChange={(e) => {
                if (e.target.value !== "") {
                  setManualCallSelect(JSON.parse(e.target.value));
                }
              }}
            >
              <option key={null} value="">
                Select Strike
              </option>

              {optionChainCall?.map((e) => {
                return (
                  <>
                    <option key={e.instrument_token} value={JSON.stringify(e)}>
                      {e.strike} {e.instrument_type}
                    </option>
                  </>
                );
              })}
            </select>
            <div className="flex items-center justify-center p-3 text-center join-item bg-neutral w-fit">
              LTP: {selectedCallLtp}
            </div>

            <button
              className="text-white btn btn-secondary join-item"
              onClick={() => {
                callShort(manualCallSelect, indexQuantity?.[currentIndex]);
              }}
            >
              {" "}
              SELL Selected Call
            </button>
            <button
              className="text-white btn btn-neutral join-item"
              onClick={() => {
                callLong(manualCallSelect, indexQuantity?.[currentIndex]);
              }}
            >
              {" "}
              BUY Selected Call
            </button>
          </div>

          {/*  */}
          {/* CURRENT STRIKE */}
          {/*  */}
          <div className="strikeQty join">
            <div className="flex flex-col items-center justify-center w-64 h-12 mt-3 rounded-lg shadow-sm join-item currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                Current Strike: {openPositions?.callShort?.strike} CE
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP: {currentStrikeCallLtp?.last_price}
              </span>
            </div>
            <button
              className="h-12 mt-3 btn btn-accent toggleAdjustQty join-item"
              onClick={() => {
                toggleAdjustmentQty();
              }}
            >
              Adjustment QTY: {adjustmentQty}
            </button>
          </div>

          {/*  */}
          {/* RISK OFF STRIKES */}
          {/*  */}

          <span className="p-3 py-0 mt-1 font-light rounded-t bg-neutral">
            Risk Off Strikes
          </span>
          <div className="riskOff join">
            <div className="flex flex-col items-center justify-center w-64 rounded-lg shadow-sm join-item h-fit currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                One Step : {oneStepRiskOffCE?.strike} CE{" "}
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP: {oneStepAwayCallLtp}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center w-64 rounded-lg shadow-sm join-item h-fit currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                Two Step : {twoStepRiskOffCE?.strike} CE{" "}
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP:
                {twoStepAwayCallLtp}
              </span>
            </div>
          </div>

          {/*  */}
          {/* RISK ON STRIKES */}
          {/*  */}
          <span className="p-3 py-0 mt-1 font-light rounded-t bg-neutral">
            Risk On Strikes
          </span>
          <div className="riskOn join">
            <div className="flex flex-col items-center justify-center w-64 rounded-lg shadow-sm join-item h-fit currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                One Step : {oneStepRiskOnCE?.strike} CE{" "}
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP: {oneStepCloseCallLtp}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center w-64 rounded-lg shadow-sm join-item h-fit currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                Two Step : {twoStepRiskOnCE?.strike} CE{" "}
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP:
                {twoStepCloseCallLtp}
              </span>
            </div>
          </div>

          {/*  */}
          {/* ADJUSTMENT QTY */}
          {/*  */}

          {/* value={() => {
                return indexQuantity?.[currentIndex] / 2;
              }} */}
          {/*  */}
          {/* RISK OFF BUTTONS */}
          {/*  */}

          <div className="flex w-4/5 mt-3 enterPuts justify-evenly">
            <button
              className="text-white btn btn-secondary "
              onClick={async () => {
                if (openPositions?.callShort) {
                  await callShortExit(openPositions?.callShort, adjustmentQty);
                  await callShort(oneStepRiskOffCE, adjustmentQty);
                }
              }}
            >
              {" "}
              RISK OFF ONE STEP
            </button>
            <button
              className="text-white btn btn-secondary "
              onClick={async () => {
                if (openPositions?.callShort) {
                  await callShortExit(openPositions?.callShort, adjustmentQty);
                  await callShort(twoStepRiskOffCE, adjustmentQty);
                }
              }}
            >
              {" "}
              RISK OFF TWO STEPS
            </button>
          </div>

          {/*  */}
          {/* RISK ON BUTTONS */}
          {/*  */}

          <div className="flex w-4/5 mt-3 enterPuts justify-evenly">
            <button
              className="text-black btn btn-accent "
              onClick={async () => {
                if (openPositions?.callShort) {
                  await callShortExit(openPositions?.callShort, adjustmentQty);
                  await callShort(oneStepRiskOnCE, adjustmentQty);
                }
              }}
            >
              {" "}
              RISK ON ONE STEP
            </button>
            <button
              className="text-black btn btn-accent "
              onClick={async () => {
                if (openPositions?.callShort) {
                  await callShortExit(openPositions?.callShort, adjustmentQty);
                  await callShort(twoStepRiskOnCE, adjustmentQty);
                }
              }}
            >
              {" "}
              RISK ON TWO STEPS
            </button>
          </div>

          {/*  */}
          {/* EXIT ALL BUTTON */}
          {/*  */}

          <button
            className="mt-2 text-black btn btn-accent btn-wide"
            onClick={async () => {
              await callShortExit(openPositions?.callShort, adjustmentQty);
            }}
          >
            {" "}
            EXIT PUTS
          </button>

          {/*  */}
          {/* SET SL TGT */}
          {/*  */}

          <div className="flex w-2/3 mt-3 SLTGT justify-evenly">
            <div className="sl join">
              <input
                className="w-24 input input-bordered join-item"
                type="number"
                name="sl"
                id="callSl"
              />
              <button className="btn btn-neutral join-item">Call SL</button>
            </div>
            <div className="tgt join">
              <input
                className="w-24 input input-bordered join-item"
                type="number"
                name="tgt"
                id="callTgt"
              />
              <button className="btn btn-neutral join-item">Call TGT</button>
            </div>
          </div>
        </div>
      </div>
      {/*  */}
      {/* SET MTM SL TSL*/}
      {/*  */}

      <div className="flex w-full px-3 mt-3 SLTGT justify-evenly">
        <div className="sl join">
          <input
            className="w-44 input input-bordered join-item"
            type="number"
            name="mtmSl"
            id="mtmSl"
          />
          <button className="btn btn-neutral join-item">MTM SL</button>
        </div>
        <div className="tgt join">
          <input
            className="w-44 input input-bordered join-item"
            type="number"
            name="mtmTsl"
            id="mtmTsl"
          />
          <button className="btn btn-neutral join-item">MTM TSL</button>
          <button className="btn btn-neutral join-item">Ratio: {1 / 2}</button>
        </div>
      </div>
    </>
  );
}

export default Strangle;
