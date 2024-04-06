const mongoose = require("mongoose");

const tickDataSchema = new mongoose.Schema([
  {
    instrument_token: Number,
    last_price: Number,
    exchange_time: String,
  },
]);

module.exports = mongoose.model("tickData", tickDataSchema);
