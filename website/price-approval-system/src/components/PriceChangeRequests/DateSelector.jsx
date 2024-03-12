import React, { useState } from "react";

function DateSelector({ name }) {
  const [selectedDate, setSelectedDate] = useState("");

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  return (
    <div>
      <label htmlFor="datePicker">{name}</label>
      <input
        type="date"
        id="datePicker"
        value={selectedDate}
        onChange={handleDateChange}
      />
      {selectedDate && <p>Selected Date: {selectedDate}</p>}
    </div>
  );
}

export default DateSelector;
