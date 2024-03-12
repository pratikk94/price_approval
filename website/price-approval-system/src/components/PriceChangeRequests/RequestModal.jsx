import React, { useState } from "react";
import {
  Box,
  Typography,
  Modal,
  Grid,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableRow,
  IconButton,
  TableCell,
  TableHead,
  Select,
} from "@mui/material";
import {
  AddCircle as AddCircleIcon,
  CheckBox,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import TableWithInputs from "./TableWithInputs";
import CustomerSelect from "./CustomerSelect";
import SpacingWrapper from "../util/SpacingWrapper";
import PaymentTerms from "./PaymentTerms";
import Plant from "./Plant";
import DateSelector from "./DateSelector";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  height: "80vh", // Adjusted for better layout
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  overflowY: "auto", // In case of overflow
};
const checkboxOptions = [
  "Agreed Price",
  "Special Discount",
  "Reel Discount",
  "Pack Upcharge",
  "TPC",
  "Offline Disc",
];
const CreateRequestModal = ({ open, handleClose }) => {
  // Simplified example, implement your form submission logic here
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Form data", { tableRows });
    handleClose(); // Close modal after submission, you might want to do this after successful submission
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="create-request-modal"
      aria-describedby="create-request-modal-description"
    >
      <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
        <Typography
          id="create-request-modal-title"
          variant="h6"
          component="h2"
          marginBottom={2}
        >
          Create New Request
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <SpacingWrapper space="12px" />
            <CustomerSelect id={1} name={"customer"} />
            <SpacingWrapper space="12px" />
            <FormControlLabel
              control={
                <Checkbox
                  //checked={checked}
                  //onChange={handleChange}
                  icon={<CheckBoxOutlineBlankIcon fontSize="medium" />}
                  checkedIcon={<CheckBoxIcon fontSize="medium" />}
                />
              }
              label="All customers for all consignees"
            />{" "}
            <SpacingWrapper space="12px" />
            <CustomerSelect id={3} name={"end use"} />
            <SpacingWrapper space="12px" />
            <Plant />
            <SpacingWrapper space="12px" />
            <PaymentTerms />
            <SpacingWrapper space="12px" />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <DateSelector name={"valid from"} />
              </Grid>
              <Grid item xs={6}>
                <DateSelector name={"valid to"} />
              </Grid>
            </Grid>
            <SpacingWrapper space="12px" />
          </Grid>
          <Grid item xs={6}>
            <SpacingWrapper space="12px" />
            <CustomerSelect id={2} name={"consignee"} />

            <SpacingWrapper space="12px" />

            <SpacingWrapper space="61.5px" />

            {/* Additional inputs and layout for column 2 */}
          </Grid>
        </Grid>

        <SpacingWrapper space="24px" />
        <Typography>Select pricing conditions</Typography>
        <TableWithInputs />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </Box>
        <Box textAlign="center" marginTop={2}>
          <Button type="submit" variant="contained">
            Submit
          </Button>
          {/* <IconButton onClick={handleAddRow}>
            <AddCircleIcon />
          </IconButton> */}
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateRequestModal;
