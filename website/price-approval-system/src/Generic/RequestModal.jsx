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
import moment from "moment-timezone";
import axios from "axios";

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
  background: "linear-gradient(135deg, #fff, #004d40)",
  overflow: "auto",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95vw",
  height: "90vh",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  overflowY: "auto",
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
  let [validFrom, setValidFrom] = useState([]);
  let [validTo, setValidTo] = useState([]);
  const [fsc, setFSC] = useState(
    editData != undefined
      ? editData.priceDetails[0] != undefined
        ? editData.priceDetails[0].fsc == "Y"
        : "N"
      : "N"
  );
  const [priceDetails, setPriceDetails] = useState(
    editData != undefined ? editData.priceDetails : []
  );
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
  const [isLoading, setIsLoading] = useState(true);
  const handleOpen = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
  };
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
    handleCloseModal();
  };
  const [errorMessage, setErrorMessage] = useState("");

  const handleFSCChange = (e) => {
    editData["priceDetails"][0]["fsc"] = e;
    setFSC(e);
  };

  const handleAddRemark = (reqId) => {
    const postData = {
      request_id: reqId,
      comment: remarks,
      user_id: session.employee_id,
    };

    fetch(`${backend_mvc}api/remarks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        const newRemark = {
          request_id: data.request_name,
          comment: remarks,
          user_id: session.employee_id,
        };
        setRemarks([newRemark, ...remarks]);
      })
      .catch((error) => console.error("Error posting remark:", error));
  };

  const handleFormSubmit = (event, draft = false) => {
    handleOpen();
    setShowSuccess(false);
    event.preventDefault();
    const checkForEndUse =
      endUse != undefined
        ? endUse[0]["value"] != undefined
          ? true
          : false
        : false;
    if (
      (validFrom != "" &&
        validTo != "" &&
        endUse != undefined &&
        endUse[0]["value"] > 0 &&
        paymentTerms != undefined &&
        selectedCustomers.length > 0 &&
        remarks.length > 10) ||
      draft
    ) {
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
        formData["validFrom"] = validFrom;
        formData["validTo"] = validTo;
        formData["remarks"] = remarks;
        formData["mappingType"] = checkBoxEnabled ? (isChecked ? 1 : 2) : 2;
        tableRowsData[0]["fsc"] = fsc;
        formData["priceTable"] = tableRowsData;
        formData["isDraft"] = draft;
        formData["am_id"] = employee_id;
        formData["oldRequestId"] = parentId;
        formData["priceTable"] = tableRowsData;
        if (draft) {
          submitFormDataMVC(formData);
          return;
        }
        setStopExecution(false);
        for (let i = 0; i < tableRowsData.length; i++) {
          if (tableRowsData[i]["grade"] == "") {
            setErrorMessage("Select Grade for Row " + (i + 1));
            setStopExecution(e, !e);
          } else if (tableRowsData[i]["gradeType"] == "") {
            setErrorMessage("Select Grade Type for Row " + (i + 1));
            setStopExecution(e, !e);
          } else if (
            tableRowsData[i]["agreedPrice"] < 1 ||
            isNaN(tableRowsData[i]["agreedPrice"])
          ) {
            setErrorMessage("Select valid agreed Price for Row " + (i + 1));
            setStopExecution(e, !e);
          } else if (
            tableRowsData[i]["specialDiscount"] < 0 ||
            isNaN(tableRowsData[i]["specialDiscount"])
          ) {
            setErrorMessage("Select Special Discount for Row " + (i + 1));
            setStopExecution(e, !e);
          } else if (tableRowsData[i]["gsmFrom"] == "") {
            setErrorMessage("Select GSM From for Row " + (i + 1));
            setStopExecution(e, !e);
          }
          if (
            parseInt(tableRowsData[i]["gsmFrom"]) >
            parseInt(tableRowsData[i]["gsmTo"])
          ) {
            setErrorMessage(
              "GSM From should be less than GSM To for Row " + (i + 1)
            );
            setStopExecution(true);
          }
        }

        if (tableRowsData.length == 0) {
          setErrorMessage("Please add grade ");
          setStopExecution(true);
        }

        formData["isDraft"] = draft;
        formData["am_id"] = employee_id;
        formData["oldRequestId"] = parentId;

        if (!stopExecution) {
          if (typeof validTo == "string") {
            validTo = new Date(validTo);
          }

          if (typeof validFrom == "string") {
            validFrom = new Date(validFrom);
          }
          if (validFrom < validTo) {
            submitFormDataMVC(formData);
          } else {
            setShowSuccess(false);
            setErrorMessage(
              "Valid To date should be greater than Valid From date"
            );
          }
        } else {
          setShowSuccess(false);
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
      setErrorMessage("Please add a remark with at least 10 characters ");
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

    const data = editData.consolidatedRequest;
    setReqId(data.request_name);
    setSelectedConsigneeIDs(data.consignee_ids);
    setSelectedCustomerIDs(data.customer_ids);
    setSelectedEndUseIDs(data.end_use_id);
    setEndUse({
      value: data.end_use_id,
      label: data.enduse_name,
    });
    setPlant(data.plant);
    setPaymentTerms({
      value: data.payment_terms_id,
      label: `Terms ${data.payment_terms_id}`,
    });
    setIsChecked(data.mappint_type == 1 ? true : false);
    setValidFrom(moment(data.valid_from, "DD/MM/YYYY").toDate());
    setValidTo(moment(data.valid_to, "DD/MM/YYYY").toDate());

    setFSC(
      editData != undefined
        ? editData.priceDetails[0] != undefined
          ? editData.priceDetails[0].fsc == "Y"
          : "N"
        : "N"
    );

    setPriceDetails(editData.priceDetails);
  }, [editData]);

  const fetchTempRequestIds = async () => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
    }

    const tempIds = localStorage.getItem("request_id") ?? [];
    return tempIds != "undefined" ? [tempIds] : [];
  };

  const fetchTempAttachments = async () => {
    const tempAttachments = localStorage.getItem("request_id") || [];
    return tempAttachments;
  };

  const submitFormDataMVC = async (formData) => {
    if (formData["isDraft"]) {
      setIsDraft(true);
    }
    const draft = formData["isDraft"];

    try {
      let action = "N";

      if (isBlocked) {
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
        action = "D";
        formData = {
          am_id: session.employee_id,
          customers:
            selectedCustomers.map((item) => item.value).join(",") ?? " ",
          consignees:
            selectedConsignees.map((item) => item.value).join(",") ?? " ",
          endUse: endUse[0] != undefined ? endUse[0].value : endUse[0],
          plant: Array.isArray(plant)
            ? plant.map((item) => item.value.toString()).toString() ?? " "
            : plant.toString() ?? " ",
          endUseSegment: "seg1" ?? " ",
          validFrom: validFrom,
          validTo: validTo,
          paymentTerms: paymentTerms["value"].toString() ?? " ",
          oneToOneMapping: checkBoxEnabled ? (isChecked ? 1 : 2) : 2,
          prices: tableRowsData,
          action: action ?? " ",
          oldRequestId: parentId,
        };
        formData["prices"] = tableRowsData;
        const attachmentId = await fetchTempAttachments();
        if (attachmentId > 0) {
          formData["tempAttachmentIds"] = attachmentId;
        }

        formData["action"] = action;
      } else {
        formData = {
          am_id: session.employee_id,
          customers: selectedCustomers.map((item) => item.value).join(","),
          consignees: selectedConsignees.map((item) => item.value).join(","),
          endUse: endUse[0] != undefined ? endUse[0].value : endUse[0],
          plant: Array.isArray(plant)
            ? plant.map((item) => item.value.toString()).toString()
            : plant.toString(),
          endUseSegment: "seg1",
          validFrom: validFrom,
          validTo: validTo,
          paymentTerms: paymentTerms["value"].toString(),
          oneToOneMapping: checkBoxEnabled ? (isChecked ? 1 : 2) : 2,
          prices: tableRowsData,
          action: action,
          oldRequestId: parentId,
        };
        formData["prices"] = tableRowsData;
        formData["action"] = action;
        const attachmentId = await fetchTempAttachments();
        if (attachmentId > 0) {
          formData["tempAttachmentIds"] = attachmentId;
        }
      }
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
      if (draft && remarks.length == 0) {
        console.log("Remark won't be stored");
      } else handleAddRemark(requestData["id"]);

      if (oldRequestIds.length > 0) {
        updateRequestIds(oldRequestIds, requestData["id"])
          .then((response) => {
            console.log("Update successful:", response);
          })
          .catch((error) => {
            console.error("Failed to update request IDs:", error);
          });
      }
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

      localStorage.removeItem("request_ids");
    } catch (error) {
      console.error("Failed to send data:", error);
    }
  };

  const CheckCheckBox = () => {
    if (handleMapping == 0) {
      if (selectedConsignees.length == 0 || selectedCustomers.length == 0) {
        setCheckBoxEnabled(false);
      } else if (selectedConsignees.length == selectedCustomers.length) {
        setScenarioId(0);
        setOpenOneToOneModal(true);
      } else {
        setCheckBoxEnabled(false);
      }
    }
  };

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const oneToManyMapping = (array1, array2) => {
    const mappedArray = array1
      .map((item1) => {
        return array2.map((item2) => {
          return [item1, item2];
        });
      })
      .flat();
  };

  const oneToOneMapping = (array1, array2) => {
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
            variant="h"
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
            isBlocked={isBlocked}
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

          <FileHandling requestId={editData ? editData["request_id"] : ""} />

          <RemarkBox
            setRemark={setRemarks}
            request_id={editData ? editData["request_id"] : ""}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <button
              type="submit"
              disabled={disableSubmit}
              onClick={handleFormSubmit}
              style={{ backgroundColor: "#156760" }}
            >
              Submit
            </button>
            <Box>
              <button
                variant="contained"
                onClick={(e) => {
                  setIsDraft((isDraft) => {
                    handleFormSubmit(e, true);
                    return true;
                  });
                }}
                style={{ backgroundColor: "#5f5f00" }}
              >
                Save as draft
              </button>
              <button
                style={{ backgroundColor: "#4f0000", marginLeft: "4px" }}
                onClick={() => {
                  handleClose();
                  window.location.reload();
                }}
                color="primary"
                variant="contained"
              >
                Close
              </button>
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
            <Box sx={{ mt: 2, color: green[500], textAlign: "center" }}>
              <img
                src="verified.gif"
                alt="Verified"
                style={{ maxWidth: "100px", marginBottom: "20px" }}
              />
              <br />
              Request Created Successfully.
              <br />
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleConfirm();
                  window.location.reload();
                }}
                sx={{ mt: 2, bgcolor: "#156760" }}
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
