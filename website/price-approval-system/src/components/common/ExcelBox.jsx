import React, { useState } from "react";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

function ExcelBox() {
  const [excelData, setExcelData] = useState("");
  const [tableData, setTableData] = useState([]);

  const handleTextChange = (event) => {
    setExcelData(event.target.value);
  };

  const handleParse = () => {
    const rows = excelData.trim().split("\n");
    const parsedData = rows.map((row) => row.split("\t"));
    setTableData(parsedData);
  };

  return (
    <div style={{ padding: "20px" }}>
      <TextField
        label="Paste Excel Data"
        multiline
        rows={4}
        variant="outlined"
        fullWidth
        value={excelData}
        onChange={handleTextChange}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleParse}
        style={{ marginTop: "10px" }}
      >
        Parse Data
      </Button>
      {tableData.length > 0 && (
        <TableContainer component={Paper} style={{ marginTop: "20px" }}>
          <Table>
            <TableHead>
              <TableRow>
                {tableData[0].map((cell, index) => (
                  <TableCell key={index}>{cell}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.slice(1).map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

export default ExcelBox;
