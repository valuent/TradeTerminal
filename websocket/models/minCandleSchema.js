const mongoose = require("mongoose");

const minCandleSchema = new mongoose.Schema([
  {
    instrument_token: Number,
    open_time: String,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
  },
]);

module.exports = mongoose.model("candleData", minCandleSchema);
