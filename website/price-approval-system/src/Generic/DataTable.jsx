import React, { useState, useEffect, useCallback } from "react";
import PriceRequestModal from "../Generic/ViewModal";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TablePagination, IconButton } from "@mui/material";
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
import { backend_mvc } from "../util";

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
    <TableCell ref={preview}>
      <TableSortLabel
        active
        direction={sortDirection || "asc"}
        onClick={() => handleSort(header)}
      >
        {header}
      </TableSortLabel>
    </TableCell>
  );
}

function ResponsiveTable() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedHeaders, setSelectedHeaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortHeader, setSortHeader] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleOpen = (row) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    axios
      .get(`${backend_mvc}api/data/` + session.role)
      .then((response) => {
        if (response.data.length > 0) {
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
  }, [session.role]);

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

  const handleSort = (header) => {
    if (sortHeader === header) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortHeader(header);
      setSortDirection("asc");
    }
  };

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
    // Implement your view logic here
  };

  const handleDownloadAction = (rowData) => {
    console.log("Download action for:", rowData);
    // Implement your download logic here
  };

  const actionButtons = (rowData) => (
    <TableCell>
      <IconButton onClick={() => handleViewAction(rowData)}>
        <ViewIcon />
      </IconButton>
      <IconButton onClick={() => handleDownloadAction(rowData)}>
        <DownloadIcon />
      </IconButton>
    </TableCell>
  );

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <Paper sx={{ width: "100%", overflowX: "auto" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <FormControl>
              <InputLabel id="select-label">Headers</InputLabel>
              <Select
                labelId="select-label"
                multiple
                value={selectedHeaders}
                onChange={handleSelectChange}
                renderValue={(selected) => `${selected.length} selected`}
              >
                {headers.map((header) => (
                  <MenuItem key={header} value={header}>
                    <Checkbox checked={selectedHeaders.indexOf(header) > -1} />
                    <ListItemText primary={header} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Search"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Box>
          <TableContainer component={Paper}>
            <Table>
              {!isMobile && (
                <TableHead>
                  <TableRow>
                    {selectedHeaders.map((header, index) => (
                      <DraggableHeader
                        key={header}
                        header={header}
                        index={index}
                        moveColumn={moveColumn}
                        sortDirection={
                          sortHeader === header ? sortDirection : false
                        }
                        handleSort={handleSort}
                      />
                    ))}
                  </TableRow>
                </TableHead>
              )}
              <TableBody>
                {isMobile
                  ? selectedHeaders.map((header, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {header}
                        </TableCell>
                        {data.map((row, rowIndex) => (
                          <TableCell key={rowIndex}>
                            {header === "Actions"
                              ? actionButtons(row)
                              : row.consolidatedRequest[header]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : data
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row, index) => (
                        <TableRow key={index}>
                          {selectedHeaders.map((header) => (
                            <TableCell key={header}>
                              {header === "Actions"
                                ? actionButtons(row)
                                : row.consolidatedRequest[header]}
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
      <PriceRequestModal
        open={open}
        handleClose={handleClose}
        data={selectedRow ?? []}
      />
    </>
  );
}

export default ResponsiveTable;
