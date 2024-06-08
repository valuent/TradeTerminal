import SaveExpiries from "../components/SaveExpiries";
// import Strangle from "../components/Strangle";
import FutTrading from "../components/FutTrading";
// import FutTradingOneMin from "../components/FutTradingOneMin";
// import PositionalSpread from "../components/PositionalSpread";
// import Supertrend from "../components/Supertrend";
import FutTradingThreeMins from "../components/FutTradingThreeMins";
import Dashboard from "../components/Dashboard";
// import BacktestFiveMin from "../components/BacktestFiveMin";

function Terminal() {
  return (
    <div className="overflow-x-hidden">
      <Dashboard />
      <SaveExpiries />

      {/* <BacktestFiveMin /> */}

      <FutTrading />
      <hr className="my-5" />

      <div className="text-lg text-center title">FUT 3 MINUTES</div>
      <FutTradingThreeMins />
      <hr className="my-5" />

      {/* <div className="text-lg text-center title">FUT 1 MINUTE</div>
      <FutTradingOneMin /> */}

      <div id="tabpanel">{/* <Strangle /> */}</div>
      {/* <div className="m-5 mt-10 text-xl text-center">
        5 Mins Super Trend Trades
      </div>
      <Supertrend />
      <hr className="m-5 mt-10 text-xl text-center"></hr>
      <div className="m-5 mt-10 text-xl text-center">30 Mins Trades</div>
      <PositionalSpread /> */}
    </div>
  );
}

export default Terminal;
