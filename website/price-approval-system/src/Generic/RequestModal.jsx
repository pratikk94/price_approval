/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Modal,
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import TableWithInputs from "../components/common/TableWithInputs";
import CustomerSelect from "../components/common/CustomerSelect";
import SpacingWrapper from "../components/util/SpacingWrapper";
import PaymentTerms from "../components/common/PaymentTerms";
import Plant from "../components/common/Plant";
import DateSelector from "../components/common/DateSelector";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import RemarkBox from "../components/common/RemarkBox";
import { backend_mvc, backend_url } from "../util";
import { useSession } from "../Login_Controller/SessionContext";
import FileHandling from "../components/common/FileHandling";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { green, red } from "@mui/material/colors";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { format, toZonedTime } from "date-fns-tz";
import moment from "moment-timezone";
import axios from "axios";
import PlantC from "../components/common/PlantC";
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

const CreateRequestModal = ({
  open,
  handleClose,
  editData,
  mode,
  parentId,
  isBlocked,
  isCopyOrMerged,
  isExtension,
  isRework,
}) => {
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedConsignees, setSelectedConsignees] = useState([]);
  const [endUse, setEndUse] = useState([]);
  const [plant, setPlant] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [validFrom, setValidFrom] = useState([]);
  const [validTo, setValidTo] = useState([]);
  const [fsc, setFSC] = useState(
    editData != undefined
      ? editData.priceDetails[0] != undefined
        ? editData.priceDetails[0].fsc == "Y"
        : "N"
      : "N"
  );
  const [priceDetails, setPriceDetails] = useState(
    editData != undefined ? editData.priceDetails : []
  ); // Assuming this is an array of objects with the structure { price: number, ...
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
  const timeZone = "Asia/Kolkata";
  const [showSuccess, setShowSuccess] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const handleOpen = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleConfirmOneToOne = () => {
    setCheckBoxEnabled(true);
    setIsChecked(true);
    setOpenOneToOneModal(false);
  };

  const fetchHistory = async (grade) => {
    try {
      const response = await axios.get(
        `${backend_mvc}api/history?/history-requests?customerIds=${selectedCustomers
          .map((item) => item.value)
          .join(",")}&consigneeIds=${selectedConsignees
          .map((item) => item.value)
          .join(",")}&plantIds=${plant}&grade=${grade}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching history:", error);
    }
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

  const handleFSCChange = (e) => {
    console.log("FSC code is " + e);
    setFSC(e);
  };

  const handleAddRemark = (reqId) => {
    const postData = {
      request_id: reqId,
      comment: remarks,
      user_id: session.employee_id,
    };

    console.log(postData);

    fetch(`${backend_mvc}api/remarks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        const newRemark = {
          // id: data.request_id,
          request_id: data.request_name,
          comment: remarks,
          user_id: session.employee_id,
          // created_at: new Date(),
        };
        setRemarks([newRemark, ...remarks]);
        //setUpdateRemarks("");
      })
      .catch((error) => console.error("Error posting remark:", error));
  };

  console.log("Rework" + isRework);
  console.log(editData ?? "No data");
  const handleFormSubmit = (event, draft = false) => {
    handleOpen();
    setShowSuccess(false);
    event.preventDefault();
    console.log(endUse);
    console.log(plant);
    console.log(remarks);
    console.log(endUse[0]);

    const checkForEndUse =
      endUse != undefined
        ? endUse[0]["value"] != undefined
          ? true
          : false
        : false;
    console.log(checkForEndUse);
    if (
      (validFrom != "" &&
        validTo != "" &&
        endUse != undefined &&
        endUse[0]["value"] > 0 &&
        paymentTerms != undefined &&
        selectedCustomers.length > 0 &&
        // selectedConsignees.length > 0 &&
        remarks.length > 10) ||
      draft
      // && checkForEndUse
    ) {
      console.log(endUse);
      console.log(plant);
      if (paymentTerms.length == 0) {
        setErrorMessage("Please select Payment Terms");
      } else {
        formData["customerIds"] = selectedCustomers
          .map((item) => item.value)
          .join(",");
        formData["consigneeIds"] = selectedConsignees
          .map((item) => item.value)
          .join(",");
        formData["endUseIds"] = endUse[0]["value"];
        formData["endUseSegmentIds"] = ["seg1"].toString();
        formData["plants"] = plant;
        formData["paymentTermsId"] = paymentTerms["value"].toString();

        const today = moment();
        formData["validFrom"] = validFrom
          ? moment(validFrom).tz(timeZone).format("YYYY-MM-DD")
          : today.tz(timeZone).format("YYYY-MM-DD");

        formData["validTo"] = validTo
          ? moment(validTo).tz(timeZone).format("YYYY-MM-DD")
          : today.tz(timeZone).format("YYYY-MM-DD");
        formData["remarks"] = remarks;
        formData["mappingType"] = checkBoxEnabled ? (isChecked ? 1 : 2) : 2;
        tableRowsData[0]["fsc"] = fsc;
        formData["priceTable"] = tableRowsData;
        console.log(formData["priceTable"]);
        formData["isDraft"] = draft;
        formData["am_id"] = employee_id;
        formData["oldRequestId"] = parentId;

        formData["priceTable"] = tableRowsData;
        if (draft) {
          console.log(formData);
          submitFormDataMVC(formData);
          return;
        }
        setStopExecution(false);
        for (let i = 0; i < tableRowsData.length; i++) {
          console.log("FSC iS " + tableRowsData[i]["fsc"] + " " + fsc);
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
          } else if (tableRowsData[i]["gsmFrom"] == "") {
            setErrorMessage("Select GSM From for Row " + (i + 1));
            setStopExecution(e, !e);
            // return;
          } else if (tableRowsData[i]["gsmTo"] == "") {
            setErrorMessage("Select GSM To for Row " + (i + 1));
            setStopExecution(e, !e);
            // return;
          }

          if (
            parseInt(tableRowsData[i]["gsmFrom"]) >=
            parseInt(tableRowsData[i]["gsmTo"])
          ) {
            console.log(typeof parseInt(tableRowsData[i]["gsmFrom"]));
            console.log(tableRowsData[i]["gsmFrom"]);
            console.log(tableRowsData[i]["gsmTo"]);
            setErrorMessage(
              "GSM From should be less than GSM To for Row " + (i + 1)
            );
            setStopExecution(true);
            // return;
          }
        }

        if (tableRowsData.length == 0) {
          setErrorMessage("Please add grade ");
          setStopExecution(true);
          // return;
        }

        formData["isDraft"] = draft;
        formData["am_id"] = employee_id;
        formData["oldRequestId"] = parentId;

        if (!stopExecution) {
          if (validFrom < validTo) {
            submitFormDataMVC(formData);
            //handleConfirm();
          } else {
            setShowSuccess(false);
            //setOpenModal(true);
            setErrorMessage(
              "Valid To date should be greater than Valid From date"
            );
          }
        } else {
          setShowSuccess(false);
          //setOpenModal(true);
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
    } else if (remarks.length < 11) {
      setErrorMessage("Please add a remark with atleast 10 characters ");
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
    if (editData == undefined) {
      return;
    }
    //setOpenModal(true);
    console.log(editData.consolidatedRequest);

    console.log("in here");

    console.log("In_here_");
    const data = editData.consolidatedRequest; // Assuming editData is the array provided, and you're using the first item.
    console.log(`DATA-> ${data}`);
    console.log(data);
    setReqId(data.request_name);
    console.log(data.consignee_ids);
    // Update states
    setSelectedConsigneeIDs(data.consignee_ids);
    setSelectedCustomerIDs(data.customer_ids);
    // con    sole.log(data.consignee_id);
    setSelectedEndUseIDs(data.end_use_id);
    setEndUse({
      value: data.end_use_id,
      label: data.enduse_name,
    });
    // Assumption: plant, paymentTermsId are singular values, not lists
    console.log(data.plant.length > 1 ? data.plant : [data.plant]);
    setPlant(data.plant);
    setPaymentTerms({
      value: data.payment_terms_id,
      label: `Terms ${data.payment_terms_id}`,
    });

    console.log(data.valid_from);
    console.log(data.valid_to);

    setValidFrom(data.valid_from);
    setValidTo(data.valid_to);

    setFSC(
      editData.priceDetails[0] != undefined ? editData.priceDetails[0].fsc : "N"
    );

    setPriceDetails(editData.priceDetails); // Assuming this directly maps to your price details state structure
    // }
  }, [editData]);

  // Example function to fetch temp IDs from localStorage
  const fetchTempRequestIds = async () => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`${key}: ${value}`);
    }

    const tempIds = localStorage.getItem("request_id") ?? [];
    console.log(`Temp ids are ${tempIds}`);
    console.log(typeof tempIds);
    console.log(tempIds == "undefined");
    // Assuming this is your key
    return tempIds != "undefined" ? [tempIds] : [];
  };

  const fetchTempAttachments = async () => {
    const tempAttachments = localStorage.getItem("request_id") || [];
    return tempAttachments;
  };

  // const submitFormData = async (formData) => {
  //   console.log("In here SFD");
  //   try {
  //     // Update formData based on whether it's a new submission or an edit
  //     formData["isNew"] = true;
  //     const tempRequestIds = await fetchTempRequestIds();
  //     const tempAttachments = await fetchTempAttachments();
  //     console.log(tempRequestIds.length);
  //     if (tempRequestIds.length > 0) {
  //       formData.tempRequestIds = [tempRequestIds];
  //     }
  //     if (editData) {
  //       formData["parentReqId"] = parentId; // Assuming `reqId` is defined somewhere in your component as the current request ID
  //       formData["isNew"] = false;
  //       formData["mode"] = mode; // Assuming `mode` is defined and indicates the type of operation (new, edit, etc.)
  //       formData["isAM"] = session.role === "AM"; // Assuming `session` is defined and contains the user's role
  //     }
  //     console.log(formData);

  //     // Send the formData to your backend
  //     const response = await fetch(`${backend_url}api/add_price_request`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     const oldRequestIds =
  //       JSON.parse(localStorage.getItem("request_ids")) || [];
  //     const requestData = await response.json();
  //     console.log(requestData["id"]);
  //     if (oldRequestIds.length > 0) {
  //       updateRequestIds(oldRequestIds, requestData["id"])
  //         .then((response) => {
  //           console.log("Update successful:", response);
  //           // Handle further actions like notifying the user
  //         })
  //         .catch((error) => {
  //           console.error("Failed to update request IDs:", error);
  //           // Handle error (e.g., showing error message to the user)
  //         });
  //     }
  //     // Check for HTTP errors
  //     if (!response.ok) {
  //       setShowSuccess(false);
  //       setErrorMessage(
  //         `Failed to create request due to HTTP error! \n Reason : ${response.status}`
  //       );
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     } else {
  //       setShowSuccess(true);
  //       setOpenModal(true);
  //     }
  //     // Extract the JSON body from the response (it should contain the requestId)

  //     localStorage.removeItem("request_ids");

  //     // Assuming you have state or methods to handle UI updates post-submission
  //     // setScenarioId(newRequestId); // Example: Update state with the new request ID
  //     // setOpenAlert(true); // Example: Show an alert or notification about the successful operation

  //     // Optional: Redirect or fetch new data based on the new request ID
  //     // window.location.reload(); // Might not be needed if you're handling UI updates more reactively
  //   } catch (error) {
  //     console.error("Failed to send data:", error);
  //   }
  // };

  const submitFormDataMVC = async (formData) => {
    console.log(selectedConsigneeIDs);

    if (formData["isDraft"]) {
      setIsDraft(true);
    }

    console.log(formData["isDraft"]);

    try {
      let action = "N";

      if (isBlocked) {
        console.log("In here");
        action = "B";
      }
      if (isExtension) {
        action = "E";
      }
      if (isCopyOrMerged) {
        action = "C";
      }
      if (isRework) {
        action = "R";
      }

      if (formData["isDraft"]) {
        console.log(endUse);
        action = "D";
        formData = {
          am_id: session.employee_id,
          customers:
            selectedCustomers.map((item) => item.value).join(",") ?? " ", // Assuming `customers` is an array in your formData
          consignees:
            selectedConsignees.map((item) => item.value).join(",") ?? " ", // Assuming `consignees` is an array in your formData
          endUse: endUse[0] != undefined ? endUse[0].value : endUse[0], //endUse["value"].toString(),
          plant: Array.isArray(plant)
            ? plant.map((item) => item.value.toString()).toString() ?? " "
            : plant.toString() ?? " ",
          endUseSegment: "seg1" ?? " ",
          validFrom: validFrom,
          validTo: validTo,
          paymentTerms: paymentTerms["value"].toString() ?? " ",
          oneToOneMapping: checkBoxEnabled ? (isChecked ? 1 : 2) : 2,
          prices: tableRowsData, // Assuming `prices` is an array in your formData
          action: action ?? " ",
          oldRequestId: parentId,
        };
        formData["prices"] = tableRowsData;
        const attachmentId = await fetchTempAttachments();
        if (attachmentId > 0) {
          formData["tempAttachmentIds"] = attachmentId;
        }
        console.log(attachmentId);

        formData["action"] = action;
      } else {
        formData = {
          am_id: session.employee_id,
          customers: selectedCustomers.map((item) => item.value).join(","), // Assuming `customers` is an array in your formData
          consignees: selectedConsignees.map((item) => item.value).join(","), // Assuming `consignees` is an array in your formData
          endUse: endUse[0] != undefined ? endUse[0].value : endUse[0], //endUse["value"].toString(),
          plant: Array.isArray(plant)
            ? plant.map((item) => item.value.toString()).toString()
            : plant.toString(),
          endUseSegment: "seg1",
          validFrom: validFrom,
          validTo: validTo,
          paymentTerms: paymentTerms["value"].toString(),
          oneToOneMapping: checkBoxEnabled ? (isChecked ? 1 : 2) : 2,
          prices: tableRowsData, // Assuming `prices` is an array in your formData
          action: action,
          oldRequestId: parentId,
        };
        formData["prices"] = tableRowsData;
        formData["action"] = action;
        const attachmentId = await fetchTempAttachments();
        if (attachmentId > 0) {
          formData["tempAttachmentIds"] = attachmentId;
        }
        console.log(attachmentId);
      }
      console.log(tableRowsData);
      console.log(formData);
      console.log(action);
      // Send the formData to your backend
      const response = await fetch(
        action == "N"
          ? `${backend_mvc}process-price-request`
          : `${backend_mvc}process-pre-approved-price-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const oldRequestIds =
        JSON.parse(localStorage.getItem("request_ids")) || [];
      const requestData = await response.json();
      console.log(requestData["id"]);
      handleAddRemark(requestData["id"]);

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

      // ... existing code ...
    } catch (error) {
      console.error("Failed to send data:", error);
    }
    // ... existing code ...
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
                disabled={isBlocked || isExtension}
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
                    disabled={
                      (mode > 1 ? false : !checkBoxEnabled) || isBlocked
                    }
                    icon={<CheckBoxOutlineBlankIcon fontSize="medium" />}
                    checkedIcon={<CheckBoxIcon fontSize="medium" />}
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                  />
                }
                label="1 Customers mapped to exactly 1 Consignees."
              />{" "}
              <SpacingWrapper space="12px" />
              <Typography>End Use</Typography>
              <CustomerSelect
                id={3}
                disabled={mode > 1 || isExtension || isBlocked}
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
                editedData={
                  editData != undefined
                    ? editData.consolidatedRequest.plant
                    : []
                }
                disabled={mode > 1 || isExtension || isBlocked}
              />
              <SpacingWrapper space="12px" />
              <Typography>Payment Terms *</Typography>
              <PaymentTerms
                disabled={mode > 1 || isExtension || isBlocked}
                setSelection={setPaymentTerms}
                editedData={paymentTerms}
                customers={selectedCustomers}
                consignees={selectedConsignees}
                endUses={endUse}
              />
              <SpacingWrapper space="12px" />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <DateSelector
                    disabled={mode > 1 || isExtension || isBlocked}
                    name={"Valid From * "}
                    setSelection={setValidFrom}
                    editedData={validFrom}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DateSelector
                    disabled={isBlocked}
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
                disabled={mode > 1 || isExtension || isBlocked}
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
            isExtension={isExtension}
            disabled={isExtension || isBlocked}
            setTableRowsDataFunction={setTableRowsDataFunction}
            setFSCCode={handleFSCChange}
            disableSubmit={setDisableSubmit}
            prices={priceDetails}
            fscCode={fsc}
            fetchHistory={fetchHistory}
          />
          <SpacingWrapper space="24px" />
          <Typography>Attachment</Typography>

          <FileHandling
            requestId={
              isBlocked || isCopyOrMerged || isExtension
                ? ""
                : editData != undefined
                ? editData[0] != undefined
                  ? editData[0].request_name
                  : ""
                : ""
            }
          />

          <RemarkBox
            setRemark={setRemarks}
            request_id={
              isBlocked || isCopyOrMerged || isExtension
                ? ""
                : editData != undefined
                ? editData[0] != undefined
                  ? editData[0].request_name
                  : ""
                : ""
            }
          />

          {/* <HistoryModal reqId={id} /> */}
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
                Ok
              </Button>
            </Box>
          ) : (
            <Box sx={{ mt: 2, color: red[500] }}>
              <ErrorOutlineIcon
                sx={{ fontSize: 40, mr: 1, verticalAlign: "middle" }}
              />
              <br />

              <Typography id="modal-modal-description" sx={{ color: "black" }}>
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
          <Box sx={{ mt: 2 }}>
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
            <div style={{ display: "inline-block", width: "40px" }}></div>
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
