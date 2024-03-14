import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  CssBaseline,
  Divider,
} from "@mui/material";
import Dashboard from "../src/Role_Business_Admin/Screens/Dashboard";
import RoleAssignment from "../src/Role_Business_Admin/Screens/RoleAssignment";
import EmployeeManagement from "../src/Role_Business_Admin/Screens/EmployeeManagement";
import SetPriceRange from "../src/Role_Business_Admin/Screens/SetPriceRange";
import PriceRequest from "../src/Role_Business_Admin/Screens/PriceRequest";
import RequestHistory from "../src/Role_Business_Admin/Screens/RequestHistory";
import ReportsAndAnalysis from "../src/Role_Business_Admin/Screens/ReportsAndAnalysis";
import Master from "../src/Role_Business_Admin/Screens/Master";
const drawerWidth = 240;

function BusinessAdminApp() {
  const [activePane, setActivePane] = useState("Dashboard");

  const drawerItems = [
    { text: "Dashboard", component: <Dashboard /> },
    { text: "Role assignment", component: <RoleAssignment /> },
    { text: "Employee Management", component: <EmployeeManagement /> },
    { text: "Set Price Range", component: <SetPriceRange /> },
    { text: "Price Requests", component: <PriceRequest /> },
    { text: "Request History", component: <RequestHistory /> },
    { text: "Reports and Analytics", component: <ReportsAndAnalysis /> },
    { text: "Master", component: <Master /> },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Logo
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {drawerItems.map(({ text }) => (
            <ListItem button key={text} onClick={() => setActivePane(text)}>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {drawerItems.find((item) => item.text === activePane)?.component}
      </Box>
    </Box>
  );
}

export default BusinessAdminApp;
