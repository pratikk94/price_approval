import { Label } from "@mui/icons-material";
import { TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns-tz";
import { toZonedTime } from "date-fns-tz";

// Specify the time zone for IST
const timeZone = "Asia/Kolkata";

// Convert UTC date to the specified time zone

function CustomDatePicker({ name, setSelection, editedData }) {
  const [startDate, setStartDate] = useState("");
  console.log(`Time${editedData.length}`);
  return (
    <div>
      <Typography variant="p">{name + "\t"}</Typography>

      <DatePicker
        selected={editedData.length != 0 ? editedData : startDate}
        dateFormat="dd/MM/yyyy"
        onChange={(date) => {
          console.log(
            format(toZonedTime(date, timeZone), "yyyy-MM-dd HH:mm:ssXXX", {
              timeZone,
            })
          );
          setStartDate(
            format(toZonedTime(date, timeZone), "yyyy-MM-dd HH:mm:ssXXX", {
              timeZone,
            })
          );
          setSelection(
            format(toZonedTime(date, timeZone), "yyyy-MM-dd HH:mm:ssXXX", {
              timeZone,
            })
          );
        }}
      />
    </div>
  );
}

export default CustomDatePicker;
