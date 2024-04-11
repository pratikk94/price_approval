import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Button,
  Grid,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Spacewrapper from "../util/SpacingWrapper";
import SendIcon from "@mui/icons-material/Send";

function RemarkBox() {
  const [remarks, setRemarks] = useState([]);
  const [remarkText, setRemarkText] = useState("");

  const handleAddRemark = () => {
    const newRemark = {
      id: remarks.length + 1, // Simple ID generation
      text: remarkText,
      author: "User Name", // Static author name, replace with dynamic data if available
      timestamp: new Date(),
    };
    setRemarks((prevRemarks) => [...prevRemarks, newRemark]);
    setRemarkText(""); // Reset input field
  };

  return (
    <div>
      <Grid item xs={12}>
        <TextField
          multiline
          variant="outlined"
          fullWidth
          value={remarkText}
          onChange={(e) => setRemarkText(e.target.value)}
          placeholder="Type your remark..."
        />
      </Grid>
      <Spacewrapper space="12px" />

      <div style={{ display: "flex", justifyContent: "end" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddRemark}
          startIcon={<SendIcon />}
        >
          Send
        </Button>
      </div>

      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell style={{ width: "5%" }}>ID</TableCell>
              <TableCell style={{ width: "70%" }}>Comment</TableCell>
              <TableCell style={{ width: "15%" }}>Posted By</TableCell>
              <TableCell style={{ width: "10%" }}>Date of Comment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {remarks.map((remark) => (
              <TableRow key={remark.id}>
                <TableCell component="th" scope="row" style={{ width: "5%" }}>
                  {remark.id}
                </TableCell>
                <TableCell style={{ width: "70%" }}>{remark.text}</TableCell>
                <TableCell style={{ width: "15%" }}>{remark.author}</TableCell>
                <TableCell style={{ width: "10%" }}>
                  {formatDistanceToNow(new Date(remark.timestamp), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default RemarkBox;
