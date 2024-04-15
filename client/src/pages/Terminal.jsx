import React from "react";
import SaveExpiries from "../components/SaveExpiries";
import Strangle from "../components/Strangle";
import FutTrading from "../components/FutTrading";
import FutTradingOneMin from "../components/FutTradingOneMin";
import PositionalSpread from "../components/PositionalSpread";
import Supertrend from "../components/Supertrend";

function Terminal() {
  return (
    <div className="overflow-x-hidden">
      <SaveExpiries />

      <div id="tabpanel">
        <FutTrading />
      </div>

      <div id="tabpanel">
        <FutTradingOneMin />
      </div>

      <div id="tabpanel">
        <Strangle />
      </div>

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
