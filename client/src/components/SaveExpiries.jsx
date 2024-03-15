import { useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import { db } from "../utils/config";
import { doc, updateDoc } from "firebase/firestore";

function SaveExpiries() {
  const [instObject, setInstObject] = useState(null);

  const [filteredInstObject, setFilteredInstObject] = useState();
  const [expiryArray, setExpiryArray] = useState([]);

  const [bnfFilteredInstObject, setBnfFilteredInstObject] = useState();
  const [bnfExpiryArray, setBnfExpiryArray] = useState([]);

  const [niftyLtp, setNiftyLtp] = useState();
  const [bnfLtp, setBnfLtp] = useState();

  const [niftyChain, setNiftyChain] = useState();
  const [bnfChain, setBnfChain] = useState();

  const getInstForExp = async () => {
    await axios.get("/api/instruments").then((response) => {
      setInstObject(response.data);
    });
  };

  useEffect(() => {
    getInstForExp();
  }, []);

  // useEffect(() => {
  //   const filterFut = () => {
  //     if (instObject != null) {
  //       const niftyFut = instObject?.filter((data) => {
  //         return (
  //           data.exchange === "NFO" &&
  //           data.name === "NIFTY" &&
  //           data.segment === "NFO-FUT"
  //         );
  //       });
  //       const BnfFut = instObject?.filter((data) => {
  //         return (
  //           data.exchange === "NFO" &&
  //           data.name === "BANKNIFTY" &&
  //           data.segment === "NFO-FUT"
  //         );
  //       });

  //       niftyFut?.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
  //       BnfFut?.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

  //       setNiftyFut(niftyFut);
  //       setBnfFut(BnfFut);
  //     }
  //   };
  //   filterFut();
  // }, [instObject]);

  // useEffect(() => {
  //   const futToFirebase = async () => {
  //     if (niftyFut != null) {
  //       const futRef = doc(db, "user", "niftyFut");
  //       await updateDoc(futRef, {
  //         instrument_token: parseInt(niftyFut?.[0]?.instrument_token),
  //       })
  //         .then(() => {
  //           console.log("Futures Updated");
  //         })
  //         .catch((e) => {
  //           console.log("Error: ", e);
  //         });
  //     }
  //   };
  //   futToFirebase();
  // }, [niftyFut]);

  // useEffect(() => {
  //   const futToFirebase = async () => {
  //     if (bnfFut != null) {
  //       const futRef = doc(db, "user", "bnfFut");
  //       await updateDoc(futRef, {
  //         instrument_token: parseInt(bnfFut?.[0]?.instrument_token),
  //       })
  //         .then(() => {
  //           console.log("Futures Updated");
  //         })
  //         .catch((e) => {
  //           console.log("Error: ", e);
  //         });
  //     }
  //   };
  //   futToFirebase();
  // }, [bnfFut]);

  const filterInst = () => {
    const niftyOptions = instObject.filter((data) => {
      return (
        data.exchange === "NFO" &&
        data.name === "NIFTY" &&
        data.segment === "NFO-OPT"
      );
    });
    const BnfOptions = instObject.filter((data) => {
      return (
        data.exchange === "NFO" &&
        data.name === "BANKNIFTY" &&
        data.segment === "NFO-OPT"
      );
    });

    setFilteredInstObject(niftyOptions);
    setBnfFilteredInstObject(BnfOptions);
  };

  const saveExpiryArray = () => {
    let arrayInst = [];
    let bnfArrayInst = [];
    filteredInstObject.forEach((element) => {
      arrayInst.push(element.expiry);
    });
    bnfFilteredInstObject.forEach((element) => {
      bnfArrayInst.push(element.expiry);
    });
    let setOfDates = new Set(arrayInst);
    let arrayOfObjects = Array.from(setOfDates);
    let setOfDatesBnf = new Set(bnfArrayInst);
    let arrayOfObjectsBnf = Array.from(setOfDatesBnf);
    arrayOfObjects.sort((a, b) => new Date(a) - new Date(b));
    arrayOfObjectsBnf.sort((a, b) => new Date(a) - new Date(b));
    setExpiryArray(arrayOfObjects);
    setBnfExpiryArray(arrayOfObjectsBnf);
  };

  const expiriesToFirebase = async () => {
    const expiriesRef = doc(db, "user", "expiries");
    await updateDoc(expiriesRef, {
      niftyExpiryDates: expiryArray,
      bnfExpiryDates: bnfExpiryArray,
    })
      .then(() => {
        console.log("Expiries Updated");
      })
      .catch((e) => {
        console.log("Error: ", e);
      });
  };

  const saveLtp = async () => {
    await axios.get("/api/ltp/NSE:NIFTY 50").then((response) => {
      let ltp = response.data["NSE:NIFTY 50"].last_price;
      const rounded = Math.round(ltp / 50);
      const result = rounded * 50;
      setNiftyLtp(result);
    });
    await axios.get("/api/ltp/NSE:NIFTY BANK").then((response) => {
      let ltp = response.data["NSE:NIFTY BANK"].last_price;
      const rounded = Math.round(ltp / 100);
      const result = rounded * 100;
      setBnfLtp(result);
    });
  };

  const filterNiftyChain = () => {
    let upperRange = niftyLtp + 1000;
    let lowerRange = niftyLtp - 1000;
    const niftyChainFilter = filteredInstObject.filter((data) => {
      return data.strike >= lowerRange && data.strike <= upperRange;
    });
    setNiftyChain(niftyChainFilter);
  };

  const filterBnfChain = () => {
    let upperRange = bnfLtp + 1000;
    let lowerRange = bnfLtp - 1000;
    const bnfChainFilter = bnfFilteredInstObject.filter((data) => {
      return data.strike >= lowerRange && data.strike <= upperRange;
    });
    setBnfChain(bnfChainFilter);
  };

  const optChainToFirebase = async () => {
    const niftyChainRef = doc(db, "user", "niftyOptChain");
    const bnfChainRef = doc(db, "user", "bnfOptChain");

    await updateDoc(niftyChainRef, {
      niftyChain,
    })
      .then(() => {
        console.log("Option Chain Updated");
      })
      .catch((e) => {
        console.log("Error: ", e);
      });

    await updateDoc(bnfChainRef, {
      bnfChain,
    })
      .then(() => {
        console.log("Option Chain Updated");
      })
      .catch((e) => {
        console.log("Error: ", e);
      });
  };

  return (
    <>
      <div className="w-full h-max p-2">
        <div className="innerNav w-full h-full bg-neutral rounded-2xl shadow-lg">
          <div className="flex justify-between">
            <div className="join join-horizontal m-2">
              <button
                className="join-item btn btn-secondary rounded-md text-white"
                onClick={() => {
                  getInstForExp();
                }}
              >
                Fetch Data
              </button>
              {instObject ? (
                <button
                  className="join-item btn btn-secondary text-white"
                  onClick={() => {
                    filterInst();
                  }}
                >
                  Filter
                </button>
              ) : null}
              {filteredInstObject && bnfFilteredInstObject ? (
                <button
                  className="join-item btn btn-secondary text-white"
                  onClick={() => {
                    saveExpiryArray();
                  }}
                >
                  Sort Expiries
                </button>
              ) : null}
              {expiryArray.length != 0 && bnfExpiryArray.length != 0 ? (
                <button
                  className="join-item btn btn-secondary text-white"
                  onClick={() => {
                    expiriesToFirebase();
                  }}
                >
                  Save To firebase
                </button>
              ) : null}
            </div>
            {/*  */}
            <div className="head self-center text-xl">Trading Terminal</div>
            {/* Option Chain */}
            <div className="join join-horizontal m-2">
              <button
                className="join-item btn btn-secondary text-white"
                onClick={saveLtp}
              >
                Get Chain Range
              </button>
              {niftyLtp && bnfLtp ? (
                <button
                  className="join-item btn btn-secondary text-white"
                  onClick={() => {
                    filterNiftyChain();
                    filterBnfChain();
                  }}
                >
                  Create Option Chain
                </button>
              ) : null}
              {niftyChain && bnfChain ? (
                <button
                  className="join-item btn btn-secondary text-white"
                  onClick={() => {
                    optChainToFirebase();
                  }}
                >
                  Chain to DB
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SaveExpiries;
