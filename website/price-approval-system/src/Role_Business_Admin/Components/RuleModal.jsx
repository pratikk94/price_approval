import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

function RuleModal({ open, handleClose, rule }) {
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
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="div">
          Rule Details
        </Typography>
        <Typography id="modal-description" sx={{ mt: 2 }}>
          Name: {rule.name}
          <br />
          Region: {rule.region}
          <br />
          Profit Center: {rule.profit_center}
          <br />
          Valid From: {rule.valid_from}
          <br />
          Valid To: {rule.valid_to}
          <br />
          Approvers: {rule.approvers}
          <br />
          Status: {rule.status === 1 ? "Active" : "Inactive"}
          <br />
          Created By: {rule.created_by}
          <br />
          Created Date: {rule.created_date}
          <br />
          Approver Names: {rule.approver_names}
        </Typography>
        <Button onClick={handleClose} style={{ marginTop: "20px" }}>
          Close
        </Button>
      </Box>
    </Modal>
  );
}

export default RuleModal;
