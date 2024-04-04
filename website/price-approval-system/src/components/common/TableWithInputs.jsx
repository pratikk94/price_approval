import React, { useState, useRef, useEffect } from "react";
import "./TableWithInputs.css"; // Make sure to create a CSS file for styles
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Select from "react-select";
import { backend_url } from "../../util";
import { HeadsetRounded, SellOutlined } from "@mui/icons-material";
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
  const [selectedOption, setSelectedOption] = useState(null);

  // Options for the dropdown
  const options = [
    { value: "Reel", label: "Reel" },
    { value: "Sheet", label: "Sheet" },
    { value: "Bobbin", label: "Bobbin" },
  ];
  // Handling the selection
  const handleMaterialChange = (option) => {
    setSelectedOption(option);
    // You can handle additional logic here, for example:
    // update some state, or form, based on the selection
  };

  const calculateWidth = (header) => {
    console.log("HEADER" + header);
    if (header < 14) return "70px"; // Min width
    if ((header = 13)) return "80px";
    if ((header = 12)) return "95px";
    if ((header = 11)) return "100px";
    if (HeadsetRounded < 9) return "110px";
    // Max width for longer headers
  };

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

  const countTrueCheckboxes = () => {
    // Use Object.values to get an array of values from the checkboxState object
    // Then use filter to find those that are true
    // The length of the resulting array tells us how many are true
    return Object.values(checkboxState).filter((value) => value).length;
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
              label={
                option == "AgreedPrice"
                  ? "Agreed Price*"
                  : option == "SpecialDiscount"
                  ? "Special Discount*"
                  : option == "ReelDiscount"
                  ? "Reel Discount"
                  : option == "PackUpCharge"
                  ? "Pack Upcharge"
                  : option == "TPC"
                  ? "TPC"
                  : "Offline Discount"
              }
            />
          </Grid>
        ))}
      </Grid>
      <table>
        <thead>
          <tr>
            <th className="tColumn">
              <center>Grade *</center>
            </th>
            <th className="tColumn">
              <center>Grade Type *</center>
            </th>
            <th className="tColumn">
              <center>GSM From</center>
            </th>
            <th className="tColumn">
              <center>GSM To</center>
            </th>
            {/* Other conditional headers based on checkboxState */}
            {checkboxState["AgreedPrice"] && (
              <th style={{ width: calculateWidth(8 + countTrueCheckboxes()) }}>
                <center>Agreed Price</center>
              </th>
            )}
            {checkboxState["SpecialDiscount"] && (
              <th style={{ width: calculateWidth(8 + countTrueCheckboxes()) }}>
                <center>Special Discount</center>
              </th>
            )}
            {checkboxState["ReelDiscount"] && (
              <th style={{ width: calculateWidth(8 + countTrueCheckboxes()) }}>
                <center>Reel Discount</center>
              </th>
            )}
            {checkboxState["PackUpCharge"] && (
              <th style={{ width: calculateWidth(8 + countTrueCheckboxes()) }}>
                <center>Pack Upcharge</center>
              </th>
            )}
            {checkboxState["TPC"] && (
              <th style={{ width: calculateWidth(8 + countTrueCheckboxes()) }}>
                <center>TPC</center>
              </th>
            )}
            {checkboxState["OfflineDisc"] && (
              <th style={{ width: calculateWidth(8 + countTrueCheckboxes()) }}>
                <center>Offline Discount</center>
              </th>
            )}
            <th style={{ width: calculateWidth(8 + countTrueCheckboxes()) }}>
              <center>Net NSR</center>
            </th>
            {/* <th className="tColumn">Old Net NSR</th> */}
            <th className="tAction">
              <center>Actions</center>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <Select
                  placeholder=""
                  className="tColumnGrade"
                  value={grades.find((grade) => row.label)} // Find the option that matches the row's grade
                  style={{ marginTop: "10px" }} // Corrected casing for marginTop
                  name="customers"
                  options={grades}
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
                      alert("Invalid mix of Grades");
                      disableSubmit(true);
                    } else {
                      disableSubmit(false);
                    } // Assuming e contains the selected option
                    // setSelectedGrade(e); // Assuming e is the option object
                    console.log(e.label, e.profitCenter); // Debugging
                  }}
                />
              </td>

              <td>
                <Select
                  value={selectedOption}
                  onChange={handleMaterialChange}
                  options={options}
                  className="tColumnGrade"
                  placeholder=""
                />
              </td>
              {/* Conditionally render inputs for other fields like gsmFrom, gsmTo */}
              {
                <td>
                  <input
                    type="number"
                    className="tColumnG"
                    disabled={disabled}
                    value={row.gsmFrom}
                    min="0"
                    onKeyDown={(e) =>
                      (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                      e.preventDefault()
                    }
                    max="9999"
                    onChange={(e) => {
                      // setGSMFrom(e.target.value);
                      const newValue = event.target.value;
                      // Allow only up to 4 digits. This will not allow the user to enter more than 4 digits.
                      if (newValue.length <= 4 && /^[0-9]*$/.test(newValue)) {
                        handleRowChange(row.id, "gsmFrom", e.target.value);
                      }
                    }}
                  />
                </td>
              }
              {
                <td>
                  <input
                    type="number"
                    className="tColumnG"
                    value={row.gsmTo}
                    min="0"
                    onKeyDown={(e) =>
                      (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                      e.preventDefault()
                    }
                    max="9999"
                    onChange={(e) => {
                      // setGSMFrom(e.target.value);
                      const newValue = event.target.value;
                      // Allow only up to 4 digits. This will not allow the user to enter more than 4 digits.
                      if (newValue.length <= 4 && /^[0-9]*$/.test(newValue)) {
                        handleRowChange(row.id, "gsmTo", e.target.value);
                      }
                    }}
                  />
                </td>
              }
              {/* Other conditional inputs based on checkboxState */}
              {checkboxState["AgreedPrice"] && (
                <td>
                  <input
                    type="number"
                    disabled={disabled}
                    value={row.agreedPrice}
                    style={{ width: calculateWidth(8 + countTrueCheckboxes()) }}
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
                    style={{ width: calculateWidth(8 + countTrueCheckboxes()) }}
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
                    style={{ width: calculateWidth(8 + countTrueCheckboxes()) }}
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
                    style={{ width: calculateWidth(8 + countTrueCheckboxes()) }}
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
                    style={{ width: calculateWidth(8 + countTrueCheckboxes()) }}
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
                    style={{ width: calculateWidth(8 + countTrueCheckboxes()) }}
                    disabled={disabled}
                    value={row.offlineDiscount}
                    onChange={(e) =>
                      handleRowChange(row.id, "offlineDiscount", e.target.value)
                    }
                  />
                </td>
              )}
              <td>
                <input
                  type="number"
                  style={{ width: calculateWidth(8 + countTrueCheckboxes()) }}
                  readOnly
                  value={row.netNSR}
                />
              </td>
              {/* <td>
                <input
                  type="text"
                  className="tColumn"
                  disabled={true}
                  value={row.oldNetNSR}
                  onChange={(e) =>
                    handleRowChange(row.id, "oldNetNSR", e.target.value)
                  }
                />
              </td> */}
              <td className="tAction">
                <Button
                  className="tAction"
                  variant="outlined"
                  color="error"
                  onClick={() => deleteRow(row.id)}
                  sx={{
                    border: "none",
                  }}
                >
                  <DeleteIcon />
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
        <Button onClick={addRow} disabled={disabled}>
          <AddCircleIcon />
        </Button>
      </div>
    </>
  );
}

export default TableWithInputs;
