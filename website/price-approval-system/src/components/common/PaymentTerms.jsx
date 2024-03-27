import React, { useState, useEffect } from "react";
import Select from "react-select";
import { backend_url } from "../../util";

const PaymentTerms = ({ setSelection, editedData, disabled }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  useEffect(() => {
    // Map selectedCustomersToEdit to the format { label, value } if customers are loaded
    console.log(editedData);
    if ([editedData]) {
      setSelectedCustomers(editedData);
    }
    // console.log(customers[editedData]);
  }, [editedData, customers]);
  // Function to fetch customers from the API
  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${backend_url}api/fetch_payment_terms`); // Adjust the API path as needed
      const data = await response.json();
      console.log(data);
      const customerOptions = data.map((customer) => ({
        label: `${customer.code} -   ${customer.name}`,
        value: customer.code,
      }));
      setCustomers(customerOptions);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (selectedOptions) => {
    if (!disabled) {
      setSelectedCustomers(selectedOptions);

      setSelection(selectedOptions);
    }
  };

  return (
    <Select
      style={{ margintop: "10px" }}
      name="customers"
      options={customers}
      value={selectedCustomers}
      className="basic-multi-select"
      classNamePrefix="select"
      onChange={handleChange}
      placeholder={`Select payment terms`}
    />
  );
};

export default PaymentTerms;
