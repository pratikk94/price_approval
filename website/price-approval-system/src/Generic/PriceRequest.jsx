/* eslint-disable react/prop-types */
/* eslint-disable no-sparse-arrays */
import { useEffect, useState } from "react";
import { Typography, Box, MenuItem, Button, Menu } from "@mui/material";

import DataTable from "./DataTable";
import { backend_mvc, backend_url, statusFilters } from "../util";

import CreateRequestModal from "./RequestModal";
import { useSession } from "../Login_Controller/SessionContext";
// import { set } from "date-fns";

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
``;
function PriceChangeRequest(rules, employee_id) {
  let statusFiltersValues = [];
  console.log(rules);

  if (rules.rules.can_initiate == 1) {
    statusFiltersValues = [
      ...statusFiltersValues,
      Array.from(statusFilters.values())[0], //draft
      Array.from(statusFilters.values())[6], //approved
      Array.from(statusFilters.values())[3], //rejected
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
  const [activeFilter, setActiveFilter] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [mode, setMode] = useState("0");
  const [modalOpen, setModalOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [copyOrMege, setCopyOrMerge] = useState(false);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Assuming this is the function triggered by "Create Request"
  const handleCreateRequest = () => {
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
    if (newfilterdId != filterdId) {
      setActiveFilter(activeFilter === filter ? "" : filter);
      setFilterdId(newfilterdId);
    } // Toggle filter
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

  const [component, setComponent] = useState(null);

  useEffect(() => {
    // ReturnDataTable();
    console.log("Working" + filterdId);
    //Completely Approved
    if (statusFiltersValues[filterdId] == "Approved") {
      console.log("Filterred ID is 1");
      setComponent(
        <DataTable
          url={`${backend_mvc}api/data/` + session.role + "/1"}
          rule={rules}
          setRows={handleRowsSelection}
        />
      );
    } else if (statusFiltersValues[filterdId] == "Rework") {
      console.log("Filterred ID is 1");
      setActiveFilter("Rework");
      setComponent(
        <DataTable
          url={`${backend_mvc}api/data/` + session.role + "/3"}
          rule={rules}
          setRows={handleRowsSelection}
          isRework={true}
        />
      );
    } else if (statusFiltersValues[filterdId] == "Draft") {
      console.log("Filterred ID is 1");
      setActiveFilter("Draft");
      setComponent(
        <DataTable
          url={`${backend_mvc}api/data/` + session.role + "/5 "}
          rule={rules}
          setRows={handleRowsSelection}
          isRework={true}
        />
      );
    } else if (statusFiltersValues[filterdId] == "Pending") {
      console.log("Filterred ID is 1");
      setActiveFilter("Pending");
      setComponent(
        <DataTable
          url={`${backend_mvc}api/data/` + session.role + "/0 "}
          rule={rules}
          setRows={handleRowsSelection}
          isRework={false}
        />
      );
    } else if (statusFiltersValues[filterdId] == "Rejected") {
      console.log("Filterred ID is 1");
      setActiveFilter("Rejected");
      setComponent(
        <DataTable
          url={`${backend_mvc}api/data/` + session.role + "/-2 "}
          rule={rules}
          setRows={handleRowsSelection}
          isRework={false}
        />
      );
    }
  }, [filterdId, rules]);

  const { session } = useSession();

  const handleRowsSelection = (selectedRows) => {
    setRows(selectedRows);
  };

  // const ReturnDataTable = () => {
  //   console.log(filterdId);
  //   console.log(statusFiltersValues[filterdId]);

  //   //Completely Approved
  //   if (statusFiltersValues[filterdId] == "Approved") {
  //     console.log("Filterred ID is 1");
  //     return (
  //       <DataTable
  //         url={`${backend_mvc}api/data/` + session.role + "/1"}
  //         rule={rules}
  //       />
  //     );
  //   } else if (statusFiltersValues[filterdId] == "Rework") {
  //     return (
  //       <DataTable
  //         url={`${backend_mvc}api/data/` + session.role + "/3"}
  //         rule={rules}
  //       />
  //     );
  //   }

  //   // Rework
  //   else {
  //     // console.log("Filterred ID is 4");
  //     return (
  //       <DataTable
  //         url={`${backend_mvc}api/data/` + session.role + "/0"}
  //         rule={rules}
  //       />
  //     );
  //   }
  //   // Blocked
  //   // if (filterdId == 5) {
  //   //   // console.log("Filterred ID is 1");
  //   //   return (
  //   //     <DataTable
  //   //       isAM={true}
  //   //       action_id={role}
  //   //       sendMode={setMode}
  //   //       url={
  //   //         backend_url +
  //   //         `api/fetch_request_am_with_status?employeeId=${employee_id}&status=5`
  //   //       }
  //   //     />
  //   //   );
  //   // }
  // };

  // const handleCopyRequest = () => {
  //   handleClose(); // Close the menu
  //   console.log("Copy Request action triggered");
  // };

  const handleMergeRequest = () => {
    handleClose(); // Close the menu
    console.log("Merge Request action triggered");
    setCopyOrMerge(true);
  };

  const handleCopyRequest = () => {
    handleClose(); // Close the menu
    console.log("Copy Request action triggered");
    setCopyOrMerge(true);
    const mergedRows = rows.reduce((accumulator, row) => {
      // Check if the fsc and mapping variables match any existing entry in the accumulator
      const existingEntry = accumulator.find(
        (accRow) => accRow.fsc === row.fsc && accRow.mapping === row.mapping
      );

      // If there's no match, add the current row to the accumulator
      if (!existingEntry) {
        return [...accumulator, row];
      }

      // If there's a match, don't add the current row to the accumulator
      return accumulator;
    }, []);
    setRows(mergedRows);
  };

  const handleEditClose = () => {
    setCopyOrMerge(false);
  };

  console.log("Rows", rows);

  return (
    <div style={{ width: "97vw", height: "96vh" }}>
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
              <Typography variant="h6">{filter}</Typography>
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
              <Typography variant="h5">+ Create request</Typography>
            </Button>
            <Menu
              id="actions-menu"
              anchorEl={anchorEl}
              keepMounted
              open={open}
              onClose={handleClose}
            >
              <MenuItem
                onClick={() => {
                  setModalOpen(true);
                  handleCreateRequest();
                }}
              >
                <Typography variant="h6">Create New Request</Typography>
              </MenuItem>
              <MenuItem onClick={handleCopyRequest}>
                <Typography variant="h6">Copy Request</Typography>
              </MenuItem>

              <MenuItem onClick={handleMergeRequest}>
                <Typography variant="h6">Merge Request</Typography>
              </MenuItem>
            </Menu>

            <CreateRequestModal
              open={modalOpen}
              handleClose={handleCloseModal}
              mode={mode ?? 0}
            />
          </div>
        ) : null}
      </Box>
      {component}
      {copyOrMege && rows.length > 0 ? (
        <CreateRequestModal
          open={copyOrMege}
          handleClose={handleEditClose}
          editData={rows[0]}
          rule={rules}
          isBlocked={false}
          isExtension={false}
          // parentId={rows[0].request_id}
        />
      ) : (
        <> </>
      )}
      {/* <DataTable/> */}
    </div>
  );
}

export default PriceChangeRequest;
