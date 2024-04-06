const tickData = require("../models/schema");
const { DateTime } = require("luxon");

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
exports.saveDataToMongo = saveDataToMongo;
