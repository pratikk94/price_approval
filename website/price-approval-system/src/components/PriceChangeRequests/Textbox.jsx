import React, { useState } from "react";
import "./Textbox.css"; // Make sure to create this CSS file

function TextInput() {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <div className="input-container">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        className="custom-input"
        placeholder="Type here..."
      />
    </div>
  );
}

export default TextInput;
