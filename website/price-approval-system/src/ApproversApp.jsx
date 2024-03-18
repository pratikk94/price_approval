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
  TextField,
} from "@mui/material";
const drawerWidth = 240;
import Dashboard from "./Role_Approvers_RM/Screens/Dashboard";
import PriceRequest from "./Role_Approvers_RM/Screens/PriceRequest";
import ReportsAndAnalysis from "./Role_Approvers_RM/Screens/ReportsAndAnalytics";
function ResponsiveDrawer({ changeScreen }) {
  const [activePane, setActivePane] = useState("Dashboard");

  const drawerItems = [
    { text: "Dashboard", component: <Dashboard /> },
    { text: "Price Requests", component: <PriceRequest /> },
    { text: "Reports and Analytics", component: <ReportsAndAnalysis /> },
  ];

  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    changeScreen(event.target.value);
  };

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
          <TextField
            label="Enter id"
            variant="outlined"
            value={inputValue}
            onChange={handleInputChange}
          />
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

export default ResponsiveDrawer;