import { useEffect, useState } from "react";
import { backend_mvc } from "../util";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

export default function EmployeeDashboard() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`${backend_mvc}api/all_roles`);
        console.log(response);
        setRows(response.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: "96vw" }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Employee Name</TableCell>
            <TableCell>Employee ID</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Region</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Created Date</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.employee_name}</TableCell>
              <TableCell>{row.employee_id}</TableCell>
              <TableCell>{row.role}</TableCell>
              <TableCell>{row.region}</TableCell>
              <TableCell>{row.created_by}</TableCell>
              <TableCell>{row.created_date}</TableCell>
              <TableCell>{row.active ? "Yes" : "No"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
