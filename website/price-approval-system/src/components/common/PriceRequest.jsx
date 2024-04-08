import React, { useEffect, useState } from "react";
import { Typography, Box, MenuItem, Button, Menu } from "@mui/material";

import CreateRequestModal from "../../Role_AM/Screens/PriceChangeRequests/RequestModal";
import DataTable from "./DataTable";
import { backend_url, statusFilters } from "../../util";
import { useSession } from "../../Login_Controller/SessionContext";

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

function PriceChangeRequest({ role, isAM }) {
  let statusFiltersValues = Array.from(statusFilters.values());
  console.log(`ROLE->${role}`);
  if (isAM == undefined) {
    statusFiltersValues = Array.from(statusFilters.values()).slice(1, 6);
  }
  if (role == "AP_NSM_HDSM" || role == "Validator" || role == "VP") {
    statusFiltersValues = Array.from(statusFilters.values()).slice(1, 4);
    statusFiltersValues.push("Blocked");
  }
  const [filterdId, setFilterdId] = useState(0);
  const { session } = useSession();

  const employee_id = session.employee_id;
  const [data, setData] = useState(initialData);
  const [selectedColumns, setSelectedColumns] = useState(
    initialColumns.filter((col) => !col.alwaysVisible).map((col) => col.id)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Pending");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [mode, setMode] = useState("0");
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Assuming this is the function triggered by "Create Request"
  const handleCreateRequest = () => {
    setModalOpen(true);
    handleClose(); // Close the dropdown menu
    // Your existing logic for handling a request creation
    console.log("Create Request action triggered");
  };

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

  const handleFilterClick = (filter, newfilterdId) => {
    setActiveFilter(activeFilter === filter ? "" : filter);
    setFilterdId(newfilterdId); // Toggle filter
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

  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
    //window.location.reload();
  };

  useEffect(() => {
    ReturnDataTable();
  }, [filterdId]);

  const ReturnDataTable = () => {
    if (role == "AP_RM") {
      if (filterdId == 0) {
        // console.log("Filterred ID is 1");
        return (
          <DataTable
            action_id={role}
            mode={mode}
            pending={true}
            url={
              backend_url +
              `api/fetch_request_rm_with_status?employeeId=${employee_id}&status=0`
            }
          />
        );
      }
      if (filterdId == 1) {
        // console.log("Filterred ID is 1");
        return (
          <DataTable
            action_id={role}
            mode={mode}
            approve={true}
            url={
              backend_url +
              `api/fetch_request_rm_with_status?employeeId=${employee_id}&status=1`
            }
          />
        );
      }
      if (filterdId == 2) {
        // console.log("Filterred ID is 2");
        return (
          <DataTable
            action_id={role}
            mode={mode}
            url={
              backend_url +
              `api/fetch_request_rm_with_status?employeeId=${employee_id}&status=2`
            }
          />
        );
      }
      if (filterdId == 3) {
        // console.log("Filterred ID is 3");
        return (
          <DataTable
            action_id={role}
            mode={mode}
            rework={true}
            url={
              backend_url +
              `api/fetch_request_rm_with_status?employeeId=${employee_id}&status=3`
            }
          />
        );
      }
      if (filterdId == 4) {
        // console.log("Filterred ID is 4");
        return (
          <DataTable
            action_id={role}
            mode={mode}
            rework={true}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=4`
            }
          />
        );
      }
      if (filterdId == 5) {
        // console.log("Filterred ID is 4");
        return (
          <DataTable
            action_id={role}
            mode={mode}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=5`
            }
          />
        );
      }
    } else if (role == "AP_NSM_HDSM") {
      console.log(role);
      if (filterdId == 0) {
        // console.log("Filterred ID is 1");
        return (
          <DataTable
            action_id={role}
            pendnig={true}
            url={
              backend_url +
              `api/fetch_request_manager_with_status?employeeId=${employee_id}&status=0&role=${session.role}`
            }
            mode={mode}
          />
        );
      }
      if (filterdId == 1) {
        // console.log("Filterred ID is 1");
        return (
          <DataTable
            action_id={role}
            url={
              backend_url +
              `api/fetch_request_manager_with_status?employeeId=${employee_id}&status=1&role=${session.role}`
            }
            mode={mode}
          />
        );
      }
      if (filterdId == 2) {
        // console.log("Filterred ID is 2");
        return (
          <DataTable
            action_id={role}
            url={
              backend_url +
              `api/fetch_request_manager_with_status?employeeId=${employee_id}&status=2&role=${session.role}`
            }
            mode={mode}
          />
        );
      }
      if (filterdId == 3) {
        // console.log("Filterred ID is 3");
        return (
          <DataTable
            action_id={role}
            rework={true}
            url={
              backend_url +
              `api/fetch_request_manager_with_status?employeeId=${employee_id}&status=3&role=${session.role}`
            }
            mode={mode}
          />
        );
      }
      // if (filterdId == 4) {
      //   // console.log("Filterred ID is 4");
      //   return (
      //     <DataTable
      //       action_id={role}
      //       url={
      //         backend_url +
      //         `api/fetch_request_manager_with_status?employeeId=${employee_id}&status=4&role=${session.role}`
      //       }
      //       mode={mode}
      //     />
      //   );
      // }
      if (filterdId == 5) {
        // console.log("Filterred ID is 4");
        return (
          <DataTable
            action_id={role}
            url={
              backend_url +
              `api/fetch_request_manager_with_status?employeeId=${employee_id}&status=5&role=${session.role}`
            }
            mode={mode}
          />
        );
      }
    } else if (role == "AM") {
      if (filterdId == 0) {
        // console.log("Filterred ID is 1");
        return (
          <DataTable
            isAM={true}
            action_id={role}
            url={
              backend_url + `api/get_draft?employeeId=${session.employee_id}`
            }
            sendMode={setMode}
            mode={mode}
          />
        );
      }
      if (filterdId == 1) {
        // console.log("Filterred ID is 1");
        return (
          <DataTable
            isAM={true}
            action_id={role}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=0`
            }
            sendMode={setMode}
            mode={mode}
          />
        );
      }
      if (filterdId == 2) {
        // console.log("Filterred ID is 2");
        return (
          <DataTable
            isAM={true}
            action_id={role}
            sendMode={setMode}
            mode={mode}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=1`
            }
          />
        );
      }
      if (filterdId == 3) {
        // console.log("Filterred ID is 3");
        return (
          <DataTable
            isAM={true}
            action_id={role}
            sendMode={setMode}
            mode={mode}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=2`
            }
          />
        );
      }
      if (filterdId == 4) {
        // console.log("Filterred ID is 4");
        return (
          <DataTable
            isAM={true}
            action_id={role}
            mode={mode}
            sendMode={setMode}
            rework={true}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=3`
            }
          />
        );
      }
      if (filterdId == 5) {
        // console.log("Filterred ID is 1");
        return (
          <DataTable
            isAM={true}
            action_id={role}
            sendMode={setMode}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=5`
            }
          />
        );
      }
    } else if (role == "Validator") {
      if (filterdId == 0) {
        // console.log("Filterred ID is 1");
        return (
          <DataTable
            pending={true}
            action_id={role}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=-1`
            }
            sendMode={setMode}
            mode={mode}
          />
        );
      }
      if (filterdId == 1) {
        // console.log("Filterred ID is 1");
        return (
          <DataTable
            isAM={true}
            action_id={role}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=0`
            }
            sendMode={setMode}
            mode={mode}
          />
        );
      }
      if (filterdId == 2) {
        // console.log("Filterred ID is 2");
        return (
          <DataTable
            isAM={true}
            action_id={role}
            sendMode={setMode}
            mode={mode}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=1`
            }
          />
        );
      }
      if (filterdId == 3) {
        // console.log("Filterred ID is 3");
        return (
          <DataTable
            isAM={true}
            action_id={role}
            sendMode={setMode}
            rework={true}
            mode={mode}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=2`
            }
          />
        );
      }
      if (filterdId == 4) {
        // console.log("Filterred ID is 4");
        return (
          <DataTable
            isAM={true}
            action_id={role}
            mode={mode}
            sendMode={setMode}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=3`
            }
          />
        );
      }
      if (filterdId == 5) {
        // console.log("Filterred ID is 1");
        return (
          <DataTable
            isAM={true}
            action_id={role}
            sendMode={setMode}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=5`
            }
          />
        );
      }
    } else if (role == "VP") {
      if (filterdId == 0) {
        // console.log("Filterred ID is 1");
        return (
          <DataTable
            isAM={true}
            action_id={role}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=-1`
            }
            sendMode={setMode}
            mode={mode}
          />
        );
      }
      if (filterdId == 1) {
        // console.log("Filterred ID is 1");
        return (
          <DataTable
            action_id={role}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=0`
            }
            sendMode={setMode}
            mode={mode}
          />
        );
      }
      if (filterdId == 2) {
        // console.log("Filterred ID is 2");
        return (
          <DataTable
            isAM={true}
            action_id={role}
            sendMode={setMode}
            mode={mode}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=1`
            }
          />
        );
      }
      if (filterdId == 3) {
        // console.log("Filterred ID is 3");
        return (
          <DataTable
            isAM={true}
            action_id={role}
            sendMode={setMode}
            mode={mode}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=2`
            }
          />
        );
      }
      if (filterdId == 4) {
        // console.log("Filterred ID is 4");
        return (
          <DataTable
            isAM={true}
            action_id={role}
            mode={mode}
            sendMode={setMode}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=3`
            }
          />
        );
      }
      if (filterdId == 5) {
        // console.log("Filterred ID is 1");
        return (
          <DataTable
            isAM={true}
            action_id={role}
            sendMode={setMode}
            url={
              backend_url +
              `api/fetch_request_am_with_status?employeeId=${employee_id}&status=5`
            }
          />
        );
      }
    }
  };

  const handleCopyRequest = () => {
    handleClose(); // Close the menu
    console.log("Copy Request action triggered");
  };

  const handleMergeRequest = () => {
    handleClose(); // Close the menu
    console.log("Merge Request action triggered");
  };

  const handleBlockRequest = () => {
    handleClose(); // Close the menu
    console.log("Block Request action triggered");
  };

  const handleExtensionOrPreclosure = () => {
    handleClose(); // Close the menu
    console.log("Extension or Preclosure action triggered");
  };

  return (
    <div style={{ width: "80vw", height: "96vh" }}>
      <Typography variant="h4" gutterBottom>
        Price Requests
      </Typography>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        flexWrap="wrap"
        marginBottom={2}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          {statusFiltersValues.map((filter, index) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "contained" : "outlined"}
              onClick={() => handleFilterClick(filter, index)}
              style={{ marginRight: "1vw" }}
              sx={{
                mb: 1,
                ...(filter === "Rework" && { mr: 2 }),
              }} // Add space after "Rework"
            >
              {filter}
            </Button>
          ))}
        </span>
        {isAM != undefined ? (
          <div>
            <Button
              aria-controls="actions-menu"
              aria-haspopup="true"
              onClick={handleClick}
              variant="contained"
            >
              + Create request
            </Button>
            <Menu
              id="actions-menu"
              anchorEl={anchorEl}
              keepMounted
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={handleCreateRequest}>Create Request</MenuItem>
              {/* <MenuItem onClick={handleCopyRequest}>Copy Request</MenuItem> */}
              <MenuItem onClick={handleMergeRequest}>Merge Request</MenuItem>
              {/* <MenuItem onClick={handleBlockRequest}>Block Request</MenuItem> */}
              <MenuItem onClick={handleExtensionOrPreclosure}>
                Extension or Preclosure
              </MenuItem>
            </Menu>
          </div>
        ) : null}
        <CreateRequestModal
          open={modalOpen}
          handleClose={handleCloseModal}
          mode={mode ?? 0}
        />
      </Box>
      {ReturnDataTable()}
    </div>
  );
}

export default PriceChangeRequest;
