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
import ApproverRoleSelect from "./ApproverRoleSelect";
import { set } from "date-fns";
function ModalComponent() {
  const [open, setOpen] = useState(false);
  const [regions, setRegions] = useState([]);
  const [profitCenter, setProfitCenter] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProfitCenter, setSelectedProfitCenter] = useState([]);

  const [validFrom, setValidFrom] = useState(new Date());
  const [validTo, setValidTo] = useState(new Date());
  const [role, setRole] = useState("");
  const [roleMapping, setRoleMapping] = useState({});
  const [roleData, setRoleData] = useState({
    rule_name: "",
    profit_center: [],
    region: "",
    valid_from: "",
    valid_to: "",
    active: 0,
    rm: 0,
    nsm: 0,
    hdsm: 0,
    validator: 0,
    created_at: "",
  });
  const handleChange = (event) => {
    setRole(event.target.value);
  };

  useEffect(() => {
    const fetchRegions = async () => {
      const response = await fetch(`${backend_url}api/fetch_region`);
      const data = await response.json();
      setRegions(data);
    };

    const fetchProfitCenters = async () => {
      // const response = await fetch(`${backend_url}api/fetch_profit_centers`);
      // const data = await response.json();
      // console.log({ data });
      const data2 = [
        [{ id: 0, name: "2" }],
        [{ id: 1, name: "3" }],
        [{ id: 2, name: "4" }],
        [{ id: 3, name: "5" }],
      ];

      // Flatten the data2 array of arrays into an array of objects
      const flattenedData2 = data2.flat();

      setProfitCenter(flattenedData2);
    };

    fetchRegions();
    fetchProfitCenters();
  }, []);

  function checkArray(arr) {
    console.log(arr);
    const hasTwoThreeFour =
      arr.includes("2") || arr.includes("3") || arr.includes("4");
    const hasFive = arr.includes("5");
    console.log(hasTwoThreeFour, hasFive);
    // If it has both the set [2, 3, 4] and 5, return false
    if (hasTwoThreeFour && hasFive) {
      return false;
    }

    // Otherwise, if it has either set [2, 3, 4] or 5, return true
    return hasTwoThreeFour || hasFive;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    roleData.rule_name = role;
    roleData.profit_center = selectedProfitCenter;
    roleData.region = selectedRegion;
    roleData.valid_from = validFrom;
    roleData.valid_to = validTo;
    roleData.active = 1;
    roleData.rm = roleMapping.RM;
    roleData.nsm = roleMapping.NSM;
    roleData.hdsm = roleMapping.HDSM;
    roleData.validator = roleMapping.Validator;
    roleData.created_at = new Date();
    const result = checkArray(selectedProfitCenter);
    alert(result ? "True" : "Error selecting profit centers");
    console.log(roleData);
    if (result) {
      try {
        const response = await fetch(`${backend_url}api/add_defined_rule`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(roleData),
        });
        const responseData = await response.json();
        console.log(responseData);
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button variant="outlined" onClick={handleOpen}>
        Set rule
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
                    multiple
                    label="Profit center"
                    value={selectedProfitCenter}
                    onChange={(e) => {
                      setSelectedProfitCenter(e.target.value);
                      console.log(e.target.value);
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
                    onChange={(e) => {
                      setSelectedRegion(e.target.value);
                      console.log("Clicked");
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
                <CustomCheckbox />
                {/* Additional inputs like Valid From and Valid To */}
              </Grid>
              <Grid item xs={6}>
                {/* Other inputs for Column 2 */}
                <SpacingWrapper space="16px" />

                <div style={{ margin: "0 auto" }}>
                  <ReactDatePicker
                    name="Valid From"
                    selected={validFrom} // Set the selected date
                    onChange={(date) => setValidFrom(date)} // Update the selected date
                    dateFormat="MMMM d, yyyy" // Format the displayed date
                    customInput={<CustomInput />} // Use a custom input
                  />
                </div>
                <SpacingWrapper space="28px" />
                <div style={{ margin: "0 auto" }}>
                  <ReactDatePicker
                    name="Valid to"
                    selected={validTo} // Set the selected date
                    onChange={(date) => setValidTo(date)} // Update the selected date
                    dateFormat="MMMM d, yyyy" // Format the displayed date
                    customInput={<CustomInput />} // Use a custom input
                  />
                </div>
                <SpacingWrapper space="24px" />
                <ApproverRoleSelect setRoleMapping={setRoleMapping} />
                <SpacingWrapper space="30px" />
              </Grid>
            </Grid>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ModalComponent;
