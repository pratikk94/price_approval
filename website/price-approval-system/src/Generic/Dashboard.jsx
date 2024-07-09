import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  card: {
    backgroundColor: "#004d40",
    color: "white",
  },
  tabLabel: {
    fontSize: "1rem",
    fontWeight: "bold",
  },
  tableHeader: {
    backgroundColor: "#004d40",
    color: "white",
  },
  tableCell: {
    fontWeight: "bold",
  },
  dialogTitle: {
    backgroundColor: "#004d40",
    color: "white",
  },
  dialogContent: {
    padding: "24px",
  },
  button: {
    margin: "8px",
  },
});

const ApprovedTransactions = () => {
  const classes = useStyles();
  const [transactions, setTransactions] = useState([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [reworkedCount, setReworkedCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);

  const apiEndpoints = [
    "http://192.168.1.103:3000/api/completed-transactions/Approved",
    "http://192.168.1.103:3000/api/completed-transactions/Rejected",
    "http://192.168.1.103:3000/api/completed-transactions/Reworked",
  ];

  useEffect(() => {
    const fetchTransactionCounts = async () => {
      try {
        const approvedResponse = await axios.get(apiEndpoints[0]);
        setApprovedCount(approvedResponse.data.length);

        const rejectedResponse = await axios.get(apiEndpoints[1]);
        setRejectedCount(rejectedResponse.data.length);

        const reworkedResponse = await axios.get(apiEndpoints[2]);
        setReworkedCount(reworkedResponse.data.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchTransactionCounts();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(apiEndpoints[currentTab]);
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchTransactions();
  }, [currentTab]);

  const handleClickOpen = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedTransaction(null);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <div>
      <Tabs
        style={{ marginTop: "-14%" }}
        value={currentTab}
        onChange={handleTabChange}
        centered
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab
          label={`Approved (${approvedCount})`}
          className={classes.tabLabel}
        />
        <Tab
          label={`Rejected (${rejectedCount})`}
          className={classes.tabLabel}
        />
        <Tab
          label={`Reworked (${reworkedCount})`}
          className={classes.tabLabel}
        />
      </Tabs>

      <Grid
        container
        spacing={2}
        style={{ marginBottom: "20px", marginTop: "0px" }}
      >
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h5" component="div">
                {currentTab === 0
                  ? "Approved Transactions"
                  : currentTab === 1
                  ? "Rejected Transactions"
                  : "Reworked Transactions"}
              </Typography>
              <Typography variant="body2" color="inherit">
                Total{" "}
                {currentTab === 0
                  ? "Approved"
                  : currentTab === 1
                  ? "Rejected"
                  : "Reworked"}
                :{" "}
                {currentTab === 0
                  ? approvedCount
                  : currentTab === 1
                  ? rejectedCount
                  : reworkedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow className={classes.tableHeader}>
              <TableCell className={classes.tableCell}>Customer Name</TableCell>
              <TableCell className={classes.tableCell}>
                Consignee Names
              </TableCell>
              <TableCell className={classes.tableCell}>Plant</TableCell>
              <TableCell className={classes.tableCell}>
                End Use Segment
              </TableCell>
              <TableCell className={classes.tableCell}>Payment Terms</TableCell>
              <TableCell className={classes.tableCell}>Valid From</TableCell>
              <TableCell className={classes.tableCell}>Valid To</TableCell>
              <TableCell className={classes.tableCell}>Mapping Type</TableCell>
              <TableCell className={classes.tableCell}>Request ID</TableCell>
              <TableCell className={classes.tableCell}>AM ID</TableCell>
              <TableCell className={classes.tableCell}>Request Name</TableCell>
              <TableCell className={classes.tableCell}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>
                  {transaction.consolidatedRequest.customer_name}
                </TableCell>
                <TableCell>
                  {transaction.consolidatedRequest.consignee_names.join(", ")}
                </TableCell>
                <TableCell>{transaction.consolidatedRequest.plant}</TableCell>
                <TableCell>
                  {transaction.consolidatedRequest.end_use_segment_id}
                </TableCell>
                <TableCell>
                  {transaction.consolidatedRequest.payment_terms_id}
                </TableCell>
                <TableCell>
                  {new Date(
                    transaction.consolidatedRequest.valid_from
                  ).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(
                    transaction.consolidatedRequest.valid_to
                  ).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {transaction.consolidatedRequest.mappint_type}
                </TableCell>
                <TableCell>{transaction.consolidatedRequest.req_id}</TableCell>
                <TableCell>{transaction.consolidatedRequest.am_id}</TableCell>
                <TableCell>
                  {transaction.consolidatedRequest.request_name}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    className={classes.button}
                    onClick={() => handleClickOpen(transaction)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle className={classes.dialogTitle}>
          Transaction Details
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {selectedTransaction && (
            <div>
              <Typography variant="h6">Consolidated Request</Typography>
              <Box sx={{ marginBottom: 2 }}>
                {Object.entries(selectedTransaction.consolidatedRequest).map(
                  ([key, value]) => (
                    <Typography key={key} variant="body2">
                      <strong>{key.replace(/_/g, " ")}:</strong>{" "}
                      {Array.isArray(value) ? value.join(", ") : value}
                    </Typography>
                  )
                )}
              </Box>

              <Typography variant="h6" style={{ marginTop: "20px" }}>
                Price Details
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow className={classes.tableHeader}>
                      <TableCell className={classes.tableCell}>
                        Request ID
                      </TableCell>
                      <TableCell className={classes.tableCell}>Grade</TableCell>
                      <TableCell className={classes.tableCell}>FSC</TableCell>
                      <TableCell className={classes.tableCell}>
                        Grade Type
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        GSM Range From
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        GSM Range To
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        Agreed Price
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        Special Discount
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        Reel Discount
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        Pack Upcharge
                      </TableCell>
                      <TableCell className={classes.tableCell}>TPC</TableCell>
                      <TableCell className={classes.tableCell}>
                        Offline Discount
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        Net NSR
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        Old Net NSR
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTransaction.priceDetails.map(
                      (priceDetail, index) => (
                        <TableRow key={index}>
                          <TableCell>{priceDetail.req_id}</TableCell>
                          <TableCell>{priceDetail.grade}</TableCell>
                          <TableCell>{priceDetail.fsc}</TableCell>
                          <TableCell>{priceDetail.grade_type}</TableCell>
                          <TableCell>{priceDetail.gsm_range_from}</TableCell>
                          <TableCell>{priceDetail.gsm_range_to}</TableCell>
                          <TableCell>{priceDetail.agreed_price}</TableCell>
                          <TableCell>{priceDetail.special_discount}</TableCell>
                          <TableCell>{priceDetail.reel_discount}</TableCell>
                          <TableCell>{priceDetail.pack_upcharge}</TableCell>
                          <TableCell>{priceDetail.tpc}</TableCell>
                          <TableCell>{priceDetail.offline_discount}</TableCell>
                          <TableCell>{priceDetail.net_nsr}</TableCell>
                          <TableCell>{priceDetail.old_net_nsr}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ApprovedTransactions;
