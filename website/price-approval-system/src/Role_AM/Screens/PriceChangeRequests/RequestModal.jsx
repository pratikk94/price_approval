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

const CreateRequestModal = ({ open, handleClose, editData }) => {
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedConsignees, setSelectedConsignees] = useState([]);
  const [endUse, setEndUse] = useState([]);
  const [plant, setPlant] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [validFrom, setValidFrom] = useState([]);
  const [validTo, setValidTo] = useState([]);
  const [fsc, setFSC] = useState([]);
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
  // const { employee_id } = useContext(SessionProvider).session.employee_id;
  const handleSubmit = (event) => {
    event.preventDefault();
    //console.log("Form data", { tableRows });
    formData["customerIds"] = selectedCustomers
      .map((item) => item.value)
      .join(",");
    formData["consigneeIds"] = selectedConsignees
      .map((item) => item.value)
      .join(",");
    formData["endUseIds"] = endUse.map((item) => item.value).join(",");
    formData["endUseSegmentIds"] = ["seg1"].toString();
    formData["plants"] = plant.map((item) => item.value.toString()).toString();
    formData["paymentTermsId"] = paymentTerms["value"].toString();
    formData["validFrom"] = validFrom;
    formData["validTo"] = validTo;
    formData["remarks"] = remarks;
    formData["mappingType"] = checkBoxEnabled ? (isChecked ? 1 : 2) : 2;
    formData["fsc"] = 1;
    formData["priceTable"] = tableRowsData;
    formData["isDraft"] = isDraft;
    formData["am_id"] = employee_id;
    console.log(employee_id);
    console.log(formData.length);
    const val = JSON.stringify(formData);
    //console.log(val);
    submitData(formData);
    setSelectedConsignees([]);
    setSelectedCustomers([]);

    //handleClose();
    if (checkBoxEnabled && isChecked) {
      oneToOneMapping(selectedCustomers, selectedConsignees);
    } else {
      oneToManyMapping(selectedCustomers, selectedConsignees);
    }
  };
  console.log(editData);
  useEffect(() => {
    if (editData != undefined && editData.length > 0) {
      const [data] = editData; // Assuming editData is the array provided, and you're using the first item.
      console.log(data);
      setReqId(data.req_id[0]);
      // Assuming these fields are comma-separated strings that need to be split into arrays
      const customerIds = data.customer_id
        .split(",")
        .map((id) => ({ value: id, label: id })); // Replace label with actual label if available
      const consigneeIds = data.consignee_id
        .split(",")
        .map((id) => ({ value: id, label: id })); // Replace label with actual label if available

      // Update states
      setSelectedCustomerIDs(data.customer_id);
      setSelectedConsigneeIDs(data.consignee_id);
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
  }, [editData]); //
  const submitData = async (formData) => {
    try {
      //console.log(JSON.stringify(formData));
      formData["isNew"] = true;
      if (editData) {
        formData["parentReqId"] = reqId;
        formData["isNew"] = false;
      }
      console.log(formData);
      const response = await fetch(`${backend_url}api/add_price_request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response;
      if (response.status === 200) console.log("Success", responseData);
    } catch (error) {
      console.error("Failed to send data:", error);
    }
  };

  const CheckCheckBox = () => {
    console.log(selectedConsignees.length, selectedCustomers.length);
    if (selectedConsignees.length == 0 || selectedCustomers.length == 0) {
      setCheckBoxEnabled(false);
    } else if (selectedConsignees.length == selectedCustomers.length) {
      alert("One to one mapping?");
      setCheckBoxEnabled(true);
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
            <CustomerSelect
              id={1}
              name={"customer"}
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
                  disabled={checkBoxEnabled ? false : true}
                  icon={<CheckBoxOutlineBlankIcon fontSize="medium" />}
                  checkedIcon={<CheckBoxIcon fontSize="medium" />}
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                />
              }
              label="All customers for all consignees"
            />{" "}
            <SpacingWrapper space="12px" />
            <CustomerSelect
              id={3}
              name={"end use"}
              customerState={setSelectedCustomers}
              consigneeState={setSelectedConsignees}
              endUseState={setEndUse}
              checkCheckBox={CheckCheckBox}
              isEditing={editData != undefined}
              selectedCustomersToEdit={selectedEndUseIDs}
            />
            <SpacingWrapper space="12px" />
            <Plant setSelection={setPlant} editedData={plant} />
            <SpacingWrapper space="12px" />
            <PaymentTerms
              setSelection={setPaymentTerms}
              editedData={paymentTerms}
            />
            <SpacingWrapper space="12px" />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <DateSelector
                  name={"valid from"}
                  setSelection={setValidFrom}
                  editedData={validFrom}
                />
              </Grid>
              <Grid item xs={6}>
                <DateSelector
                  name={"valid to"}
                  setSelection={setValidTo}
                  editedData={validTo}
                />
              </Grid>
            </Grid>
            <SpacingWrapper space="12px" />
          </Grid>
          <Grid item xs={6}>
            <SpacingWrapper space="12px" />
            <CustomerSelect
              id={2}
              name={"consignee"}
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

        <SpacingWrapper space="24px" />
        <Typography>Select pricing conditions</Typography>
        <TableWithInputs
          setTableRowsDataFunction={setTableRowsDataFunction}
          setFSCCode={setFSC}
          disableSubmit={setDisableSubmit}
          prices={priceDetails}
          fscCode={fsc}
        />
        <SpacingWrapper space="24px" />
        <RemarkBox />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
          <Button
            onClick={(e) => {
              setIsDraft(true);
              handleSubmit(e);
            }}
            color="primary"
          >
            Save as draft
          </Button>
        </Box>
        <Box textAlign="center" marginTop={2}>
          <Button type="submit" variant="contained" disabled={disableSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateRequestModal;
