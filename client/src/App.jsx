import React from "react";
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./utils/config";
import { DataContext } from "./utils/DataContext";
import Login from "./components/Login";
import Terminal from "./pages/Terminal";

import io from "socket.io-client";

function App() {
  const [expiries, setExpiries] = useState();

  const [niftyOptChainData, setNiftyOptChainData] = useState();
  const [bnfOptChainData, setBnfOptChainData] = useState();
  const [fnfOptChainData, setFnfOptChainData] = useState();

  const [niftyFutData, setNiftyFutData] = useState();
  const [bnfFutData, setBnfFutData] = useState();
  const [fnfFutData, setFnfFutData] = useState();

  const [niftySpotData, setNiftySpotData] = useState();
  const [bnfSpotData, setBnfSpotData] = useState();
  const [fnfSpotData, setFnfSpotData] = useState();

  const [tokenAvailable, setTokenAvailable] = useState(null);

  // Socket Related States
  const [socket, setSocket] = useState(null);
  const [instrumentTokens, setInstrumentTokens] = useState(null);
  const [tickerData, setTickerData] = useState([]);
  const [isSuccess, setIsSuccess] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramValue = params.get("token");
    if (paramValue) {
      setTokenAvailable(paramValue);
    }
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "expiries"), (doc) => {
      setExpiries(doc.data());
    });
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "niftyOptChain"), (doc) => {
      setNiftyOptChainData(doc.data());
    });
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "bnfOptChain"), (doc) => {
      setBnfOptChainData(doc.data());
    });
  }, []);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "fnfOptChain"), (doc) => {
      setFnfOptChainData(doc.data());
    });
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "niftyFut"), (doc) => {
      setNiftyFutData(doc.data());
    });
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "bnfFut"), (doc) => {
      setBnfFutData(doc.data());
    });
  }, []);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "fnfFut"), (doc) => {
      setFnfFutData(doc.data());
    });
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "niftySpot"), (doc) => {
      setNiftySpotData(doc.data());
    });
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "bnfSpot"), (doc) => {
      setBnfSpotData(doc.data());
    });
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "user", "fnfSpot"), (doc) => {
      setFnfSpotData(doc.data());
    });
  }, []);

  useEffect(() => {
    if (tokenAvailable !== null && socket == null) {
      const newSocket = io.connect("http://localhost:3001", {
        timeout: 99999999,
      }); // Replace with your server URL
      newSocket.on("connect", () => {
        console.log("Socket connected");
        setSocket(newSocket);
      });
      newSocket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      });
    }
  }, [tokenAvailable]);

  useEffect(() => {
    if (socket && tokenAvailable) {
      socket?.emit("sendToken", tokenAvailable);
    }
    socket?.on("tickerSuccess", (data) => {
      console.log("ticker Connected", data);
      setIsSuccess(data);
    });
    socket?.on("ticks", (data) => {
      setTickerData(data);
    });
    socket?.on("connect", () => {
      socket?.emit("sendToken", tokenAvailable);
    });
  }, [socket]);

  // useEffect(() => {
  //   console.log(expiries);
  //   console.log(bnfOptChainData);
  //   console.log(niftyOptChainData);
  //   console.log(bnfFutData);
  //   console.log(niftyFutData);
  //   console.log(niftySpotData);
  //   console.log(bnfSpotData);
  // }, [
  //   expiries,
  //   niftyOptChainData,
  //   bnfOptChainData,
  //   bnfFutData,
  //   niftyFutData,
  //   niftySpotData,
  //   bnfSpotData,
  // ]);

  return (
    <>
      {/* {JSON.stringify(tickerData[0])} */}
      <DataContext.Provider
        value={{
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
        }}
      >
        {!tokenAvailable ? <Login /> : null}
        {tokenAvailable ? <Terminal /> : null}
        {/* <TickerSocket /> */}
      </DataContext.Provider>
    </>
  );
}

export default App;
