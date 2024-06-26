/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from "react";
import PriceRequestModal from "../Generic/ViewModal";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TablePagination, IconButton, Typography } from "@mui/material";
import "./DataTable.css";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  TableSortLabel,
  Checkbox,
  ListItemText,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ViewIcon from "@mui/icons-material/Visibility";
import { useSession } from "../Login_Controller/SessionContext";
import DownloadModal from "./DownloadModal";
import BlockIcon from "@mui/icons-material/Block";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import CreateRequestModal from "./RequestModal";
function DraggableHeader({
  header,
  index,
  moveColumn,
  sortDirection,
  handleSort,
}) {
  const ref = React.useRef(null);
  const [, drop] = useDrop({
    accept: "header",
    hover(item) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      moveColumn(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [, drag, preview] = useDrag({
    type: "header",
    item: () => ({ type: "header", index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <TableCell
      ref={preview}
      sx={{
        bgcolor: "#156760",
        color: "common.white",
        fontWeight: "bold",
        height: "24px !important", // Attempting to override with !important
        "& .MuiTableSortLabel-root": {
          // Increasing specificity for potential child components
          height: "24px !important",
        },
      }}
    >
      <TableSortLabel
        active
        direction={sortDirection || "asc"}
        onClick={() => handleSort(header)}
      >
        <center>
          <h4 style={{ color: "#FFF" }}>{header}</h4>
        </center>
      </TableSortLabel>
    </TableCell>
  );
}

function ResponsiveTable({ url, rule, setRows, isRework = false }) {
  const [data, setData] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("");
  const [headers, setHeaders] = useState([]);
  const [selectedHeaders, setSelectedHeaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isExtension, setIsExtension] = useState(false);
  const [openDownloadModal, setOpenDownloadModal] = useState(false);
  const [id, setId] = useState(0);
  const [downloadRowData, setDownlaodRowData] = useState([]);
  console.log("Rework is " + isRework);

  const handleRowClick = (id) => {
    const row = data.find((item) => item.request_id === id); // Find the row in the data array
    if (!row) return; // If no row found, exit the function

    const selectedIndex = selectedRows.findIndex(
      (item) => item.request_id === id
    );
    let newSelected = [];

    if (selectedIndex === -1) {
      // Row is not currently selected, add the full row to the selected array
      newSelected = [...selectedRows, row];
    } else {
      // Row is currently selected, remove it from the array
      newSelected = selectedRows.filter((item) => item.request_id !== id);
    }

    setSelectedRows(newSelected);
    // Also update any other state that depends on selectedRows here, if necessary
    console.log(newSelected);
    setRows(newSelected);
  };

  const isSelected = (id) =>
    selectedRows.some((item) => item.request_id === id);

  const handleOpen = (row) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setOpenDownloadModal(false);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  useEffect(() => {
    console.log("URL_IS " + url);
    console.log(url);

    axios
      .get(`${url}`)
      .then((response) => {
        if (response.data) {
          console.log(response.data);
          setData(response.data);
          const initialHeaders = Object.keys(
            response.data[0].consolidatedRequest
          );
          initialHeaders.push("Actions");
          setHeaders(initialHeaders);
          setSelectedHeaders(initialHeaders);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [session.role, url]);

  const moveColumn = useCallback(
    (dragIndex, hoverIndex) => {
      const dragHeader = headers[dragIndex];
      const newHeaders = [...headers];
      newHeaders.splice(dragIndex, 1);
      newHeaders.splice(hoverIndex, 0, dragHeader);
      setHeaders(newHeaders);
    },
    [headers]
  );

  const handleSelectChange = (event) => {
    setSelectedHeaders(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // const handleSort = (header) => {
  //   if (sortHeader === header) {
  //     setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  //   } else {
  //     setSortHeader(header);
  //     setSortDirection("asc");
  //   }
  // };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  const handleViewAction = (rowData) => {
    console.log("View action for:", rowData);
    handleOpen(rowData);
    if (isRework) {
      setEditOpen(true);
    }
    // Implement your view logic here
  };

  const handleDownloadAction = (rowData) => {
    console.log(rowData.request_id);
    setDownlaodRowData(rowData);
    setId(rowData.request_id);
    console.log("Download action for:", rowData);
    setOpenDownloadModal(true);

    // Implement your download logic here
  };

  // console.log(rule["rules"] ?? "");

  const actionButtons = (rowData) => (
    <div>
      <span style={{ display: "flex" }}>
        <IconButton onClick={() => handleViewAction(rowData)}>
          <ViewIcon />
        </IconButton>
        <IconButton onClick={() => handleDownloadAction(rowData)}>
          <DownloadIcon />
        </IconButton>

        {rule["rules"].can_initiate == 1 && !isRework ? (
          <>
            <IconButton
              onClick={() => {
                console.log("Blocked clicked");
                setSelectedRow(rowData);
                console.log(rowData);
                setEditOpen(true);
                setIsBlocked(true);
              }}
            >
              <BlockIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                console.log("Extension clicked");
                setSelectedRow(rowData);
                console.log(rowData);
                setEditOpen(true);
                setIsExtension(true);
              }}
            >
              <MoreTimeIcon />
            </IconButton>
          </>
        ) : null}
      </span>
    </div>
  );

  const handleSort = (property) => {
    console.log(`Sorting by ${property}`);
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    sortData(property, isAsc ? "desc" : "asc");
  };

  const sortData = (sortBy, sortOrder) => {
    console.log(`Sorting data by ${sortBy} in ${sortOrder} order`);
    const sortedData = [...data].sort((a, b) => {
      if (a["consolidatedRequest"][sortBy] < b["consolidatedRequest"][sortBy]) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (a["consolidatedRequest"][sortBy] > b["consolidatedRequest"][sortBy]) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });
    console.log(sortedData);
    setData(sortedData);
  };

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <Paper
          sx={{
            width: "100%",
            overflowX: "auto",
            boxShadow: 2,
            borderRadius: 2,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              p: 1,
              bgcolor: "background.paper",
              borderRadius: 1,
            }}
          >
            <FormControl
              className="dataTableContainer"
              alignItems="center"
              mb={2}
              sx={{ mb: 2 }}
            >
              {/* <InputLabel id="select-label">Headers</InputLabel> */}
              <Select
                labelId="select-label"
                multiple
                value={selectedHeaders}
                onChange={handleSelectChange}
                renderValue={(selected) => `${selected.length} selected`}
              >
                {headers
                  .filter((header) => !header.includes("_id"))
                  .map((header) => (
                    <MenuItem key={header} value={header}>
                      <Checkbox
                        checked={selectedHeaders.indexOf(header) > -1}
                        className="menuItemCheckbox"
                      />
                      <ListItemText
                        primary={
                          header.replace("_", " ").charAt(0).toUpperCase() +
                          header.replace("_", " ").slice(1)
                        }
                      />
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              label=""
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ mx: 2 }}
            />
          </Box>
          <TableContainer
            component={Paper}
            sx={{ paddingLeft: 12, paddingRight: 12 }}
          >
            <Table>
              {!isMobile && (
                <TableHead>
                  <TableRow>
                    <TableCell
                      padding="checkbox"
                      sx={{
                        bgcolor: "green.dark",
                        color: "common.white",
                        fontWeight: "bold",
                      }}
                    />
                    {selectedHeaders
                      .filter((header) => !header.includes("_id"))
                      .map((header, index) => (
                        <DraggableHeader
                          key={
                            header.replace("_", " ").charAt(0).toUpperCase() +
                            header.replace("_", " ").slice(1)
                          }
                          header={
                            header.replace("_", " ").charAt(0).toUpperCase() +
                            header.replace("_", " ").slice(1)
                          }
                          index={index}
                          moveColumn={moveColumn}
                          sortDirection={orderBy === header ? order : false}
                          handleSort={() => handleSort(header)}
                        />
                      ))}
                  </TableRow>
                </TableHead>
              )}
              <TableBody>
                {isMobile
                  ? data.map((row, rowIndex) => (
                      <Box key={rowIndex}>
                        {selectedHeaders
                          .filter((header) => !header.includes("_id"))
                          .map((header) => (
                            <Typography key={header} variant="p">
                              <strong>
                                {header
                                  .replace("_", " ")
                                  .charAt(0)
                                  .toUpperCase() +
                                  header.replace("_", " ").slice(1)}
                                :{" "}
                              </strong>
                              {row.consolidatedRequest[header]}
                            </Typography>
                          ))}
                        <Box
                          mt={2}
                          display="flex"
                          justifyContent="space-between"
                        >
                          <IconButton
                            onClick={() => handleViewAction(row)}
                            sx={{
                              m: 1,
                              "&:hover": {
                                bgcolor: "secondary.light", // theme-based color
                                transform: "scale(1.1)",
                              },
                            }}
                          >
                            <ViewIcon sx={{ color: "primary.main" }} />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDownloadAction(row)}
                            sx={{
                              m: 1,
                              "&:hover": {
                                bgcolor: "secondary.light", // theme-based color
                                transform: "scale(1.1)",
                              },
                            }}
                          >
                            <DownloadIcon sx={{ color: "primary.main" }} />
                          </IconButton>
                          {/* Additional buttons here */}
                        </Box>
                      </Box>
                    ))
                  : data
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row, index) => (
                        <TableRow
                          sx={{
                            "&:nth-of-type(odd)": { bgcolor: "action.hover" },
                            "&:nth-of-type(even)": {
                              bgcolor: "background.default",
                            },
                          }}
                          key={row.request_id}
                          selected={isSelected(row.request_id)}
                          onClick={() => handleRowClick(row.request_id)}
                          role="checkbox"
                          aria-checked={isSelected(row.request_id)}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={isSelected(row.request_id)} />
                          </TableCell>
                          {selectedHeaders
                            .filter((header) => !header.includes("_id"))
                            .map((header) => (
                              <TableCell key={header}>
                                {header === "Actions" ? (
                                  actionButtons(row)
                                ) : (
                                  <p>{row.consolidatedRequest[header]}</p>
                                )}
                              </TableCell>
                            ))}
                        </TableRow>
                      ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Paper>
      </DndProvider>
      {!isRework ? (
        <PriceRequestModal
          open={open}
          handleClose={handleClose}
          data={selectedRow ?? []}
          rule={rule}
        />
      ) : (
        <></>
      )}
      <DownloadModal
        open={openDownloadModal}
        onClose={handleClose}
        id={downloadRowData.request_id}
        consolidatedRequest={downloadRowData.consolidatedRequest}
        priceRequest={downloadRowData.priceDetails}
      />
      {(editOpen || isRework) && selectedRow != undefined ? (
        <CreateRequestModal
          open={editOpen}
          handleClose={handleEditClose}
          editData={selectedRow}
          rule={rule}
          isBlocked={isBlocked}
          isExtension={isExtension}
          parentId={selectedRow.request_id}
          isRework={isRework}
        />
      ) : (
        <> </>
      )}
    </>
  );
}

export default ResponsiveTable;
