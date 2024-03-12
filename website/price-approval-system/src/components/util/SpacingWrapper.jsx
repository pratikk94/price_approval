// SpacingWrapper.js
import React from "react";

const SpacingWrapper = ({ children, space }) => {
  const style = { marginBottom: space };
  return <div style={style}>{children}</div>;
};

export default SpacingWrapper;
