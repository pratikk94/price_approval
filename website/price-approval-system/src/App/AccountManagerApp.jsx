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
import Dashboard from "../Role_AM/Screens/Dashboard";
import PriceChangeRequests from "../components/common/PriceRequest";
import RequestsHistory from "../Role_AM/Screens/RequestHistory";
import ReportsAndAnalysis from "../Role_AM/Screens/ReportsAndAnalysis";

const drawerWidth = 240;

function ResponsiveDrawer({ logout }) {
  const [activePane, setActivePane] = useState("Dashboard");

  const drawerItems = [
    { text: "Dashboard", component: <Dashboard /> },
    {
      text: "Price Requests",
      component: <PriceChangeRequests role={"AM"} isAM={true} />,
    },
    { text: "Requests History", component: <RequestsHistory /> },
    { text: "Reports and Analytics", component: <ReportsAndAnalysis /> },
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

          <Button
            color="inherit"
            onClick={() => {
              logout();
            }}
          >
            Logout
          </Button>
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
