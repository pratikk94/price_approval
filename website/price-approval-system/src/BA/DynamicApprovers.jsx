// src/DynamicApprovers.js
import { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextField, Box, Typography } from "@mui/material";

const DynamicApprovers = () => {
  const [approvers, setApprovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const response = await axios.get(
          "http://192.168.0.5:3000/api/sales_office/Sales%20office%20North"
        );
        setApprovers(response.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchApprovers();
  }, []);

  const addApprover = () => {
    setApprovers([...approvers, { id: approvers.length + 1, approver: "" }]);
  };

  const handleApproverChange = (index, event) => {
    const newApprovers = approvers.map((approver, idx) => {
      if (index === idx) {
        return { ...approver, approver: event.target.value };
      }
      return approver;
    });
    setApprovers(newApprovers);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error loading approvers: {error.message}</Typography>;
  }

  return (
    <Box sx={{ m: 2 }}>
      <Typography variant="h4" gutterBottom>
        Approvers
      </Typography>
      {approvers.map((approver, index) => (
        <Box
          key={approver.id}
          sx={{ display: "flex", alignItems: "center", mb: 2 }}
        >
          <TextField
            label={`Approver ${index + 1}`}
            value={approver.approver}
            onChange={(event) => handleApproverChange(index, event)}
            sx={{ mr: 2 }}
          />
        </Box>
      ))}
      <Button variant="contained" onClick={addApprover}>
        Add Approver
      </Button>
    </Box>
  );
};

export default DynamicApprovers;
