import React, { useState, useRef, useEffect } from "react";
import "./TableWithInputs.css"; // Make sure to create a CSS file for styles
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
} from "@mui/material";

import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Select from "react-select";
import { backend_url } from "../../util";
import { SellOutlined } from "@mui/icons-material";
import SpacingWrapper from "../util/SpacingWrapper";
function TableWithInputs({
  setTableRowsDataFunction,
  fscCode,
  setFSCCode,
  disableSubmit,
  prices,
  disabled,
}) {
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [fsc, setFSC] = useState(fscCode);
  useEffect(() => {
    fetch_grades();
  }, [fscCode]);

  useEffect(() => {
    // Set rows based on incoming prices data
    // console.log(prices);
    if (prices && prices.length > 0 && grades.length > 0) {
      const newRows = prices.map((price, index) => ({
        id: Date.now() + index, // Ensure unique id
        grade:
          gradeMapper(price.grade)[0] != undefined
            ? gradeMapper(price.grade)[0].label
            : gradeMapper(price.grade),
        gradeType: price.grade_type,
        gsmFrom: price.gsm_range_from,
        gsmTo: price.gsm_range_to,
        agreedPrice: price.agreed_price,
        specialDiscount: price.special_discount,
        reelDiscount: price.reel_discount,
        packUpCharge: price.pack_upcharge,
        tpc: price.tpc,
        offlineDiscount: price.offline_discount,
        netNSR: price.net_nsr,
        oldNetNSR: price.old_net_nsr,
        profitCenter: "", // Add any additional fields here
      }));
      //console.log(newRows);
      setRows(newRows);
    }
  }, [prices, grades]);

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
      oldNetNSR: 0,
      profitCenter: "",
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

  const gradeMapper = (gradeLabel) => {
    if (gradeLabel && grades.length > 0) {
      const foundCustomer = grades.find((c) => c.label === gradeLabel);

      // Return the found customer in an array format, or an empty array if not found
      return foundCustomer ? [foundCustomer] : [];
    }
    return []; // Return an empty array by default if conditions are not met
  };

  const fetch_grades = async () => {
    try {
      const fscM = fscCode.length == 0 ? "N" : fscCode;
      console.log("FSC_Code", fscM);

      const response = await fetch(
        `${backend_url}api/fetch_grade_with_pc?fsc=${fscM}`
      ); // Adjust the API path as needed
      const data = await response.json();
      console.log(data);
      const customerOptions = data.map((customer) => ({
        label: customer.name,
        value: customer.code,
        profitCenter: customer.profitCenter,
      }));
      // console.log(customerOptions);

      setGrades([...customerOptions]);
      console.log("Selected Grade", selectedGrade);
      if (
        selectedGrade.length > 0 &&
        customerOptions.indexOf(selectedGrade) === -1
      ) {
        alert("Invalid mix of Grades");
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  // const onHandleGSMTo = (e) => {
  //   setGSMTo(e.target.value);
  // };

  // const onHandleGSMFrom = (e) => {
  //   //setGSMFrom(e.target.value);
  //   setGSMFrom(e.target.value);
  // };

  // Update row field values and calculate netNSR dynamically
  const handleRowChange = (id, field, value, profit_center) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        // console.log(row);
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
          if (field === "grade") updatedRow.profitCenter = profit_center;
          // console.log(updatedRow);
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
          // setNetNSR(updatedRow.netNSR);

          console.log("Recalculating GRADE" + id);

          return updatedRow;
        }
        return row;
      })
    );
  };

  useEffect(() => {
    setTableRowsDataFunction(rows);
  }, [rows, setTableRowsDataFunction]);

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
      oldNetNSR: 0,
      profitCenter: "",
    };
    setRows((prevRows) => [...prevRows, newRow]);
  };

  // Delete a row
  const deleteRow = (id) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  function handleFSCChange(e) {
    // setGrades(e.target.checked ? 1 : 0);
    setFSC((e) => {
      // fetch_grades(e ? 0 : 1);
      setFSCCode(e ? "N" : "Y");
      alert("FSC Code change will require Grade selection again");
      return e ? 0 : 1;
    });
  }

  function isMixPresent(rowData) {
    const firstDigits = rowData.map((item) => String(item.profitCenter)[0]); // Get first digit of each profitCenter

    // Check presence of each category
    const has234 = ["2", "3", "4"].some((digit) => firstDigits.includes(digit));
    const has5 = firstDigits.includes("5");

    // Return false if both groups, [2, 3, 4] and [5], are found
    return !(has234 && has5);
  }

  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={fsc == 1 ? true : false}
            onChange={handleFSCChange}
            icon={<CheckBoxOutlineBlankIcon fontSize="medium" />}
            checkedIcon={<CheckBoxIcon fontSize="medium" />}
          />
        }
        label="FSC"
      />
      <SpacingWrapper space="12px" />
      <Typography>Select Pricing Conditions</Typography>
      <Grid container spacing={0} sx={{ mb: 2 }}>
        {Object.keys(checkboxState).map((option) => (
          <Grid item xs={4} key={option}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checkboxState[option]}
                  onChange={handleCheckboxChange}
                  name={option}
                  disabled={disabled}
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
            <th className="tColumn">Grade</th>
            <th className="tColumn">Grade Type</th>
            <th className="tColumn">GSM From</th>
            <th className="tColumn">GSM To</th>
            {/* Other conditional headers based on checkboxState */}
            {checkboxState["AgreedPrice"] && (
              <th className="tColumn">Agreed Price</th>
            )}
            {checkboxState["SpecialDiscount"] && (
              <th className="tColumn">Special Discount</th>
            )}
            {checkboxState["ReelDiscount"] && (
              <th className="tColumn">Reel discount</th>
            )}
            {checkboxState["PackUpCharge"] && (
              <th className="tColumn">PackUp charge</th>
            )}
            {checkboxState["TPC"] && <th className="tColumn">TPC</th>}
            {checkboxState["OfflineDisc"] && (
              <th className="tColumn">Offline Discount</th>
            )}
            <th className="tColumn">Net Nsr</th>
            <th className="tColumn">Old net NSR</th>
            <th className="tColumn">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <Select
                  value={grades.find((grade) => selectedGrade.label)} // Find the option that matches the row's grade
                  style={{ marginTop: "10px" }} // Corrected casing for marginTop
                  name="customers"
                  options={grades}
                  className="basic-multi-select tColumn"
                  classNamePrefix="select"
                  disabled={disabled}
                  onChange={(e) => {
                    console.log(row); // Debugging
                    handleRowChange(row.id, "grade", e.label, e.profitCenter);
                    console.log("Handling row change");
                    row.grade = e.label;
                    row.profitCenter = e.profitCenter;
                    console.log(rows);
                    const result = isMixPresent(rows);
                    console.log(result);

                    if (!result) {
                      alert("Invalid mix of profit centers");
                      disableSubmit(true);
                    } else {
                      disableSubmit(false);
                    } // Assuming e contains the selected option
                    setSelectedGrade(e); // Assuming e is the option object
                    console.log(e.label, e.profitCenter); // Debugging
                  }}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="tColumn"
                  disabled={disabled}
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
                    className="tColumn"
                    disabled={disabled}
                    value={row.gsmFrom}
                    onChange={(e) => {
                      // setGSMFrom(e.target.value);
                      handleRowChange(row.id, "gsmFrom", e.target.value);
                    }}
                  />
                </td>
              }
              {
                <td>
                  <input
                    type="text"
                    className="tColumn"
                    value={row.gsmTo}
                    disabled={disabled}
                    onChange={(e) => {
                      // setGSMFrom(e.target.value);
                      handleRowChange(row.id, "gsmTo", e.target.value);
                    }}
                  />
                </td>
              }
              {/* Other conditional inputs based on checkboxState */}
              {checkboxState["AgreedPrice"] && (
                <td>
                  <input
                    type="number"
                    className="tColumn"
                    disabled={disabled}
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
                    className="tColumn"
                    disabled={disabled}
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
                    className="tColumn"
                    disabled={disabled}
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
                    className="tColumn"
                    disabled={disabled}
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
                    className="tColumn"
                    value={row.tpc}
                    disabled={disabled}
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
                    className="tColumn"
                    disabled={disabled}
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
                  className="tColumn"
                  disabled={disabled}
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
        <Button variant="contained" onClick={addRow} disabled={disabled}>
          Add Row
        </Button>
      </div>
    </>
  );
}

export default TableWithInputs;
