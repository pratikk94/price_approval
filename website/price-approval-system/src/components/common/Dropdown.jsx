// Dropdown.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

function Dropdown({ selectedItem, onChange, url }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Update 'your_api_endpoint' with your actual API endpoint
        const response = await axios.get(url);
        setItems(response.data); // Make sure to adjust this based on your API's response structure
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <FormControl fullWidth>
      <InputLabel id="dropdown-label">Item</InputLabel>
      <Select
        labelId="dropdown-label"
        id="dropdown-select"
        value={selectedItem}
        label="Item"
        onChange={onChange}
      >
        {items.map((item, index) => (
          // Assuming each 'item' has a 'name' property. Adjust as needed.
          <MenuItem key={index} value={`${item.id}-${item.name}`}>
            {`${item.id}-${item.name}`}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default Dropdown;
