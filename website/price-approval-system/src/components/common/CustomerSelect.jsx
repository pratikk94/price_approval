import React, { useState, useEffect } from "react";
import Select from "react-select";
import { backend_url } from "../../util";

const CustomerSelect = ({
  id,
  name,
  customerState,
  consigneeState,
  endUseState,
  checkCheckBox,
  selectedCustomersToEdit,
}) => {
  const [customers, setCustomers] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      // Mock fetching process
      const response = await fetch(
        `${backend_url}api/fetch_customers?type=${id}`
      );
      const data = await response.json();
      const formattedData = data.map((customer) => ({
        value: customer.code, // assuming your customer object has an id field
        label: `${customer.name} (${customer.code})`, // assuming your customer object has a name field
      }));
      setCustomers(formattedData);

      if (selectedCustomersToEdit) {
        const initialSelectedCustomers = formattedData.filter((customer) =>
          selectedCustomersToEdit.includes(customer.value)
        );
        setSelectedOptions(initialSelectedCustomers);
        customerState(initialSelectedCustomers);
      }
    };
    console.log("fetching customers", selectedCustomersToEdit);
    fetchCustomers();
  }, [id, selectedCustomersToEdit, customerState]);

  const handleChange = (selected) => {
    setSelectedOptions(selected);
    if (id === 1) customerState(selected);
    if (id === 2) consigneeState(selected);
    if (id === 3) endUseState(selected);
    checkCheckBox();
  };

  return (
    <Select
      isMulti
      name={name}
      options={customers}
      value={selectedOptions}
      onChange={handleChange}
      closeMenuOnSelect={false}
      placeholder={`Select ${name}`}
    />
  );
};

export default CustomerSelect;
