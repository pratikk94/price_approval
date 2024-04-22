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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { green, orange, red } from "@mui/material/colors";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
const style = {
  position: "absolute",
  top: "10%",
  left: "50%",
  transform: "translate(-50%, -10%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  textAlign: "center",
};
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95vw",
  height: "90vh", // Adjusted for better layout
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
  const [scenarioID, setScenarioId] = useState(0);
  const [stopExecution, setStopExecution] = useState(false);
  const [newRequestId, setNewRequestId] = useState("");
  const [handleMapping, setHandleMapping] = useState(0);
  const [openOneToOneModal, setOpenOneToOneModal] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleConfirmOneToOne = () => {
    setCheckBoxEnabled(true);
    setIsChecked(true);
    setOpenOneToOneModal(false);
  };

  const handleConfirm = () => {
    if (showSuccess) window.location.reload();
    else setErrorMessage("");

    handleCloseModal();
    // setTimeout(() => {
    //   handleCloseModal();
    // }, 2000); // Close the modal and hide success message after 2 seconds
  };
  const [errorMessage, setErrorMessage] = useState("");
  console.log(`Mode is ${mode}`);
  const handleFormSubmit = (event, draft = false) => {
    handleOpen();
    setShowSuccess(false);
    event.preventDefault();
    console.log(endUse);
    console.log(endUse != undefined);
    console.log(endUse["value"] != undefined);
    if (
      validFrom != "" &&
      validTo != "" &&
      paymentTerms != undefined &&
      selectedCustomers.length > 0 &&
      selectedConsignees.length > 0 &&
      endUse["value"] != undefined
    ) {
      console.log(endUse);
      if (paymentTerms.length == 0) {
        setErrorMessage("Please select Payment Terms");
      } else {
        formData["customerIds"] = selectedCustomers
          .map((item) => item.value)
          .join(",");
        formData["consigneeIds"] = selectedConsignees
          .map((item) => item.value)
          .join(",");
        formData["endUseIds"] = endUse["value"].toString();
        formData["endUseSegmentIds"] = ["seg1"].toString();
        formData["plants"] = plant
          .map((item) => item.value.toString())
          .toString();
        formData["paymentTermsId"] = paymentTerms["value"].toString();
        formData["validFrom"] = validFrom;
        formData["validTo"] = validTo;
        formData["remarks"] = remarks;
        formData["mappingType"] = checkBoxEnabled ? (isChecked ? 1 : 2) : 2;
        formData["fsc"] = fsc == "Y" ? 1 : 0;

        formData["priceTable"] = tableRowsData;
        console.log(formData["priceTable"]);
        setStopExecution(false);
        for (let i = 0; i < tableRowsData.length; i++) {
          console.log(tableRowsData[i]);
          console.log(tableRowsData[i]["grade"] == "");
          console.log(tableRowsData[i]["gradeType"] == "");
          console.log(
            tableRowsData[i]["agreedPrice"] < 1 ||
              isNaN(tableRowsData[i]["agreedPrice"])
          );
          console.log(
            tableRowsData[i]["specialDiscount"] < 1 ||
              isNaN(tableRowsData[i]["specialDiscount"])
          );
          if (tableRowsData[i]["grade"] == "") {
            setErrorMessage("Select Grade for Row " + (i + 1));
            setStopExecution(e, !e);
            // return;
          } else if (tableRowsData[i]["gradeType"] == "") {
            setErrorMessage("Select Grade Type for Row " + (i + 1));
            setStopExecution(e, !e);
            // return;
          } else if (
            tableRowsData[i]["agreedPrice"] < 1 ||
            isNaN(tableRowsData[i]["agreedPrice"])
          ) {
            setErrorMessage("Select valid agreed Price for Row " + (i + 1));
            setStopExecution(e, !e);
            // return;
          } else if (
            tableRowsData[i]["specialDiscount"] < 0 ||
            isNaN(tableRowsData[i]["specialDiscount"])
          ) {
            setErrorMessage("Select Special Discount for Row " + (i + 1));
            setStopExecution(e, !e);
            // return;
          }
        }

        if (tableRowsData.length == 0) {
          setErrorMessage("Please add grade ");
          setStopExecution(true);
          // return;
        }

        console.log("CP_1");
        setShowSuccess(true);
        formData["isDraft"] = draft;
        formData["am_id"] = employee_id;

        const val = JSON.stringify(formData);
        console.log(stopExecution);
        if (!stopExecution) {
          if (validFrom < validTo) {
            submitFormData(formData);
            //handleConfirm();
          } else {
            setShowSuccess(false);
            setOpenModal(true);
            setErrorMessage(
              "Valid To date should be greater than Valid From date"
            );
          }
        } else {
          setShowSuccess(false);
          setOpenModal(true);
        }
      }
    } else if (selectedCustomers.length == 0) {
      setErrorMessage("Please select Customer(s)");
    } else if (selectedConsignees.length == 0) {
      setErrorMessage("Please select Consignee(s)");
    } else if (paymentTerms == undefined) {
      setErrorMessage("Please select Payment Terms");
    } else if (validFrom == "") {
      setErrorMessage("Please select Valid From date");
    } else if (validTo == "") {
      setErrorMessage("Please select Valid To date");
    } else if (endUse.length == 0) {
      setErrorMessage("Please select End Use");
    } else {
      console.log("All checks met");
    }
    if (checkBoxEnabled && isChecked) {
      oneToOneMapping(selectedCustomers, selectedConsignees);
    } else {
      oneToManyMapping(selectedCustomers, selectedConsignees);
    }
  };

  const updateRequestIds = async (oldRequestIds, newRequestId) => {
    const response = await fetch(`${backend_url}api/update-request-ids`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ oldRequestIds, newRequestId }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
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
      setEndUse({
        value: data.end_use_id,
        label: `End Use ${data.end_use_id}`,
      });
      // Assumption: plant, paymentTermsId are singular values, not lists
      setPlant([{ value: data.plant, label: `Plant ${data.plant}` }]);
      setPaymentTerms({
        value: data.payment_terms_id,
        label: `Terms ${data.payment_terms_id}`,
      });

      console.log(data.valid_from);
      console.log(data.valid_to);

      setValidFrom(data.valid_from);
      setValidTo(data.valid_to);
      setFSC(data.fsc == "1" ? "Y" : "N");
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
    console.log(typeof tempIds);
    console.log(tempIds == "undefined");
    // Assuming this is your key
    return tempIds != "undefined" ? [tempIds] : [];
  };

  const submitFormData = async (formData) => {
    console.log("In here SFD");
    try {
      // Update formData based on whether it's a new submission or an edit
      formData["isNew"] = true;
      const tempRequestIds = await fetchTempRequestIds();
      console.log(tempRequestIds.length);
      if (tempRequestIds.length > 0) {
        formData.tempRequestIds = [tempRequestIds];
      }
      if (editData) {
        formData["parentReqId"] = reqId; // Assuming `reqId` is defined somewhere in your component as the current request ID
        formData["isNew"] = false;
        formData["mode"] = mode; // Assuming `mode` is defined and indicates the type of operation (new, edit, etc.)
        formData["isAM"] = session.role === "AM"; // Assuming `session` is defined and contains the user's role
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

      const oldRequestIds =
        JSON.parse(localStorage.getItem("request_ids")) || [];
      const requestData = await response.json();
      console.log(requestData["id"]);
      if (oldRequestIds.length > 0) {
        updateRequestIds(oldRequestIds, requestData["id"])
          .then((response) => {
            console.log("Update successful:", response);
            // Handle further actions like notifying the user
          })
          .catch((error) => {
            console.error("Failed to update request IDs:", error);
            // Handle error (e.g., showing error message to the user)
          });
      }
      // Check for HTTP errors
      if (!response.ok) {
        setShowSuccess(false);
        setErrorMessage(
          `Failed to create request due to HTTP error! \n Reason : ${response.status}`
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        setShowSuccess(true);
        setOpenModal(true);
      }
      // Extract the JSON body from the response (it should contain the requestId)

      localStorage.removeItem("request_ids");

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
    if (handleMapping == 0) {
      if (selectedConsignees.length == 0 || selectedCustomers.length == 0) {
        setCheckBoxEnabled(false);
      } else if (selectedConsignees.length == selectedCustomers.length) {
        setScenarioId(0);
        //setOpenAlert(true);
        setOpenOneToOneModal(true);
        // setShowSuccess(false);
        // setErrorMessage(
        //   "Do you wish to have one to one mapping of customers and consignees?"
        // );
      } else {
        setCheckBoxEnabled(false);
      }
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

  const handleOneToOneModalClose = () => {
    setIsChecked(false);
    setOpenOneToOneModal(false);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={(event, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            handleClose();
          }
        }}
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
                label="1 Customers for 1 Consignees only"
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

          <RemarkBox />
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
                  setIsDraft((isDraft) => {
                    handleFormSubmit(e, true);
                    return true;
                  });
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
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {showSuccess ? (
            <Box sx={{ mt: 2, color: green[500] }}>
              <CheckCircleOutlineIcon
                sx={{ fontSize: 40, mr: 1, verticalAlign: "middle" }}
              />
              Request Created Successfully.
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirm}
                sx={{ mt: 2 }}
              >
                Confirm
              </Button>
            </Box>
          ) : (
            <Box sx={{ mt: 2, color: red[500] }}>
              <ErrorOutlineIcon
                sx={{ fontSize: 40, mr: 1, verticalAlign: "middle" }}
              />
              <br />

              <Typography id="modal-modal-description">
                Failed to create request.
                <br /> Reason : {errorMessage}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirm}
                sx={{ mt: 2 }}
              >
                Ok
              </Button>
            </Box>
          )}
        </Box>
      </Modal>
      <Modal
        open={openOneToOneModal}
        onClose={handleOneToOneModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box sx={{ mt: 2, color: orange[500] }}>
            Do you wish to choose one to one mapping for your customers and
            consignees?
            <br />
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmOneToOne}
              sx={{ mt: 2 }}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOneToOneModalClose}
              sx={{ mt: 2, marginLeft: 2 }}
            >
              No
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default CreateRequestModal;
