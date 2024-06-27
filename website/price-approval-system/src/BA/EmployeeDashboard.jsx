import React, { useEffect, useState } from "react";
import axios from "axios";
import { backend_mvc } from "../util";
import RoleModal from "./RoleModal"; // Import the RoleModal component
import {
  Button,
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
  const [modalOpen, setModalOpen] = useState(false); // State to control modal visibility

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${backend_mvc}api/data/fetchRoles`);
        console.log(response);
        setRows(response.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  // Function to toggle modal open/close
  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  return (
    <div>
      <button
        color="primary"
        onClick={toggleModal}
        style={{
          backgroundColor: "#156760",
          marginBottom: "16px",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Add New Employee
      </button>
      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: "96vw", height: "70vh" }}
          aria-label="simple table"
        >
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
      <RoleModal open={modalOpen} handleClose={toggleModal} />
    </div>
  );
}
