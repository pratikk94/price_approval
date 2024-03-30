import React, { useState, useEffect } from "react";
import Select from "react-select";
import { backend_url } from "../../util";
import { useSession } from "../../Login_Controller/SessionContext";

const CustomerSelect = ({
  id,
  name,
  customerState,
  consigneeState,
  endUseState,
  checkCheckBox,
  selectedCustomersToEdit,
  disabled,
}) => {
  const [customers, setCustomers] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const { session } = useSession();
  useEffect(() => {
    // Fetch and set customers only if not disabled

    const fetchCustomers = async () => {
      const response = await fetch(
        `${backend_url}api/fetch_customers?type=${id}&&region=${session.region}`
      );
      const data = await response.json();
      const formattedData = data.map((customer) => ({
        value: customer.code,
        label: `${customer.name} (${customer.code})`,
      }));
      setCustomers(formattedData);

      if (selectedCustomersToEdit) {
        const initialSelectedCustomers = formattedData.filter((customer) => {
          return selectedCustomersToEdit
            .split(",")
            .map(Number)
            .includes(customer.value);
        });
        console.log(initialSelectedCustomers);
        setSelectedOptions(initialSelectedCustomers);

        if (id === 1) customerState(initialSelectedCustomers);
        if (id === 2) consigneeState(initialSelectedCustomers);
        if (id === 3) endUseState(initialSelectedCustomers);
      }
    };
    fetchCustomers();
  }, [disabled, id, selectedCustomersToEdit, customerState]);
  const handleChange = (selected) => {
    // Only update if not disabled

    if (!disabled) {
      setSelectedOptions(selected);
      if (id === 1) customerState(selected);
      if (id === 2) consigneeState(selected);
      if (id === 3) endUseState(selected);
    }
  };

  const handleBlur = () => {
    console.log("Select has lost focus");
    checkCheckBox();
    // Run any function or logic you need here
  };

  // console.log(disabled);
  return (
    <Select
      isMulti
      disabled={disabled}
      name={name}
      options={customers}
      value={selectedOptions}
      onChange={handleChange}
      onBlur={handleBlur}
      closeMenuOnSelect={false}
      placeholder={`Select ${name}`}
    />
  );
};

export default CustomerSelect;
