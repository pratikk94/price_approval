import React, { useEffect, useState } from "react";
import Select from "react-select";

const DropdownComponent = ({ setRoleMapping }) => {
  const initialOptions = [
    { value: 1, label: "RM" },
    { value: 2, label: "NSM" },
    { value: 3, label: "HDSM" },
    { value: 4, label: "Validator" },
  ];

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [dropdowns, setDropdowns] = useState([
    { options: initialOptions, selected: [] },
  ]);
  const [dropdownMapping, setDropdownMapping] = useState({});

  const createDropdownMapping = (dropdowns, initialOptions) => {
    let dropdownMapping = {};

    // Initialize all options to 0
    initialOptions.forEach((option) => {
      dropdownMapping[option.label] = 0;
    });

    // Update mapping based on dropdown selections
    dropdowns.forEach((dropdown, index) => {
      dropdown.selected.forEach((selectedOption) => {
        // If already exists, convert to array or push to existing array
        if (
          dropdownMapping[selectedOption.label] &&
          typeof dropdownMapping[selectedOption.label] === "number"
        ) {
          dropdownMapping[selectedOption.label] = [
            dropdownMapping[selectedOption.label],
            index + 1,
          ]; // Convert to array if it's the second occurrence
        } else if (Array.isArray(dropdownMapping[selectedOption.label])) {
          dropdownMapping[selectedOption.label].push(index + 1); // Add to array if it's the third or more occurrence
        } else {
          dropdownMapping[selectedOption.label] = index + 1; // Set the dropdown index if it's the first occurrence
        }
      });
    });

    // Handle any value that might be in an array but unique, convert back to number
    Object.keys(dropdownMapping).forEach((key) => {
      if (
        Array.isArray(dropdownMapping[key]) &&
        dropdownMapping[key].length === 1
      ) {
        dropdownMapping[key] = dropdownMapping[key][0];
      }
    });

    return dropdownMapping;
  };

  useEffect(() => {
    // This effect updates the mapping whenever the dropdowns state changes
    const newMapping = {};
    dropdowns.forEach((dropdown, index) => {
      // Join the labels of the selected options for this dropdown
      newMapping[index] = dropdown.selected
        .map((option) => option.label)
        .join(", ");
    });
    setDropdownMapping(createDropdownMapping(dropdowns, initialOptions));
    setRoleMapping(createDropdownMapping(dropdowns, initialOptions));
  }, [dropdowns]);

  const handleMainChange = (selected) => {
    setSelectedOptions(selected);
    const maxSelectedValue = Math.max(
      ...selected.map((option) => option.value),
      0
    );
    setDropdowns([
      { options: initialOptions, selected: selected },
      ...dropdowns.slice(1).map((d) => ({
        ...d,
        options: initialOptions.filter(
          (option) => option.value > maxSelectedValue
        ),
      })),
    ]);
  };

  const handleDropdownChange = (selected, index) => {
    const updatedDropdowns = [...dropdowns];
    updatedDropdowns[index] = {
      ...updatedDropdowns[index],
      selected: selected,
    };
    setDropdowns(updatedDropdowns);
  };

  const addButtonClick = () => {
    const lastDropdown = dropdowns[dropdowns.length - 1];
    const maxSelectedValue =
      lastDropdown.selected.length > 0
        ? Math.max(...lastDropdown.selected.map((option) => option.value), 0)
        : 0;
    const newOptions = initialOptions.filter(
      (option) => option.value > maxSelectedValue
    );
    if (newOptions.length > 0) {
      setDropdowns([...dropdowns, { options: newOptions, selected: [] }]);
    }
  };

  const removeDropdown = (index) => {
    if (index > 0 && index < dropdowns.length) {
      // Ensure not to remove the first dropdown
      const updatedDropdowns = [...dropdowns];
      updatedDropdowns.splice(index, 1);
      setDropdowns(updatedDropdowns);
    }
  };

  // Determine if the add button should be disabled
  const lastDropdown = dropdowns[dropdowns.length - 1];
  const addButtonDisabled =
    lastDropdown.selected.length === 0 || lastDropdown.options.length <= 1;

  console.log(dropdownMapping);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Select
        isMulti
        value={selectedOptions}
        onChange={handleMainChange}
        options={initialOptions}
        styles={{ container: (base) => ({ ...base, width: 300 }) }}
      />
      {dropdowns.slice(1).map((dropdown, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            marginBottom: "10px",
            alignItems: "center",
          }}
        >
          <Select
            isMulti
            value={dropdown.selected}
            onChange={(selected) => handleDropdownChange(selected, index + 1)}
            options={dropdown.options}
            styles={{ container: (base) => ({ ...base, width: 300 }) }}
          />
          <button
            onClick={() => removeDropdown(index + 1)}
            disabled={dropdown.selected.length > 0}
            style={{ marginLeft: "10px" }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={addButtonClick}
        disabled={addButtonDisabled}
        style={{ marginTop: "10px" }}
      >
        Add Dropdown
      </button>
      <div>
        {Object.entries(dropdownMapping) // Convert the object to an array of [label, level] pairs
          .filter(([label, level]) => level > 0) // Keep only those with a level greater than 0
          .sort((a, b) => a[1] - b[1]) // Sort them by their level in ascending order
          .map(([label, level], index) => (
            <div key={index}>{`Approver ${level}: ${label}`}</div>
          ))}
      </div>
    </div>
  );
};

export default DropdownComponent;
