/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TablePagination } from "@mui/material";

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
  useEffect(() => {
    axios
      .get(`http:/${backend_mvc}:3000/api/data/` + session.role)
      .then((response) => {
        if (response.data.length === 0) {
          setData(response.data);
          if (response.data.length > 0) {
            const initialHeaders = Object.keys(
              response.data[0].consolidatedRequest
            );
            setHeaders(initialHeaders);

            setSelectedHeaders(initialHeaders);
          }
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

  const filteredData = data
    .filter((row) =>
      selectedHeaders.some((header) =>
        row.consolidatedRequest[header]
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    )
    .sort(
      (a, b) =>
        (a.consolidatedRequest[sortHeader] < b.consolidatedRequest[sortHeader]
          ? -1
          : 1) * (sortDirection === "asc" ? 1 : -1)
    );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
                        {filteredData.map((row, rowIndex) => (
                          <TableCell key={rowIndex}>
                            {row.consolidatedRequest[header]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : filteredData
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row, index) => (
                        <TableRow key={index}>
                          {selectedHeaders.map((header) => (
                            <TableCell key={header}>
                              {row.consolidatedRequest[header]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Paper>
      </DndProvider>
    </>
  );
}

export default ResponsiveTable;
