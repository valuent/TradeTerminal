const express = require("express");
const KiteConnect = require("kiteconnect").KiteConnect;
var KiteTicker = require("kiteconnect").KiteTicker;
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = 3000;
const rateLimit = require("express-rate-limit");

app.use(express.json());
app.use(cors());

const limiter = rateLimit({
  windowMs: 1000,
  limit: 4,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const apiKey = process.env.APIKEY;
const apiSecret = process.env.APISECRET;

const kite = new KiteConnect({
  api_key: apiKey,
});

app.get("/login", async (req, res) => {
  try {
    const loginUrl = kite.getLoginURL();
    res.json({ loginUrl });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("Error logging in");
  }
});

app.get("/auth", async (req, res) => {
  try {
    const requestToken = req.query.request_token;
    const data = await kite.generateSession(requestToken, apiSecret);
    const accessToken = data?.access_token;
    ticker_access_token = data?.access_token;
    kite.setAccessToken(accessToken);
    res.cookie("isLoggedIn", "true", { httpOnly: true });
    res.redirect(`http://localhost:5173/?token=${data.access_token}`);
  } catch (error) {
    const requestToken = req.query.request_token;
    res
      .status(500)
      .send(
        `Error occurred during authentication ${requestToken}${error.message}`
      );
  }
});

app.get("/api/holdings", async (req, res) => {
  try {
    const holdings = await kite.getHoldings();
    res.send(holdings);
  } catch (error) {
    res.status(500).send("Error occurred while fetching holdings");
  }
});

app.get("/api/instruments", async (req, res) => {
  try {
    const data = await kite.getInstruments();
    res.send(data);
  } catch (error) {
    res.status(500).send(`Error occurred while fetching holdings ${error}`);
    console.log(error);
  }
});

app.get("/api/ltp/:inst", async (req, res) => {
  try {
    let data = await kite.getLTP(req.params.inst);
    res.send(data);
  } catch (error) {
    res.status(500).send(`Error occurred while fetching ltp ${error.message}`);
  }
});

app.get("/api/placeOrderFno", limiter, async (req, res) => {
  let orderInfo = {
    exchange: "NFO",
    tradingsymbol: req.query.tradingsymbol,
    transaction_type: req.query.transaction_type,
    quantity: req.query.quantity,
    product: req.query.product,
    order_type: req.query.order_type,
  };
  try {
    let data = await kite.placeOrder("regular", orderInfo);
    res.send(data);
    console.log(data);
  } catch (error) {
    res.send(`Error occurred while placing Order ${error.message}`);
  }
});

app.get("/api/placeOrderFnoBnf", limiter, async (req, res) => {
  let orderInfo = {
    exchange: "NFO",
    tradingsymbol: req.query.tradingsymbol,
    transaction_type: req.query.transaction_type,
    quantity: req.query.quantity,
    product: req.query.product,
    order_type: req.query.order_type,
  };
  try {
    let data = await kite.placeOrder("regular", orderInfo);
    res.send(data);
    console.log(data);
  } catch (error) {
    res.send(`Error occurred while placing Order ${error.message}`);
  }
});

app.get("/api/orderInfo", async (req, res) => {
  try {
    let data = await kite.getOrders();
    res.send(data);
  } catch (error) {
    res.send(error.message);
  }
});

app.get("/api/histData", async (req, res) => {
  let token = 9372418;
  let interval = "60minute";
  let from = "2024-03-12";
  let to = "2024-03-19";
  try {
    let data = await kite.getHistoricalData(token, interval, from, to);

    res.send(data);
  } catch (error) {
    console.log(error.message);
  }
});

console.log(Date.now() + 5);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
