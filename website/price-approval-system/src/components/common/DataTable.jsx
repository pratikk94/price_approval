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
  IconButton,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
} from "@mui/material";
import ViewIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/GetApp";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import DownloadModal from "./DownloadModal";
import ViewModal from "../../Role_Approvers_RM/Components/ViewModal";
function DynamicTable({ url, onCustomViewFunction, isCustomEnabled }) {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [open, setOpen] = useState(false);
  const [filteredData, setFilteredData] = useState([]); // State to hold the filtered data
  const [searchQuery, setSearchQuery] = useState(""); // State to hold the search query
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [id, setId] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
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
              (value
                ? value
                    .toString()
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                : false)
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
  // const [open, setOpen] = useState(false);
  const handleOpen = (id) => {
    setOpen(true);
    setId(id);
  };

  // const handleClose = () => setOpen(false);

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

  const selectedColumns = Object.entries(columnVisibility)
    .filter(([key, value]) => value)
    .map(([key]) => key);

  const handleColumnVisibilityChange = (event) => {
    const { value } = event.target;
    // Create a new visibility object, setting all to false initially
    const newVisibility = Object.keys(columnVisibility).reduce(
      (acc, column) => ({
        ...acc,
        [column]: false,
      }),
      {}
    );

    // Set selected columns to true
    value.forEach((column) => {
      newVisibility[column] = true;
    });

    setColumnVisibility(newVisibility);
  };

  // Function to handle actions (as examples):
  const handleView = (id) => {
    console.log(`View action for ${id}`);
    setOpen(true);
    setId(id);
    // Implement view logic here
  };

  const handleEdit = (id) => {
    console.log(`Edit action for ${id}`);
    // Implement edit logic here
  };

  const handleDownload = (id) => {
    console.log(`Download action for ${id}`);
    // Implement download logic here
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Paper style={{ width: "80vw", overflowX: "auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel id="column-visibility-select-label">Columns</InputLabel>
          <Select
            labelId="column-visibility-select-label"
            id="column-visibility-select"
            multiple
            value={selectedColumns}
            onChange={handleColumnVisibilityChange}
            input={<OutlinedInput label="Columns" />}
            renderValue={(selected) => selected.join(", ")}
          >
            {Object.keys(columnVisibility).map((column) => (
              <MenuItem key={column} value={column}>
                <Checkbox checked={selectedColumns.indexOf(column) > -1} />
                <ListItemText
                  primary={column
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
              <TableCell>Actions</TableCell>
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
                  <TableCell>
                    {isCustomEnabled ? (
                      // <IconButton onClick={() => onCustomViewFunction(row.id)}>
                      //   <SupervisedUserCircleIcon />

                      // </IconButton>
                      <span>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            handleOpen(id);
                          }}
                        >
                          Show Request Details
                        </Button>
                      </span>
                    ) : (
                      <IconButton onClick={() => handleView(row["req_id"])}>
                        <ViewIcon />
                      </IconButton>
                    )}
                    {/* <IconButton onClick={() => handleEdit(row.id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDownload(row.id)}>
                      <DownloadIcon />
                    </IconButton> */}
                  </TableCell>
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
      <ViewModal open={open} onClose={handleClose} id={id} />
      {/* <DownloadModal open={open} handleClose={handleClose} setOpen={setOpen} /> */}
      {/* <DownloadModal open={open} onClose={handleClose} id={id} /> */}
    </Paper>
  );
}

export default DynamicTable;
