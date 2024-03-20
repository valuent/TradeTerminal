const tickData = require("./models/schema");
const { DateTime } = require("luxon");
const dbconnection = require("./dbconnection");
const candleData = require("./models/minCandleSchema");

dbconnection.connectToDb();

// Function to fetch data from MongoDB for the last 2 hours
const fetchData = async (insToken) => {
  let data = await tickData
    // .where("exchange_time")
    // .gte(twoHoursAgo)
    // .lte(now)
    .where("instrument_token")
    .equals(insToken)
    .sort({ _id: -1 })
    .limit(1000);

  const candlesticks = [];
  let currentCandlestick = null;

  data.forEach((tick) => {
    let time = new Date(tick.exchange_time);

    let istTime = DateTime.fromJSDate(time, { zone: "utc" }).setZone(
      "Asia/Kolkata"
    );

    const roundedIST = istTime
      .startOf("minute")
      .minus({ minutes: istTime.minute % 1 }).ts;

    if (currentCandlestick !== roundedIST) {
      currentCandlestick = roundedIST;
      candlesticks.push(
        DateTime.fromMillis(roundedIST, { zone: "utc" })
          .setZone("Asia/Kolkata")
          .toISO({ includeOffset: false })
      );
      // console.log(candlesticks);
    }
  });

  var candles = [];

  candlesticks.forEach(async (stick) => {
    let candleEndTime = DateTime.fromISO(stick)
      .plus({ minutes: 1 })
      .minus({ seconds: 1 })
      .toISO();

    let matchedTime = data?.filter((tic) => {
      return tic.exchange_time >= stick && tic.exchange_time < candleEndTime;
    });

    let sortedData = matchedTime?.sort(
      (a, b) => new Date(a.exchange_time) - new Date(b.exchange_time)
    );

    let candleObject = {
      instrument_token: sortedData[0]?.instrument_token,
      open_time: stick,
      open: sortedData[0]?.last_price,
      high: sortedData.reduce(
        (max, obj) => (obj.last_price > max ? obj.last_price : max),
        -Infinity
      ),
      low: sortedData.reduce(
        (min, obj) => (obj.last_price < min ? obj.last_price : min),
        Infinity
      ),
      close: sortedData[sortedData.length - 1]?.last_price,
    };

    candles.push(candleObject);
    // console.log(candles[0]);
    // const candle = new candleData({
    //   instrument_token: candleObject.instrument_token,
    //   open_time: candleObject.open_time,
    //   open: candleObject.open,
    //   high: candleObject.high,
    //   low: candleObject.low,
    //   close: candleObject.close,
    // });
    // await candle.save();
    // console.log("data Saved");
  });
  // console.log("hey", candles);

  const candle = new candleData({
    instrument_token: candles[0]?.instrument_token,
    open_time: candles[0]?.open_time,
    open: candles[0]?.open,
    high: candles[0]?.high,
    low: candles[0]?.low,
    close: candles[0]?.close,
  });
  await candle.save();
  console.log("Data Added: " + candle);
  // return candles;
};

// fetchData([9372674]);
module.exports = { fetchData };
