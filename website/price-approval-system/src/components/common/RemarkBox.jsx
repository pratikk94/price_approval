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

function RemarkBox({ request_id, setRemark }) {
  const [remarks, setRemarks] = useState([]);
  const [remarkText, setRemarkText] = useState("");
  const { session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [editId, setEditId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Fetch remarks data using the new API logic
    fetch(`${backend_url}api/remarks?request_id=${request_id}`)
      .then((response) => response.json())
      .then((data) => setRemarks(data))
      .catch((error) => console.error("Error fetching remarks:", error));
  }, [request_id]);

  const latestRemark = remarks.length ? remarks[0] : null;
  const olderRemarks = remarks.length > 1 ? remarks.slice(1) : [];

  return (
    <div>
      <Grid item xs={12}>
        <TextField
          multiline
          variant="outlined"
          fullWidth
          value={remarkText}
          onChange={(e) => {
            setRemarkText(e.target.value);
            setRemark(e.target.value);
          }}
          placeholder="Type your remark..."
        />
      </Grid>
      <Spacewrapper space="12px" />

      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Latest Remark</TableCell>
              <TableCell>Posted By</TableCell>
              <TableCell>Date of Comment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {latestRemark && (
              <TableRow key={latestRemark.id}>
                <TableCell>{latestRemark.text}</TableCell>
                <TableCell>{latestRemark.authorId}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(latestRemark.timestamp), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={4}>
                <Button onClick={() => setShowDropdown((prev) => !prev)}>
                  {showDropdown ? "Hide Older Remarks" : "Show Older Remarks"}
                </Button>
              </TableCell>
            </TableRow>
            {showDropdown &&
              olderRemarks.map((remark) => (
                <TableRow key={remark.id}>
                  <TableCell>{remark.text}</TableCell>
                  <TableCell>{remark.authorId}</TableCell>
                  <TableCell>
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
