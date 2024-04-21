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
    NIFTY: 500,
    BANKNIFTY: 240,
    FINNIFTY: 480,
  });

  const [roundedLtp, setRoundedLtp] = useState();

  const [optionChainPut, setOptionChainPut] = useState();
  const [optionChainCall, setOptionChainCall] = useState();

  const [manualPutSelect, setManualPutSelect] = useState();
  const [manualCallSelect, setManualCallSelect] = useState();

  const [selectedPutLtp, setSelectedPutLtp] = useState();
  const [selectedCallLtp, setSelectedCallLtp] = useState();

  const [openPositions, setOpenPositions] = useState();
  const [allExecPositions, setAllExecPositions] = useState();

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

  const [closedMTM, setClosedMTM] = useState();

  const [rollOnSL, setRollOnSL] = useState(true);

  const [selectedStrategy, setSelectedStrategy] = useState();
  const [selectedStrategyQty, setSelectedStrategyQty] = useState(
    indexQuantity?.[currentIndex]
  );

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
    socket?.emit("defaultTokens", [niftySpotData?.instrument_token]);
  }, [niftySpotData]);
  useEffect(() => {
    socket?.emit("defaultTokens", [bnfSpotData?.instrument_token]);
  }, [bnfSpotData]);
  useEffect(() => {
    socket?.emit("defaultTokens", [fnfSpotData?.instrument_token]);
  }, [fnfSpotData]);

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

  const sendOptionChainTokensNifty = async () => {
    const niftyChainFilterPut = niftyOptChainData?.niftyChain?.filter(
      (data) => {
        return (
          data.instrument_type === "PE" &&
          data.expiry === expiries?.niftyExpiryDates?.[0]
        );
      }
    );
    const niftyChainFilterCall = niftyOptChainData?.niftyChain?.filter(
      (data) => {
        return (
          data.instrument_type === "CE" &&
          data.expiry === expiries?.niftyExpiryDates?.[0]
        );
      }
    );

    if (niftyChainFilterCall?.length > 0 && niftyChainFilterPut?.length > 0) {
      let tokenArray = [];
      let callTokens = niftyChainFilterCall?.map((data) => {
        let token = data.instrument_token;
        return token;
      });
      let putTokens = niftyChainFilterPut?.map((data) => {
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
  const sendOptionChainTokensBnf = async () => {
    const bnfChainFilterPut = bnfOptChainData?.bnfChain?.filter((data) => {
      return (
        data.instrument_type === "PE" &&
        data.expiry === expiries?.bnfExpiryDates?.[0]
      );
    });
    const bnfChainFilterCall = bnfOptChainData?.bnfChain?.filter((data) => {
      return (
        data.instrument_type === "CE" &&
        data.expiry === expiries?.bnfExpiryDates?.[0]
      );
    });

    if (bnfChainFilterCall?.length > 0 && bnfChainFilterPut?.length > 0) {
      let tokenArray = [];
      let callTokens = bnfChainFilterCall?.map((data) => {
        let token = data.instrument_token;
        return token;
      });
      let putTokens = bnfChainFilterPut?.map((data) => {
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
  const sendOptionChainTokensFnf = async () => {
    const fnfChainFilterPut = fnfOptChainData?.fnfChain?.filter((data) => {
      return (
        data.instrument_type === "PE" &&
        data.expiry === expiries?.fnfExpiryDates?.[0]
      );
    });
    const fnfChainFilterCall = fnfOptChainData?.fnfChain?.filter((data) => {
      return (
        data.instrument_type === "CE" &&
        data.expiry === expiries?.fnfExpiryDates?.[0]
      );
    });

    if (fnfChainFilterCall?.length > 0 && fnfChainFilterPut?.length > 0) {
      let tokenArray = [];
      let callTokens = fnfChainFilterCall?.map((data) => {
        let token = data.instrument_token;
        return token;
      });
      let putTokens = fnfChainFilterPut?.map((data) => {
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
  useEffect(() => {
    sendOptionChainTokensNifty();
  }, [niftyOptChainData]);
  useEffect(() => {
    sendOptionChainTokensBnf();
  }, [bnfOptChainData]);
  useEffect(() => {
    sendOptionChainTokensFnf();
  }, [fnfOptChainData]);

  useEffect(() => {
    // console.time("selectedTick");
    const selectedPutTicks = tickerData?.filter((data) => {
      return (
        data?.instrument_token === parseInt(manualPutSelect?.instrument_token)
      );
    });
    // console.timeEnd("selectedTick", selectedPutTicks);

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
        }
      );
      const unsubALLEXEC = onSnapshot(
        doc(db, "strangleExpiry", `${currentIndex}ALLEXEC`),
        (doc) => {
          setAllExecPositions(doc.data());
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
  }, [openPositions, currentIndex]);

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
  }, [currentIndex]);

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
          let calcSL;
          let calcTGT;
          if (putShortId?.[0]?.average_price) {
            price = putShortId?.[0].average_price;
            calcSL = putShortId?.[0]?.average_price * 1.5;
            calcTGT = putShortId?.[0]?.average_price * 0.5;
          } else {
            price = "";
            calcSL = "";
            calcTGT = "";
          }

          let putCount;
          let legKey;
          if (allExecPositions?.putLegCount) {
            putCount = allExecPositions?.putLegCount + 1;
            legKey = "putLeg_" + (allExecPositions?.putLegCount + 1);
          } else {
            putCount = 1;
            legKey = "putLeg_" + 1;
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
                slPoints: calcSL,
                tgtPoints: calcTGT,
                quantity: qty,
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

          await setDoc(
            doc(db, "strangleExpiry", `${currentIndex}ALLEXEC`),
            {
              putLegCount: putCount,
              [legKey]: {
                putEntry: {
                  order_id: orderId,
                  average_price: price,
                  instrument_token: parseInt(putInfo?.instrument_token),
                  tradingsymbol: putInfo?.tradingsymbol,
                  strike: putInfo?.strike,
                  quantity: qty,
                },
              },
            },
            { merge: true }
          );
        });
      });
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

            let legKey;
            if (allExecPositions?.putLegCount) {
              legKey = "putLeg_" + allExecPositions?.putLegCount;
            } else {
              legKey = "putLeg_" + 1;
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

            await setDoc(
              doc(db, "strangleExpiry", `${currentIndex}ALLEXEC`),
              {
                [legKey]: {
                  putExit: {
                    order_id: orderId,
                    average_price: price,
                    instrument_token: parseInt(putInfo?.instrument_token),
                    tradingsymbol: putInfo?.tradingsymbol,
                    strike: putInfo?.strike,
                    quantity: qty,
                  },
                },
              },
              { merge: true }
            );
          });
        });
    }
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
          let calcSL;
          let calcTGT;
          if (callShortId?.[0]?.average_price) {
            price = callShortId?.[0].average_price;
            calcSL = callShortId?.[0]?.average_price * 1.5;
            calcTGT = callShortId?.[0]?.average_price * 0.5;
          } else {
            price = "";
            calcSL = "";
            calcTGT = "";
          }

          let callCount;
          let legKey;
          if (allExecPositions?.callLegCount) {
            callCount = allExecPositions?.callLegCount + 1;
            legKey = "callLeg_" + (allExecPositions?.callLegCount + 1);
          } else {
            callCount = 1;
            legKey = "callLeg_" + 1;
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
                slPoints: calcSL,
                tgtPoints: calcTGT,
                quantity: qty,
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

          await setDoc(
            doc(db, "strangleExpiry", `${currentIndex}ALLEXEC`),
            {
              callLegCount: callCount,
              [legKey]: {
                callEntry: {
                  order_id: orderId,
                  average_price: price,
                  instrument_token: parseInt(callInfo?.instrument_token),
                  tradingsymbol: callInfo?.tradingsymbol,
                  strike: callInfo?.strike,
                  quantity: qty,
                },
              },
            },
            { merge: true }
          );
        });
      });
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

            let legKey;
            if (allExecPositions?.callLegCount) {
              legKey = "callLeg_" + allExecPositions?.callLegCount;
            } else {
              legKey = "callLeg_" + 1;
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

            await setDoc(
              doc(db, "strangleExpiry", `${currentIndex}ALLEXEC`),
              {
                [legKey]: {
                  callExit: {
                    order_id: orderId,
                    average_price: price,
                    instrument_token: parseInt(callInfo?.instrument_token),
                    tradingsymbol: callInfo?.tradingsymbol,
                    strike: callInfo?.strike,
                    quantity: qty,
                  },
                },
              },
              { merge: true }
            );
          });
        });
    }
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

  const updateOrderBookStrangle = async () => {
    await axios.get(`/api/orderInfo`).then(async (response) => {
      // console.log(response);
      let callShortId = response?.data?.filter((order) => {
        return (
          order.order_id === openPositions?.callShort?.order_id &&
          order.status === "COMPLETE"
        );
      });
      let putShortId = response?.data?.filter((order) => {
        return (
          order.order_id === openPositions?.putShort?.order_id &&
          order.status === "COMPLETE"
        );
      });

      if (callShortId.length > 0 && callShortId?.[0]?.average_price !== "") {
        let calcSL = callShortId?.[0]?.average_price * 1.5;
        let calcTGT = callShortId?.[0]?.average_price * 0.5;

        await setDoc(
          doc(db, "strangleExpiry", currentIndex),
          {
            callShort: {
              average_price: callShortId?.[0]?.average_price,
              slPoints: calcSL,
              tgtPoints: calcTGT,
            },
          },
          { merge: true }
        )
          .then(() => {
            toastHandler(`${currentIndex} order book updated`);
          })
          .catch((e) => {
            toastHandler(`${currentIndex} order Book Error: ${e}`);
          });
      }

      if (putShortId.length > 0 && putShortId?.[0]?.average_price !== "") {
        let calcSL = putShortId?.[0]?.average_price * 1.5;
        let calcTGT = putShortId?.[0]?.average_price * 0.5;
        await setDoc(
          doc(db, "strangleExpiry", currentIndex),
          {
            putShort: {
              average_price: putShortId?.[0]?.average_price,
              slPoints: calcSL,
              tgtPoints: calcTGT,
            },
          },
          { merge: true }
        )
          .then(() => {
            toastHandler(`${currentIndex} order book updated`);
          })
          .catch((e) => {
            toastHandler(`${currentIndex} order Book Error: ${e}`);
          });
      }

      if (allExecPositions?.callLegCount > 0) {
        for (let i = 1; i <= allExecPositions?.callLegCount; i++) {
          let legName = "callLeg_" + i;
          if (
            allExecPositions?.[legName]?.callEntry &&
            allExecPositions?.[legName]?.callEntry?.average_price == ""
          ) {
            let callEntryId = response?.data?.filter((order) => {
              return (
                order.order_id ===
                  allExecPositions?.[legName]?.callEntry?.order_id &&
                order.status === "COMPLETE"
              );
            });
            await setDoc(
              doc(db, "strangleExpiry", `${currentIndex}ALLEXEC`),
              {
                [legName]: {
                  callEntry: {
                    average_price: callEntryId?.[0]?.average_price,
                  },
                },
              },
              { merge: true }
            );
          }
          if (
            allExecPositions?.[legName]?.callExit &&
            allExecPositions?.[legName]?.callExit?.average_price == ""
          ) {
            let callExitId = response?.data?.filter((order) => {
              return (
                order.order_id ===
                  allExecPositions?.[legName]?.callExit?.order_id &&
                order.status === "COMPLETE"
              );
            });
            await setDoc(
              doc(db, "strangleExpiry", `${currentIndex}ALLEXEC`),
              {
                [legName]: {
                  callExit: {
                    average_price: callExitId?.[0]?.average_price,
                  },
                },
              },
              { merge: true }
            );
          }
        }
      }
      // PUT ALL EXEC ORDER BOOK
      if (allExecPositions?.putLegCount > 0) {
        for (let i = 1; i <= allExecPositions?.putLegCount; i++) {
          let legName = "putLeg_" + i;
          if (
            allExecPositions?.[legName]?.putEntry &&
            allExecPositions?.[legName]?.putEntry?.average_price == ""
          ) {
            let putEntryId = response?.data?.filter((order) => {
              return (
                order.order_id ===
                  allExecPositions?.[legName]?.putEntry?.order_id &&
                order.status === "COMPLETE"
              );
            });
            await setDoc(
              doc(db, "strangleExpiry", `${currentIndex}ALLEXEC`),
              {
                [legName]: {
                  putEntry: {
                    average_price: putEntryId?.[0]?.average_price,
                  },
                },
              },
              { merge: true }
            );
          }
          if (
            allExecPositions?.[legName]?.putExit &&
            allExecPositions?.[legName]?.putExit?.average_price == ""
          ) {
            let putExitId = response?.data?.filter((order) => {
              return (
                order.order_id ===
                  allExecPositions?.[legName]?.putExit?.order_id &&
                order.status === "COMPLETE"
              );
            });
            await setDoc(
              doc(db, "strangleExpiry", `${currentIndex}ALLEXEC`),
              {
                [legName]: {
                  putExit: {
                    average_price: putExitId?.[0]?.average_price,
                  },
                },
              },
              { merge: true }
            );
          }
        }
      }
    });

    await axios.get(`/api/orderInfo`).then(async (response) => {
      // console.log(response);
      let putLongId = response?.data?.filter((order) => {
        return (
          order.order_id === openPositions?.putLong?.order_id &&
          order.status === "COMPLETE"
        );
      });
      let callLongId = response?.data?.filter((order) => {
        return (
          order.order_id === openPositions?.callLong?.order_id &&
          order.status === "COMPLETE"
        );
      });
      if (
        putLongId.length > 0 &&
        callLongId.length > 0 &&
        putLongId?.[0]?.average_price !== "" &&
        callLongId?.[0]?.average_price !== ""
      ) {
        await setDoc(
          doc(db, "strangleExpiry", currentIndex),
          {
            putLong: {
              average_price: putLongId?.[0]?.average_price,
            },
            callLong: {
              average_price: callLongId?.[0]?.average_price,
            },
          },
          { merge: true }
        )
          .then(() => {
            toastHandler(`${currentIndex} order book updated`);
          })
          .catch((e) => {
            toastHandler(`${currentIndex} order Book Error: ${e}`);
          });
      }
    });
  };

  const deployIronFly = async () => {
    await putShort(optionChainPut?.[0], indexQuantity?.[currentIndex]);
    await callShort(optionChainCall?.[0], indexQuantity?.[currentIndex]);
    await putLong(optionChainPut?.[5], indexQuantity?.[currentIndex]);
    await callLong(optionChainCall?.[5], indexQuantity?.[currentIndex]);
  };
  const deploy1StepCondor = async () => {
    await putShort(optionChainPut?.[1], indexQuantity?.[currentIndex]);
    await callShort(optionChainCall?.[1], indexQuantity?.[currentIndex]);
    await putLong(optionChainPut?.[4], indexQuantity?.[currentIndex]);
    await callLong(optionChainCall?.[4], indexQuantity?.[currentIndex]);
  };
  const deploy2StepCondor = async () => {
    await putShort(optionChainPut?.[2], indexQuantity?.[currentIndex]);
    await callShort(optionChainCall?.[2], indexQuantity?.[currentIndex]);
    await putLong(optionChainPut?.[5], indexQuantity?.[currentIndex]);
    await callLong(optionChainCall?.[5], indexQuantity?.[currentIndex]);
  };
  const deploy3StepCondor = async () => {
    await putShort(optionChainPut?.[3], indexQuantity?.[currentIndex]);
    await callShort(optionChainCall?.[3], indexQuantity?.[currentIndex]);
    await putLong(optionChainPut?.[6], indexQuantity?.[currentIndex]);
    await callLong(optionChainCall?.[6], indexQuantity?.[currentIndex]);
  };

  useEffect(() => {
    if (
      openPositions?.putShort?.average_price === "" ||
      openPositions?.callShort?.average_price === "" ||
      openPositions?.putLong?.average_price === "" ||
      openPositions?.callLong?.average_price === ""
    ) {
      updateOrderBookStrangle();
    }
    if (allExecPositions?.putLegCount > 0) {
      for (let i = 1; i <= allExecPositions?.putLegCount; i++) {
        let legName = "putLeg_" + i;
        if (allExecPositions?.[legName]?.average_price == "") {
          updateOrderBookStrangle();
        }
      }
    }
    if (allExecPositions?.callLegCount > 0) {
      for (let i = 1; i <= allExecPositions?.callLegCount; i++) {
        let legName = "callLeg_" + i;
        if (allExecPositions?.[legName]?.average_price == "") {
          updateOrderBookStrangle();
        }
      }
    }
  }, [tickerData, currentIndex, openPositions, allExecPositions]);

  const setPutSL = async (slPoints) => {
    if (openPositions?.putShort) {
      await setDoc(
        doc(db, "strangleExpiry", currentIndex),
        {
          putShort: {
            slPoints: parseFloat(slPoints),
          },
        },
        { merge: true }
      );
      toastHandler(`${currentIndex} PUT SL points ${slPoints}`);
    }
  };
  const setPutTGT = async (tgtPoints) => {
    if (openPositions?.putShort) {
      await setDoc(
        doc(db, "strangleExpiry", currentIndex),
        {
          putShort: {
            tgtPoints: parseFloat(tgtPoints),
          },
        },
        { merge: true }
      );
      toastHandler(`${currentIndex} PUT TGT points ${tgtPoints}`);
    }
  };
  const setCallSL = async (slPoints) => {
    if (openPositions?.callShort) {
      await setDoc(
        doc(db, "strangleExpiry", currentIndex),
        {
          callShort: {
            slPoints: parseFloat(slPoints),
          },
        },
        { merge: true }
      );
      toastHandler(`${currentIndex} CALL SL points ${slPoints}`);
    }
  };
  const setCallTGT = async (tgtPoints) => {
    if (openPositions?.callShort) {
      await setDoc(
        doc(db, "strangleExpiry", currentIndex),
        {
          callShort: {
            tgtPoints: parseFloat(tgtPoints),
          },
        },
        { merge: true }
      );
      toastHandler(`${currentIndex} CALL TGT points ${tgtPoints}`);
    }
  };
  const setMTMSL = async (mtmSL) => {
    if (openPositions?.callShort || openPositions?.putShort) {
      await setDoc(
        doc(db, "strangleExpiry", currentIndex),
        {
          mtmSL: parseFloat(mtmSL),
        },
        { merge: true }
      );
      toastHandler(`${currentIndex} MTM SL points ${mtmSL}`);
    }
  };

  useEffect(() => {
    const calculateMTM = () => {
      let callMtmPoints = 0;
      let putMtmPoints = 0;
      if (allExecPositions?.callLegCount > 0) {
        for (let i = 1; i <= allExecPositions?.callLegCount; i++) {
          let legName = "callLeg_" + i;
          if (
            allExecPositions?.[legName]?.callExit &&
            allExecPositions?.[legName]?.callExit?.average_price !== "" &&
            allExecPositions?.[legName]?.callEntry?.average_price !== ""
          ) {
            callMtmPoints =
              callMtmPoints +
              allExecPositions?.[legName]?.callEntry?.average_price -
              allExecPositions?.[legName]?.callExit?.average_price;
          }
        }
      }
      if (allExecPositions?.putLegCount > 0) {
        for (let i = 1; i <= allExecPositions?.putLegCount; i++) {
          let legName = "putLeg_" + i;
          if (
            allExecPositions?.[legName]?.putExit &&
            allExecPositions?.[legName]?.putExit?.average_price !== "" &&
            allExecPositions?.[legName]?.putEntry?.average_price !== ""
          ) {
            putMtmPoints =
              putMtmPoints +
              allExecPositions?.[legName]?.putEntry?.average_price -
              allExecPositions?.[legName]?.putExit?.average_price;
          }
        }
      }

      setClosedMTM(callMtmPoints + putMtmPoints);
      console.log(
        (callMtmPoints + putMtmPoints) * indexQuantity?.[currentIndex]
      );
    };
    calculateMTM();
  }, [allExecPositions]);

  useEffect(() => {
    const monitorPutShortSLTGT = async () => {
      if (
        openPositions?.putShort &&
        openPositions?.putShort?.average_price &&
        openPositions?.putShort?.slPoints &&
        openPositions?.putShort?.tgtPoints
      ) {
        if (
          currentStrikePutLtp?.last_price >=
            openPositions?.putShort?.slPoints &&
          rollOnSL == true
        ) {
          await putShortExit(openPositions?.putShort, adjustmentQty);
          await putShort(oneStepRiskOffPE, adjustmentQty);
          toastHandler("PUT SL TAKEN ROLLED 1 STEP");
        } else if (
          currentStrikePutLtp?.last_price >=
            openPositions?.putShort?.slPoints &&
          rollOnSL == false
        ) {
          await putShortExit(openPositions?.putShort, adjustmentQty);
          toastHandler("PUT SL TAKEN FULL EXIT");
        }

        if (
          currentStrikePutLtp?.last_price <=
            openPositions?.putShort?.tgtPoints &&
          rollOnSL == true
        ) {
          await putShortExit(openPositions?.putShort, adjustmentQty);
          await putShort(oneStepRiskOnPE, adjustmentQty);
          toastHandler("PUT TGT TAKEN ROLLED 1 STEP");
        } else if (
          currentStrikePutLtp?.last_price <=
            openPositions?.putShort?.tgtPoints &&
          rollOnSL == false
        ) {
          await putShortExit(openPositions?.putShort, adjustmentQty);
          toastHandler("PUT TGT TAKEN FULL EXIT");
        }
      }
    };
    const monitorCallShortSLTGT = async () => {
      if (
        openPositions?.callShort &&
        openPositions?.callShort?.average_price &&
        openPositions?.callShort?.slPoints &&
        openPositions?.callShort?.tgtPoints
      ) {
        if (
          currentStrikeCallLtp?.last_price >=
            openPositions?.callShort?.slPoints &&
          rollOnSL == true
        ) {
          await callShortExit(openPositions?.callShort, adjustmentQty);
          await callShort(oneStepRiskOffCE, adjustmentQty);
          toastHandler("CALL SL TAKEN ROLLED 1 STEP");
        } else if (
          currentStrikeCallLtp?.last_price >=
            openPositions?.callShort?.slPoints &&
          rollOnSL == false
        ) {
          await callShortExit(openPositions?.callShort, adjustmentQty);
          toastHandler("CALL SL TAKEN FULL EXIT");
        }

        if (
          currentStrikeCallLtp?.last_price <=
            openPositions?.callShort?.tgtPoints &&
          rollOnSL == true
        ) {
          await callShortExit(openPositions?.callShort, adjustmentQty);
          await callShort(oneStepRiskOnCE, adjustmentQty);
          toastHandler("CALL TGT TAKEN ROLLED 1 STEP");
        } else if (
          currentStrikeCallLtp?.last_price <=
            openPositions?.callShort?.tgtPoints &&
          rollOnSL == false
        ) {
          await callShortExit(openPositions?.callShort, adjustmentQty);
          toastHandler("CALL TGT TAKEN FULL EXIT");
        }
      }
    };
    const monitorMTMSL = async () => {
      if (
        ((openPositions?.callShort &&
          openPositions?.callShort?.average_price !== "") ||
          (openPositions?.putShort &&
            openPositions?.putShort?.average_price !== "")) &&
        closedMTM &&
        openPositions?.mtmSL
      ) {
        let liveMTM =
          closedMTM +
          (openPositions?.callShort?.average_price -
            currentStrikeCallLtp?.last_price +
            openPositions?.putShort?.average_price -
            currentStrikePutLtp?.last_price) *
            indexQuantity?.[currentIndex];

        let mtmSL = openPositions?.mtmSL;
        if (liveMTM <= -mtmSL) {
          await putShortExit(openPositions?.putShort, adjustmentQty);
          await callShortExit(openPositions?.callShort, adjustmentQty);
          await setDoc(
            doc(db, "strangleExpiry", currentIndex),
            {
              mtmSL: deleteField(),
            },
            { merge: true }
          );
        }

        if (liveMTM >= mtmSL && openPositions?.mtmSLAdjusted < 1) {
          await setDoc(
            doc(db, "strangleExpiry", currentIndex),
            {
              mtmSL: parseFloat(mtmSL / 2),
              prevMtmSl: mtmSL,
              mtmSLAdjusted: 1,
            },
            { merge: true }
          );
          toastHandler(`${currentIndex} MTM SL points ${mtmSL}`);
        }
        if (
          liveMTM >= openPositions?.prevMtmSl * 1.5 &&
          openPositions?.mtmSLAdjusted == 1
        ) {
          await setDoc(
            doc(db, "strangleExpiry", currentIndex),
            {
              mtmSL: 1,
              mtmSLAdjusted: 2,
            },
            { merge: true }
          );
          toastHandler(`${currentIndex} MTM SL points ${mtmSL}`);
        }

        if (
          liveMTM >= openPositions?.prevMtmSl * 2 &&
          openPositions?.mtmSLAdjusted == 2
        ) {
          await setDoc(
            doc(db, "strangleExpiry", currentIndex),
            {
              mtmSL: openPositions?.prevMtmSl * -0.25,
              mtmSLAdjusted: 3,
            },
            { merge: true }
          );
          toastHandler(`${currentIndex} MTM SL points ${mtmSL}`);
        }
      }
    };

    monitorMTMSL();
    monitorPutShortSLTGT();
    monitorCallShortSLTGT();
  }, [tickerData, allExecPositions, openPositions]);

  const clearDayHist = async () => {
    await setDoc(doc(db, "strangleExpiry", `${currentIndex}ALLEXEC`), {}).catch(
      (err) => {
        console.log(err);
      }
    );
    toastHandler("Cleared Day History");
  };

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
    const slTgtRefresh = () => {
      if (
        openPositions?.putShort?.slPoints ||
        openPositions?.putShort?.tgtPoints
      ) {
        document.getElementById("putSl").value =
          openPositions?.putShort?.slPoints;
        document.getElementById("putTgt").value =
          openPositions?.putShort?.tgtPoints;
      } else {
        document.getElementById("putSl").value = "";
        document.getElementById("putTgt").value = "";
      }

      if (
        openPositions?.callShort?.slPoints ||
        openPositions?.callShort?.tgtPoints
      ) {
        document.getElementById("callSl").value =
          openPositions?.callShort?.slPoints;
        document.getElementById("callTgt").value =
          openPositions?.callShort?.tgtPoints;
      } else {
        document.getElementById("callSl").value = "";
        document.getElementById("callTgt").value = "";
      }

      if (openPositions?.mtmSL) {
        document.getElementById("mtmSl").value = openPositions?.mtmSL;
      } else {
        document.getElementById("mtmSl").value = "";
      }
    };

    slTgtRefresh();
  }, [openPositions]);

  // useEffect(() => {
  //   console.log(currentStrikePutLtp);
  // }, [currentStrikePutLtp]);

  return (
    <>
      <div className="w-full p-2 h-max">
        <div className="flex justify-between w-full h-full shadow-lg innerNav bg-neutral rounded-2xl">
          <div className="flex items-center justify-center w-full join">
            <select
              className="select select-md select-accent join-item"
              name="index"
              id="index"
              onChange={(e) => {
                setCurrentIndex(e.target.value);
              }}
            >
              <option selected disabled>
                Please Select Index
              </option>
              <option className="m-3" value="NIFTY">
                NIFTY
              </option>
              <option value="BANKNIFTY">BANKNIFTY</option>
              <option value="FINNIFTY">FINNIFTY</option>
            </select>
          </div>

          <div className="join w-">
            <select
              className="select-md select select-accent select-bordered join-item"
              onChange={(e) => {
                setSelectedStrategy(e.target.value);
              }}
            >
              <option disabled selected>
                Please Select strategy
              </option>
              <option value={"ironfly"}>ATM IRON FLY</option>
              <option value={"1stepcondor"}>1 STEP CONDOR</option>
              <option value={"2stepcondor"}>2 STEP CONDOR</option>
              <option value={"3stepcondor"}>3 STEP CONDOR</option>
            </select>

            <button
              className="btn join-item btn-accent"
              onClick={async () => {
                if (selectedStrategy === "ironfly") {
                  await deployIronFly();
                } else if (selectedStrategy === "1stepcondor") {
                  await deploy1StepCondor();
                } else if (selectedStrategy === "2stepcondor") {
                  await deploy2StepCondor();
                } else if (selectedStrategy === "3stepcondor") {
                  await deploy3StepCondor();
                }
              }}
            >
              Deploy
            </button>
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
          <div className="justify-center w-4/5 align-middle strikeSelection join">
            <div className="flex items-center justify-center w-full p-3 text-center join-item bg-neutral ">
              Select PUT
            </div>
            <select
              className="w-full select select-bordered join-item"
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
              {optionChainPut?.map((e, i) => {
                return (
                  <>
                    <option key={i} value={JSON.stringify(e)}>
                      {e.strike} {e.instrument_type}
                    </option>
                  </>
                );
              })}
            </select>
            <div className="flex items-center justify-center w-full p-3 text-center join-item bg-neutral">
              LTP: {selectedPutLtp}
            </div>
            <button
              className="text-white btn btn-secondary join-item"
              onClick={() => {
                putShort(manualPutSelect, indexQuantity?.[currentIndex]);
              }}
            >
              {" "}
              SELL PUT
            </button>
            <button
              className="text-white btn btn-neutral join-item"
              onClick={() => {
                putLong(manualPutSelect, indexQuantity?.[currentIndex]);
              }}
            >
              {" "}
              BUY CALL
            </button>
          </div>

          {/*  */}
          {/* CURRENT STRIKE */}
          {/*  */}
          <div className="justify-center w-4/5 strikeQty join">
            <div className="flex flex-col items-center justify-center w-3/5 h-12 mt-3 rounded-lg shadow-sm join-item currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                Current Strike: {openPositions?.putShort?.strike} PE
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP: {currentStrikePutLtp?.last_price}
              </span>
            </div>
            <button
              className="w-2/5 h-12 mt-3 btn btn-base toggleAdjustQty join-item"
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

          <span className="p-3 py-0 mt-1 font-light rounded-t bg-neutral join-item">
            Risk Off Strikes
          </span>
          <div className="flex justify-center w-4/5 riskOff join">
            <div className="flex flex-col items-center justify-center w-full rounded-lg shadow-sm join-item h-fit currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                One Step : {oneStepRiskOffPE?.strike} PE
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP: {oneStepAwayPutLtp}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center w-full rounded-lg shadow-sm join-item h-fit currentEnteredStrike bg-neutral">
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
          <div className="justify-center w-4/5 riskOn join">
            <div className="flex flex-col items-center justify-center w-full rounded-lg shadow-sm join-item h-fit currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                One Step : {oneStepRiskOnPE?.strike} PE
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP: {oneStepClosePutLtp}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center w-full rounded-lg shadow-sm join-item h-fit currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                Two Step : {twoStepRiskOnPE?.strike} PE
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP: {twoStepClosePutLtp}
              </span>
            </div>
          </div>

          {/*  */}
          {/* RISK OFF BUTTONS */}
          {/*  */}

          <div className="flex justify-between w-4/5 mt-3 enterPuts">
            <button
              className="w-1/3 text-white btn btn-secondary "
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
              className="w-1/3 text-white btn btn-secondary"
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

          <div className="flex justify-between w-4/5 mt-3 enterPuts">
            <button
              className="w-1/3 text-black btn btn-accent"
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
              className="w-1/3 text-black btn btn-accent"
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
          {/* SET SL TGT */}
          {/*  */}

          <div className="flex justify-between w-4/5 mt-3 SLTGT">
            <div className="w-1/3 sl join">
              <input
                className="w-full input input-bordered join-item"
                type="number"
                name="sl"
                id="putSl"
              />
              <button
                className="text-white btn join-item btn-secondary"
                onClick={() => {
                  let sl = document.getElementById("putSl").value;
                  setPutSL(sl);
                }}
              >
                Put SL
              </button>
            </div>
            <div className="w-1/3 tgt join">
              <input
                className="w-full input input-bordered join-item"
                type="number"
                name="tgt"
                id="putTgt"
              />
              <button
                className="text-white btn btn-secondary join-item"
                onClick={() => {
                  let tgt = document.getElementById("putTgt").value;
                  setPutTGT(tgt);
                }}
              >
                Put TGT
              </button>
            </div>
          </div>

          {/*  */}
          {/* EXIT ALL BUTTON */}
          {/*  */}

          <button
            className="w-4/5 mt-2 text-white btn btn-base"
            onClick={async () => {
              await putShortExit(openPositions?.putShort, adjustmentQty);
            }}
          >
            {" "}
            EXIT PUTS
          </button>
        </div>

        {/*  */}
        {/* CALL SIDE TERMINAL */}
        {/*  */}

        <div className="flex flex-col items-center justify-start w-full calls">
          <div className="justify-center w-4/5 align-middle strikeSelection join">
            <div className="flex items-center justify-center w-full p-3 text-center join-item bg-neutral ">
              Select CALL
            </div>
            <select
              className="w-full select select-bordered join-item"
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
            <div className="flex items-center justify-center w-full p-3 text-center join-item bg-neutral ">
              LTP: {selectedCallLtp}
            </div>

            <button
              className="text-white btn btn-secondary join-item"
              onClick={() => {
                callShort(manualCallSelect, indexQuantity?.[currentIndex]);
              }}
            >
              {" "}
              SELL CALL
            </button>
            <button
              className="text-white btn btn-neutral join-item"
              onClick={() => {
                callLong(manualCallSelect, indexQuantity?.[currentIndex]);
              }}
            >
              {" "}
              BUY CALL
            </button>
          </div>

          {/*  */}
          {/* CURRENT STRIKE */}
          {/*  */}
          <div className="justify-center w-4/5 strikeQty join">
            <div className="flex flex-col items-center justify-center w-3/5 h-12 mt-3 rounded-lg shadow-sm join-item currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                Current Strike: {openPositions?.callShort?.strike} CE
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP: {currentStrikeCallLtp?.last_price}
              </span>
            </div>
            <button
              className="w-2/5 h-12 mt-3 btn btn-base toggleAdjustQty join-item"
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
          <div className="flex justify-center w-4/5 riskOff join">
            <div className="flex flex-col items-center justify-center w-full rounded-lg shadow-sm join-item h-fit currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                One Step : {oneStepRiskOffCE?.strike} CE{" "}
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP: {oneStepAwayCallLtp}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center w-full rounded-lg shadow-sm join-item h-fit currentEnteredStrike bg-neutral">
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
          <div className="justify-center w-4/5 riskOn join">
            <div className="flex flex-col items-center justify-center w-full rounded-lg shadow-sm join-item h-fit currentEnteredStrike bg-neutral">
              <span className="mt-1 text-lg">
                One Step : {oneStepRiskOnCE?.strike} CE{" "}
              </span>
              <span className="mb-1 text-sm font-thin">
                LTP: {oneStepCloseCallLtp}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center w-full rounded-lg shadow-sm join-item h-fit currentEnteredStrike bg-neutral">
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
          {/* #RISK OFF BUTTONS */}
          {/*  */}

          <div className="flex justify-between w-4/5 mt-3 enterPuts">
            <button
              className="w-1/3 text-white btn btn-secondary "
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
              className="w-1/3 text-white btn btn-secondary "
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

          <div className="flex justify-between w-4/5 mt-3 enterPuts">
            <button
              className="w-1/3 text-black btn btn-accent"
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
              className="w-1/3 text-black btn btn-accent"
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
          {/* SET SL TGT */}
          {/*  */}

          <div className="flex justify-between w-4/5 mt-3 SLTGT">
            <div className="w-1/3 sl join">
              <input
                className="w-full input input-bordered join-item"
                type="number"
                name="sl"
                id="callSl"
              />
              <button
                className="text-white btn join-item btn-secondary"
                onClick={() => {
                  let sl = document.getElementById("callSl").value;
                  setCallSL(sl);
                }}
              >
                Call SL
              </button>
            </div>
            <div className="w-1/3 tgt join">
              <input
                className="w-full input input-bordered join-item"
                type="number"
                name="tgt"
                id="callTgt"
              />
              <button
                className="text-white btn btn-secondary join-item"
                onClick={() => {
                  let tgt = document.getElementById("callTgt").value;
                  setCallTGT(tgt);
                }}
              >
                Call TGT
              </button>
            </div>
          </div>

          {/*  */}
          {/* EXIT ALL BUTTON */}
          {/*  */}

          <button
            className="w-4/5 mt-2 text-white btn btn-base"
            onClick={async () => {
              await callShortExit(openPositions?.callShort, adjustmentQty);
            }}
          >
            {" "}
            EXIT CALLS
          </button>
        </div>
      </div>

      {/*  */}
      {/* POSITIONS TABLE */}
      {/*  */}
      {openPositions?.callShort || openPositions?.putShort ? (
        <div className="flex justify-center w-full overflow-x-auto">
          <table className="table w-4/5">
            {/* head */}
            <thead>
              <tr>
                <th></th>
                <th>STRIKE</th>
                <th>AVERAGE</th>
                <th>LTP</th>
                <th>PNL</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              <tr>
                <th>CALL</th>
                <td>
                  {currentIndex} {openPositions?.callShort?.strike} CE
                </td>
                <td>{openPositions?.callShort?.average_price}</td>
                <td>{currentStrikeCallLtp?.last_price}</td>
                <td
                  className={
                    openPositions?.callShort?.average_price -
                      currentStrikeCallLtp?.last_price >=
                    0
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {(
                    (openPositions?.callShort?.average_price -
                      currentStrikeCallLtp?.last_price) *
                    indexQuantity?.[currentIndex]
                  ).toFixed(2)}
                </td>
              </tr>
              {/* row 2 */}
              <tr>
                <th>PUT</th>
                <td>
                  {currentIndex} {openPositions?.putShort?.strike} PE
                </td>
                <td>{openPositions?.putShort?.average_price}</td>
                <td>{currentStrikePutLtp?.last_price}</td>
                <td
                  className={
                    openPositions?.putShort?.average_price -
                      currentStrikePutLtp?.last_price >=
                    0
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {(
                    (openPositions?.putShort?.average_price -
                      currentStrikePutLtp?.last_price) *
                    indexQuantity?.[currentIndex]
                  ).toFixed(2)}
                </td>
              </tr>
              {/* row 3 */}
              <tr>
                <th>TOTAL</th>
                <td></td>
                <td></td>
                <td></td>
                <td
                  className={
                    openPositions?.callShort?.average_price -
                      currentStrikeCallLtp?.last_price +
                      openPositions?.putShort?.average_price -
                      currentStrikePutLtp?.last_price >=
                    0
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {closedMTM
                    ? (
                        closedMTM * indexQuantity?.[currentIndex] +
                        (openPositions?.callShort?.average_price -
                          currentStrikeCallLtp?.last_price +
                          openPositions?.putShort?.average_price -
                          currentStrikePutLtp?.last_price) *
                          indexQuantity?.[currentIndex]
                      ).toFixed(2)
                    : (
                        (openPositions?.callShort?.average_price -
                          currentStrikeCallLtp?.last_price +
                          openPositions?.putShort?.average_price -
                          currentStrikePutLtp?.last_price) *
                        indexQuantity?.[currentIndex]
                      ).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
      {/*  */}
      {/* SET MTM SL TSL*/}
      {/*  */}

      <div className="flex justify-between w-full px-3 mt-3 mb-5 SLTGT">
        <div className="flex justify-center w-1/3 sl join">
          <input
            className="w-44 input input-bordered join-item"
            type="number"
            name="mtmSl"
            id="mtmSl"
          />
          <button
            className="text-white btn btn-secondary join-item"
            onClick={() => {
              let mtmSLAmount = document.getElementById("mtmSl").value;
              setMTMSL(parseFloat(mtmSLAmount));
            }}
          >
            MTM SL
          </button>
        </div>
        <div className="options">
          <button
            className="btn"
            onClick={() => {
              rollOnSL ? setRollOnSL(false) : setRollOnSL(true);
            }}
          >
            On SL: {rollOnSL ? "Roll" : "Full Exit"}
          </button>
        </div>

        <div className="flex justify-center w-1/3 btnCont join">
          <button
            className=" btn join-item btn-accent"
            onClick={updateOrderBookStrangle}
          >
            Refresh Order Book
          </button>

          <button className="btn join-item btn-accent" onClick={clearDayHist}>
            Clear day history
          </button>
        </div>
      </div>
    </>
  );
}

export default Strangle;
