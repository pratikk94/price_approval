import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

function EmployeeDetailsModal({ open, handleClose, employeeData }) {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="employee-modal-title"
      aria-describedby="employee-modal-description"
    >
      <Box sx={style}>
        <Typography id="employee-modal-title" variant="h6" component="h2">
          Employee Details
        </Typography>
        {employeeData ? (
          <>
            <Typography>Name: {employeeData.employee_name}</Typography>
            <Typography>Employee ID: {employeeData.employee_id}</Typography>
            <Typography>Role: {employeeData.role}</Typography>
            <Typography>Region: {employeeData.region}</Typography>
            <Typography>Created By: {employeeData.created_by}</Typography>
            <Typography>Created Date: {employeeData.created_date}</Typography>
            <Typography>
              Status: {employeeData.active === 1 ? "Active" : "Inactive"}
            </Typography>
          </>
        ) : null}
        <Button onClick={handleClose} style={{ marginTop: "20px" }}>
          Close
        </Button>
      </Box>
    </Modal>
  );
}

export default EmployeeDetailsModal;
