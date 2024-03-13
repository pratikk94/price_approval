import React, { useState } from "react";
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Box,
  Select,
  MenuItem,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  Modal,
} from "@mui/material";
import {
  Refresh,
  Download,
  Visibility,
  Edit,
  ContentCopy,
  Delete,
} from "@mui/icons-material";
import CreateRequestModal from "./RequestModal";
import DataTable from "./DataTable";

// Initial dummy data with status
const initialData = [
  {
    id: 1,
    status: "Draft",
    requestId: "RQ-101",
    refReq: "REF-501",
    startDate: "2022-01-01",
    endDate: "2022-01-15",
    plant: "Plant 1",
    customer: "Pratik",
    consignee: "Sirisha",
    created_date: "2024-03-12:17:03:00",
    created_by: "Pratik",
  },
  // Add more dummy data as needed
];

// Column configurations
const initialColumns = [
  { id: "requestId", label: "Request ID" },
  { id: "refReq", label: "Ref Req" },
  { id: "startDate", label: "Start Date" },
  { id: "endDate", label: "End Date" },
  { id: "plant", label: "Plant" },
  { id: "customer", label: "Customer" },
  { id: "consignee", label: "Consignee" },
  { id: "created_date", label: "Created Date" },
  { id: "created_by", label: "Created By" },
  { id: "actions", label: "Actions", alwaysVisible: true }, // Actions column
];

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

// Status filter action items
const statusFilters = ["Draft", "Pending", "Rejected", "Approved", "Rework"];

function PriceChangeRequest() {
  const [data, setData] = useState(initialData);
  const [selectedColumns, setSelectedColumns] = useState(
    initialColumns.filter((col) => !col.alwaysVisible).map((col) => col.id)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setActiveFilter("");
    // Reset selected columns except those marked as alwaysVisible
    setSelectedColumns(
      initialColumns.filter((col) => !col.alwaysVisible).map((col) => col.id)
    );
  };

  const handleColumnSelectionChange = (event) => {
    const value = event.target.value;
    setSelectedColumns(typeof value === "string" ? value.split(",") : value);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(activeFilter === filter ? "" : filter); // Toggle filter
  };

  // Apply both status filter and search term
  const filteredData = data.filter(
    (item) =>
      (activeFilter ? item.status === activeFilter : true) &&
      initialColumns
        .filter((col) => selectedColumns.includes(col.id) || col.alwaysVisible)
        .some(
          (column) =>
            item[column.id] &&
            item[column.id].toString().toLowerCase().includes(searchTerm)
        )
  );

  const renderActionIcons = () => (
    <>
      <IconButton>
        <Download />
      </IconButton>
      <IconButton>
        <Visibility />
      </IconButton>
      <IconButton>
        <Edit />
      </IconButton>
      <IconButton>
        <ContentCopy />
      </IconButton>
      <IconButton>
        <Delete />
      </IconButton>
    </>
  );
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <div style={{ width: "80    vw", height: "96vh" }}>
      <Typography variant="h4" gutterBottom>
        Price Requests
      </Typography>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        flexWrap="wrap"
        marginBottom={2}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenModal}
          sx={{ mb: 1 }}
        >
          Create Request
        </Button>
        <CreateRequestModal open={modalOpen} handleClose={handleCloseModal} />
        <IconButton onClick={handleRefresh} sx={{ mb: 1 }}>
          <Refresh />
        </IconButton>
      </Box>
      {/* <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              {initialColumns
                .filter(
                  (col) => selectedColumns.includes(col.id) || col.alwaysVisible
                )
                .map((column) => (
                  <TableCell key={column.id}>{column.label}</TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.id}>
                {initialColumns
                  .filter(
                    (col) =>
                      selectedColumns.includes(col.id) || col.alwaysVisible
                  )
                  .map((column) => (
                    <TableCell key={column.id}>
                      {column.id === "actions"
                        ? renderActionIcons()
                        : row[column.id]}
                    </TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer> */}
      <DataTable />
    </div>
  );
}

export default PriceChangeRequest;
