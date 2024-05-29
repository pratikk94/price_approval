import React, { useState, useEffect } from "react";
import Select from "react-select";
import { backend_url } from "../../util";

const Plant = ({ setSelection, editedData, disabled }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  //console.log(editedData);
  // useEffect(() => {
  //   // Map selectedCustomersToEdit to the format { label, value } if customers are loaded
  //   //console.log(selectedCustomersToEdit);
  //   // if (editedData && customers.length > 0) {
  //   //   const selected = editedData
  //   //     .map((customerCode) => {
  //   //       const foundCustomer = customers.find((c) => c.value === customerCode);
  //   //       return foundCustomer || null; // Ensure that we return null for not found customers to filter them out later
  //   //     })
  //   //     .filter(Boolean); // Remove any nulls (in case a customer code doesn't match)
  //   setSelectedCustomers();
  //   console.log(editedData);
  // }, [editedData, customers]);
  // Function to fetch customers from the API
  const fetch_plants = async () => {
    try {
      const response = await fetch(`${backend_url}api/fetch_plants`); // Adjust the API path as needed
      const data = await response.json();
      console.log(data);
      const customerOptions = data.map((customer) => ({
        label: `${customer.code} -   ${customer.name}`,
        value: customer.code,
      }));
      setCustomers(customerOptions);
      console.log(customerOptions);
      console.log(editedData);
      if (editedData.length > 0) {
        const result = editedData.map((id) => customerOptions[id]);
        setSelectedCustomers(result);
        console.log(result);
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  useEffect(() => {
    fetch_plants();
  }, [editedData]);

  const handleChange = (selectedOptions) => {
    if (!disabled) {
      setSelectedCustomers(selectedOptions);
      setSelection(selectedOptions);
    }
  };

  return (
    <Select
      style={{ margintop: "10px" }}
      isMulti
      disabled={disabled}
      name="customers"
      options={customers}
      value={selectedCustomers}
      closeMenuOnSelect={false}
      className="basic-multi-select"
      classNamePrefix="select"
      onChange={handleChange}
      placeholder={`Select Plant`}
    />
  );
};

export default Plant;
