import React from "react";
import SaveExpiries from "../components/SaveExpiries";
import FutTrading from "../components/FutTrading";
import PositionalSpread from "../components/PositionalSpread";

function Terminal() {
  return (
    <div>
      <SaveExpiries />
      <FutTrading />
      {/* <hr className="text-xl m-5 text-center mt-10"></hr> */}
      {/* <div className="text-xl m-5 text-center mt-10">Hourly Trades</div> */}
      {/* <PositionalSpread /> */}
    </div>
  );
}

export default Terminal;
