import React from "react";
import SaveExpiries from "../components/SaveExpiries";
import FutTrading from "../components/FutTrading";
import PositionalSpread from "../components/PositionalSpread";

function Terminal() {
  return (
    <div>
      <SaveExpiries />
      <FutTrading />
      {/* <hr className="h-[1px] border-0 rounded-lg bg-primary w-full" /> */}
      {/* <PositionalSpread /> */}
    </div>
  );
}

export default Terminal;
