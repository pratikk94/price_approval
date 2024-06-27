import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import axios from "axios";
import { backend_mvc } from "../util";

function RoleModal({ open, handleClose }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    employee_name: "",
    role: "",
    region: "",
    created_by: "",
    created_date: "",
    active: true,
  });
  const [employees, setEmployees] = useState([]);
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${backend_mvc}api/data/fetchRoles`); // Update URL as necessary
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    const fetchRegions = async () => {
      try {
        const response = await axios.get(
          `${backend_mvc}api/fetch_sales_regions`
        ); // Update URL as necessary
        setRegions(response.data[0]);
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    };

    fetchEmployees();
    fetchRegions();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSelectEmployee = (event) => {
    const selectedEmployee = employees.find(
      (emp) => emp.id === event.target.value
    );
    setFormData({
      ...formData,
      employee_id: selectedEmployee.employee_id,
      employee_name: selectedEmployee.employee_name,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New Role</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To add a role, please enter the following details.
        </DialogContentText>
        <FormControl fullWidth margin="dense">
          <InputLabel id="employee-select-label">Employee</InputLabel>
          <Select
            labelId="employee-select-label"
            id="employee-select"
            value={formData.employee_id}
            label="Employee"
            onChange={handleSelectEmployee}
            name="employee_id"
          >
            {employees.map((employee) => (
              <MenuItem key={employee.id} value={employee.id}>
                {employee.employee_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel id="region-select-label">Sales Region</InputLabel>
          <Select
            labelId="region-select-label"
            id="region-select"
            value={formData.region}
            label="Sales Region"
            onChange={handleChange}
            name="region"
          >
            {regions.map((region) => (
              <MenuItem key={region.id} value={region.name}>
                {region.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          id="role"
          label="Role"
          type="text"
          fullWidth
          variant="standard"
          name="role"
          value={formData.role}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          id="created_by"
          label="Created By"
          type="text"
          fullWidth
          variant="standard"
          name="created_by"
          value={formData.created_by}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          id="created_date"
          label="Created Date"
          type="date"
          fullWidth
          variant="standard"
          name="created_date"
          value={formData.created_date}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          margin="dense"
          id="active"
          label="Active"
          type="checkbox"
          fullWidth
          variant="standard"
          name="active"
          checked={formData.active}
          onChange={(event) =>
            setFormData({ ...formData, active: event.target.checked })
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={() => handleSubmit(formData)}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RoleModal;
