import React, { useEffect, useState } from "react";
import { Typography, Paper } from "@mui/material";
import axios from "axios";

const MessagesComponent = ({ reqId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/get_history_of_price_request?id=${reqId}`
        );
        setMessages(response.data);

        const messagesById = {};

        for (const message of messages) {
          const id = message.split(": ")[0];
          const content = message.split(": ")[1];
          if (!messagesById[id]) {
            messagesById[id] = [content];
          } else {
            messagesById[id].push(content);
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchData();
  }, [reqId]);

  return (
    <Paper elevation={3} style={{ padding: 20 }}>
      <Typography variant="h5" gutterBottom>
        Unique Messages
      </Typography>
      {messages.map((message, index) => (
        <div key={index}>
          <Typography>{message}</Typography>
        </div>
      ))}
    </Paper>
  );
};

export default MessagesComponent;
