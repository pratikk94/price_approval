// src/RuleEditModal.js
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
import axios from "axios";
import SpacingWrapper from "../components/util/SpacingWrapper";

const backend_url = "http://192.168.1.103:3000/";

const RuleEditModal = ({ open, handleClose, onRuleUpdated }) => {
  const [rules, setRules] = useState([]);
  const [approvers, setApprovers] = useState([
    "AM",
    "RM",
    "NSM/NSMT",
    "HDSM",
    "Validator",
  ]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [selectedApprovers, setSelectedApprovers] = useState([]);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await axios.get(
          `${backend_url}api/sales_office/Sales office North`
        );
        setRules(response.data);
        if (response.data.length > 0) {
          const firstRule = response.data[0];
          setSelectedRule(firstRule);
          setValidFrom(firstRule.valid_from);
          setValidTo(firstRule.valid_to);
          setSelectedApprovers(Array(firstRule.level).fill(""));
        }
      } catch (error) {
        console.error("Failed to fetch rules:", error);
      }
    };

    fetchRules();
  }, []);

  const handleApproverChange = (index, event) => {
    const newApprovers = [...selectedApprovers];
    newApprovers[index] = event.target.value;
    setSelectedApprovers(newApprovers);

    // Remove all approvers below the selected one
    for (let i = index + 1; i < newApprovers.length; i++) {
      newApprovers[i] = "";
    }
    setSelectedApprovers(newApprovers);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const updatedRule = {
        ...selectedRule,
        valid_from: validFrom,
        valid_to: validTo,
        approver_names: selectedApprovers,
      };

      const response = await axios.put(
        `${backend_url}api/update_rule/${updatedRule.id}`,
        updatedRule
      );

      if (!response.status === 200) {
        throw new Error(`Error: ${response.statusText}`);
      }

      onRuleUpdated(updatedRule); // Callback to inform parent component about the update
      handleClose();
    } catch (error) {
      console.error("Failed to update rule:", error);
      alert("Failed to update rule");
    }
  };

  const getAvailableApprovers = (currentIndex) => {
    if (currentIndex === 0) {
      return approvers;
    }

    const previousApprover = selectedApprovers[currentIndex - 1];
    const previousApproverIndex = approvers.indexOf(previousApprover);
    return approvers.slice(previousApproverIndex + 1);
  };

  if (!selectedRule) {
    return <Typography>Loading...</Typography>;
  }

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
            value={selectedRule.name}
            onChange={(e) =>
              setSelectedRule({ ...selectedRule, name: e.target.value })
            }
          />
          <SpacingWrapper space={"20px"} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Valid From"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Valid To"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">Approvers</Typography>
            {selectedApprovers.map((approver, index) => (
              <FormControl key={index} fullWidth margin="normal">
                <InputLabel>{`Approver ${index + 1}`}</InputLabel>
                <Select
                  value={approver}
                  onChange={(e) => handleApproverChange(index, e)}
                >
                  {getAvailableApprovers(index).map((a, idx) => (
                    <MenuItem key={idx} value={a}>
                      {a}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
            <Button
              variant="contained"
              onClick={() => setSelectedApprovers([...selectedApprovers, ""])}
              sx={{ mt: 2 }}
            >
              Add Approver
            </Button>
          </Box>
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
};

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
