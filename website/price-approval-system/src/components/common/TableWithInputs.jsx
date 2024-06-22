import React, { useState, useRef, useEffect } from "react";
import "./TableWithInputs.css"; // Make sure to create a CSS file for styles
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
  MenuItem,
  Modal,
  TableContainer,
  Paper,
  TableHead,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Tab,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Select from "react-select";
import { backend_url } from "../../util";
import { HeadsetRounded, SellOutlined } from "@mui/icons-material";
import SpacingWrapper from "../util/SpacingWrapper";
import { v4 as uuidv4 } from "uuid";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
function TableWithInputs({
  setTableRowsDataFunction,
  fscCode,
  setFSCCode,
  disableSubmit,
  prices,
  disabled,
  isExtension,
  fetchHistory,
}) {
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [fsc, setFSC] = useState("N");
  const [gradeType, setGradeType] = useState(null);
  const [ids, setIds] = useState([]);
  const [open, setOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  // Options for the dropdown
  const options = [
    { value: "Reel", label: "Reel" },
    { value: "Sheet", label: "Sheet" },
    { value: "Bobbin", label: "Bobbin" },
  ];

  const gradeTypes = ["Reel", "Sheet", "Bobbin"];
  // Handling the selection
  const handleMaterialChange = (option) => {
    setGradeType(option);
    // You can handle additional logic here, for example:
    // update some state, or form, based on the selection
  };

  const calculateWidth = () => {
    const fixedColumnWidths = 30; // Adjust this percentage based on the total fixed widths you desire
    const activeConditionalColumns = Object.values(checkboxState).filter(
      (val) => val
    ).length;
    // console.log(activeConditionalColumns);
    // Assuming the rest of the width is evenly distributed among the conditional columns
    const conditionalColumnWidth =
      activeConditionalColumns > 0
        ? (100 - fixedColumnWidths) / activeConditionalColumns
        : 0;

    // console.log(conditionalColumnWidth);

    return `${conditionalColumnWidth}%`;
  };

  useEffect(() => {
    fetch_grades(prices[0] != undefined ? prices[0].fsc : fsc);
  }, [fsc]);

  useEffect(() => {
    // Set rows based on incoming prices data
    console.log(prices);
    if (prices && prices.length > 0) {
      console.log(prices[0].grade_type);
      setFSCCode(prices[0].fsc_code);
      const newRows = prices.map((price, index) => {
        const newId = uuidv4(); // Calculate the new ID

        console.log(price.grade);
        setSelectedGrade([...grades, price.grade]);
        setIds(ids, [...ids, newId]);

        console.log(newId);

        if (price.tpc != 0 && price.tpc != null) {
          setCheckboxState((prev) => {
            return { ...prev, TPC: true };
          });
        }

        if (price.offline_discount != 0 && price.offline_discount != null) {
          setCheckboxState((prev) => {
            return { ...prev, offlineDiscount: true };
          });
        }

        if (price.reel_discount != 0 && price.reel_discount != null) {
          setCheckboxState((prev) => {
            return { ...prev, ReelDiscount: true };
          });
        }

        if (price.pack_upcharge != 0 && price.pack_upcharge != null) {
          setCheckboxState((prev) => {
            return { ...prev, PackUpCharge: true };
          });
        }

        return {
          id: newId,
          grade: price.grade,
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
          profitCenter: gradeMapper(newId, price.grade), // Add any additional fields here
        };
      });

      console.log(newRows);
      // for (let i = 0; i < newRows.length; i++) {
      //   if (newRows[i].grade != undefined && newRows[i].grade != "") {
      //     return;
      //   }
      // }
      setRows(newRows);
    }
  }, [prices, grades]);

  const [rows, setRows] = useState([
    {
      id: "",
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

  const gradeMapper = (id, gradeLabel) => {
    console.log(gradeLabel);
    console.log(grades);

    if (gradeLabel && grades.length > 0) {
      const foundCustomer = grades.find((c) => c.label == gradeLabel);
      if (foundCustomer) {
        console.log(foundCustomer ? [foundCustomer] : []);
        console.log(foundCustomer.profitCenter);

        return foundCustomer.profitCenter;
      }
      return gradeLabel;
      // Return the found customer in an array format, or an empty array if not found
    }
    return []; // Return an empty array by default if conditions are not met
  };

  const fetch_grades = async (fscM) => {
    try {
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
      console.log(customerOptions);

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
    console.log("In_handleRowChange");
    setRows((prevRows) =>
      prevRows.map((row) => {
        console.log(row);
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
          console.log(updatedRow);
          if (field === "grade") {
            updatedRow.profitCenter = profit_center;
          }

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
            // console.log(updatedRow);
            // If the fields to calculate netNSR are updated, recalculate it
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
      id: uuidv4(),
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
    console.log(e.target.checked);
    setFSC(e.target.checked ? "Y" : "N");
    setFSCCode(e.target.checked ? "Y" : "N");
  }

  function isMixPresent(rowData) {
    const firstDigits = rowData.map((item) => String(item.profitCenter)[0]); // Get first digit of each profitCenter

    // Check presence of each category
    const has234 = ["2", "3", "4"].some((digit) => firstDigits.includes(digit));
    const has5 = firstDigits.includes("5");

    // Return false if both groups, [2, 3, 4] and [5], are found
    return !(has234 && has5);
  }

  console.log(grades);
  console.log(fsc);
  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            disabled={isExtension}
            checked={
              prices[0] != undefined
                ? prices[0].fsc == "Y"
                  ? true
                  : false
                : fsc == "Y"
            }
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
                  disabled={
                    (option === "AgreedPrice" || option === "SpecialDiscount"
                      ? true
                      : false) || isExtension
                  }
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
                  : option == "OfflineDisc"
                  ? "Offline Discount"
                  : ""
              }
            />
          </Grid>
        ))}
      </Grid>
      <table>
        <thead>
          <tr>
            <th>
              {" "}
              <center>Grade *</center>
            </th>
            <th>
              <center>Grade Type *</center>
            </th>
            <th>
              <center>GSM From *</center>
            </th>
            <th>
              <center>GSM To</center>
            </th>
            {/* Other conditional headers based on checkboxState */}
            {checkboxState["AgreedPrice"] && (
              <th style={{ width: calculateWidth() }}>
                <center>Agreed Price</center>
              </th>
            )}
            {checkboxState["SpecialDiscount"] && (
              <th style={{ width: calculateWidth() }}>
                {" "}
                <center>Special Discount</center>
              </th>
            )}
            {checkboxState["ReelDiscount"] && (
              <th style={{ width: calculateWidth() }}>
                {" "}
                <center>Reel Discount</center>
              </th>
            )}
            {checkboxState["PackUpCharge"] && (
              <th style={{ width: calculateWidth() }}>
                {" "}
                <center>Pack Upcharge</center>
              </th>
            )}
            {checkboxState["TPC"] && (
              <th style={{ width: calculateWidth() }}>
                {" "}
                <center>TPC</center>
              </th>
            )}
            {checkboxState["OfflineDisc"] && (
              <th style={{ width: calculateWidth() }}>
                {" "}
                <center>Offline Discount</center>
              </th>
            )}
            <th style={{ width: calculateWidth() }}>
              {" "}
              <center>Net NSR</center>
            </th>
            {/* <th className="tColumn">Old Net NSR</th> */}
            <th style={{ width: calculateWidth() }}>
              {" "}
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
                  value={grades.find((grade) => grade.label === row.grade)} // Find the option that matches the row's grade
                  style={{ marginTop: "10px" }} // Corrected casing for marginTop
                  name="customers"
                  options={grades}
                  classNamePrefix="select"
                  disabled={disabled || isExtension}
                  onChange={(e) => {
                    console.log(rows); // Debugging
                    console.log(
                      grades.find((label) => label.grade === row.grade)
                    );
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
                    setSelectedGrade(e); // Assuming e is the option object
                    console.log(e.label, e.profitCenter); // Debugging
                  }}
                />
              </td>

              <td>
                <Select
                  value={options.find(
                    (option) => option.label === row.gradeType
                  )}
                  onChange={(e) => {
                    console.log("EEE" + e);
                    handleMaterialChange(e);
                    row.gradeType = e.label;
                    handleRowChange(
                      row.id,
                      "gradeType",
                      e.label,
                      e.profitCenter
                    );
                  }}
                  disabled={disabled || isExtension}
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
                    disabled={disabled || isExtension}
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
                    disabled={disabled || isExtension}
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
                <td style={{ width: calculateWidth() }}>
                  <input
                    type="number"
                    disabled={disabled || isExtension}
                    style={{ width: "100%" }}
                    value={row.agreedPrice}
                    onChange={(e) =>
                      handleRowChange(row.id, "agreedPrice", e.target.value)
                    }
                  />
                </td>
              )}
              {checkboxState["SpecialDiscount"] && (
                <td style={{ width: calculateWidth() }}>
                  <input
                    type="number"
                    disabled={disabled || isExtension}
                    style={{ width: "100%" }}
                    value={row.specialDiscount}
                    onChange={(e) =>
                      handleRowChange(row.id, "specialDiscount", e.target.value)
                    }
                  />
                </td>
              )}
              {checkboxState["ReelDiscount"] && (
                <td style={{ width: calculateWidth() }}>
                  <input
                    type="number"
                    style={{ width: "100%" }}
                    disabled={disabled || isExtension}
                    value={row.reelDiscount}
                    onChange={(e) =>
                      handleRowChange(row.id, "reelDiscount", e.target.value)
                    }
                  />
                </td>
              )}
              {checkboxState["PackUpCharge"] && (
                <td style={{ width: calculateWidth() }}>
                  <input
                    type="number"
                    style={{ width: "100%" }}
                    disabled={disabled || isExtension}
                    value={row.packUpCharge}
                    onChange={(e) =>
                      handleRowChange(row.id, "packUpCharge", e.target.value)
                    }
                  />
                </td>
              )}
              {checkboxState["TPC"] && (
                <td style={{ width: calculateWidth() }}>
                  <input
                    type="number"
                    style={{ width: "100%" }}
                    value={row.tpc}
                    disabled={disabled || isExtension}
                    onChange={(e) =>
                      handleRowChange(row.id, "tpc", e.target.value)
                    }
                  />
                </td>
              )}
              {checkboxState["OfflineDisc"] && (
                <td style={{ width: calculateWidth() }}>
                  <input
                    type="number"
                    style={{ width: "100%" }}
                    disabled={disabled || isExtension}
                    value={row.offlineDiscount}
                    onChange={(e) =>
                      handleRowChange(row.id, "offlineDiscount", e.target.value)
                    }
                  />
                </td>
              )}
              <td style={{ width: calculateWidth() }}>
                <input
                  type="number"
                  readOnly
                  disabled={disabled || isExtension}
                  value={row.netNSR}
                  style={{ width: "100%" }}
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
                <span style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    className="tAction"
                    variant="outlined"
                    color="error"
                    disabled={disabled || isExtension}
                    onClick={() => deleteRow(row.id)}
                    sx={{
                      border: "none",
                    }}
                  >
                    <DeleteIcon />
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{
                      border: "none",
                    }}
                    onClick={async () => {
                      console.log(row.grade);
                      let response = await fetchHistory(row.grade);
                      console.log(response.data);
                      setHistoryData(response.data);
                      setOpen(true);
                    }}
                  >
                    <WorkHistoryIcon />
                  </Button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        className="div_container"
        style={{ marginTop: "20px", textAlign: "right" }}
      >
        <Button onClick={addRow} disabled={disabled || isExtension}>
          <AddCircleIcon />
        </Button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            backgroundColor: "white", // Changed from 'background.paper' to 'white'
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                {/* Replace with your actual column headers */}
                <TableRow>
                  <TableCell>Request Id</TableCell>
                  <TableCell>Agreed Price</TableCell>
                  <TableCell>Special Discount</TableCell>
                  <TableCell>Reel Discount</TableCell>
                  <TableCell>TPC</TableCell>
                  <TableCell>Offline Discount</TableCell>
                  <TableCell>Net NSR</TableCell>
                  {/* ... other headers */}
                </TableRow>
              </TableHead>
              <TableBody>
                {historyData.map((row) => (
                  <TableRow key={row.req_id}>
                    <TableCell>{row.req_id[0]}</TableCell>
                    <TableCell>{row.agreed_price}</TableCell>
                    <TableCell>{row.special_discount}</TableCell>
                    <TableCell>{row.reel_discount}</TableCell>
                    <TableCell>{row.tpc}</TableCell>
                    <TableCell>{row.offline_discount}</TableCell>
                    <TableCell>{row.net_nsr}</TableCell>

                    {/* ... other cells */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Modal>
    </>
  );
}

export default TableWithInputs;
