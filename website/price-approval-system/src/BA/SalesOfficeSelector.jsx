import React, { useState, useEffect } from "react";
import axios from "axios";
import { backend_mvc } from "../util";

const SalesOfficeSelector = () => {
  const [salesOffices, setSalesOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState("");

  useEffect(() => {
    axios
      .get(`${backend_mvc}api/fetch_sales_regions`)
      .then((response) => {
        setSalesOffices(response.data[0]);
      })
      .catch((error) => {
        console.error("There was an error fetching the sales offices!", error);
      });
  }, []);

  const handleSelectChange = (event) => {
    setSelectedOffice(event.target.value);
  };

  return (
    <div className="sales-office-selector">
      <label htmlFor="sales-office">Select Sales Office:</label>
      <select
        id="sales-office"
        value={selectedOffice}
        onChange={handleSelectChange}
      >
        <option value="">-- Select a Sales Office --</option>
        {salesOffices.map((office) => (
          <option key={office.id} value={office.id}>
            {office.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SalesOfficeSelector;
