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
import ApproverSelect from "./ApproverSelect";
import { Check } from "@mui/icons-material";
import CustomCheckbox from "./Checkbox";
import { backend_url } from "../../util";
import DateSelector from "../../components/common/DateSelector";
function RuleEditModal({ open, handleClose, rule, onRuleUpdated }) {
  const [editedRule, setEditedRule] = useState({ ...rule });

  const [regions, setRegions] = useState([]);
  const [profitCenter, setProfitCenter] = useState([]);
  const [validFrom, setValidFrom] = useState([]);
  const [validTo, setValidTo] = useState([]);

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProfitCenter, setSelectedProfitCenter] = useState([]);

  const [selectedCustomers, setSelectedCustomers] = useState([
    rule.approver_names,
  ]);
  const handleChangeRegion = (event) => {
    setSelectedRegion(event.target.value);
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    console.log(event.target);
    setEditedRule((prevRule) => ({
      ...prevRule,
      [name]: value,
    }));
  };
  useEffect(() => {
    const fetchRegions = async () => {
      const response = await fetch(`${backend_url}api/fetch_region`);
      const data = await response.json();
      setRegions(data);
    };

    const fetchProfitCenters = async () => {
      const response = await fetch(`${backend_url}api/fetch_profit_centers`);
      const data = await response.json();
      setProfitCenter(data);
    };

    fetchRegions();
    fetchProfitCenters();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // try {
    //   console.log(editedRule);
    //   await axios.put(
    //     `${backend_url}api/update_rule/${editedRule.id}`,
    //     editedRule
    //   );
    //   onRuleUpdated(editedRule); // Callback to inform parent component about the update
    //   handleClose();
    // } catch (error) {
    //   console.error("Error updating rule:", error);
    // }

    try {
      console.log(typeof selectedCustomers);
      console.log(selectedCustomers);
      editedRule.approvers = selectedCustomers.map((item) =>
        parseInt(item.value)
      );
      editedRule.valid_from = validFrom;
      editedRule.valid_to = validTo;
      console.log(editedRule);

      const response = await fetch(
        `${backend_url}api/update-rule/${editedRule.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedRule),
        }
      );

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
            label="Name"
            type="text"
            value={editedRule.name}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Profit Center</InputLabel>
            <Select
              label="Profit center"
              value={selectedProfitCenter}
              multiple
              name="profit_center"
              onChange={(e) => {
                setSelectedProfitCenter(e.target.value);
                handleInputChange(e);
                // Clear customers on region change
              }}
            >
              {profitCenter.map((role) => (
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
                setSelectedRegion(e.target.value);
                handleInputChange(e);
                console.log(e.target.value);
                // fetchCustomers(e.target.value); // Clear customers on region change
              }}
              label="Region"
            >
              {regions.map((region) => (
                <MenuItem key={region.id} value={region.name}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <DateSelector name={"valid from"} setSelection={setValidFrom} />
            </Grid>
            <Grid item xs={6}>
              <DateSelector name={"valid to"} setSelection={setValidTo} />
            </Grid>
          </Grid>
          {/* <TextField
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
          /> */}
          <ApproverSelect
            name={"approver"}
            setApprover={setSelectedCustomers}
            prevSetApprovers={selectedCustomers}
            region={selectedRegion}
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
