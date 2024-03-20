import React from "react";
import { TextField, Grid, Typography } from "@mui/material";
import { Label } from "@mui/icons-material";

function SetPriceRange() {
  const labels = [
    " ",
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
            {index == 0 ? (
              <>
                <Grid item xs={4} style={{ paddingRight: "5%" }}>
                  <Typography variant="h6">Maximum</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h6">Minimum</Typography>
                </Grid>
              </>
            ) : (
              <>
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
              </>
            )}
          </React.Fragment>
        ))}
      </Grid>
    </div>
  );
}

export default SetPriceRange;
