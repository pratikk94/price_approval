import React, { useState, useEffect } from "react";
import "./TableWithInputs.css"; // Make sure to create a CSS file for styles
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
  Modal,
  TableContainer,
  Paper,
  TableHead,
  Table,
  TableRow,
  TableCell,
  TableBody,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Select from "react-select";
import { backend_url } from "../../util";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import SpacingWrapper from "../util/SpacingWrapper";
import { v4 as uuidv4 } from "uuid";

function TableWithInputs({
  setTableRowsDataFunction,
  disableSubmit,
  prices,
  disabled,
  isCopy,
  isBlocked,
  isExtension,
  fetchHistory,
  setFSCCode,
}) {
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [gradeType, setGradeType] = useState(null);
  const [ids, setIds] = useState([]);
  const [open, setOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [fscCode, setFSC] = useState(
    prices[0] != undefined ? prices[0].fsc : "N"
  );
  const options = [
    { value: "Reel", label: "Reel" },
    { value: "Sheet", label: "Sheet" },
    { value: "Bobbin", label: "Bobbin" },
  ];
  const gradeTypes = ["Reel", "Sheet", "Bobbin"];
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
    offlineDiscount: false,
  });
  const [excelData, setExcelData] = useState("");
  const [errorRows, setErrorRows] = useState([]); // State to store rows with errors

  const handleTextChange = (event) => {
    setExcelData(event.target.value);
  };

  const handleParse = () => {
    const rows = excelData.trim().split("\n");
    const parsedData = rows.map((row) => row.split("\t"));
    const newRows = [];
    const errors = [];

    parsedData.forEach((data, index) => {
      const row = {
        id: uuidv4(),
        grade: data[0] || "",
        gradeType: data[1] || "",
        gsmFrom: data[2] || "",
        gsmTo: data[3] || "",
        agreedPrice: parseFloat(data[4]) || 0,
        specialDiscount: parseFloat(data[5]) || 0,
        reelDiscount: parseFloat(data[6]) || 0,
        packUpCharge: parseFloat(data[7]) || 0,
        tpc: parseFloat(data[8]) || 0,
        offlineDiscount: parseFloat(data[9]) || 0,
        netNSR: parseFloat(data[10]) || 0,
        oldNetNSR: parseFloat(data[11]) || 0,
        profitCenter: "",
      };

      const isError =
        !row.grade ||
        !row.gradeType ||
        !row.gsmFrom ||
        !row.gsmTo ||
        isNaN(row.agreedPrice) ||
        isNaN(row.specialDiscount) ||
        isNaN(row.reelDiscount) ||
        isNaN(row.packUpCharge) ||
        isNaN(row.tpc) ||
        isNaN(row.offlineDiscount) ||
        isNaN(row.netNSR) ||
        isNaN(row.oldNetNSR);

      if (isError) {
        errors.push(index);
      }
      newRows.push(row);
    });

    setRows((prevRows) => [...prevRows, ...newRows]);
    setErrorRows(errors);
  };

  const handleMaterialChange = (option) => {
    setGradeType(option);
  };

  const calculateWidth = () => {
    const fixedColumnWidths = 30;
    const activeConditionalColumns = Object.values(checkboxState).filter(
      (val) => val
    ).length;
    const conditionalColumnWidth =
      activeConditionalColumns > 0
        ? (100 - fixedColumnWidths) / activeConditionalColumns
        : 0;
    return `${conditionalColumnWidth}%`;
  };

  useEffect(() => {
    fetch_grades(fscCode);
  }, [fscCode]);

  useEffect(() => {
    if (prices && prices.length > 0) {
      const newRows = prices.map((price) => {
        const newId = uuidv4();
        setSelectedGrade([...grades, price.grade]);
        setIds((prevIds) => [...prevIds, newId]);
        if (price.tpc !== 0 && price.tpc !== null) {
          setCheckboxState((prev) => ({ ...prev, TPC: true }));
        }
        if (price.offline_discount !== 0 && price.offline_discount !== null) {
          setCheckboxState((prev) => ({ ...prev, offlineDiscount: true }));
        }
        if (price.reel_discount !== 0 && price.reel_discount !== null) {
          setCheckboxState((prev) => ({ ...prev, ReelDiscount: true }));
        }
        if (price.pack_upcharge !== 0 && price.pack_upcharge !== null) {
          setCheckboxState((prev) => ({ ...prev, PackUpCharge: true }));
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
          profitCenter: gradeMapper(newId, price.grade),
        };
      });
      setRows(newRows);
    }
  }, [prices, grades]);

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxState((prev) => ({ ...prev, [name]: checked }));
  };

  const countTrueCheckboxes = () => {
    return Object.values(checkboxState).filter((value) => value).length;
  };

  const gradeMapper = (id, gradeLabel) => {
    if (gradeLabel && grades.length > 0) {
      const foundCustomer = grades.find((c) => c.label === gradeLabel);
      if (foundCustomer) {
        return foundCustomer.profitCenter;
      }
      return gradeLabel;
    }
    return [];
  };

  const fetch_grades = async (fscM) => {
    try {
      const response = await fetch(
        `${backend_url}api/fetch_grade_with_pc?fsc=${fscM}`
      );
      const data = await response.json();
      const customerOptions = data.map((customer) => ({
        label: customer.name,
        value: customer.code,
        profitCenter: customer.profitCenter,
      }));
      setGrades([...customerOptions]);
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

  const handleRowChange = (id, field, value, profit_center) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
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
              alert("Net NSR cannot be less than 0");
            }
          }
          return updatedRow;
        }
        return row;
      })
    );
  };

  useEffect(() => {
    setTableRowsDataFunction(rows);
  }, [rows, setTableRowsDataFunction]);

  console.log(prices);

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

  const deleteRow = (id) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  function handleFSCChange(e) {
    console.log(e.target.checked);
    setFSC(e.target.checked ? "Y" : "N");
    setFSCCode(e.target.checked ? "Y" : "N");
  }

  function isMixPresent(rowData) {
    const firstDigits = rowData.map((item) => String(item.profitCenter)[0]);
    const has234 = ["2", "3", "4"].some((digit) => firstDigits.includes(digit));
    const has5 = firstDigits.includes("5");
    return !(has234 && has5);
  }

  console.log(fscCode);

  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={fscCode == "Y"}
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
        {Object.keys(checkboxState)
          .filter(
            (option) => option !== "AgreedPrice" && option !== "SpecialDiscount"
          )
          .map((option) => (
            <Grid item xs={3} key={option}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkboxState[option]}
                    onChange={handleCheckboxChange}
                    name={option}
                    disabled={
                      option === "AgreedPrice" ||
                      option === "SpecialDiscount" ||
                      isExtension ||
                      isBlocked
                    }
                  />
                }
                label={
                  option === "AgreedPrice"
                    ? "Agreed Price*"
                    : option === "SpecialDiscount"
                    ? "Special Discount*"
                    : option === "ReelDiscount"
                    ? "Reel Discount"
                    : option === "PackUpCharge"
                    ? "Pack Upcharge"
                    : option === "TPC"
                    ? "TPC"
                    : option === "offlineDiscount"
                    ? "Offline Discount"
                    : ""
                }
              />
            </Grid>
          ))}
      </Grid>

      <TextField
        label="Paste Excel Data"
        multiline
        rows={4}
        variant="outlined"
        fullWidth
        value={excelData}
        onChange={handleTextChange}
        error={errorRows.length > 0}
        helperText={
          errorRows.length > 0 ? "Some fields are empty or invalid" : ""
        }
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleParse}
        style={{ marginTop: "10px" }}
      >
        Parse Data
      </Button>

      <table>
        <thead>
          <tr>
            <th>
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
            {checkboxState["AgreedPrice"] && (
              <th style={{ width: calculateWidth() }}>
                <center>Agreed Price</center>
              </th>
            )}
            {checkboxState["SpecialDiscount"] && (
              <th style={{ width: calculateWidth() }}>
                <center>Special Discount</center>
              </th>
            )}
            {checkboxState["ReelDiscount"] && (
              <th style={{ width: calculateWidth() }}>
                <center>Reel Discount</center>
              </th>
            )}
            {checkboxState["PackUpCharge"] && (
              <th style={{ width: calculateWidth() }}>
                <center>Pack Upcharge</center>
              </th>
            )}
            {checkboxState["TPC"] && (
              <th style={{ width: calculateWidth() }}>
                <center>TPC</center>
              </th>
            )}
            {checkboxState["offlineDiscount"] && (
              <th style={{ width: calculateWidth() }}>
                <center>Offline Discount</center>
              </th>
            )}
            <th style={{ width: calculateWidth() }}>
              <center>Net NSR</center>
            </th>
            <th style={{ width: calculateWidth() }}>
              <center>Actions</center>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              style={
                errorRows.includes(index) ? { backgroundColor: "red" } : {}
              }
            >
              <td>
                <Select
                  placeholder=""
                  className="tColumnGrade"
                  value={grades.find((grade) => grade.label === row.grade)}
                  style={{ marginTop: "10px" }}
                  name="customers"
                  options={grades}
                  classNamePrefix="select"
                  isDisabled={disabled || isExtension || isBlocked}
                  onChange={(e) => {
                    handleRowChange(row.id, "grade", e.label, e.profitCenter);
                    row.grade = e.label;
                    row.profitCenter = e.profitCenter;
                    const result = isMixPresent(rows);
                    if (!result) {
                      alert("Invalid mix of Grades");
                      disableSubmit(true);
                    } else {
                      disableSubmit(false);
                    }
                    setSelectedGrade(e);
                  }}
                />
              </td>
              <td>
                <Select
                  value={options.find(
                    (option) => option.label === row.gradeType
                  )}
                  onChange={(e) => {
                    handleMaterialChange(e);
                    row.gradeType = e.label;
                    handleRowChange(
                      row.id,
                      "gradeType",
                      e.label,
                      e.profitCenter
                    );
                  }}
                  isDisabled={disabled || isExtension || isBlocked}
                  options={options}
                  className="tColumnGrade"
                  placeholder=""
                />
              </td>
              <td>
                <input
                  type="number"
                  className="tColumnG"
                  disabled={disabled || isExtension || isBlocked}
                  value={row.gsmFrom}
                  min="0"
                  onKeyDown={(e) =>
                    (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                    e.preventDefault()
                  }
                  max="9999"
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue.length <= 4 && /^[0-9]*$/.test(newValue)) {
                      handleRowChange(row.id, "gsmFrom", e.target.value);
                    }
                  }}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="tColumnG"
                  value={row.gsmTo}
                  disabled={disabled || isExtension || isBlocked}
                  min="0"
                  onKeyDown={(e) =>
                    (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                    e.preventDefault()
                  }
                  max="9999"
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue.length <= 4 && /^[0-9]*$/.test(newValue)) {
                      handleRowChange(row.id, "gsmTo", e.target.value);
                    }
                  }}
                />
              </td>
              {checkboxState["AgreedPrice"] && (
                <td style={{ width: calculateWidth() }}>
                  <input
                    type="number"
                    disabled={disabled || isExtension || isBlocked}
                    style={{ width: "100%" }}
                    value={isCopy ? 0 : row.agreedPrice}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Minus" ||
                        e.key === "NumpadSubtract" ||
                        e.key === "-" ||
                        e.key === "+"
                      ) {
                        e.preventDefault();
                      }
                    }}
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
                    disabled={disabled || isExtension || isBlocked}
                    style={{ width: "100%" }}
                    value={isCopy ? 0 : row.specialDiscount}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Minus" ||
                        e.key === "NumpadSubtract" ||
                        e.key === "-" ||
                        e.key === "+"
                      ) {
                        e.preventDefault();
                      }
                    }}
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
                    disabled={disabled || isExtension || isBlocked}
                    value={isCopy ? 0 : row.reelDiscount}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Minus" ||
                        e.key === "NumpadSubtract" ||
                        e.key === "-" ||
                        e.key === "+"
                      ) {
                        e.preventDefault();
                      }
                    }}
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
                    disabled={disabled || isExtension || isBlocked}
                    value={isCopy ? 0 : row.packUpCharge}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Minus" ||
                        e.key === "NumpadSubtract" ||
                        e.key === "-" ||
                        e.key === "+"
                      ) {
                        e.preventDefault();
                      }
                    }}
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
                    value={isCopy ? 0 : row.tpc}
                    disabled={disabled || isExtension || isBlocked}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Minus" ||
                        e.key === "NumpadSubtract" ||
                        e.key === "-" ||
                        e.key === "+"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) =>
                      handleRowChange(row.id, "tpc", e.target.value)
                    }
                  />
                </td>
              )}
              {checkboxState["offlineDiscount"] && (
                <td style={{ width: calculateWidth() }}>
                  <input
                    type="number"
                    style={{ width: "100%" }}
                    disabled={disabled || isExtension || isBlocked}
                    value={isCopy ? 0 : row.offlineDiscount}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Minus" ||
                        e.key === "NumpadSubtract" ||
                        e.key === "-" ||
                        e.key === "+"
                      ) {
                        e.preventDefault();
                      }
                    }}
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
                  disabled={disabled || isExtension || isBlocked}
                  value={row.netNSR}
                  style={{ width: "100%" }}
                />
              </td>
              <td className="tAction">
                <span
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    backgroundColor: "white",
                  }}
                >
                  <Button
                    className="tAction"
                    variant="outlined"
                    color="error"
                    disabled={disabled || isExtension || isBlocked}
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
                      let response = await fetchHistory(row.grade);
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
        <Button
          onClick={addRow}
          disabled={disabled || isExtension || isBlocked}
        >
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
            backgroundColor: "white",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Request Id</TableCell>
                  <TableCell>Agreed Price*</TableCell>
                  <TableCell>Special Discount*</TableCell>
                  <TableCell>Reel Discount</TableCell>
                  <TableCell>TPC</TableCell>
                  <TableCell>Pack UpCharge</TableCell>
                  <TableCell>Offline Discount</TableCell>
                  <TableCell>Net NSR</TableCell>
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
                    <TableCell>{row.packUpCharge}</TableCell>
                    <TableCell>{row.offline_discount}</TableCell>
                    <TableCell>{row.net_nsr}</TableCell>
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
