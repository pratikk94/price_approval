import React, { useState, useEffect } from "react";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { backend_mvc } from "../util";

const CustomerDropdown = ({ salesOffice, role, onCustomerSelect }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  useEffect(() => {
    fetch(
      `${backend_mvc}/api/customers/${role}?salesOffice=${encodeURIComponent(
        salesOffice
      )}`
    )
      .then((response) => response.json())
      .then((data) => setCustomers(data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (event) => {
    setSelectedCustomer(event.target.value);
    if (onCustomerSelect) {
      onCustomerSelect(event.target.value);
    }
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="customer-label">Customer</InputLabel>
      <Select
        labelId="customer-label"
        value={selectedCustomer}
        onChange={handleChange}
      >
        {customers.map((customer) => (
          <MenuItem key={customer.id} value={customer.id}>
            {customer.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CustomerDropdown;
