import React, { useState, useEffect } from "react";
import Select from "react-select";
import { backend_url } from "../../util";

const PaymentTerms = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

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
    setSelectedCustomers(selectedOptions);
  };

  return (
    <Select
      style={{ margintop: "10px" }}
      name="customers"
      options={customers}
      className="basic-multi-select"
      classNamePrefix="select"
      onChange={handleChange}
      placeholder={`Select payment terms`}
    />
  );
};

export default PaymentTerms;
