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
start.setHours(9, 15, 0);
var end = new Date();
end.setHours(15, 30, 5);
var tickEnd = new Date();
tickEnd.setHours(15, 29, 59, 900);

const startFetchJob = async (instTokenArray) => {
  const job = schedule.scheduleJob("* * * * *", async () => {
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
  const job = schedule.scheduleJob("1 */5 * * * *", async () => {
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
  const job = schedule.scheduleJob("1 15,45 * * * *", async () => {
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
  const job = schedule.scheduleJob("2 */5 * * * *", async () => {
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
  const job = schedule.scheduleJob("5 15,45 * * * *", async () => {
    if (now >= start && now <= end) {
      instTokenArray?.forEach(async (token) => {
        let data = await thirtyCandleData
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
const startSLMonitor30m = () => {
  const job = schedule.scheduleJob("59 14,44 * * * *", () => {
    // const job = schedule.scheduleJob("*/5 * * * * *", () => {
    now = new Date();

    // io.emit("checkSl", now.getMinutes());
    io.emit("checkSl30m", now.getMinutes());
  });

  const job2 = schedule.scheduleJob("25 15 * * *", () => {
    // const job = schedule.scheduleJob("*/5 * * * * *", () => {
    now = new Date();

    // io.emit("checkSl", now.getMinutes());
    io.emit("checkSl30m", now.getMinutes());
  });
};

const startEntryMonitor = () => {
  const job = schedule.scheduleJob("59 4/5 * * * *", () => {
    // const job = schedule.scheduleJob("*/5 * * * * *", () => {
    now = new Date();

    // io.emit("checkEntry", now.getMinutes());
    io.emit("checkEntry", now.getMinutes());
  });
};
const startEntryMonitor30m = () => {
  const job = schedule.scheduleJob("58 14,44 * * * *", () => {
    // const job = schedule.scheduleJob("*/5 * * * * *", () => {
    now = new Date();

    // io.emit("checkEntry", now.getMinutes());
    io.emit("checkEntry30m", now.getMinutes());
  });

  const job2 = schedule.scheduleJob("25 15 * * *", () => {
    // const job2 = schedule.scheduleJob("*/5 * * * * *", () => {
    now = new Date();

    // io.emit("checkEntry", now.getMinutes());
    io.emit("checkEntry30m", now.getMinutes());
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
    ticker.connect();
    ticker.autoReconnect(true, 300, 5);

    ticker.on("connect", () => {
      socket.emit(
        "tickerSuccess",
        `ConnectionSuccessful${now.getMilliseconds()}`
      );
    });

    ticker.on("error", (err) => {
      console.log(err.message);
    });
    // ticker.on("disconnect", (err) => {
    //   console.log(err);
    // });
    ticker.on("reconnect", (reconnect_count, reconnect_interval) => {
      socket.emit("reconnected");
      console.log(
        "Reconnecting: attempt - ",
        reconnect_count,
        " interval - ",
        reconnect_interval
      );
    });
    ticker.on("noreconnect ", () => {
      console.log("Reconnection wasn't Possible please restart the server");
    });

    ticker.on("ticks", (ticks) => {
      socket.emit("ticks", ticks);

      ticks.forEach((tick) => {
        now = new Date();
        if (now >= start && now <= tickEnd) {
          saveDataToMongo(
            tick.instrument_token,
            tick.last_price,
            tick.exchange_timestamp
          );
        } else {
          console.log("Market Closed");
          console.log(now);
        }
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
    startSLMonitor30m();
    startEntryMonitor();
    startEntryMonitor30m();
  });
});

// 109119239;

// server.listen(3001, () => {
//   console.log("Server running on port 3001");
//   dbconnection.connectToDb();
// });
