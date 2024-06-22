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
// import DoneIcon from "@mui/icons-material/Done";
// import CloseIcon from "@mui/icons-material/Close";
// import ReplayIcon from "@mui/icons-material/Replay";
import { backend_mvc } from "../util";
import Spacewrapper from "../components/util/SpacingWrapper";
import ReactModal from "react-modal";
// import { IconButton, Modal } from "@mui/material";
import RemarkBox from "../components/common/RemarkBox";
import HistoryModal from "../components/common/History";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FileHandling from "../components/common/FileHandling";
import { useSession } from "../Login_Controller/SessionContext";
import { green } from "@mui/material/colors";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import axios from "axios";
import { Modal } from "@mui/material";
function PriceTable({ price, selectedConsignees, selectedCustomers, plant }) {
  const [historyData, setHistoryData] = useState([]);
  const [open, setOpen] = useState(false);

  console.log(
    "Values are " + selectedConsignees.split(",") + selectedCustomers + plant
  );

  console.log(selectedConsignees.split(","));

  console.log(selectedCustomers.split(",").map((item) => item.value));
  const fetchHistory = async (grade) => {
    try {
      let url = `${backend_mvc}api/history?/history-requests?customerIds=${selectedCustomers.split(
        ","
      )}&consigneeIds=${selectedConsignees.split(",")}&plantIds=${plant.split(
        ","
      )}&grade=${grade}`;
      url = url.replace(" ", "");
      const response = await axios.get(url);
      return response;
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };
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
              <TableCell align="center">Pack UpCharge</TableCell>
              <TableCell align="center">Offline Discount</TableCell>
              <TableCell align="center">Net NSR</TableCell>
              <TableCell align="center">Actions</TableCell>
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
                <TableCell align="right">{row.pack_upcharge}</TableCell>
                <TableCell align="right">{row.offline_discount}</TableCell>
                <TableCell align="right">{row.net_nsr}</TableCell>
                <TableCell align="right">
                  <span style={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      sx={{
                        border: "none",
                      }}
                      onClick={async () => {
                        console.log(row.grade);
                        let response = await fetchHistory(row.grade);
                        console.log(response.data);
                        setHistoryData(response.data);
                        setOpen(true);
                      }}
                    >
                      <WorkHistoryIcon />
                    </Button>
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            backgroundColor: "white", // Changed from 'background.paper' to 'white'
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                {/* Replace with your actual column headers */}
                <TableRow>
                  <TableCell>Request Id</TableCell>
                  <TableCell>Agreed Price</TableCell>
                  <TableCell>Special Discount</TableCell>
                  <TableCell>Reel Discount</TableCell>
                  <TableCell>TPC</TableCell>
                  <TableCell>Pack upcharge</TableCell>
                  <TableCell>Offline Discount</TableCell>
                  <TableCell>Net NSR</TableCell>

                  {/* ... other headers */}
                </TableRow>
              </TableHead>
              <TableBody>
                {historyData.map((row) => (
                  <TableRow key={row.req_id}>
                    <TableCell>{row.req_id[0]}</TableCell>
                    <TableCell>{row.agreed_price}</TableCell>
                    <TableCell>{row.special_discount}</TableCell>
                    <TableCell>{row.reel_discount}</TableCell>
                    <TableCell>{row.tpc}</TableCell>
                    <TableCell>{row.pack_upcharge}</TableCell>
                    <TableCell>{row.offline_discount}</TableCell>
                    <TableCell>{row.net_nsr}</TableCell>

                    {/* ... other cells */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Modal>
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
  console.log(data);
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
  console.log(data["consolidatedRequest"]);
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
                  FSC: {data.priceDetails[0]?.fsc == "Y " ? "Yes" : "No"}
                  <br />
                  Mapping Type:{" "}
                  {data.consolidatedRequest.mappint_type == 1
                    ? "One to one mapping"
                    : "One to many mapping"}
                </Typography>
              </div>
              <PriceTable
                price={data.priceDetails}
                selectedConsignees={data.consolidatedRequest.consignee_ids}
                selectedCustomers={data["consolidatedRequest"].customer_ids}
                plant={data.consolidatedRequest.plant}
              />
              {data.request_id != undefined && (
                <FileHandling requestId={data.request_id} />
              )}
              <Spacewrapper space="24px" />
              {rule.rules.can_approve ? (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <Button
                      variant="contained"
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
                      {/* <DoneIcon /> */}
                      Approve
                    </Button>
                    <Button
                      style={{ marginLeft: "40px" }}
                      variant="contained"
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
                      Rework
                      {/* <ReplayIcon /> */}
                    </Button>
                  </div>
                  <Button
                    style={{
                      backgroundColor: "#f00",
                      color: "#fff",
                    }}
                    variant="contained"
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
                    {/* <CloseIcon /> */}
                    Reject
                  </Button>
                </div>
              ) : null}
              <Spacewrapper space="24px" />
              <RemarkBox request_id={data.request_id} setRemark={setRemarks} />

              <br />
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
