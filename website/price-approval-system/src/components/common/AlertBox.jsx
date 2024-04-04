import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

function AlertBox({ isOpen, onClose, onConfirm, title, message, isUpdate }) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      {!isUpdate && (
        <DialogActions>
          <Button onClick={onClose} color="primary">
            No
          </Button>
          <Button onClick={onConfirm} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      )}
      {isUpdate && (
        <DialogActions>
          <Button
            onClick={(e) => {
              onClose(3);
              // window.location.reload();
            }}
            color="primary"
            autoFocus
          >
            OK
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

export default AlertBox;
