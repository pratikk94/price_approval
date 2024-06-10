import { useState, useEffect } from "react";
import Select from "react-select";
import { backend_url } from "../../util";

const Plant = ({ setSelection, editedData, disabled }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  const fetch_plants = async (disabled) => {
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
      // if (disabled) {
      const result = customerOptions.filter((customer) =>
        editedData.split(",").map(Number).includes(customer.value)
      );
      console.log(result);
      setSelectedCustomers(result);
      // }
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  useEffect(() => {
    fetch_plants(disabled);
  }, [disabled, editedData]);

  console.log(editedData);

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
      isDisabled={disabled}
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
