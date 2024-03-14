import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button, Grid, TextField, TextareaAutosize } from "@mui/material";
import Spacewrapper from "../util/SpacingWrapper";
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
      <Grid xs={12} item>
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
        <Button variant="contained" onClick={handleAddRemark}>
          Post Remark
        </Button>
      </div>
      <div>
        {remarks.map((remark) => (
          <div
            key={remark.id}
            style={{
              border: "1px solid #ccc",
              margin: "10px 0",
              padding: "10px",
            }}
          >
            <p>{remark.text}</p>
            <small>
              Posted by {remark.author}{" "}
              {formatDistanceToNow(new Date(remark.timestamp), {
                addSuffix: true,
              })}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RemarkBox;
