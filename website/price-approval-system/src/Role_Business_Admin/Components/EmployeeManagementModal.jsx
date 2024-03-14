// SelectModal.jsx
import React, { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Dropdown from "../../components/common/Dropdown";
import { backend_url } from "../../util";
import SpacingWrapper from "../../components/util/SpacingWrapper";
function SelectModal() {
  const [open, setOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");
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
      role: selectedRole,
      region: selectedRegion,
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
        Open Select Modal
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          style: {
            width: "80vw", // Custom width
            height: "30vh", // Custom height
            // Add more styles as needed
          },
        }}
      >
        <DialogTitle>Select an Item</DialogTitle>
        <DialogContent>
          <SpacingWrapper space="12px" />
          <Dropdown
            selectedItem={selectedName}
            onChange={handleChangeName}
            url={`${backend_url}api/fetch_employees`}
          />
          <SpacingWrapper space="12px" />
          <Dropdown
            selectedItem={selectedRole}
            onChange={handleChangRole}
            url={`${backend_url}api/fetch_roles`}
          />
          <SpacingWrapper space="12px" />
          <Dropdown
            selectedItem={selectedRegion}
            onChange={handleChangeRegion}
            url={`${backend_url}api/fetch_region`}
          />
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
