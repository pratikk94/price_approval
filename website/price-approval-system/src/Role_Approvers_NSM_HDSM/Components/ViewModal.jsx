import React, { useEffect, useState } from "react";
import {
  Modal,
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
import { backend_url } from "../../util";
import axios from "axios";
import ReactModal from "react-modal";
import { IconButton } from "@mui/material";
import RemarkBox from "../../components/common/RemarkBox";
import HistoryModal from "../../components/common/History";
import { useSession } from "../../Login_Controller/SessionContext";
import { green, red } from "@mui/material/colors";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FileHandling from "../../components/common/FileHandling";
function PriceTable({ price }) {
  console.log(price);
  return price ? (
    <>
      <TableContainer component={Paper}>
        <Table aria-label="price table">
          <TableHead>
            <TableRow>
              <TableCell>Grade</TableCell>
              <TableCell align="right">Agreed Price</TableCell>
              <TableCell align="right">Special Discount</TableCell>
              <TableCell align="right">Reel Discount</TableCell>
              <TableCell align="right">TPC</TableCell>
              <TableCell align="right">Offline Discount</TableCell>
              <TableCell align="right">Net NSR</TableCell>
              <TableCell align="right">Old Net NSR</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {price.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row.grade}
                </TableCell>
                <TableCell align="right">{row.agreed_price}</TableCell>
                <TableCell align="right">{row.special_discount}</TableCell>
                <TableCell align="right">{row.reel_discount}</TableCell>
                <TableCell align="right">{row.tpc}</TableCell>
                <TableCell align="right">{row.offline_discount}</TableCell>
                <TableCell align="right">{row.net_nsr}</TableCell>
                <TableCell align="right">{row.old_net_nsr}</TableCell>
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

function PriceViewModal({ openNSM, onClose, id, data, isEditable }) {
  console.log(`Opened VSM:${openNSM}`);
  const { session } = useSession();
  const employee_id = session.employee_id;
  const updateStatus = (newStatus) => {
    let reportData = {
      request_id: id, // Example reportId
      employee_id: employee_id, // Example statusUpdatedById
      action: newStatus, // Example new status
    };
    console.log("New Status: ", newStatus);
    console.log(reportData);
    const apiUrl = `${backend_url}api/update_request_status_manager`;
    reportData["role"] = session.role;

    console.log(reportData);
    console.log(apiUrl);
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
    updateStatus(updateStatusV);
    window.location.reload();
  };

  return (
    <>
      <ReactModal
        isOpen={openNSM}
        onRequestClose={onClose}
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
        <h2>Request Details</h2>
        {data ? (
          <>
            <div>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                Customer: {data.customer_id}
                <br />
                Consignee: {data.consignee_id}
                <br />
                Plant: {data.plant_name}
                <br />
                End Use: {data.end_use_id}
                <br />
                Payment Terms ID: {data.payment_terms_id}
                <br />
                Valid From: {formatDate(data.valid_from)}
                <br />
                Valid To: {formatDate(data.valid_to)}
                <br />
                FSC: {data.fsc == 1 ? "Yes" : "No"}
                <br />
                Mapping Type:{" "}
                {data.mappint_type == 1 ? "One to one" : "One to many"}
              </Typography>
            </div>
            <PriceTable price={data.price} />
            <FileHandling request_id={data.request_name} />
            <RemarkBox request_id={data.request_name} />
            {isEditable ? (
              <>
                <IconButton
                  onClick={() => {
                    setUpdateStatusV(1);
                    handleConfirm();
                  }}
                >
                  <DoneIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setShowSuccess(false);
                    setErrorMessage(
                      "Are you sure you want to reject this request?"
                    );
                    setOpenModal(true);
                    setUpdateStatusV(2);
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setShowSuccess(false);
                    setErrorMessage(
                      "Are you sure you want to send this request for rework?"
                    );
                    setOpenModal(true);
                    setUpdateStatusV(3);
                  }}
                >
                  <ReplayIcon />
                </IconButton>
              </>
            ) : null}
            <br />
            <HistoryModal reqId={id} />
            <button onClick={onClose}>Close</button>
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
                  Confirm
                </Button>
              </center>
            </Box>
          ) : (
            <Box sx={{ mt: 2, color: red[500] }}>
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
                  onClick={handleConfirm}
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
                    <div style={{ display: "inline-block", width: "40" }}></div>
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
  );
}

export default PriceViewModal;
