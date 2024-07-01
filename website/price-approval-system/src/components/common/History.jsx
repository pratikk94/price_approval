/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Typography, Paper } from "@mui/material";
import axios from "axios";
import { backend_mvc } from "../../util";
// import moment from "moment";

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
          // moment(transaction.created_at).format(
          //   "DD/M/YY HH:mm:ss"
          // );
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
    if (status == "Rework" || status == "Rejecet") return status;
    else return null;
  }

  return (
    <Paper elevation={3} style={{ padding: 20 }}>
      <Typography variant="h5" gutterBottom>
        Transaction History
      </Typography>
      <div>
        {messages.map((transaction, index) => (
          <p key={index}>
            {transaction.last_updated_by_id.toString().includes("(AM)")
              ? "Request was raised"
              : setStatus(transaction.current_status) == null
              ? "Request was approved."
              : "Request put for " + setStatus(transaction.current_status)}{" "}
            by {transaction.last_updated_by_id} on {transaction.created_at}
            <br />
          </p>
        ))}
      </div>
    </Paper>
  );
};

export default MessagesComponent;
