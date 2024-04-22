import React, { useState, useEffect } from "react";
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
import { backend_url } from "../../util";
import { useSession } from "../../Login_Controller/SessionContext";

function RemarkBox({ request_id }) {
  const [remarks, setRemarks] = useState([]);
  const [remarkText, setRemarkText] = useState("");
  const { session } = useSession();
  const [requestIds, setRequestIds] = useState([]);

  useEffect(() => {
    // Load request_ids from localStorage
    fetch(`${backend_url}api/remarks?requestId=${request_id}`)
      .then((response) => response.json())
      .then((data) => {
        setRemarks(data); // Combine remarks from multiple requests
      })
      .catch((error) => console.error("Error fetching remarks:", error));
  }, []);

  const handleAddRemark = () => {
    var t_req_id =
      request_id ?? session.employee_id + "-" + new Date().getTime();
    const storedRequestIds =
      JSON.parse(localStorage.getItem("request_ids")) || [];
    setRequestIds(storedRequestIds);
    localStorage.setItem(
      "request_ids",
      JSON.stringify([...storedRequestIds, t_req_id])
    );
    setRequestIds(localStorage.getItem("request_ids"));

    console.log("Request IDs: ", localStorage.getItem("request_ids"));

    const postData = {
      requestId: t_req_id, // This should ideally come from user input or another part of the application logic
      remarksText: remarkText,
      remarkAuthorId: session.employee_id,
    };

    fetch(`${backend_url}api/remarks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        const newRemark = {
          id: remarks.length + 1,
          text: remarkText,
          author: session.employee_id || "User Name",
          timestamp: new Date(),
        };
        setRemarks((prevRemarks) => [newRemark, ...prevRemarks]);

        setRemarkText(""); // Reset input field
      })
      .catch((error) => {
        console.error("Error posting remark:", error);
      });
  };

  console.log("RequestID -> ", request_id);

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
