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
import { backend_url } from "../../util";
import axios from "axios";
import ReactModal from "react-modal";

function PriceTable({ price }) {
  console.log(price);
  return (
    // <div>Table </div>
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
  );
}

function ViewModal({ open, onClose, id }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Update 'your_api_endpoint' with your actual API endpoint
        const response = await axios.get(
          `${backend_url}api/price_requests?id=1083`
        );
        console.log(response.data[0]);
        setData(response.data[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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
      <button onClick={onClose}>Close</button>
    </ReactModal>
  );
}

export default ViewModal;
