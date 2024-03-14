// import {
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
// } from "@mui/material";
// import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
// import MyDocument from "./PriceRequestPDF";
// import { useEffect, useState } from "react";

// export default function DownloadModal({ open, handleClose, setOpen }) {
//   return (
//     <Dialog open={open} onClose={handleClose}>
//       <DialogTitle>Download PDF</DialogTitle>
//       <DialogContent>
//         <DialogContentText>Do you want to download the PDF?</DialogContentText>
//       </DialogContent>
//       <DialogActions>
//         <div>
//           <PDFViewer style={{ width: "100%", height: "90vh" }}>
//             <MyDocument data={priceRequests} />
//           </PDFViewer>
//         </div>
//       </DialogActions>
//       <Button
//         onClick={() => {
//           setOpen(false);
//           console.log("Clicked");
//         }}
//       >
//         Cancel
//       </Button>
//     </Dialog>
//   );
// }

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
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function FullScreenDialog({ open, onClose, id }) {
  const [priceRequests, setPriceRequests] = useState([]);

  useEffect(() => {
    // Replace 'id=6' with dynamic ID if needed
    console.log(id);
    axios
      .get(`http://localhost:3000/api/price-requests?id=63`)
      .then((response) => {
        // Assuming the response data is directly the array you want to use
        setPriceRequests(response.data);
      })
      .catch((error) => console.error("Failed to fetch data:", error));
  }, []);
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
            Full-Screen Dialog
          </Typography>
        </Toolbar>
      </AppBar>

      <PDFViewer style={{ width: "100%", height: "90vh" }}>
        <MyDocument data={priceRequests} id={id} />
      </PDFViewer>
      <Typography variant="body1" style={{ margin: 20 }}>
        This is an example of a full-screen dialog.
      </Typography>
    </Dialog>
  );
}

export default FullScreenDialog;
