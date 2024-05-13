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
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import BlockIcon from "@mui/icons-material/Block";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import DownloadIcon from "@mui/icons-material/GetApp";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import DownloadModal from "./DownloadModal";
import ViewModal from "../../Role_Approvers_RM/Components/ViewModal";
import axios from "axios";
import { backend_url } from "../../util";
import RuleModal from "../../Role_Business_Admin/Components/RuleModal";
import RuleEditModal from "../../Role_Business_Admin/Components/RuleEditModal";
import EmployeeManagement from "../../Role_Business_Admin/Screens/EmployeeManagement";
import EmployeeDetailsModal from "../../Role_Business_Admin/Components/EmployeeManagementModal";
import HistoryModal from "../../Role_Business_Admin/Components/RequestHistoryModal";
import PriceViewModal from "../../Role_Approvers_RM/Components/ViewModal";
import EmployeeEditModal from "../../Role_Business_Admin/Components/EmployeeEditModal";
import CreateRequestModal from "../../Role_AM/Screens/PriceChangeRequests/RequestModal";
import ViewModalNSM from "../../Role_Approvers_NSM_HDSM/Components/ViewModal";
import { setDayOfYear } from "date-fns";
function DynamicTable({
  url,
  action_id,
  isAM,
  sendMode,
  mode,
  approve,
  pending,
  rework,
  isEmployeeManagement,
}) {
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
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [rule, setRule] = useState(null);
  const [rule_id, setRuleId] = useState(0);
  const [employeeManagement, setEmployeeManagement] = useState(null);
  const [empId, setEmpId] = useState(0);
  const [history, setHistory] = useState(null);
  const [historyId, setHistoryId] = useState(0);
  const [aprm, setAprm] = useState(null);
  const [aprm_id, setAprmId] = useState(0);
  const [rowId, setRowId] = useState(0);
  const [editData, setEditData] = useState([]);
  const [selectedSearchColumns, setSelectedSearchColumns] = useState([]);
  const [columnSearches, setColumnSearches] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editModalId, setEditModalId] = useState(0);
  const [employeeEditModal, setEmployeeEditModal] = useState(false);
  const [employeeViewModal, setEmployeeViewModal] = useState(false);
  const [openAM, setOpenAM] = useState(false);
  const [openNSM, setOpenNSM] = useState(false);
  const [openRM, setOpenRM] = useState(false);
  const [openDownloadModal, setOpenDownloadModal] = useState(false);
  const [parentId, setParentId] = useState(0);
  const [extension, setExtension] = useState(false);
  console.log("NSM_pending", pending);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(url);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const jsonData = await response.json();
        setData(jsonData);
        // Initialize column visibility based on the first item's keys
        if (jsonData.length > 0) {
          const initialVisibility = Object.keys(jsonData[0]).reduce(
            (acc, key) => {
              if (key !== "id" && key !== "req_id") {
                // Skip 'id' and 'requestId'
                return {
                  ...acc,
                  [key]: true,
                };
              }
              return acc;
            },
            {}
          );

          setColumnVisibility(initialVisibility);
        }
      } catch (error) {
        console.error("Could not fetch data:", error);
      }
    };
    fetchData();
  }, [url]);

  // Sort and filter data whenever the data, sortConfig, or searchQuery changes
  useEffect(() => {
    // Sort the data based on the configuration
    const sorted = sortData(data, sortConfig);

    // Filter the sorted data
    const filtered = sorted.filter((row) => {
      // Filter by date range if dates are selected
      const rowDate = new Date(row.valid_from);
      const startCheck = startDate ? rowDate >= startDate : true;
      const endCheck = endDate ? rowDate <= endDate : true;
      const dateFilter = startCheck && endCheck;

      // Early return if date filter fails
      if (!dateFilter) return false;

      // If there are no column searches defined, include all rows
      if (columnSearches.length === 0) return true;

      // Column-specific search filtering
      return columnSearches.every((search) => {
        // If a column search is defined but the column or query is empty, skip this search
        if (!search.column || !search.query) return true;

        // Access the value in the specified column for this row
        const value = row[search.column];

        // If the value exists and matches the search query, include this row
        return value
          ? value.toString().toLowerCase().includes(search.query.toLowerCase())
          : false;
      });
    });

    // Update the state with the filtered data
    setFilteredData(filtered);
  }, [
    data,
    sortConfig,
    columnSearches, // Make sure this is correctly updated elsewhere in your component
    startDate,
    endDate,
    // Removed selectedSearchColumns from dependencies since it's not used within this useEffect
  ]);

  useEffect(() => {
    const fetchRule = async () => {
      try {
        const response = await axios.get(
          `${backend_url}api/fetch_rules_by_id?id=${rule_id}`
        );
        setRule(response.data[0]);
        console.log("Rule set");
      } catch (error) {
        console.error("Error fetching rule data:", error);
      }
    };

    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(
          `${backend_url}api/fetch_roles_data_by_id?id=${empId}`
        );
        console.log(response.data[0]);
        setEmployeeManagement(response.data[0]);

        console.log("Employee management set");
      } catch (error) {
        console.error("Error fetching rule data:", error);
      }
    };

    const fetchRequestHistoryData = async () => {
      try {
        const response = await axios.get(
          `${backend_url}api/fetch_report_status_by_id?id=${historyId}`
        );
        console.log(response.data[0]);
        setHistory(response.data[0]);
      } catch (error) {
        console.error("Error fetching rule data:", error);
      }
    };

    const fetchAMData = async () => {
      console.log("in here", aprm_id);
      if (aprm_id != 0) {
        try {
          const response = await axios.get(
            `${backend_url}api/price_requests?id=${aprm_id}`
          );
          console.log("IN_HERE");
          console.log(response.data[0]);
          response.data[0].parent_id = id;
          setAprm(response.data[0]);
        } catch (error) {
          console.error("Error fetching rule data:", error);
        }
      }
    };

    if (action_id == "B1") fetchRule();
    else if (action_id == "B2") fetchEmployeeData();
    else if (action_id == "B3") fetchRequestHistoryData();
    else if (
      action_id == "AM" ||
      action_id == "AP_RM" ||
      action_id == "AP_NSM_HDSM" ||
      action_id == "Validator"
    )
      fetchAMData();
  }, [modalOpen, employeeEditModal, aprm_id, employeeViewModal]);

  // useEffect(() => {
  //   // Function to delete IDs from the database

  //   console.log(openAM, openRM, openNSM, modalOpen);

  //   // This effect runs when `openAM` changes. If it's false, perform deletion.
  //   if (!modalOpen) {
  //     // Assuming IDs are stored in local storage in a specific format; you'll need to adjust this based on your actual storage format.
  //     const idsToDelete = JSON.parse(
  //       localStorage.getItem("request_id") || "[]"
  //     );
  //     if (idsToDelete.length > 0) {
  //       deleteIdsFromDb(idsToDelete);

  //       // Optionally, clear the ids from local storage after deletion
  //       localStorage.removeItem("request_id");

  //       // Here you would also handle the "dumping" of file data as required by your application.
  //     }
  //   }
  // }, [modalOpen]);

  useEffect(() => {
    if (id != 0) {
      const fetchForEdit = async () => {
        try {
          const response = await axios.get(
            `${backend_url}api/fetch_price_request_by_id?id=${id}`
          );

          console.log(JSON.parse(response.data));
          setEditData(JSON.parse(response.data));
          setParentId(id);
        } catch (error) {
          console.error("Error fetching rule data:", error);
        }
      };

      fetchForEdit();
    }
  }, [editModalOpen]);

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
    // setOpen(true);
    setId(id);
    // Implement view logic here
  };

  const handleEdit = (id) => {
    //console.log(`Edit action for ${id}`);
    setId(id);
  };

  const handleDownload = (id) => {
    //console.log(`Download action for ${id}`);
    // Implement download logic here
  };

  const handleClose = () => {
    setOpen(false);
    setOpenAM(false);
    setOpenDownloadModal(false);
    setOpenRM(false);
    setOpenNSM(false);
  };

  const handleRuleUpdate = (updatedRule) => {
    console.log(updatedRule);
    setRule(updatedRule);
  };

  const handleEmployeeUpdate = (updatedRule) => {
    console.log(updatedRule);
    setEmployeeManagement(updatedRule);
  };

  const Actions = ({ id, row_id, req_id, rule_id }) => {
    if (id == "B1") {
      console.log("IN B1.");
      console.log(rule_id);
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={() => {
              handleView(rule);
              setModalOpen(true);
              setRuleId(rule_id);
            }}
          >
            <ViewIcon />
          </IconButton>

          {/* <IconButton
            onClick={() => {
              setEditModalOpen(true);
              handleEdit(rule_id);
              setRuleId(rule_id);
            }}
          >
            <EditIcon />
          </IconButton> */}
        </div>
      );
    } else if (id == "B2") {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={() => {
              handleView(rule_id);
              setEmployeeViewModal(true);
              setEmpId(rule_id);
            }}
          >
            <ViewIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              console.log("clicked");
              handleEdit(rule_id);
              setEmployeeEditModal(true);
              setEmpId(rule_id);
            }}
          >
            <EditIcon />
          </IconButton>
        </div>
      );
    } else if (id == "B3") {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={() => {
              handleView(row_id);
              setModalOpen(true);
              setHistoryId(row_id);
            }}
          >
            <ViewIcon />
          </IconButton>
        </div>
      );
    } else if (id == "AP_RM") {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          {!rework && (
            <>
              <IconButton
                onClick={() => {
                  console.log("ROW id is ", row_id);
                  console.log("REQ id is ", req_id);
                  console.log("APRM ID is", aprm_id);
                  setOpenRM(true);
                  setOpenNSM(false);
                  handleView(row_id);
                  setId(row_id);
                  setModalOpen(true);
                  setAprmId(row_id);
                  console.log(row_id);
                }}
              >
                <ViewIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  setId(row_id);
                  console.log(row_id);
                  setOpenDownloadModal(true);
                }}
              >
                <DownloadIcon />
              </IconButton>
            </>
          )}
          {rework && (
            <IconButton
              onClick={() => {
                console.log("ROW id is ", row_id);
                setEditModalOpen(true);
                handleEdit(row_id);
                setId(row_id);

                setAprmId(row_id);
                //handleView(row_id);
                console.log(row_id);
                setRuleId(row_id);
              }}
            >
              <EditIcon />
            </IconButton>
          )}
          {/* {approve && (
            <>
              <IconButton
                onClick={() => {
                  console.log("ROW id is ", row_id);
                  setEditModalId(0);
                  sendMode(0);
                  setEditModalOpen(true);
                  handleEdit(row_id);
                  setId(row_id);
                  console.log(row_id);
                  setRuleId(row_id);
                }}
              >
                <ContentCopyIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  console.log("ROW id is ", row_id);
                  setEditModalId(1);
                  sendMode(2);
                  setEditModalOpen(true);
                  handleEdit(row_id);
                  setId(row_id);
                  console.log(row_id);
                  setRuleId(row_id);
                }}
              >
                <MoreTimeIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  console.log("ROW id is ", row_id);
                  setEditModalId(2);
                  sendMode(3);
                  setEditModalOpen(true);
                  handleEdit(row_id);
                  setId(row_id);
                  //handleView(row_id);
                  console.log(row_id);
                  setRuleId(row_id);
                }}
              >
                <BlockIcon />
              </IconButton>
            </>
          )} */}
        </div>
      );
    } else if (id == "AP_NSM_HDSM" || id == "Validator") {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={() => {
              console.log("ROW id is ", row_id);
              handleView(row_id);
              setId(row_id);
              setModalOpen(true);
              setAprmId(row_id);
              setOpenNSM(true);
              console.log(row_id);
            }}
          >
            <ViewIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              setId(row_id);
              console.log(row_id);

              setOpenDownloadModal(true);
            }}
          >
            <DownloadIcon />
          </IconButton>
        </div>
      );
    } else if (id == "AM") {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          {rework && (
            <>
              <IconButton
                onClick={() => {
                  console.log("ROW id is ", row_id);
                  setEditModalOpen(true);
                  handleEdit(row_id);
                  setId(row_id);
                  setAprmId(row_id);
                  //handleView(row_id);
                  console.log(row_id);
                  setRuleId(row_id);
                }}
              >
                <EditIcon />
              </IconButton>
            </>
          )}
          {approve && (
            <>
              <IconButton
                onClick={() => {
                  console.log("ROW id is ", row_id);
                  setEditModalId(0);
                  sendMode(0);
                  setEditModalOpen(true);
                  handleEdit(row_id);
                  setId(row_id);
                  console.log(row_id);
                  setRuleId(row_id);
                }}
              >
                <ContentCopyIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  console.log("ROW id is ", row_id);
                  setEditModalId(1);
                  sendMode(2);
                  setEditModalOpen(true);
                  handleEdit(row_id);
                  setId(row_id);
                  console.log(row_id);
                  setRuleId(row_id);
                }}
              >
                <MoreTimeIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  console.log("ROW id is ", row_id);
                  setEditModalId(2);
                  sendMode(3);
                  setEditModalOpen(true);
                  handleEdit(row_id);
                  setId(row_id);
                  //handleView(row_id);
                  console.log(row_id);
                  setRuleId(row_id);
                }}
              >
                <BlockIcon />
              </IconButton>
            </>
          )}
        </div>
      );
    }
  };

  const handleAddSearchColumn = () => {
    // Initially, no column is selected and the search query is empty
    setColumnSearches([...columnSearches, { column: "", query: "" }]);
  };

  const handleRemoveSearchColumn = (index) => {
    // Create a new array without the item at the specified index
    const newSearches = columnSearches.filter((_, i) => i !== index);
    setColumnSearches(newSearches);
  };

  // Toggle a single row
  const handleSelectRow = (rowId) => {
    setSelectedRows((prev) => {
      if (prev.includes(rowId)) {
        return prev.filter((id) => id !== rowId); // Deselect if already selected
      } else {
        return [...prev, rowId]; // Select if not already selected
      }
    });
  };

  // Select/deselect all rows
  const handleSelectAllRows = (event) => {
    if (event.target.checked) {
      // Select all rows
      const newSelectedRows = data.map((row) => row.id); // Assuming each row has a unique 'id' field
      setSelectedRows(newSelectedRows);
    } else {
      // Deselect all
      setSelectedRows([]);
    }
  };

  const downloadCsv = () => {
    // Filter out deselected columns
    const visibleColumns = Object.keys(columnVisibility).filter(
      (key) => columnVisibility[key]
    );

    // Create CSV header
    const csvHeader = visibleColumns.join(",") + "\n";

    // Create CSV rows
    // Assuming this is within your downloadCsv function
    const csvRows = data
      .map((row) => {
        return Object.keys(row)
          .filter((key) => columnVisibility[key]) // Ensure only visible columns are included
          .map((key) => {
            let cell = row[key];
            // Ensure the cell is treated as a string
            let cellAsString =
              cell !== null && cell !== undefined ? cell.toString() : "";

            // If the cell contains a comma, newline, or double-quote, escape those characters
            if (
              cellAsString.includes(",") ||
              cellAsString.includes("\n") ||
              cellAsString.includes('"')
            ) {
              cellAsString = `"${cellAsString.replace(/"/g, '""')}"`; // Escape double quotes
            }
            return cellAsString;
          })
          .join(",");
      })
      .join("\n");

    // Combine header and rows
    const csvString = [csvHeader, ...csvRows].join("");

    // Trigger CSV download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "datatable_export.csv"); // Set the file name for the download
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link); // Clean up
  };

  return (
    <Paper style={{ width: "80vw", overflowX: "auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: 10,
        }}
      >
        <FormControl variant="outlined" size="small" style={{ marginRight: 8 }}>
          <Button variant="contained" onClick={handleAddSearchColumn}>
            Add Search Column
          </Button>
        </FormControl>

        {!isEmployeeManagement && (
          <div>
            {/* <span>Start Date: </span>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy-MM-dd"
                isClearable
                wi
              />
              <span>End Date: </span>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="yyyy-MM-dd"
                isClearable
                minDate={startDate} // Optional: Ensures end date is after start date
              /> */}
            <Button onClick={downloadCsv} color="primary" sx={{ my: "12px" }}>
              <DownloadIcon />
            </Button>
            <FormControl sx={{ m: 1, width: 205 }}>
              <Select
                id="column-visibility-select"
                multiple
                value={selectedColumns}
                onChange={handleColumnVisibilityChange}
                style={{ height: 40 }}
                renderValue={(selected) =>
                  `Columns: ${selected.length} selected`
                }
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
        )}
        {isEmployeeManagement && (
          <div
            style={{
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
            }}
          >
            <Button onClick={downloadCsv} color="primary" sx={{ my: "12px" }}>
              <DownloadIcon />
            </Button>
            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel id="column-visibility-select-label">""</InputLabel>
              <Select
                id="column-visibility-select"
                multiple
                value={selectedColumns}
                onChange={handleColumnVisibilityChange}
                input={<OutlinedInput label="Columns" />}
                renderValue={(selected) => `${selected.length} selected`}
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
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          margin: 10,
        }}
      >
        {columnSearches.map((search, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: 16,
              marginLeft: 10,
              alignItems: "flex-start",
            }}
          >
            <FormControl
              variant="outlined"
              size="small"
              style={{ marginBottom: 8, width: "100%" }}
            >
              <InputLabel>Column</InputLabel>
              <Select
                value={search.column}
                onChange={(e) => {
                  const newSearches = [...columnSearches];
                  newSearches[index].column = e.target.value;
                  setColumnSearches(newSearches);
                }}
                label="Column"
              >
                {Object.keys(columnVisibility).map((column) => (
                  <MenuItem key={column} value={column}>
                    {column}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={search.query}
              onChange={(e) => {
                const newSearches = [...columnSearches];
                newSearches[index].query = e.target.value;
                setColumnSearches(newSearches);
              }}
              style={{ marginBottom: 8, width: "100%" }}
            />
            <Button
              variant="contained"
              color="error"
              onClick={() => handleRemoveSearchColumn(index)}
              style={{ alignSelf: "center" }}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {isAM && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < data.length
                    }
                    checked={
                      data.length > 0 && selectedRows.length === data.length
                    }
                    onChange={handleSelectAllRows}
                  />
                </TableCell>
              )}
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
                  {isAM && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                      />
                    </TableCell>
                  )}
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
                    <Actions
                      id={action_id}
                      row_id={row.req_id}
                      req_id={row.req_id}
                      rule_id={row.id}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {rule && (
        <>
          <RuleModal
            open={modalOpen}
            handleClose={() => {
              setModalOpen(false);
            }}
            rule={rule}
          />
          {/* <RuleEditModal
            open={editModalOpen}
            handleClose={() => {
              setEditModalOpen(false);
              window.location.reload();
            }}
            rule={rule}
            onRuleUpdated={handleRuleUpdate}
          /> */}
        </>
      )}

      {employeeViewModal && (
        <EmployeeDetailsModal
          open={employeeViewModal}
          handleClose={() => {
            setEmployeeViewModal(false);
          }}
          employeeData={employeeManagement}
        />
      )}
      {employeeEditModal && (
        <EmployeeEditModal
          open={employeeEditModal}
          handleClose={() => {
            setEditModalOpen(false);
            window.location.reload();
          }}
          employeeData={employeeManagement}
          onEmployeeUpdated={handleRuleUpdate}
        />
      )}
      {history && (
        <HistoryModal
          open={modalOpen}
          handleClose={() => setModalOpen(false)}
          history={history}
        />
      )}
      {/* {aprm && (
        <PriceViewModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          id={aprm_id}
          data={aprm}
          isEditable={
            (action_id == "AP_RM" || action_id == "AP_NSM_HDSM") &&
            (pending || rework)
          }
          role={action_id}
          mode={mode}
        />
      )} */}

      <TablePagination
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {(openRM || openAM) && aprm && (
        <ViewModal
          openRM={openRM}
          openAM={openAM}
          data={aprm}
          onClose={handleClose}
          id={aprm_id}
          isEditable={
            (action_id == "AP_RM" ||
              action_id == "AP_NSM_HDSM" ||
              action_id == "AM") &&
            (pending || rework)
          }
          role={action_id}
          mode={mode}
        />
      )}
      {openNSM && aprm && (
        <ViewModalNSM
          openNSM={openNSM}
          onClose={handleClose}
          id={id}
          data={aprm}
          mode={mode}
          isEditable={true && pending}
        />
      )}
      <DownloadModal open={openDownloadModal} onClose={handleClose} id={id} />
      <CreateRequestModal
        open={editModalOpen}
        handleClose={() => {
          setEditModalOpen(false);
          console.log("In here");
          handleClose();
          // Here you would also handle the "dumping" of file data as required by your application.
        }}
        parentId={parentId}
        editData={editData}
        isCopyOrMerged={true}
        isExtension={extension}
        mode={mode}
      />
      {/* <DownloadModal open={open} handleClose={handleClose} setOpen={setOpen} /> */}
      {/* <DownloadModal open={open} onClose={handleClose} id={id} /> */}
    </Paper>
  );
}

export default DynamicTable;
