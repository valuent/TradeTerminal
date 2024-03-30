import React from "react";
import SaveExpiries from "../components/SaveExpiries";
import FutTrading from "../components/FutTrading";
import PositionalSpread from "../components/PositionalSpread";
import Supertrend from "../components/Supertrend";

function Terminal() {
  return (
    <div>
      <SaveExpiries />
      <FutTrading />
      <hr className="text-xl m-5 text-center mt-10"></hr>
      <div className="text-xl m-5 text-center mt-10">30 Mins Trades</div>
      <PositionalSpread />
      <hr className="text-xl m-5 text-center mt-10"></hr>
      <div className="text-xl m-5 text-center mt-10">
        5 Mins Super Trend Trades
      </div>
      <Supertrend />
    </div>
  );
}

export default Terminal;
