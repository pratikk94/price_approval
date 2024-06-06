/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PDFViewer } from "@react-pdf/renderer";
import MyDocument from "./PriceRequestPDF";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function FullScreenDialog({
  open,
  onClose,
  id,
  consolidatedRequest,
  priceRequest,
}) {
  console.log(consolidatedRequest);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Price Request {id}
          </Typography>
        </Toolbar>
      </AppBar>

      <PDFViewer style={{ width: "100%", height: "90vh" }}>
        <MyDocument
          id={id}
          consolidatedRequest={consolidatedRequest}
          data={priceRequest}
        />
      </PDFViewer>
    </Dialog>
  );
}

export default FullScreenDialog;
