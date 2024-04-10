import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Modal,
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import TableWithInputs from "../../../components/common/TableWithInputs";
import CustomerSelect from "../../../components/common/CustomerSelect";
import SpacingWrapper from "../../../components/util/SpacingWrapper";
import PaymentTerms from "../../../components/common/PaymentTerms";
import Plant from "../../../components/common/Plant";
import DateSelector from "../../../components/common/DateSelector";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import RemarkBox from "../../../components/common/RemarkBox";
import { backend_url } from "../../../util";
import { useSession } from "../../../Login_Controller/SessionContext";
import AlertBox from "../../../components/common/AlertBox";
import FileHandling from "../../../components/common/FileHandling";

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

const CreateRequestModal = ({ open, handleClose, editData, mode }) => {
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedConsignees, setSelectedConsignees] = useState([]);
  const [endUse, setEndUse] = useState([]);
  const [plant, setPlant] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [validFrom, setValidFrom] = useState([]);
  const [validTo, setValidTo] = useState([]);
  const [fsc, setFSC] = useState("");
  const [priceDetails, setPriceDetails] = useState([]); // Assuming this is an array of objects with the structure { price: number, ...
  const [remarks, setRemarks] = useState([]);
  const [checkBoxEnabled, setCheckBoxEnabled] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [tableRowsData, setTableRowsData] = useState([]);
  const formData = {};
  const [reqId, setReqId] = useState(0);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const { session } = useSession();
  const employee_id = session.employee_id;
  const [selectedCustomerrIDs, setSelectedCustomerIDs] = useState([]);
  const [selectedConsigneeIDs, setSelectedConsigneeIDs] = useState([]);
  const [selectedEndUseIDs, setSelectedEndUseIDs] = useState([]);
  const [openAlert, setOpenAlert] = useState(false);
  const [scenarioID, setScenarioId] = useState(0);
  const [stopExecution, setStopExecution] = useState(false);
  const alertBoxScenarios = {
    0: {
      title: "One to many Mapping",
      message: "Do you want to have one to many combination?",
    },
    1: {
      title: "Request submitted",
      message:
        "Request has been created successfully and submitted for approval",
    },
    2: {
      title: "Draft",
      message: "Request has been saved as draft",
    },
  };
  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (
      validFrom != "" &&
      validTo != "" &&
      paymentTerms != undefined &&
      selectedCustomers.length > 0 &&
      selectedConsignees.length > 0 &&
      endUse.length > 0
    ) {
      if (paymentTerms.length == 0) {
        alert("Please select Payment Terms");
      } else {
        formData["customerIds"] = selectedCustomers
          .map((item) => item.value)
          .join(",");
        formData["consigneeIds"] = selectedConsignees
          .map((item) => item.value)
          .join(",");
        formData["endUseIds"] = endUse.map((item) => item.value).join(",");
        formData["endUseSegmentIds"] = ["seg1"].toString();
        formData["plants"] = plant
          .map((item) => item.value.toString())
          .toString();
        formData["paymentTermsId"] = paymentTerms["value"].toString();
        formData["validFrom"] = validFrom;
        formData["validTo"] = validTo;
        formData["remarks"] = remarks;
        formData["mappingType"] = checkBoxEnabled ? (isChecked ? 1 : 2) : 2;
        formData["fsc"] = 1;
        formData["priceTable"] = tableRowsData;

        for (let i = 0; i < tableRowsData.length; i++) {
          console.log(tableRowsData[i]);
          if (tableRowsData[i]["grade"].length == 0) {
            alert("Select Grade for Row " + (i + 1));
            setStopExecution(true);
          }
          if (tableRowsData[i]["gradeType"].length == 0) {
            alert("Select Grade Type for Row " + (i + 1));
            setStopExecution(true);
          } else if (tableRowsData[i]["agreedPrice"] < 1) {
            alert("Select Agreed Price for Row " + (i + 1));
            setStopExecution(true);
          } else if (tableRowsData[i]["specialDiscount"] < 1) {
            alert("Select Special Discount for Row " + (i + 1));
            setStopExecution(true);
          }
        }

        formData["isDraft"] = isDraft;
        formData["am_id"] = employee_id;

        const val = JSON.stringify(formData);
        console.log("In here");
        if (!stopExecution) {
          if (validFrom < validTo) {
            submitFormData(formData);
          } else {
            alert("Valid To date should be greater than Valid From date");
          }
        }
      }
    } else if (selectedCustomers.length == 0) {
      alert("Please Select Customer(s)");
    } else if (selectedConsignees.length == 0) {
      alert("Please Select Consignee(s)");
    } else if (paymentTerms == undefined) {
      alert("Please Select Payment Terms");
    } else if (validFrom == "") {
      alert("Please Select Valid From date");
    } else if (validTo == "") {
      alert("Please Select Valid To date");
    } else {
      console.log("All checks met");
    }
    if (checkBoxEnabled && isChecked) {
      oneToOneMapping(selectedCustomers, selectedConsignees);
    } else {
      oneToManyMapping(selectedCustomers, selectedConsignees);
    }
  };

  useEffect(() => {
    if (editData != undefined && editData.length > 0) {
      const [data] = editData; // Assuming editData is the array provided, and you're using the first item.
      console.log(`DATA-> ${data}`);
      setReqId(data.req_id[0]);

      // Update states
      setSelectedConsigneeIDs(data.consignee_id);
      setSelectedCustomerIDs(data.customer_id);
      // con    sole.log(data.consignee_id);
      setSelectedEndUseIDs(data.end_use_id);
      // Assumption: plant, paymentTermsId are singular values, not lists
      setPlant([{ value: data.plant, label: `Plant ${data.plant}` }]);
      setPaymentTerms({
        value: data.payment_terms_id,
        label: `Terms ${data.payment_terms_id}`,
      });
      setValidFrom(data.valid_from);
      setValidTo(data.valid_to);
      setFSC(data.fsc);
      console.log(data.fsc);
      //setMap(data.mappint_type);
      setPriceDetails(data.price); // Assuming this directly maps to your price details state structure
    }
  }, [editData]);

  // Example function to fetch temp IDs from localStorage
  const fetchTempRequestIds = async () => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`${key}: ${value}`);
    }
    const tempIds = localStorage.getItem("request_id") || initialRequestId;
    console.log(`Temp ids are ${tempIds}`);
    // Assuming this is your key
    return tempIds != undefined ? JSON.parse([tempIds]) : [];
  };

  const submitFormData = async (formData) => {
    try {
      // Update formData based on whether it's a new submission or an edit
      formData["isNew"] = true;
      const tempRequestIds = await fetchTempRequestIds();
      formData.tempRequestIds = [tempRequestIds];
      if (editData) {
        formData["parentReqId"] = reqId; // Assuming `reqId` is defined somewhere in your component as the current request ID
        formData["isNew"] = false;
        formData["mode"] = mode; // Assuming `mode` is defined and indicates the type of operation (new, edit, etc.)
      }
      console.log(formData);

      // Send the formData to your backend
      const response = await fetch(`${backend_url}api/add_price_request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Extract the JSON body from the response (it should contain the requestId)
      const responseData = await response.json();
      localStorage.removeItem("request_id");

      // Assuming you have state or methods to handle UI updates post-submission
      // setScenarioId(newRequestId); // Example: Update state with the new request ID
      // setOpenAlert(true); // Example: Show an alert or notification about the successful operation

      // Optional: Redirect or fetch new data based on the new request ID
      // window.location.reload(); // Might not be needed if you're handling UI updates more reactively
    } catch (error) {
      console.error("Failed to send data:", error);
    }
  };

  const CheckCheckBox = () => {
    console.log(selectedConsignees.length, selectedCustomers.length);
    if (selectedConsignees.length == 0 || selectedCustomers.length == 0) {
      setCheckBoxEnabled(false);
    } else if (selectedConsignees.length == selectedCustomers.length) {
      setScenarioId(0);
      setOpenAlert(true);
    } else {
      setCheckBoxEnabled(false);
    }
  };

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const oneToManyMapping = (array1, array2) => {
    // Generating the mapped array using nested loops
    const mappedArray = array1
      .map((item1) => {
        return array2.map((item2) => {
          return [item1, item2];
        });
      })
      .flat(); // Use flat() to flatten the array of arrays generated by the double map
  };

  const oneToOneMapping = (array1, array2) => {
    // Generating the mapped array using nested loops
    const maxLength = Math.min(array1.length, array2.length);
    const mappedArray = Array.from({ length: maxLength }, (_, i) => [
      array1[i],
      array2[i],
    ]);
  };

  const setTableRowsDataFunction = (data) => {
    setTableRowsData(data);
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const handleConfirm = () => {
    console.log("User clicked Yes!");
    setCheckBoxEnabled(true);
    setIsChecked(true);
    setOpenAlert(false);
  };

  console.log(session);

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="create-request-modal"
        aria-describedby="create-request-modal-description"
      >
        <Box sx={modalStyle} component="form">
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
              <Typography>Customer * </Typography>
              <CustomerSelect
                disabled={mode > 1}
                id={1}
                name={"Customer"}
                customerState={setSelectedCustomers}
                consigneeState={setSelectedConsignees}
                endUseState={setEndUse}
                checkCheckBox={CheckCheckBox}
                isEditing={editData != undefined}
                selectedCustomersToEdit={selectedCustomerrIDs}
              />
              <SpacingWrapper space="12px" />
              <FormControlLabel
                control={
                  <Checkbox
                    disabled={mode > 1 ? false : !checkBoxEnabled}
                    icon={<CheckBoxOutlineBlankIcon fontSize="medium" />}
                    checkedIcon={<CheckBoxIcon fontSize="medium" />}
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                  />
                }
                label="All Customers for all Consignees"
              />{" "}
              <SpacingWrapper space="12px" />
              <Typography>End Use</Typography>
              <CustomerSelect
                id={3}
                disabled={mode > 1}
                name={"End Use"}
                customerState={setSelectedCustomers}
                consigneeState={setSelectedConsignees}
                endUseState={setEndUse}
                checkCheckBox={CheckCheckBox}
                isEditing={editData != undefined}
                selectedCustomersToEdit={selectedEndUseIDs}
              />
              <SpacingWrapper space="12px" />
              <Typography>Plant </Typography>
              <Plant
                setSelection={setPlant}
                editedData={plant}
                disabled={mode > 1}
              />
              <SpacingWrapper space="12px" />
              <Typography>Payment Terms *</Typography>
              <PaymentTerms
                disabled={mode > 1}
                setSelection={setPaymentTerms}
                editedData={paymentTerms}
              />
              <SpacingWrapper space="12px" />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <DateSelector
                    disabled={mode > 1}
                    name={"Valid From * "}
                    setSelection={setValidFrom}
                    editedData={validFrom}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DateSelector
                    disabled={mode > 1}
                    name={"Valid To * "}
                    setSelection={setValidTo}
                    editedData={validTo}
                  />
                </Grid>
              </Grid>
              <SpacingWrapper space="12px" />
            </Grid>
            <Grid item xs={6}>
              <SpacingWrapper space="12px" />
              <Typography>Consignee *</Typography>

              <CustomerSelect
                id={2}
                disabled={mode > 1}
                name={"Consignee"}
                customerState={setSelectedCustomers}
                consigneeState={setSelectedConsignees}
                endUseState={setEndUse}
                checkCheckBox={CheckCheckBox}
                isEditing={editData != undefined}
                selectedCustomersToEdit={selectedConsigneeIDs}
              />

              <SpacingWrapper space="12px" />

              <SpacingWrapper space="61.5px" />
            </Grid>
          </Grid>

          <SpacingWrapper space="0px" />

          <TableWithInputs
            disabled={mode > 1}
            setTableRowsDataFunction={setTableRowsDataFunction}
            setFSCCode={setFSC}
            disableSubmit={setDisableSubmit}
            prices={priceDetails}
            fscCode={fsc}
          />
          <SpacingWrapper space="24px" />
          <Typography>Attachment</Typography>
          {session.role == "AM" && <FileHandling />}

          {session.role != "AM" && <RemarkBox />}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={disableSubmit}
              onClick={handleFormSubmit}
            >
              Submit
            </Button>
            <Box>
              <Button
                variant="contained"
                onClick={(e) => {
                  setIsDraft(true);
                  handleFormSubmit(e);
                }}
                color="primary"
              >
                Save as draft
              </Button>
              <Button
                sx={{ marginLeft: 4 }}
                onClick={handleClose}
                color="primary"
                variant="contained"
              >
                Close
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      <AlertBox
        isOpen={openAlert}
        onClose={handleCloseAlert}
        onConfirm={handleConfirm}
        title={alertBoxScenarios[scenarioID].title}
        message={alertBoxScenarios[scenarioID].message}
        isUpdate={scenarioID != 0}
      />
    </>
  );
};

export default CreateRequestModal;
