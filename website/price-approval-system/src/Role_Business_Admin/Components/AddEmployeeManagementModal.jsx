// SelectModal.jsx
import React, { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Dropdown from "../../components/common/Dropdown";
import Checkbox from "../../Role_Business_Admin/Components/Checkbox";
import { backend_url } from "../../util";
import SpacingWrapper from "../../components/util/SpacingWrapper";
function SelectModal() {
  const [open, setOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [empId, setEmpID] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const handleChangeName = (event) => {
    setSelectedName(event.target.value);
  };

  const handleChangeRegion = (event) => {
    setSelectedRegion(event.target.value);
  };
  const handleChangRole = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleSubmit = async (e) => {
    let formData = {
      employee_name: selectedName.split("-")[1],
      employee_id: selectedName.split("-")[0],
      role: selectedRole.split("-")[1],
      region: selectedRegion.split("-")[1],
      active: 1,
    };
    console.log(selectedName);
    console.log(formData);

    e.preventDefault();
    try {
      const response = await fetch(`${backend_url}api/add_employee_role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        // await response.json();
        alert("Role added successfully");
      } else {
        alert("Failed to add role");
      }
    } catch (error) {
      console.error("Error adding role:", error);
      alert("Error adding role");
    }
  };

  return (
    <div>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Create user
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          style: {
            width: "80vw", // Custom width

            // Add more styles as needed
          },
        }}
      >
        <DialogTitle>Select an Employee</DialogTitle>
        <DialogContent>
          <SpacingWrapper space="12px" />
          <Dropdown
            name="Employee"
            selectedItem={selectedName}
            onChange={handleChangeName}
            url={`${backend_url}api/fetch_employees`}
          />
          <SpacingWrapper space="12px" />
          <Dropdown
            name="Role"
            selectedItem={selectedRole}
            onChange={handleChangRole}
            url={`${backend_url}api/fetch_roles`}
          />
          <SpacingWrapper space="12px" />
          <Dropdown
            name="Region"
            selectedItem={selectedRegion}
            onChange={handleChangeRegion}
            url={`${backend_url}api/fetch_sales_regions`}
          />
          <Checkbox />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={(e) => {
              setOpen(false);
              handleSubmit(e);
            }}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SelectModal;
