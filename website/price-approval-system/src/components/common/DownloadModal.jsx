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
import axios from "axios";
import { backend_url } from "../../util";
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function FullScreenDialog({ open, onClose, id }) {
  const [priceRequests, setPriceRequests] = useState([]);
  const [idR, setIdR] = useState(0);
  useEffect(() => {
    // Replace 'id=6' with dynamic ID if needed
    console.log(id);
    axios
      .get(`${backend_url}api/price_requests?id=${id}`)
      .then((response) => {
        // Assuming the response data is directly the array you want to use

        console.log(response.data[0]);
        setPriceRequests(response.data[0]);
        setIdR(response.data[0]["request_name"]);
        console.log(response.data[0]["request_name"]);
      })
      .catch((error) => console.error("Failed to fetch data:", error));
  }, [id]);
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
            Price Request {idR}
          </Typography>
        </Toolbar>
      </AppBar>

      <PDFViewer style={{ width: "100%", height: "90vh" }}>
        <MyDocument data={priceRequests} id={id} />
      </PDFViewer>
    </Dialog>
  );
}

export default FullScreenDialog;
