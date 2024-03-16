import React, { useState } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";

function CustomCheckbox() {
  const [checked, setChecked] = useState(false);

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  return (
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={handleChange} />}
      label="Active" // This is how you specify the label
    />
  );
}

export default CustomCheckbox;
