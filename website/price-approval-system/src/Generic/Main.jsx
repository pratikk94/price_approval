// ParentComponent.jsx
import React, { useState } from "react";
import DataTable from "./DataTable";
import ApproveRequestModal from "./ApproveRequestModal";

const ParentComponent = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <DataTable handleOpen={handleOpen} />
      <ApproveRequestModal open={open} handleClose={handleClose} />
    </div>
  );
};

export default ParentComponent;
