import React, { useState } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import axios from "axios";
import ApproverSelect from "./ApproverSelect";
import { Check } from "@mui/icons-material";
import CustomCheckbox from "./Checkbox";

function RuleEditModal({ open, handleClose, rule, onRuleUpdated }) {
  const [editedRule, setEditedRule] = useState({ ...rule });
  const [selectedCustomers, setSelectedCustomers] = useState([
    rule.approver_names,
  ]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditedRule((prevRule) => ({
      ...prevRule,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(
        `http://localhost:3000/api/update_rule/${editedRule.id}`,
        editedRule
      );
      onRuleUpdated(editedRule); // Callback to inform parent component about the update
      handleClose();
    } catch (error) {
      console.error("Error updating rule:", error);
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
            label="Name"
            type="text"
            value={editedRule.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="normal"
            fullWidth
            name="name"
            label="Region"
            type="text"
            value={editedRule.region}
            onChange={handleInputChange}
          />
          <TextField
            margin="normal"
            fullWidth
            name="name"
            label="Profit center"
            type="text"
            value={editedRule.profit_center}
            onChange={handleInputChange}
          />
          <TextField
            margin="normal"
            fullWidth
            name="name"
            label="Valid from"
            type="text"
            value={editedRule.valid_from}
            onChange={handleInputChange}
          />
          <TextField
            margin="normal"
            fullWidth
            name="name"
            label="Valid to"
            type="text"
            value={editedRule.valid_to}
            onChange={handleInputChange}
          />
          <ApproverSelect
            name={"approver"}
            setApprover={setSelectedCustomers}
            prevSetApprovers={editedRule.approver_names}
          />
          <CustomCheckbox isSelcted={editedRule.status} />
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

export default RuleEditModal;
