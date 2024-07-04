const express = require("express");
const session = require("express-session");
const morgan = require("morgan");
const cors = require("cors");
const setupSwagger = require("./config/swagger");
const routes = require("./routes");
const setupRoutes = require("./utils/routeSetup");
const priceRequestController = require("./controllers/priceRequestController");


// Initialize Express app
const app = express();

// Set up CORS options
const corsOptions = {
  origin: "http://192.168.1.109:5173", // or the specific origin you want to allow
  credentials: true, // allowing credentials (cookies, session)
};
app.use(cors(corsOptions));

// Set up Swagger
setupSwagger(app);

// Session configuration
app.use(
  session({
    secret: "PratikCodesForFunp",
    resave: false,
    saveUninitialized: true,
  })
);

// Use middleware
// app.use(authRoutes);
app.use(express.json());
app.use(morgan("dev"));

// Use routes
setupRoutes(app, routes);

// Specific routes
app.post("/process-price-request", priceRequestController.processTransaction);
app.post("/process-pre-approved-price-request", priceRequestController.processPrevApprovedTransaction);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
