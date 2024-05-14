const express = require("express");
const app = express();
const morgan = require("morgan");
const ruleRoutes = require("./routes/ruleRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

app.use(express.json());
app.use(morgan("dev"));
app.use("/api", ruleRoutes);
app.use("/api", transactionRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
