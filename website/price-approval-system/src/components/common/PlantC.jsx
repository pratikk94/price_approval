import { useState, useEffect } from "react";
import Select from "react-select";
import { backend_url } from "../../util";

const PlantC = ({ setSelection, editedData, disabled }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  // Function to fetch customers from the API
  const fetch_plants = async () => {
    try {
      const response = await fetch(`${backend_url}api/fetch_plants`); // Adjust the API path as needed
      const data = await response.json();
      console.log("Fetched data:", data);
      const customerOptions = data.map((customer) => ({
        label: `${customer.code} -   ${customer.name}`,
        value: customer.code,
      }));
      setCustomers(customerOptions);
      console.log("Customer options:", customerOptions);

      // If editedData is provided, set the selected customers based on it
      if (editedData && editedData.length > 0) {
        const result = editedData
          .map((id) => {
            const customer = customerOptions.find((c) => c.value === id);
            return customer || null; // Ensure that we return null for not found customers to filter them out later
          })
          .filter(Boolean); // Remove any nulls (in case a customer code doesn't match)

        setSelectedCustomers(result);
        console.log("Selected customers based on editedData:", result);
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  useEffect(() => {
    console.log("Fetching plants...");
    fetch_plants();
  }, []);

  const handleChange = (selectedOptions) => {
    if (!disabled) {
      setSelectedCustomers(selectedOptions);
      setSelection(selectedOptions);
      console.log("Selected options:", selectedOptions);
    }
  };

  return (
    <Select
      style={{ marginTop: "10px" }}
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

export default PlantC;
