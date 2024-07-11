/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import axios from "axios";
import { backend_mvc } from "../../util";

const MessagesComponent = ({ reqId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${backend_mvc}api/requestHistory/${reqId}`
        );
        console.log(response.data);
        const formattedData = response.data.data.map((transaction) => {
          const dateFormatted = transaction.created_at;
          return {
            ...transaction,
            created_at: dateFormatted,
          };
        });
        setMessages(formattedData);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchData();
  }, [reqId]);

  function setStatus(status) {
    if (status === "Rework" || status === "Rejected") return status;
    else return null;
  }

  return (
    <Paper elevation={3} style={{ padding: 20 }}>
      <Typography variant="h5" gutterBottom>
        Transaction History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Last Updated</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Transaction time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>
                  {transaction.name +
                    " (" +
                    transaction.role +
                    "-" +
                    transaction.last_updated_by_id +
                    ")"}
                </TableCell>
                <TableCell>
                  {transaction.action == "Approved" && transaction.role == "AM"
                    ? "Submited"
                    : transaction.action}
                </TableCell>

                <TableCell>{transaction.created_at}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default MessagesComponent;
