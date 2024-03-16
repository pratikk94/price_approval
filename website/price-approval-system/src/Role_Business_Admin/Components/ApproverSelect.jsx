import React, { useState, useEffect } from "react";
import Select, { components } from "react-select";
import { backend_url } from "../../util";
import { checkboxClasses } from "@mui/material";

const ApproverSelect = ({ name, setApprover }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  // Function to fetch customers from the API
  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${backend_url}api/get_approver`);
      const data = await response.json();
      console.log(data);
      const customerOptions = data.map((employee) => ({
        value: employee.employee_id,
        label: `${employee.role} - ${employee.employee_name}`,
      }));
      console.log(customerOptions);
      setCustomers(customerOptions);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (selectedOptions) => {
    console.log(selectedOptions);
    setSelectedCustomers(selectedOptions);
    setApprover(selectedOptions);
  };

  const Option = (props) => {
    return (
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={handleChange} // Dummy function for controlled component
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

export default ApproverSelect;
