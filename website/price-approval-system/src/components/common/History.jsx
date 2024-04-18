import React, { useEffect, useState } from "react";
import { Typography, Paper } from "@mui/material";
import axios from "axios";
import { backend_url } from "../../util";
import { format, parseISO } from "date-fns";
import moment from "moment";
import "moment-timezone";
function formatMomentDate(input) {
  const date = moment(input, "MMM DD YYYY h:mmA");

  return moment(date).tz("Asia/Kolkata").format("DD/MM/YYYY HH:mm:ss");
}

const MessagesComponent = ({ reqId }) => {
  const [messages, setMessages] = useState([]);
  const [log, setLog] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${backend_url}api/get_history_of_price_request?id=${reqId}`
        );

        for (let i = 0; i < response.data.length; i++) {
          console.log(response.data[i].split(" "));
          let changedtime = "";
          if (response.data[i].split(" ")[0] != "AM") {
            const time = response.data[i].split(" ").slice(6, 7);
            console.log(time);
            changedtime = format(
              parseISO(response.data[i].split(" ").slice(6, 7).join("")),
              "d/M/yy H:mm:ss"
            );
          } else {
            changedtime = formatMomentDate(
              response.data[i].split(" ").slice(6, 11)
            );
          }

          response.data[i] = [
            response.data[i].split(" ").slice(0, 6),
            changedtime,
          ].join(" ");
          console.log(response.data[i]);
        }
        // response.data[i] = response.data[i];

        console.log(response.data);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchData();
  }, [reqId]);

  return (
    <Paper elevation={3} style={{ padding: 20 }}>
      <Typography variant="h5" gutterBottom>
        Request History
      </Typography>
      <div>
        {messages.map((entry, index) => (
          <p key={index}>{entry}</p>
        ))}
      </div>
    </Paper>
  );
};

export default MessagesComponent;
