import { Button, Container } from "@mui/material";
import RuleEditModal from "./RuleEditModal";
import SalesOfficeSelector from "./SalesOfficeSelector"; // Adjust the path as necessary
import { useState } from "react";

export const RuleModal = () => {
  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRuleUpdated = (updatedRule) => {
    console.log("Rule updated:", updatedRule);
    // handle rule update logic here
  };
  return (
    <>
      <Container>
         <RuleEditModal
          open={modalOpen}
          handleClose={handleClose}
          onRuleUpdated={handleRuleUpdated}
        />
      </Container>
    </>
  );
};
