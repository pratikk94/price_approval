/* eslint-disable react/prop-types */
import { useState } from "react";
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
  // TextField,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme, useMediaQuery } from "@mui/material";
import Dashboard from "../Role_Approvers_RM/Screens/Dashboard";

import ReportsAndAnalysis from "../Role_Approvers_RM/Screens/ReportsAndAnalytics";
import ParentComponent from "../Generic/Main";
import { useSession } from "../Login_Controller/SessionContext";
function ResponsiveDrawer({ logout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePane, setActivePane] = useState("Dashboard"); // Initialize with "Dashboard" or whichever is default
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { session } = useSession();
  const drawerWidth = 240;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerItems = [
    { text: "Dashboard", component: <Dashboard /> },
    { text: "Price Requests", component: <ParentComponent /> },
    { text: "Reports and Analytics", component: <ReportsAndAnalysis /> },
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
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Logo
          </Typography>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {session.role}
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
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
