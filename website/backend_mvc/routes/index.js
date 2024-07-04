const express = require("express");

// Import routes
const ruleRoutes = require("./ruleRoutes");
const transactionRoutes = require("./transactionRoutes");
const priceRequestController = require("../controllers/priceRequestController");
const dataRoutes = require("./dataRoutes");
const roleRoutes = require("./roleRoutes");
const customerRoutes = require("./customerRoutes");
const requestRoutes = require("./requestRoutes");
const historyRoutes = require("./historyRoutes");
const remarksRoutes = require("./remarkRoutes");
const authRoutes = require("./authRoutes");
const requestHistoryRoutes = require("./requestHistoryRoutes");
const paymentRoutes = require("./paymentRoutes");
const businessAdminRoutes = require("./businessAdminRoutes");
const plantsRoutes = require("./plantsRoutes");
const gradeRoutes = require("./gradeRoutes");
const fileRoutes = require("./fileRoutes");
const attachmentRoutes = require("./attachmentRoutes");

const routes = [
    { path: "/api", route: ruleRoutes },
    { path: "/api", route: transactionRoutes },
    { path: "/api", route: dataRoutes },
    { path: "/api/roles", route: roleRoutes },
    { path: "/api", route: customerRoutes },
    { path: "/api", route: requestRoutes },
    { path: "/api", route: historyRoutes },
    { path: "/api", route: remarksRoutes },
    { path: "/api", route: requestHistoryRoutes },
    { path: "/api", route: paymentRoutes },
    { path: "/api", route: businessAdminRoutes },
    { path: "/api", route: plantsRoutes },
    { path: "/api", route: gradeRoutes },
    { path: "/api", route: fileRoutes },
    { path: "/api/files", route: attachmentRoutes },
    { path: "/api", route: roleRoutes },
    { path: "/api", route: authRoutes }
  ];
  
  module.exports = routes;