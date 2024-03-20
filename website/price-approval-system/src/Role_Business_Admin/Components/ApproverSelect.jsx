import React, { useState, useEffect } from "react";
import Select, { components } from "react-select";
import { backend_url } from "../../util";
import { checkboxClasses } from "@mui/material";

const ApproverSelect = ({ name, setApprover, prevSetApprovers, region }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([
    prevSetApprovers,
  ]);

  // console.log(prevSetApprovers);

  useEffect(() => {
    const fetchCustomers = async (region) => {
      // console.log(region);
      const response = await fetch(
        `${backend_url}api/fetch_approvers?region=${region}`
      );
      const data = await response.json();

      const customerOptions = data.map((employee) => ({
        value: employee.employee_id,
        name: employee.employee_name,
        label: `${employee.role} - ${employee.employee_name}`,
      }));
      // console.log(customerOptions);
      setCustomers(customerOptions);
      if (prevSetApprovers) {
        const preSelectedCustomers = customerOptions.filter((option) =>
          prevSetApprovers.includes(option.name)
        );
        setSelectedCustomers(preSelectedCustomers);
      }
    };
    fetchCustomers(region);
  }, [region]);

  const handleChange = (selectedOptions) => {
    // console.log(selectedOptions);
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
