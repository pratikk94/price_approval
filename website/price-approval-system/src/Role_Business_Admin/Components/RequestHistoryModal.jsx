import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

function HistoryModal({ open, handleClose, history }) {
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
        {history ? (
          <>
            <Typography id="modal-description" sx={{ mt: 2 }}>
              Report ID: {history.report_id}
              <br />
              Status updated by ID: {history.status_updated_by_id}
              <br />
              Status: {history.status === 1 ? "Active" : "Inactive"}
              <br />
              Created By: {history.created_at}
              <br />
              Last updated at: {history.last_updated_at}
              <br />
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

export default HistoryModal;
