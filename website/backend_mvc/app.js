const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const url = require("./utils");
const ruleRoutes = require("./routes/ruleRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const priceRequestConroller = require("./controllers/priceRequestController");
const dataRoutes = require("./routes/dataRoutes");
const roleRoutes = require("./routes/roleRoutes");
const customerRoutes = require("./routes/customerRoutes");
// const timeZone = "Asia/Kolkata";
// const { format, toZonedTime } = require("date-fns-tz");
// const { listenerCount } = require("events");
// const fs = require("fs");
// const nodemailer = require("nodemailer");
// const upload = multer({ storage: multer.memoryStorage() });
const corsOptions = {
  origin: "http://" + url + ":5173", // or the specific origin you want to allow
  credentials: true, // allowing credentials (cookies, session)
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.json());
app.use(morgan("dev"));

app.post("/process-price-request", priceRequestConroller.processTransaction);
app.use("/api", ruleRoutes);
app.use("/api", transactionRoutes);
app.use("/api", dataRoutes);
app.use("/api/roles", roleRoutes); // Mount the dataRoutes on the '/api' path
app.use("/api", customerRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, url, () => console.log(`Server running on port ${PORT}`));
