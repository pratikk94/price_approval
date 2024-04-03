import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import ApproverSelect from "./ApproverSelect";
import CustomCheckbox from "./Checkbox";
import { backend_url } from "../../util";
import DateSelector from "../../components/common/DateSelector";
function EmployeeEditModal({ open, handleClose, employeeData }) {
  console.log(employeeData);
  const [editedEmployee, setEditedEmployee] = useState({ ...employeeData });
  const [role, setRole] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [active, setActive] = useState(false);
  const handleChangeRegion = (event) => {
    setSelectedRegion(event.target.value);
  };

  const handleChangeRole = (event) => {
    setSelectedRole(event.target.value);
  };

  useEffect(() => {
    const fetchRegions = async () => {
      const response = await fetch(`${backend_url}api/fetch_sales_regions`);
      const data = await response.json();
      console.log(data);
      setRegions(data);
    };

    const fetchRole = async () => {
      const response = await fetch(`${backend_url}api/fetch_roles`);
      const data = await response.json();
      console.log(data);
      setRole(data);
    };

    fetchRegions();
    fetchRole();

    if (employeeData != undefined) {
      setSelectedRegion(employeeData.region);
      setSelectedRole(employeeData.role);
    }
  }, [employeeData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(active);
    try {
      editedEmployee.role = selectedRole ?? employeeData.role;
      editedEmployee.region = selectedRegion ?? employeeData.region;
      editedEmployee.active = active;
      editedEmployee.employee_id = employeeData.employee_id;
      editedEmployee.employee_name = employeeData.employee_name;
      console.log(editedEmployee);

      const response = await fetch(`${backend_url}api/update-employee-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedEmployee),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(result);
      alert("Rule updated successfully:", result);
      handleClose();
    } catch (error) {
      console.error("Failed to update rule:", error);
      alert("Failed to update rule");
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="edit-rule-modal-title"
      aria-describedby="edit-rule-modal-description"
    >
      <Box sx={{ ...style, width: 500 }}>
        <Typography id="edit-rule-modal-title" variant="h6" component="div">
          Edit Rule
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            fullWidth
            name="name"
            type="text"
            value={
              employeeData != undefined
                ? employeeData["employee_name"]
                : editedEmployee["employee_name"]
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={selectedRole}
              name="role"
              onChange={(e) => {
                handleChangeRole(e);

                // Clear customers on region change
              }}
            >
              {role.map((role) => (
                <MenuItem key={role.id} value={role.name}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Region</InputLabel>
            <Select
              value={selectedRegion}
              name="region"
              onChange={(e) => {
                handleChangeRegion(e);

                console.log(e.target.value);
                // fetchCustomers(e.target.value); // Clear customers on region change
              }}
              label="region"
            >
              {regions.map((region) => (
                <MenuItem key={region.id} value={region.name}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <CustomCheckbox
            isSelcted={
              employeeData != undefined ? employeeData.active == 1 : false
            }
            setValue={setActive}
          />
          <div></div>
          {/* Add more input fields for each property you want to be editable */}
          <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
            Save Changes
          </Button>
          <Button
            onClick={handleClose}
            color="error"
            variant="outlined"
            sx={{ mt: 3, mb: 2, ml: 2 }}
          >
            Cancel
          </Button>
        </form>
      </Box>
    </Modal>
  );
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default EmployeeEditModal;
