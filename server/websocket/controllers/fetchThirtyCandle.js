const { DateTime } = require("luxon");
const dbconnection = require("./dbconnection");
const candleData = require("../models/minCandleSchema");
const thirtyCandleData = require("../models/thirtyMinCandleSchema");

dbconnection.connectToDb();

// Function to fetch data from MongoDB for the last 2 hours
const fetchThirtyCandle = async (insToken) => {
  let data = await candleData
    // .where("exchange_time")
    // .gte(twoHoursAgo)
    // .lte(now)
    .where("instrument_token")
    .equals(insToken)
    .sort({ _id: -1 })
    .limit(10000);

  const candlesticks = [];
  let currentCandlestick = null;

  data.forEach((tick) => {
    let time = new Date(tick.open_time);

    let istTime = DateTime.fromJSDate(time, { zone: "utc" }).setZone(
      "Asia/Kolkata"
    );

    let roundedIST = null;
    if (istTime.minute == 15 || istTime.minute == 45) {
      roundedIST = istTime.ts;
    }

    // console.log(roundedIST);

    if (currentCandlestick !== roundedIST && roundedIST !== null) {
      currentCandlestick = roundedIST;
      candlesticks.push(
        DateTime.fromMillis(roundedIST, { zone: "utc" })
          .setZone("Asia/Kolkata")
          .toISO({ includeOffset: false })
      );
    }
    // console.log(candlesticks);
  });

  var candles = [];

  candlesticks.forEach(async (stick) => {
    let candleEndTime = DateTime.fromISO(stick)
      .plus({ minutes: 30 })
      .minus({ seconds: 1 })
      .toISO();

    let matchedTime = data?.filter((tic) => {
      return tic.open_time >= stick && tic.open_time < candleEndTime;
    });

    let sortedData = matchedTime?.sort(
      (a, b) => new Date(a.open_time) - new Date(b.open_time)
    );

    let candleObject = {
      instrument_token: sortedData[0]?.instrument_token,
      open_time: stick,
      open: sortedData[0]?.open,
      high: sortedData.reduce(
        (max, obj) => (obj.high > max ? obj.high : max),
        -Infinity
      ),
      low: sortedData.reduce(
        (min, obj) => (obj.low < min ? obj.low : min),
        Infinity
      ),
      close: sortedData[sortedData.length - 1]?.close,
    };

    candles.push(candleObject);
    // console.log(sortedData[0]);
    // const candle = new thirtyCandleData({
    //   instrument_token: candleObject.instrument_token,
    //   open_time: candleObject.open_time,
    //   open: candleObject.open,
    //   high: candleObject.high,
    //   low: candleObject.low,
    //   close: candleObject.close,
    // });
    // await candle.save();
    // console.log("data Saved", candle);
  });
  // console.log(candles[1]);
  const candle = new thirtyCandleData({
    instrument_token: candles[0]?.instrument_token,
    open_time: candles[0]?.open_time,
    open: candles[0]?.open,
    high: candles[0]?.high,
    low: candles[0]?.low,
    close: candles[0]?.close,
  });
  await candle.save();
  console.log("Data saved 30 Min: ", candle);
  //   return candles;
};

// fetchThirtyCandle([9372674]);
module.exports = { fetchThirtyCandle };
