import { Label } from "@mui/icons-material";
import { TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function CustomDatePicker({ name, setSelection, editedData }) {
  const [startDate, setStartDate] = useState("");

  return (
    <div>
      <Typography variant="p">{name + "\t"}</Typography>

      <DatePicker
        selected={startDate}
        dateFormat="dd/MM/yyyy"
        onChange={(date) => {
          setStartDate(date);
          setSelection(date);
        }}
      />
    </div>
  );
}

export default CustomDatePicker;
