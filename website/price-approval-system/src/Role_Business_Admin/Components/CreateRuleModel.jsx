import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
} from "@mui/material";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { backend_url } from "../../util";
import SpacingWrapper from "../../components/util/SpacingWrapper";
import CustomInput from "./CustomDateInput";

import CustomCheckbox from "./Checkbox";
import ApproverSelect from "./ApproverSelect";
function ModalComponent() {
  const [open, setOpen] = useState(false);
  const [regions, setRegions] = useState([]);
  const [profitCenter, setProfitCenter] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProfitCenter, setSelectedProfitCenter] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [validTo, setValidTo] = useState(new Date());
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [role, setRole] = useState("");

  const handleChange = (event) => {
    setRole(event.target.value);
  };

  const fetchCustomers = async () => {
    const response = await fetch(
      `${backend_url}api/fetch_approvers?region=${selectedRegion}`
    );
    const data = await response.json();
    setCustomers(data);
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

  const handleCustomerSelectionChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedCustomers(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button variant="outlined" onClick={handleOpen}>
        Open Modal
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Create rule</DialogTitle>

        <DialogContent>
          <div style={{ height: "56vh" }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth margin="normal">
                  <TextField
                    label="Rule name"
                    variant="outlined"
                    value={role}
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "7vh", // Set the height of the input
                      },
                      "& .MuiOutlinedInput-input": {
                        height: "100%", // Ensure the inner input height matches the container
                        padding: "0px 8px", // Adjust padding as needed
                      },
                    }}
                    onChange={handleChange}
                  />
                  <SpacingWrapper space="2px" />
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Profit Center</InputLabel>
                  <Select
                    label="Profit center"
                    value={selectedProfitCenter}
                    onChange={(e) => {
                      setSelectedProfitCenter(e.target.value);
                      setCustomers([]);
                      setSelectedCustomers([]); // Clear customers on region change
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
                    onChange={(e) => {
                      setSelectedRegion(e.target.value);
                      setCustomers([]);
                      setSelectedCustomers([]); // Clear customers on region change
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
                <CustomCheckbox />
                {/* Additional inputs like Valid From and Valid To */}
              </Grid>
              <Grid item xs={6}>
                {/* Other inputs for Column 2 */}
                <SpacingWrapper space="16px" />

                <div style={{ margin: "0 auto" }}>
                  <ReactDatePicker
                    name="Valid From"
                    selected={selectedDate} // Set the selected date
                    onChange={(date) => setSelectedDate(date)} // Update the selected date
                    dateFormat="MMMM d, yyyy" // Format the displayed date
                    customInput={<CustomInput />} // Use a custom input
                  />
                </div>
                <SpacingWrapper space="28px" />
                <div style={{ margin: "0 auto" }}>
                  <ReactDatePicker
                    name="Valid to"
                    selected={selectedDate} // Set the selected date
                    onChange={(date) => setSelectedDate(date)} // Update the selected date
                    dateFormat="MMMM d, yyyy" // Format the displayed date
                    customInput={<CustomInput />} // Use a custom input
                  />
                </div>
                <SpacingWrapper space="24px" />
                <ApproverSelect
                  name={"approver"}
                  setApprover={setSelectedCustomers}
                />
                <SpacingWrapper space="30px" />
              </Grid>
            </Grid>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ModalComponent;
