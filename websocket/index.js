const express = require("express");
const socketIo = require("socket.io");
const KiteTicker = require("kiteconnect").KiteTicker;
const cors = require("cors");
const dbconnection = require("./dbconnection");
const { fetchData } = require("./fetchCandle");
const { fetchFiveCandle } = require("./fetchFiveCandle");
const { fetchThirtyCandle } = require("./fetchThirtyCandle");
require("dotenv").config();
const tickData = require("./models/schema");
const schedule = require("node-schedule");
const { DateTime } = require("luxon");
const mongoose = require("mongoose");
const fiveCandleData = require("./models/fiveMinCandleSchema");
const thirtyCandleData = require("./models/thirtyMinCandleSchema");

const app = express();

const server = app.listen(3001, () => {
  console.log("Server running on port 3001");
  dbconnection.connectToDb();
});

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
  connectTimeout: 99999999, // 25 seconds interval
});
app.use(cors());

dbconnection.connectToDb();

let ticker;
const saveDataToMongo = async (insToken, lastPrice, exchangeTime) => {
  let exchTime = DateTime.fromJSDate(exchangeTime, { zone: "utc" })
    .setZone("Asia/Kolkata")
    .toISO({ includeOffset: false });
  const tick = new tickData({
    instrument_token: insToken,
    last_price: lastPrice,
    exchange_time: exchTime,
  });
  await tick.save();
  console.log("Added Data");
};

var now = new Date();
var start = new Date();
start.setHours(0, 15, 0);
var end = new Date();
end.setHours(15, 29, 59, 900);

const startFetchJob = async (instTokenArray) => {
  const job = schedule.scheduleJob("* * * * *", () => {
    if (now >= start && now <= end) {
      instTokenArray?.forEach(async (token) => {
        await fetchData(token);

        now = new Date();
      });
    } else {
      console.log("No candles market closed");
    }
  });
};

const startFiveFetchJob = async (instTokenArray) => {
  const job = schedule.scheduleJob("1 */5 * * * *", () => {
    if (now >= start && now <= end) {
      instTokenArray?.forEach(async (token) => {
        await fetchFiveCandle(token);
        now = new Date();
      });
    } else {
      console.log("No candles market closed");
    }
  });
};

const startThirtyFetchJob = async (instTokenArray) => {
  const job = schedule.scheduleJob("2 15,45 * * * *", () => {
    if (now >= start && now <= end) {
      instTokenArray?.forEach(async (token) => {
        await fetchThirtyCandle(token);
        now = new Date();
      });
    } else {
      console.log("No candles market closed");
    }
  });
};

const fetchFiveCandleFromDB = async (instTokenArray) => {
  if (now >= start && now <= end) {
    instTokenArray?.forEach(async (token) => {
      let data = await fiveCandleData
        .where("instrument_token")
        .equals(token)
        .sort({ _id: -1 })
        .limit(100);
      io.emit(token, data);
    });
  } else {
    console.log("No candles market closed");
  }
  const job = schedule.scheduleJob("3 */5 * * * *", () => {
    if (now >= start && now <= end) {
      instTokenArray?.forEach(async (token) => {
        let data = await thirtyCandleData
          .where("instrument_token")
          .equals(token)
          .sort({ _id: -1 })
          .limit(100);
        io.emit(token, data);
      });
    } else {
      console.log("No candles market closed");
    }
  });
};

const fetchThirtyCandleFromDB = async (instTokenArray) => {
  if (now >= start && now <= end) {
    instTokenArray?.forEach(async (token) => {
      let data = await thirtyCandleData
        .where("instrument_token")
        .equals(token)
        .sort({ _id: -1 })
        .limit(100);
      io.emit(`30min${token}`, data);
    });
  } else {
    console.log("No candles market closed");
  }
  const job = schedule.scheduleJob("3 15,45 * * * *", () => {
    if (now >= start && now <= end) {
      instTokenArray?.forEach(async (token) => {
        let data = await fiveCandleData
          .where("instrument_token")
          .equals(token)
          .sort({ _id: -1 })
          .limit(50);
        io.emit(`30min${token}`, data);
      });
    } else {
      console.log("No candles market closed");
    }
  });
};

const startSLMonitor = () => {
  const job = schedule.scheduleJob("59 4/5 * * * *", () => {
    // const job = schedule.scheduleJob("*/5 * * * * *", () => {
    now = new Date();

    io.emit("checkSl", now.getMinutes());
    // io.emit("checkSl", now.getSeconds());
  });
};

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("sendToken", (data) => {
    const tokenAvailable = data;
    console.log("Access Token", tokenAvailable);

    ticker = new KiteTicker({
      api_key: process.env.APIKEY,
      access_token: tokenAvailable,
    });
    ticker.autoReconnect(true, 1000, 2);
    ticker.connect();
    ticker.on("connect", () => {
      socket.emit("tickerSuccess", "ConnectionSuccessful");
    });

    ticker.on("ticks", (ticks) => {
      socket.emit("ticks", ticks);

      ticks.forEach((tick) => {
        now = new Date();
        // if (now >= start && now <= end) {
        //   saveDataToMongo(
        //     tick.instrument_token,
        //     tick.last_price,
        //     tick.exchange_timestamp
        //   );
        // } else {
        //   console.log("Market Closed");
        //   console.log(now);
        // }
      });
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    schedule.gracefulShutdown();
    if (ticker) {
      ticker.disconnect();
    }
  });

  socket.on("defaultTokens", (data) => {
    if (ticker) {
      ticker.subscribe(data);
      ticker.setMode(ticker.modeFull, data);
      console.log(data);
    }
  });

  socket.on("niftyFutToken", (data) => {
    if (ticker) {
      ticker.subscribe(data);
      ticker.setMode(ticker.modeFull, data);
      console.log(data);
    }
  });

  socket.on("candleToken", (data) => {
    console.log(data);
    startFetchJob(data);
    startFiveFetchJob(data);
    fetchFiveCandleFromDB(data);
    startThirtyFetchJob(data);
    fetchThirtyCandleFromDB(data);
    startSLMonitor();
  });
});

// 109119239;

// server.listen(3001, () => {
//   console.log("Server running on port 3001");
//   dbconnection.connectToDb();
// });
