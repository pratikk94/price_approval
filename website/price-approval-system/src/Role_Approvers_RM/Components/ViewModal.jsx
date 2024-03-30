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
} from "@material-ui/core";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";
import { backend_url } from "../../util";
import axios from "axios";
import ReactModal from "react-modal";
import { IconButton } from "@mui/material";
import RemarkBox from "../../components/common/RemarkBox";
import { useSession } from "../../Login_Controller/SessionContext";
import HistoryModal from "../../components/common/History";

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

function PriceViewModal({ open, onClose, id, data, isEditable, role, mode }) {
  console.log("Mode: ", mode);
  console.log("IDSI", id, data, isEditable, role, mode);
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
        alert("Report status updated successfully!");
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Failed to update report status.");
      });
  };
  return (
    <ReactModal
      isOpen={open}
      onRequestClose={onClose}
      contentLabel="Request Details"
      style={{
        content: {
          top: "50%",
          left: "50%",
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
              Customer ID: {data.customer_id}
              <br />
              Consignee ID: {data.consignee_id}
              <br />
              Plant: {data.plant}
              <br />
              End Use ID: {data.end_use_id}
              <br />
              End Use Segment ID: {data.end_use_segment_id}
              <br />
              Payment Terms ID: {data.payment_terms_id}
              <br />
              Valid From: {data.valid_from}
              <br />
              Valid To: {data.valid_to}
              <br />
              FSC: {data.fsc}
              <br />
              Mapping Type: {data.mappint_type}
            </Typography>
          </div>
          <PriceTable price={data.price} />
          <RemarkBox />
          {isEditable ? (
            <>
              <IconButton
                onClick={() => {
                  updateStatus(mode);
                }}
              >
                <DoneIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  updateStatus(2);
                }}
              >
                <CloseIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  updateStatus(3);
                }}
              >
                <ReplayIcon />
              </IconButton>
            </>
          ) : null}
          <HistoryModal reqId={id} />
          <br />
          <button onClick={onClose}>Close</button>
        </>
      ) : null}
    </ReactModal>
  );
}

export default PriceViewModal;
