import React from "react";
import SaveExpiries from "../components/SaveExpiries";
import Strangle from "../components/Strangle";
import FutTrading from "../components/FutTrading";
import PositionalSpread from "../components/PositionalSpread";
import Supertrend from "../components/Supertrend";

function Terminal() {
  return (
    <div>
      <SaveExpiries />
      <Strangle />
      <FutTrading />
      <hr className="m-5 mt-10 text-xl text-center"></hr>
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
