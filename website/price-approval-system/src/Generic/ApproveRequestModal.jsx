/* eslint-disable react/prop-types */
// ApproveRequestModal.jsx

import { Modal } from "@mui/material";
import Customer from "../components_mvc/Customer";
import { useSession } from "../Login_Controller/SessionContext";

const ApproveRequestModal = ({ open, handleClose }) => {
  const { session } = useSession();

  console.log(session.region);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          backgroundColor: "white", // Changed from 'background.paper' to 'white'
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <h2 id="modal-modal-title">Approve Request</h2>
        <p id="modal-modal-description">
          Select a customer to approve the request.
        </p>
        <Customer role={1} salesOffice={session.region} />
        <Customer role={2} salesOffice={session.region} />
      </div>
    </Modal>
  );
};

export default ApproveRequestModal;
