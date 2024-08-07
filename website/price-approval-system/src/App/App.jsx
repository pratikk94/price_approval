/* eslint-disable react/prop-types */
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
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useTheme, useMediaQuery } from "@mui/material";
import Dashboard from "../Generic/Dashboard";
import ReportsAndAnalysis from "../Role_Approvers_RM/Screens/ReportsAndAnalytics";
import ParentComponent from "../Generic/Main";
import { useSession } from "../Login_Controller/SessionContext";
import ApprovedTransactions from "../Generic/Dashboard";

function ResponsiveDrawer({ logout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePane, setActivePane] = useState("Price Requests"); // Initialize with "Dashboard" or whichever is default
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { session } = useSession();
  const drawerWidth = 240;
  const [drawerOpen, setDrawerOpen] = useState(false); // Add this line
  const [anchorEl, setAnchorEl] = useState(null); // State for profile menu

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const drawerItems = [
    { text: "Price Requests", component: <ParentComponent /> },
    { text: "Reports and Analytics", component: <ApprovedTransactions /> },
    { text: "Dashboard", component: <ReportsAndAnalysis /> },
  ];

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {drawerItems.map(({ text }) => (
          <ListItem
            button
            key={text}
            onClick={() => {
              setActivePane(text);
              if (isMobile) setMobileOpen(false);
            }}
          >
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "#156760" }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Logo
          </Typography>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Price Approval System
          </Typography>
          <IconButton color="inherit" onClick={handleProfileMenuOpen}>
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleProfileMenuClose}>
              Role: {session.role}
            </MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>
              Region: {session.region}
            </MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>
              Employee ID: {session.employee_id}
            </MenuItem>
          </Menu>
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawer}
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
