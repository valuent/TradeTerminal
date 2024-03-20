const tickData = require("./schema");
const { DateTime } = require("luxon");
const dbconnection = require("./dbconnection");

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
    .limit(15000);

  const candlesticks = [];
  let currentCandlestick = null;

  data.forEach((tick) => {
    let time = new Date(tick.exchange_time);

    let istTime = DateTime.fromJSDate(time, { zone: "utc" }).setZone(
      "Asia/Kolkata"
    );

    const roundedIST = istTime
      .startOf("minute")
      .minus({ minutes: istTime.minute % 5 }).ts;

    if (currentCandlestick !== roundedIST) {
      currentCandlestick = roundedIST;
      candlesticks.push(
        DateTime.fromMillis(roundedIST, { zone: "utc" })
          .setZone("Asia/Kolkata")
          .toISO({ includeOffset: false })
      );
    }
  });

  var candles = [];

  candlesticks.forEach((stick) => {
    let candleEndTime = DateTime.fromISO(stick).plus({ minutes: 5 }).toISO();

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
    // console.log(sortedData[0]);
  });
  // console.log(candles);
  return candles;
};

// fetchData([256265, 256265]);
module.exports = { fetchData };
