import React from "react";
import { TextField, Grid, Typography } from "@mui/material";

function SetPriceRange() {
  const labels = [
    "Agreed Price",
    "Special Discount",
    "Reel Discount",
    "Pack Up Charge",
    "TPC",
    "Offline Discount",
  ];

  return (
    <div
      style={{
        width: "80%",
        margin: "0 auto",
        height: "80vh",
        marginTop: "10vh",
      }}
    >
      <Grid container spacing={2}>
        {labels.map((label, index) => (
          <React.Fragment key={index}>
            <Grid item xs={4} style={{ paddingRight: "20%" }}>
              <Typography>{label}</Typography>
            </Grid>
            <Grid item xs={4} style={{ paddingRight: "5%" }}>
              <TextField
                fullWidth
                type="number"
                variant="outlined"
                label="Value 1"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                variant="outlined"
                label="Value 2"
              />
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    </div>
  );
}

export default SetPriceRange;
