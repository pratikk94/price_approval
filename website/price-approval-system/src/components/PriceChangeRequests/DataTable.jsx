import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  TablePagination,
  Checkbox,
  FormControlLabel,
  TableSortLabel,
  TextField,
} from "@mui/material";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

function DynamicTable() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [filteredData, setFilteredData] = useState([]); // State to hold the filtered data
  const [searchQuery, setSearchQuery] = useState(""); // State to hold the search query
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/fetch_price_requests"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const jsonData = await response.json();
        setData(jsonData);
        // Initialize column visibility based on the first item's keys
        if (jsonData.length > 0) {
          const initialVisibility = Object.keys(jsonData[0]).reduce(
            (acc, key) => ({
              ...acc,
              [key]: true,
            }),
            {}
          );
          setColumnVisibility(initialVisibility);
        }
      } catch (error) {
        console.error("Could not fetch data:", error);
      }
    };
    fetchData();
  }, []);

  // Sort and filter data whenever the data, sortConfig, or searchQuery changes
  useEffect(() => {
    let sorted = sortData(data, sortConfig);
    let filtered = sorted
      .filter((row) => {
        const rowDate = new Date(row.valid_from);
        const startCheck = startDate ? rowDate >= startDate : true;
        const endCheck = endDate ? rowDate <= endDate : true;
        return startCheck && endCheck;
      })
      .filter(
        (row) =>
          searchQuery === "" ||
          Object.entries(row).some(
            ([key, value]) =>
              columnVisibility[key] &&
              value.toString().toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    setFilteredData(filtered);
  }, [data, sortConfig, searchQuery, columnVisibility, startDate, endDate]);

  const sortData = (data, sortConfig) => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleColumnVisibilityChange = (column) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  return (
    <Paper>
      <TextField
        label="Search"
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div style={{ margin: "10px" }}>
        <span>Start Date: </span>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="yyyy-MM-dd"
          isClearable
        />
        <span>End Date: </span>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          dateFormat="yyyy-MM-dd"
          isClearable
          minDate={startDate} // Optional: Ensures end date is after start date
        />
      </div>
      <div>
        {Object.keys(columnVisibility).map((column) => (
          <FormControlLabel
            key={column}
            control={
              <Checkbox
                checked={columnVisibility[column]}
                onChange={() => handleColumnVisibilityChange(column)}
              />
            }
            label={column
              .replace(/_/g, " ")
              .replace(/\b\w/g, (letter) => letter.toUpperCase())}
          />
        ))}
      </div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {Object.keys(columnVisibility)
                .filter((key) => columnVisibility[key])
                .map((key) => (
                  <TableCell key={key}>
                    <TableSortLabel
                      active={sortConfig.key === key}
                      direction={
                        sortConfig.key === key ? sortConfig.direction : "asc"
                      }
                      onClick={() => handleSort(key)}
                    >
                      {key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                    </TableSortLabel>
                  </TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={index}>
                  {Object.entries(row)
                    .filter(([key]) => columnVisibility[key])
                    .map(([key, value], idx) => (
                      <TableCell key={idx}>
                        {typeof value === "object" && value !== null
                          ? JSON.stringify(value)
                          : value}
                      </TableCell>
                    ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default DynamicTable;
