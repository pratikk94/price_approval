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
import HistoryModal from "../../Role_Business_Admin/Components/RequestHistoryModal";

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

function PriceViewModal({ open, onClose, id, data, isEditable }) {
  const updateStatus = (newStatus) => {
    const apiUrl = `${backend_url}api/update-report-status`;
    const reportData = {
      reportId: id, // Example reportId
      statusUpdatedById: 0, // Example statusUpdatedById
      newStatus: newStatus, // Example new status
    };

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
              <IconButton>
                <DoneIcon
                  onClick={() => {
                    updateStatus(2);
                  }}
                />
              </IconButton>
              <IconButton
                onClick={() => {
                  updateStatus(3);
                }}
              >
                <CloseIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  updateStatus(4);
                }}
              >
                <ReplayIcon />
              </IconButton>
            </>
          ) : null}
          <br />
          <HistoryModal />
          <button onClick={onClose}>Close</button>
        </>
      ) : null}
    </ReactModal>
  );
}

export default PriceViewModal;
