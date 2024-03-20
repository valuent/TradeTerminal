const mongoose = require("mongoose");

const fiveMinCandleSchema = new mongoose.Schema([
  {
    instrument_token: Number,
    open_time: String,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
  },
]);

module.exports = mongoose.model("fiveCandleData", fiveMinCandleSchema);
