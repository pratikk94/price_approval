import React, { useState, useEffect } from "react";
import Select, { components } from "react-select";
import { backend_url } from "../../util";

const CustomerSelect = ({ id, name, setSelection, checkCheckBox }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  // Function to fetch customers from the API
  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        `${backend_url}api/fetch_customers?type=${id}`
      );
      const data = await response.json();
      const customerOptions = data.map((customer) => ({
        label: `${customer.code} - ${customer.name}`,
        value: customer.code,
      }));
      setCustomers(customerOptions);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [id]);

  const handleChange = (selectedOptions) => {
    setSelectedCustomers(selectedOptions);
    setSelection(selectedOptions);
    checkCheckBox();
    console.log("Called");
  };

  // Customizing the option component
  const Option = (props) => {
    return (
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null} // Dummy function for controlled component
          className="custom-checkbox"
        />{" "}
        {props.isSelected && <span className="tick-mark">✓</span>}{" "}
        {/* Show tick mark next to checkbox when selected */}
        <label>{props.label}</label>
      </components.Option>
    );
  };

  return (
    <Select
      styles={{ menu: (base) => ({ ...base, marginTop: 2 }) }}
      isMulti
      name="customers"
      options={customers}
      className="basic-multi-select"
      classNamePrefix="select"
      onChange={handleChange}
      components={{ Option }}
      closeMenuOnSelect={false}
      placeholder={`Select ${name}`}
      value={selectedCustomers}
      hideSelectedOptions={false} // Ensure selected options are not hidden
    />
  );
};

export default CustomerSelect;
