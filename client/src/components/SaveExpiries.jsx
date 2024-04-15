import { useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import { db } from "../utils/config";
import { doc, updateDoc } from "firebase/firestore";

function SaveExpiries() {
  const [instObject, setInstObject] = useState(null);

  const [niftyFut, setNiftyFut] = useState();
  const [bnfFut, setBnfFut] = useState();
  const [fnfFut, setFnfFut] = useState();

  const [filteredInstObject, setFilteredInstObject] = useState();
  const [expiryArray, setExpiryArray] = useState([]);

  const [bnfFilteredInstObject, setBnfFilteredInstObject] = useState();
  const [bnfExpiryArray, setBnfExpiryArray] = useState([]);

  const [fnfFilteredInstObject, setFnfFilteredInstObject] = useState();
  const [fnfExpiryArray, setFnfExpiryArray] = useState([]);

  const [niftyLtp, setNiftyLtp] = useState();
  const [bnfLtp, setBnfLtp] = useState();
  const [fnfLtp, setFnfLtp] = useState();

  const [niftyChain, setNiftyChain] = useState();
  const [bnfChain, setBnfChain] = useState();
  const [fnfChain, setFnfChain] = useState();

  const getInstForExp = async () => {
    await axios.get("/api/instruments").then((response) => {
      setInstObject(response.data);
    });
  };

  useEffect(() => {
    getInstForExp();
  }, []);

  useEffect(() => {
    const filterFut = () => {
      if (instObject != null) {
        const niftyFutFitered = instObject?.filter((data) => {
          return (
            data.exchange === "NFO" &&
            data.name === "NIFTY" &&
            data.segment === "NFO-FUT"
          );
        });
        const bnfFutFiltered = instObject?.filter((data) => {
          return (
            data.exchange === "NFO" &&
            data.name === "BANKNIFTY" &&
            data.segment === "NFO-FUT"
          );
        });
        const fnfFutFiltered = instObject?.filter((data) => {
          return (
            data.exchange === "NFO" &&
            data.name === "FINNIFTY" &&
            data.segment === "NFO-FUT"
          );
        });

        niftyFutFitered?.sort(
          (a, b) => new Date(a.expiry) - new Date(b.expiry)
        );
        bnfFutFiltered?.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
        fnfFutFiltered?.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

        setNiftyFut(niftyFutFitered);
        setBnfFut(bnfFutFiltered);
        setFnfFut(fnfFutFiltered);
      }
    };
    filterFut();
  }, [instObject]);

  useEffect(() => {
    const futToFirebase = async () => {
      if (niftyFut != null) {
        const futRef = doc(db, "user", "niftyFut");
        await updateDoc(futRef, {
          instrument_token: parseInt(niftyFut?.[0]?.instrument_token),
        })
          .then(() => {
            console.log("Futures Updated");
          })
          .catch((e) => {
            console.log("Error: ", e);
          });
      }
    };
    futToFirebase();
  }, [niftyFut]);

  useEffect(() => {
    const futToFirebase = async () => {
      if (bnfFut != null) {
        const futRef = doc(db, "user", "bnfFut");
        await updateDoc(futRef, {
          instrument_token: parseInt(bnfFut?.[0]?.instrument_token),
        })
          .then(() => {
            console.log("Futures Updated");
          })
          .catch((e) => {
            console.log("Error: ", e);
          });
      }
    };
    futToFirebase();
  }, [bnfFut]);

  useEffect(() => {
    const futToFirebase = async () => {
      if (fnfFut != null) {
        const futRef = doc(db, "user", "fnfFut");
        await updateDoc(futRef, {
          instrument_token: parseInt(fnfFut?.[0]?.instrument_token),
        })
          .then(() => {
            console.log("Futures Updated");
          })
          .catch((e) => {
            console.log("Error: ", e);
          });
      }
    };
    futToFirebase();
  }, [fnfFut]);

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
    const FnfOptions = instObject.filter((data) => {
      return (
        data.exchange === "NFO" &&
        data.name === "FINNIFTY" &&
        data.segment === "NFO-OPT"
      );
    });

    setFilteredInstObject(niftyOptions);
    setBnfFilteredInstObject(BnfOptions);
    setFnfFilteredInstObject(FnfOptions);
  };

  const saveExpiryArray = () => {
    let arrayInst = [];
    let bnfArrayInst = [];
    let fnfArrayInst = [];

    filteredInstObject.forEach((element) => {
      arrayInst.push(element.expiry);
    });

    bnfFilteredInstObject.forEach((element) => {
      bnfArrayInst.push(element.expiry);
    });

    fnfFilteredInstObject.forEach((element) => {
      fnfArrayInst.push(element.expiry);
    });

    let setOfDates = new Set(arrayInst);
    let arrayOfObjects = Array.from(setOfDates);

    let setOfDatesBnf = new Set(bnfArrayInst);
    let arrayOfObjectsBnf = Array.from(setOfDatesBnf);

    let setOfDatesFnf = new Set(fnfArrayInst);
    let arrayOfObjectsFnf = Array.from(setOfDatesFnf);

    arrayOfObjects.sort((a, b) => new Date(a) - new Date(b));

    arrayOfObjectsBnf.sort((a, b) => new Date(a) - new Date(b));

    arrayOfObjectsFnf.sort((a, b) => new Date(a) - new Date(b));

    setExpiryArray(arrayOfObjects);
    setBnfExpiryArray(arrayOfObjectsBnf);
    setFnfExpiryArray(arrayOfObjectsFnf);
  };

  const expiriesToFirebase = async () => {
    const expiriesRef = doc(db, "user", "expiries");
    await updateDoc(expiriesRef, {
      niftyExpiryDates: expiryArray,
      bnfExpiryDates: bnfExpiryArray,
      fnfExpiryDates: fnfExpiryArray,
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
    await axios.get("/api/ltp/NSE:NIFTY FIN SERVICE").then((response) => {
      let ltp = response.data["NSE:NIFTY FIN SERVICE"].last_price;
      const rounded = Math.round(ltp / 100);
      const result = rounded * 100;
      setFnfLtp(result);
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
    let upperRange = bnfLtp + 1500;
    let lowerRange = bnfLtp - 1500;
    const bnfChainFilter = bnfFilteredInstObject.filter((data) => {
      return data.strike >= lowerRange && data.strike <= upperRange;
    });
    setBnfChain(bnfChainFilter);
  };

  const filterFnfChain = () => {
    let upperRange = fnfLtp + 1000;
    let lowerRange = fnfLtp - 1000;
    const fnfChainFilter = fnfFilteredInstObject.filter((data) => {
      return data.strike >= lowerRange && data.strike <= upperRange;
    });
    setFnfChain(fnfChainFilter);
  };

  const optChainToFirebase = async () => {
    const niftyChainRef = doc(db, "user", "niftyOptChain");
    const bnfChainRef = doc(db, "user", "bnfOptChain");
    const fnfChainRef = doc(db, "user", "fnfOptChain");

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

    await updateDoc(fnfChainRef, {
      fnfChain,
    })
      .then(() => {
        console.log("Option Chain Updated");
      })
      .catch((e) => {
        console.log("Error: ", e);
      });
  };

  const toggleRightNav = () => {
    let rightNav = document.getElementById("navRight");

    rightNav.classList.toggle("mr-[-280px]");
  };

  const toggleLeftNav = () => {
    let rightNav = document.getElementById("navLeft");
    rightNav.classList.toggle("ml-[-280px]");
  };

  return (
    <>
      <div
        id="navRight"
        className="fixed right-0 z-50 flex flex-col items-end w-64 h-full p-2 overflow-hidden transition-all duration-200 ease-in-out sideNavRight bg-base-300 bg-opacity-80 backdrop-blur-md rounded-tl-xl rounded-bl-xl"
      >
        <button
          className="absolute z-50 text-black right-1 top-1 btn btn-circle btn-xs btn-accent"
          onClick={toggleRightNav}
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
        <div className="w-full p-3 text-lg text-center rounded-lg title bg-neutral-800 backdrop-blur-md bg-opacity-10">
          Data resources update
        </div>

        <div className="w-full p-3 border-double taskTitle border-neutral border-[1px] rounded-lg text-center mt-5 ">
          Fetch instrument data
          <div className="flex justify-start w-full mt-3 join join-vertical">
            <button
              className="text-black rounded-md join-item btn btn-accent "
              onClick={() => {
                getInstForExp();
              }}
            >
              Fetch Data
            </button>
            {instObject ? (
              <button
                className="text-black join-item btn btn-accent"
                onClick={() => {
                  filterInst();
                }}
              >
                Filter
              </button>
            ) : null}
            {filteredInstObject && bnfFilteredInstObject ? (
              <button
                className="text-black join-item btn btn-accent"
                onClick={() => {
                  saveExpiryArray();
                }}
              >
                Sort Expiries
              </button>
            ) : null}
            {expiryArray.length != 0 && bnfExpiryArray.length != 0 ? (
              <button
                className="text-black join-item btn btn-accent"
                onClick={() => {
                  expiriesToFirebase();
                }}
              >
                Save To firebase
              </button>
            ) : null}
          </div>
        </div>

        <div className="w-full p-3 border-double taskTitle border-neutral border-[1px] rounded-lg text-center mt-5 ">
          Fetch Option chain data
          <div className="flex justify-start w-full mt-3 join join-vertical">
            <button
              className="text-black join-item btn btn-accent"
              onClick={saveLtp}
            >
              Get Chain Range
            </button>
            {niftyLtp && bnfLtp ? (
              <button
                className="text-black join-item btn btn-accent"
                onClick={() => {
                  filterNiftyChain();
                  filterBnfChain();
                  filterFnfChain();
                }}
              >
                Create Option Chain
              </button>
            ) : null}
            {niftyChain && bnfChain ? (
              <button
                className="text-black join-item btn btn-accent"
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

      <div
        id="navLeft"
        className="fixed left-0 z-50 flex flex-col items-end w-64 h-full p-2 overflow-hidden transition-all duration-200 ease-in-out sideNavRight bg-base-300 bg-opacity-80 backdrop-blur-md rounded-tr-xl rounded-br-xl"
      >
        <button
          className="absolute z-50 text-black left-1 top-1 btn btn-circle btn-xs btn-accent"
          onClick={toggleLeftNav}
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
        <div className="w-full p-3 text-lg text-center rounded-lg title bg-neutral-800 backdrop-blur-md bg-opacity-10">
          Select strategy
        </div>

        <div className="w-full p-3 border-double taskTitle border-neutral border-[1px] rounded-lg text-center mt-5 ">
          Fetch instrument data
          <button
            className="w-full mt-3 text-black rounded-md join-item btn btn-accent "
            onClick={() => {
              getInstForExp();
            }}
          >
            Fetch Data
          </button>
        </div>

        <div className="w-full p-3 border-double taskTitle border-neutral border-[1px] rounded-lg text-center mt-5 ">
          Fetch Option chain data
          <div className="flex justify-start w-full mt-3 join join-vertical">
            <button
              className="text-black join-item btn btn-accent"
              onClick={saveLtp}
            >
              Get Chain Range
            </button>
          </div>
        </div>
      </div>
      <div className="w-full px-2 pt-2 mt-1">
        <div className="w-full shadow-lg h-fit innerNav bg-neutral rounded-2xl">
          <div className="flex items-center justify-between h-full">
            <div className="self-start w-1/3 p-1 text-xl text-left">
              <div className="w-20 rounded-xl btn" onClick={toggleLeftNav}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center w-1/3 h-full text-xl text-center ">
              <div className="justify-center w-full tabButtons join">
                <button
                  id="fut5min"
                  className="join-item btn btn-accent btn-sm"
                >
                  FUTURE 5 MINS
                </button>
                <button
                  id="fut1min"
                  className="join-item btn btn-accent btn-sm"
                >
                  FUTURE 1 MIN
                </button>
                <button
                  id="strangle"
                  className="join-item btn btn-accent btn-sm"
                >
                  STRANGLE
                </button>
              </div>
            </div>
            <div
              className="self-end w-1/3 p-1 text-xl text-right"
              onClick={toggleRightNav}
            >
              <div className="w-20 rounded-xl btn">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SaveExpiries;
