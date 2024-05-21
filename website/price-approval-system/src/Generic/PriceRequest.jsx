/* eslint-disable react/prop-types */
/* eslint-disable no-sparse-arrays */
import { useEffect, useState } from "react";
import { Typography, Box, MenuItem, Button, Menu } from "@mui/material";

import DataTable from "./DataTable";
import { backend_url, statusFilters } from "../util";

import CreateRequestModal from "../Role_AM/Screens/PriceChangeRequests/RequestModal";

// Initial dummy data with status
// const initialData = [
//   {
//     id: 1,
//     status: "Draft",
//     requestId: "RQ-101",
//     refReq: "REF-501",
//     startDate: "2022-01-01",
//     endDate: "2022-01-15",
//     plant: "Plant 1",
//     customer: "Pratik",
//     consignee: "Sirisha",
//     created_date: "2024-03-12:17:03:00",
//     created_by: "Pratik",
//   },
//   // Add more dummy data as needed
// ];

// Column configurations
// const initialColumns = [
//   { id: "requestId", label: "Request ID" },
//   { id: "refReq", label: "Ref Req" },
//   { id: "startDate", label: "Start Date" },
//   { id: "endDate", label: "End Date" },
//   { id: "plant", label: "Plant" },
//   { id: "customer", label: "Customer" },
//   { id: "consignee", label: "Consignee" },
//   { id: "created_date", label: "Created Date" },
//   { id: "created_by", label: "Created By" },
//   { id: "actions", label: "Actions", alwaysVisible: true }, // Actions column
// ];

// const modalStyle = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 400,
//   bgcolor: "background.paper",
//   border: "2px solid #000",
//   boxShadow: 24,
//   p: 4,
// };

// Status filter action items

function PriceChangeRequest(rules, employee_id) {
  let statusFiltersValues = [];
  console.log(rules.rules);
  if (rules.rules.can_initiate == 1) {
    statusFiltersValues = [
      ...statusFiltersValues,
      Array.from(statusFilters.values())[0], //draft
      Array.from(statusFilters.values())[6], //approved
    ];
  }

  if (rules.rules.can_rework == 1) {
    statusFiltersValues = [
      ...statusFiltersValues,
      Array.from(statusFilters.values())[4], //rework
    ];
  }

  if (rules.rules.can_approve == 1) {
    statusFiltersValues = [
      ...statusFiltersValues,
      Array.from(statusFilters.values())[1], //pending
    ];
  }
  const [filterdId, setFilterdId] = useState(0);

  // const [data, setData] = useState(initialData);
  // const [selectedColumns, setSelectedColumns] = useState(
  //   initialColumns.filter((col) => !col.alwaysVisible).map((col) => col.id)
  // );
  // const [searchTerm, setSearchTerm] = useState("");
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

  // const handleSearchChange = (event) => {
  //   setSearchTerm(event.target.value.toLowerCase());
  // };

  // const handleRefresh = () => {
  //   setSearchTerm("");
  //   setActiveFilter("");
  //   // Reset selected columns except those marked as alwaysVisible
  //   setSelectedColumns(
  //     initialColumns.filter((col) => !col.alwaysVisible).map((col) => col.id)
  //   );
  // };

  // const handleColumnSelectionChange = (event) => {
  //   const value = event.target.value;
  //   setSelectedColumns(typeof value === "string" ? value.split(",") : value);
  // };

  const handleFilterClick = (filter, newfilterdId) => {
    setActiveFilter(activeFilter === filter ? "" : filter);
    setFilterdId(newfilterdId); // Toggle filter
  };

  // Apply both status filter and search term
  // const filteredData = data.filter(
  //   (item) =>
  //     (activeFilter ? item.status === activeFilter : true) &&
  //     initialColumns
  //       .filter((col) => selectedColumns.includes(col.id) || col.alwaysVisible)
  //       .some(
  //         (column) =>
  //           item[column.id] &&
  //           item[column.id].toString().toLowerCase().includes(searchTerm)
  //       )
  // );

  const [modalOpen, setModalOpen] = useState(false);

  // const handleOpenModal = () => setModalOpen(true);
  const deleteIdsFromDb = async (ids) => {
    try {
      const response = await fetch(`${backend_url}api/delete_ids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });
      const data = await response.json();
      console.log("Delete response:", data);
    } catch (error) {
      console.error("Error deleting ids:", error);
    }
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    const idsToDelete = JSON.parse(localStorage.getItem("request_id") || []);

    if ([idsToDelete].length > 0) {
      deleteIdsFromDb([idsToDelete]);

      // Optionally, clear the ids from local storage after deletion
      localStorage.removeItem("request_id");
    }
    //window.location.reload();
  };

  useEffect(() => {
    ReturnDataTable();
  }, [filterdId]);

  const ReturnDataTable = () => {
    if (filterdId == 0) {
      // console.log("Filterred ID is 1");
      return (
        <DataTable
          isAM={true}
          action_id={"AM"}
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
    //Completely Approved
    if (filterdId == 1) {
      // console.log("Filterred ID is 1");
      return (
        <DataTable
          isAM={true}
          action_id={"AM"}
          approve={true}
          url={
            backend_url +
            `api/fetch_request_am_with_status?employeeId=${employee_id}&status=5`
          }
          sendMode={setMode}
          mode={mode}
        />
      );
    }
    // Rework
    if (filterdId == 2) {
      // console.log("Filterred ID is 4");
      return (
        <DataTable
          isAM={true}
          action_id={"AM"}
          rework={true}
          url={backend_url + `api/get_draft?employeeId=${employee_id}`}
          sendMode={setMode}
          mode={mode}
        />
      );
    }
    // Blocked
    // if (filterdId == 5) {
    //   // console.log("Filterred ID is 1");
    //   return (
    //     <DataTable
    //       isAM={true}
    //       action_id={role}
    //       sendMode={setMode}
    //       url={
    //         backend_url +
    //         `api/fetch_request_am_with_status?employeeId=${employee_id}&status=5`
    //       }
    //     />
    //   );
    // }
  };

  // const handleCopyRequest = () => {
  //   handleClose(); // Close the menu
  //   console.log("Copy Request action triggered");
  // };

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
        {rules.rules.can_initiate == 1 ? (
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
              <MenuItem onClick={handleCreateRequest}>
                Create New Request
              </MenuItem>
              {/* <MenuItem onClick={handleCopyRequest}>Copy Request</MenuItem> */}
              {activeFilter == "Completely Approved" ? (
                <>
                  <MenuItem onClick={handleMergeRequest}>
                    Merge Request
                  </MenuItem>
                  <MenuItem onClick={handleBlockRequest}>
                    Block Request
                  </MenuItem>
                  <MenuItem onClick={handleExtensionOrPreclosure}>
                    Extension or Preclosure
                  </MenuItem>
                </>
              ) : null}
            </Menu>

            <CreateRequestModal
              open={modalOpen}
              handleClose={handleCloseModal}
              mode={mode ?? 0}
            />
          </div>
        ) : null}
      </Box>
      {/* {ReturnDataTable()} */}
      <DataTable />
    </div>
  );
}

export default PriceChangeRequest;
