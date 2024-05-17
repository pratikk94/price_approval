const express = require("express");
const app = express();
const morgan = require("morgan");
const ruleRoutes = require("./routes/ruleRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const priceRequestConroller = require("./controllers/priceRequestController");
const dataRoutes = require("./routes/dataRoutes");
app.use(express.json());
app.use(morgan("dev"));

app.post("/process-price-request", priceRequestConroller.processTransaction);
app.use("/api", ruleRoutes);
app.use("/api", transactionRoutes);
app.use("/api", dataRoutes); // Mount the dataRoutes on the '/api' path

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
