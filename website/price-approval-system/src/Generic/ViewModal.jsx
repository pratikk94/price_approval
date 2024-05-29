/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@material-ui/core";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";
import { backend_mvc } from "../util";

import ReactModal from "react-modal";
import { IconButton } from "@mui/material";
import RemarkBox from "../components/common/RemarkBox";
import HistoryModal from "../components/common/History";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FileHandling from "../components/common/FileHandling";
import { useSession } from "../Login_Controller/SessionContext";
import { green } from "@mui/material/colors";
function PriceTable({ price }) {
  return price ? (
    <>
      <TableContainer component={Paper}>
        <Table aria-label="price table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Grade</TableCell>
              <TableCell align="center">Grade Type</TableCell>
              <TableCell align="center">GSM From</TableCell>
              <TableCell align="center">GSM To</TableCell>
              <TableCell align="center">Agreed Price</TableCell>
              <TableCell align="center">Special Discount</TableCell>
              <TableCell align="center">Reel Discount</TableCell>
              <TableCell align="center">TPC</TableCell>
              <TableCell align="center">Offline Discount</TableCell>
              <TableCell align="center">Net NSR</TableCell>
              {/* <TableCell align="center">Old Net NSR</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {price.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row.grade}
                </TableCell>
                <TableCell align="right">{row.grade_type}</TableCell>
                <TableCell align="right">{row.gsm_range_from}</TableCell>
                <TableCell align="right">{row.gsm_range_to}</TableCell>
                <TableCell align="right">{row.agreed_price}</TableCell>
                <TableCell align="right">{row.special_discount}</TableCell>
                <TableCell align="right">{row.reel_discount}</TableCell>
                <TableCell align="right">{row.tpc}</TableCell>
                <TableCell align="right">{row.offline_discount}</TableCell>
                <TableCell align="right">{row.net_nsr}</TableCell>
                {/* <TableCell align="right">{row.old_net_nsr}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  ) : null;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  // Specify the locale as 'en-GB' to ensure the format is day/month/year
  // You can change 'en-GB' to any other locale as needed
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function PriceViewModal({ open, handleClose, data, rule }) {
  console.log(`Opened VSM:${open}`);
  const { session } = useSession();
  const employee_id = session.employee_id;
  const [remarks, setRemarks] = useState([]);
  console.log(data);
  const id = data.request_id;

  const handleAddRemark = () => {
    const postData = {
      request_id: data.request_id,
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

  const updateStatus = (newStatus) => {
    let reportData = {
      request_id: id, // Example reportId
      employee_id: employee_id, // Example statusUpdatedById
      action: newStatus, // Example new status
    };
    console.log("New Status: ", newStatus);
    console.log(reportData);
    console.log(remarks);

    const apiUrl = `${backend_mvc}api/transactions-add/${data.request_id}/${session.region}/${newStatus}/${employee_id}/${session.role}`;

    reportData["role"] = session.role;

    console.log(reportData);
    console.log(apiUrl);
    handleAddRemark();
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        handleOpen();
        setShowSuccess(true);

        switch (newStatus) {
          case 2:
            setSuccessMessage("Request rejected succesfully!");
            break;
          case 3:
            setSuccessMessage("Request sent for rework!");
            break;
          default:
            setSuccessMessage("Request updated successfully!");
            break;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        handleOpen();
        showSuccess(false);
        setErrorMessage(error);
      });
  };
  const [showSuccess, setShowSuccess] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const [success_message, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [updateStatusV, setUpdateStatusV] = useState(0);

  const handleConfirm = () => {
    setTimeout(() => {
      setShowSuccess(false);
      handleCloseModal();
    }, 2000); // Close the modal and hide success message after 2 seconds
    console.log("Update Status V:", updateStatusV);

    updateStatus(updateStatusV);
    window.location.reload();
  };
  console.log(rule);
  console.log(rule.rules.can_approve);

  return (
    data["consolidatedRequest"] && (
      <>
        <ReactModal
          isOpen={open}
          onRequestClose={handleClose}
          contentLabel="Request Details"
          style={{
            content: {
              top: "54%",
              left: "58%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#FFF", // White background
              padding: "20px",
              borderRadius: "10px",
              maxHeight: "84vh", // Adjust the height as needed
              maxWidth: "76vw", // Adjust the width as needed
              // Responsive width
            },
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.75)", // Dark overlay
            },
          }}
        >
          <h2>Request Details</h2>
          {data ? (
            <>
              <div>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                  Customer: {data["consolidatedRequest"].customer_name}
                  <br />
                  Consignee: {data.consolidatedRequest.consignee_name}
                  <br />
                  Plant: {data.consolidatedRequest.plant}
                  <br />
                  End Use: {data.consolidatedRequest.enduse_name}
                  <br />
                  Payment Terms ID: {data.consolidatedRequest.payment_terms_id}
                  <br />
                  Valid From: {formatDate(data.consolidatedRequest.valid_from)}
                  <br />
                  Valid To: {formatDate(data.consolidatedRequest.valid_to)}
                  <br />
                  FSC: {data.priceDetails[0].fsc == 1 ? "Yes" : "No"}
                  <br />
                  Mapping Type:{" "}
                  {data.consolidatedRequest.mappint_type == 1
                    ? "One to one"
                    : "One to many"}
                </Typography>
              </div>
              <PriceTable price={data.priceDetails} />
              {data.request_name != undefined && (
                <FileHandling requestId={data.request_name} />
              )}
              <RemarkBox request_id={data.request_id} setRemark={setRemarks} />

              <br />
              {rule.rules.can_approve ? (
                <>
                  <IconButton
                    onClick={() => {
                      if (remarks.length < 11) {
                        setOpenModal(true);
                        setShowSuccess(false);

                        setErrorMessage(
                          "Please enter a remark before updating the status."
                        );
                        return;
                      }
                      setUpdateStatusV((e) => {
                        //handleConfirm(1);
                        return 1;
                      });
                      setOpenModal(true);
                      setShowSuccess(true);
                      setSuccessMessage("Request approved successfully!");
                    }}
                  >
                    <DoneIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      if (remarks.length < 11) {
                        setOpenModal(true);
                        setShowSuccess(false);

                        setErrorMessage(
                          "Please enter a remark before updating the status."
                        );
                        return;
                      }
                      setShowSuccess(false);
                      setErrorMessage(
                        "Are you sure you want to reject this request?"
                      );
                      setOpenModal(true);
                      setUpdateStatusV((e) => {
                        // handleConfirm(2);
                        return 2;
                      });
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      if (remarks.length < 11) {
                        setOpenModal(true);
                        setShowSuccess(false);

                        setErrorMessage(
                          "Please enter a remark before updating the status."
                        );
                        return;
                      }
                      setShowSuccess(false);
                      setErrorMessage(
                        "Are you sure you want to send this request for rework?"
                      );
                      setOpenModal(true);
                      setUpdateStatusV((e) => {
                        // handleConfirm(3);
                        return 3;
                      });
                    }}
                  >
                    <ReplayIcon />
                  </IconButton>
                </>
              ) : null}
              <HistoryModal reqId={id} />
              <button onClick={handleClose}>Close</button>
            </>
          ) : null}
        </ReactModal>
        <ReactModal
          isOpen={openModal}
          onRequestClose={handleCloseModal}
          contentLabel="Request Details"
          style={{
            content: {
              top: "50%",
              left: "60%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#FFF", // White background
              padding: "20px",
              borderRadius: "10px",
              maxHeight: "56vh", // Adjust the height as needed
              maxWidth: "70vw", // Adjust the width as needed
              // Responsive width
            },
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.75)", // Dark overlay
            },
          }}
        >
          <>
            {showSuccess ? (
              <Box sx={{ mt: 2, color: green[500] }}>
                <CheckCircleOutlineIcon
                  sx={{ fontSize: 40, mr: 1, verticalAlign: "middle" }}
                />
                {success_message}
                <br />
                <center>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConfirm}
                    sx={{ mt: 2 }}
                  >
                    Ok
                  </Button>
                </center>
              </Box>
            ) : (
              <Box sx={{ mt: 2, color: "black" }}>
                {/* <ErrorOutlineIcon
                sx={{ fontSize: 40, mr: 1, verticalAlign: "middle" }}
              /> */}
                <br />
                {updateStatusV < 2 ? (
                  <Typography id="modal-modal-description">
                    Failed to create request.
                    <br /> Reason : {errorMessage}
                  </Typography>
                ) : null}
                {updateStatusV < 2 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setOpenModal(false);
                    }}
                    sx={{ mt: 2 }}
                  >
                    Confirm
                  </Button>
                ) : (
                  <>
                    <Typography id="modal-modal-description">
                      {errorMessage}
                    </Typography>
                    <br />
                    <center>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfirm}
                        sx={{ mt: 2 }}
                      >
                        Yes
                      </Button>
                      <div
                        style={{ display: "inline-block", width: "40px" }}
                      ></div>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setOpenModal(false);
                          setUpdateStatusV(0);
                        }}
                        sx={{ mt: 2, marginLeft: 2 }}
                      >
                        No
                      </Button>
                    </center>
                  </>
                )}
              </Box>
            )}
          </>
        </ReactModal>
      </>
    )
  );
}

export default PriceViewModal;
