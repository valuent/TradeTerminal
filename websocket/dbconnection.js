const mongoose = require("mongoose");

const dbURL = "mongodb://localhost:27017";

const connectToDb = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(dbURL);
      console.log("DB connected");
    } else {
      console.log("DB already connected");
    }
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = { connectToDb };
