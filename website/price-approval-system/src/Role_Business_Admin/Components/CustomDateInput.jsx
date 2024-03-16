import React, { forwardRef } from "react";
import TextField from "@mui/material/TextField"; // Assuming you're using Material-UI

const CustomInput = forwardRef(({ value, onClick, onChange, name }, ref) => {
  return (
    <TextField
      onClick={onClick}
      value={value}
      onChange={onChange}
      inputRef={ref}
      label={name}
      variant="outlined"
      fullWidth
      // Apply custom styles via the InputProps prop of TextField
      InputProps={{
        style: {
          height: "56px",
          width: "27.5vw", // Set the width of the input
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "20px",
          // Note: TextField's variant="outlined" and fullWidth props may override some styles
        },
      }}
      // Style the notched outline specifically (for the outlined variant)
      InputLabelProps={{
        shrink: true, // Ensures the label doesn't overlap with the custom height
      }}
    />
  );
});

export default CustomInput;
