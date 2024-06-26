const express = require("express");
const session = require("express-session");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const url = require("./utils");
const corsOptions = {
  origin: "http://" + url + ":5173", // or the specific origin you want to allow
  credentials: true, // allowing credentials (cookies, session)
};
app.use(cors(corsOptions));
const ruleRoutes = require("./routes/ruleRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const priceRequestConroller = require("./controllers/priceRequestController");
const dataRoutes = require("./routes/dataRoutes");
const roleRoutes = require("./routes/roleRoutes");
const customerRoutes = require("./routes/customerRoutes");
const requestRoutes = require("./routes/requestRoutes");
const historyRoutes = require("./routes/historyRoutes");
const remarksRoutes = require("./routes/remarkRoutes");
const authRoutes = require("./routes/authRoutes");
const requestHistoryRoutes = require("./routes/requestHistoryRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const businessAdminRoutes = require("./routes/businessAdminRoutes");
const plantsRoutes = require("./routes/plantsRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const fileRoutes = require("./routes/fileRoutes");
// const timeZone = "Asia/Kolkata";
// const { format, toZonedTime } = require("date-fns-tz");
// const { listenerCount } = require("events");
// const fs = require("fs");
// const nodemailer = require("nodemailer");
// const upload = multer({ storage: multer.memoryStorage() });
const attachmentRoutes = require("./routes/attachmentRoutes");

app.use(
  session({
    secret: "PratikCodesForFunp",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(authRoutes);
app.use(express.json());
app.use(morgan("dev"));

app.post("/process-price-request", priceRequestConroller.processTransaction);
app.post(
  "/process-pre-approved-price-request",
  priceRequestConroller.processPrevApprovedTransaction
);
app.use("/api", ruleRoutes);
app.use("/api", transactionRoutes);
app.use("/api", dataRoutes);
app.use("/api/roles", roleRoutes); // Mount the dataRoutes on the '/api' path
app.use("/api", customerRoutes);
app.use("/api", requestRoutes);
app.use("/api", historyRoutes);
app.use("/api", remarksRoutes);
app.use("/api", requestHistoryRoutes);
app.use("/api", paymentRoutes);
app.use("/api", businessAdminRoutes);
app.use("/api", plantsRoutes);
app.use("/api", gradeRoutes);
app.use("/api", fileRoutes);
app.use("/api/files", attachmentRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, url, () => console.log(`Server running on port ${PORT}`));
