import React, { useState, useRef, useEffect } from "react";
import "./TableWithInputs.css"; // Make sure to create a CSS file for styles
import { Button, Checkbox, FormControlLabel, Grid } from "@mui/material";

import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Select from "react-select";
import { backend_url } from "../../util";
function TableWithInputs() {
  const [grades, setGrades] = useState([]);
  const [rows, setRows] = useState([
    {
      id: Date.now(),
      grade: "",
      gradeType: "",
      gsmFrom: "",
      gsmTo: "",
      agreedPrice: 0,
      specialDiscount: 0,
      reelDiscount: 0,
      packUpCharge: 0,
      tpc: 0,
      offlineDiscount: 0,
      netNSR: 0,
      oldNetNSR: "",
    },
  ]);

  const [checkboxState, setCheckboxState] = useState({
    AgreedPrice: true,
    SpecialDiscount: true,
    ReelDiscount: false,
    PackUpCharge: false,
    TPC: false,
    OfflineDisc: false,
  });

  // Handle dynamic checkbox changes
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxState((prev) => ({ ...prev, [name]: checked }));
  };

  const fetch_grades = async (code) => {
    try {
      console.log(fscCode);
      const response = await fetch(`${backend_url}api/fetch_grade?fsc=${code}`); // Adjust the API path as needed
      const data = await response.json();
      console.log(data);
      const customerOptions = data.map((customer) => ({
        label: `${customer.code} -   ${customer.name}`,
        value: customer.code,
      }));
      setGrades(customerOptions);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  // Update row field values and calculate netNSR dynamically
  const handleRowChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };

          // If the fields to calculate netNSR are updated, recalculate it
          if (
            [
              "agreedPrice",
              "specialDiscount",
              "reelDiscount",
              "packUpCharge",
              "tpc",
              "offlineDiscount",
            ].includes(field)
          ) {
            const agreedPrice = parseFloat(updatedRow.agreedPrice) || 0;
            const specialDiscount = parseFloat(updatedRow.specialDiscount) || 0;
            const reelDiscount = parseFloat(updatedRow.reelDiscount) || 0;
            const packUpCharge = parseFloat(updatedRow.packUpCharge) || 0;
            const tpc = parseFloat(updatedRow.tpc) || 0;
            const offlineDiscount = parseFloat(updatedRow.offlineDiscount) || 0;

            updatedRow.netNSR =
              agreedPrice -
              specialDiscount -
              reelDiscount -
              packUpCharge -
              tpc -
              offlineDiscount;
            if (updatedRow.netNSR < 0) {
              console.log("Went below 0");
              alert("Net NSR cannot be less than 0");
              // return;
            }
          }

          return updatedRow;
        }
        return row;
      })
    );
  };

  // Add a new row
  const addRow = () => {
    const newRow = {
      id: Date.now(),
      grade: "",
      gradeType: "",
      gsmFrom: "",
      gsmTo: "",
      agreedPrice: 0,
      specialDiscount: 0,
      reelDiscount: 0,
      packUpCharge: 0,
      tpc: 0,
      offlineDiscount: 0,
      netNSR: 0,
      oldNetNSR: "",
    };
    setRows((prevRows) => [...prevRows, newRow]);
  };

  // Delete a row
  const deleteRow = (id) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };
  const [fscCode, setFSC] = useState(0);

  function handleFSCChange(e) {
    setGrades(e.target.checked ? 1 : 0);
    setFSC((e) => {
      fetch_grades(e ? 0 : 1);
      return e ? 0 : 1;
    });
  }

  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={fscCode == 1 ? true : false}
            onChange={handleFSCChange}
            icon={<CheckBoxOutlineBlankIcon fontSize="medium" />}
            checkedIcon={<CheckBoxIcon fontSize="medium" />}
          />
        }
        label="FSC"
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {Object.keys(checkboxState).map((option) => (
          <Grid item xs={4} key={option}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checkboxState[option]}
                  onChange={handleCheckboxChange}
                  name={option}
                />
              }
              label={option}
            />
          </Grid>
        ))}
      </Grid>
      <table>
        <thead>
          <tr>
            <th>Grade</th>
            <th>Grade Type</th>
            {<th>GSM From</th>}
            {<th>GSM To</th>}
            {/* Other conditional headers based on checkboxState */}
            {checkboxState["AgreedPrice"] && <th>Agreed Price</th>}
            {checkboxState["SpecialDiscount"] && <th>Special Discount</th>}
            {checkboxState["ReelDiscount"] && <th>Reel discount</th>}
            {checkboxState["PackUpCharge"] && <th>PackUp charge</th>}
            {checkboxState["TPC"] && <th>TPC</th>}
            {checkboxState["OfflineDisc"] && <th>Offine Discount</th>}

            <th>Net Nsr</th>
            <th>Old net NSR</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <Select
                  value={fscCode}
                  style={{ margintop: "10px" }}
                  name="customers"
                  options={grades}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  onChange={handleFSCChange}
                  placeholder={`Select plant`}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={row.gradeType}
                  onChange={(e) =>
                    handleRowChange(row.id, "gradeType", e.target.value)
                  }
                />
              </td>
              {/* Conditionally render inputs for other fields like gsmFrom, gsmTo */}
              {
                <td>
                  <input
                    type="number"
                    value={row.gsmFrom}
                    onChange={(e) =>
                      handleRowChange(row.id, "gsmFrom", e.target.value)
                    }
                  />
                </td>
              }
              {
                <td>
                  <input
                    type="number"
                    value={row.gsmTo}
                    onChange={(e) =>
                      handleRowChange(row.id, "gsmTo", e.target.value)
                    }
                  />
                </td>
              }
              {/* Other conditional inputs based on checkboxState */}
              {checkboxState["AgreedPrice"] && (
                <td>
                  <input
                    type="number"
                    value={row.agreedPrice}
                    onChange={(e) =>
                      handleRowChange(row.id, "agreedPrice", e.target.value)
                    }
                  />
                </td>
              )}
              {checkboxState["SpecialDiscount"] && (
                <td>
                  <input
                    type="number"
                    value={row.specialDiscount}
                    onChange={(e) =>
                      handleRowChange(row.id, "specialDiscount", e.target.value)
                    }
                  />
                </td>
              )}
              {checkboxState["ReelDiscount"] && (
                <td>
                  <input
                    type="number"
                    value={row.reelDiscount}
                    onChange={(e) =>
                      handleRowChange(row.id, "reelDiscount", e.target.value)
                    }
                  />
                </td>
              )}
              {checkboxState["PackUpCharge"] && (
                <td>
                  <input
                    type="number"
                    value={row.packUpCharge}
                    onChange={(e) =>
                      handleRowChange(row.id, "packUpCharge", e.target.value)
                    }
                  />
                </td>
              )}
              {checkboxState["TPC"] && (
                <td>
                  <input
                    type="number"
                    value={row.tpc}
                    onChange={(e) =>
                      handleRowChange(row.id, "tpc", e.target.value)
                    }
                  />
                </td>
              )}
              {checkboxState["OfflineDisc"] && (
                <td>
                  <input
                    type="number"
                    value={row.offlineDiscount}
                    onChange={(e) =>
                      handleRowChange(row.id, "offlineDiscount", e.target.value)
                    }
                  />
                </td>
              )}
              <td>
                <input type="number" readOnly value={row.netNSR} />
              </td>
              <td>
                <input
                  type="text"
                  value={row.oldNetNSR}
                  onChange={(e) =>
                    handleRowChange(row.id, "oldNetNSR", e.target.value)
                  }
                />
              </td>
              <td>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => deleteRow(row.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        className="div_container"
        style={{ marginTop: "20px", textAlign: "right" }}
      >
        <Button variant="contained" onClick={addRow}>
          Add Row
        </Button>
      </div>
    </>
  );
}

export default TableWithInputs;
