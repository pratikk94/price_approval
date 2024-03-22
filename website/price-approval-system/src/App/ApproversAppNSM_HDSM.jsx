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
import Dashboard from "../Role_Approvers_RM/Screens/Dashboard";
import ReportsAndAnalysis from "../Role_Approvers_RM/Screens/ReportsAndAnalytics";
import PriceChangeRequest from "../components/common/PriceRequest";
function ResponsiveDrawer() {
  const [activePane, setActivePane] = useState("Dashboard");

  const drawerItems = [
    { text: "Dashboard", component: <Dashboard /> },
    {
      text: "Price Requests",
      component: <PriceChangeRequest role={"AP_NSM_HDSM"} />,
    },
    { text: "Reports and Analytics", component: <ReportsAndAnalysis /> },
  ];

  const [inputValue, setInputValue] = useState("");

  

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
          
          <Button color="inherit">Logout</Button>
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
