import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

// Define your styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column", // Changed to column to ensure items are placed top-to-bottom
    backgroundColor: "#E4E4E4",
    padding: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  text: {
    margin: 12,
    fontSize: 12,

    textAlign: "justify",
  },
  table: {
    display: "table",
    width: "auto",
    marginTop: 5, // Added a margin top for spacing between the section and the table
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    borderBottomStyle: "solid",
    alignItems: "center",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#eeeeee",
    borderBottomStyle: "solid",
    backgroundColor: "#f3f3f3",
  },
  tableColHeader: {
    width: "20%",
    padding: 5,
  },
  tableCol: {
    width: "20%",
    padding: 10,
  },
  tableCell: {
    fontSize: 6,
  },
});

// Create document component
function MyDocument({ data }) {
  if (data === undefined) return null;
  else {
    return (
      <Document>
        <Page size="A4" style={styles.page} orientation="landscape">
          <View style={styles.section}>
            <Text>Request ID: {data.req_id}</Text>
            <Text>Customer ID: {data.customer_id}</Text>
            <Text>Consignee ID: {data.consignee_id}</Text>
            <Text>Plant Name: {data.plant_name}</Text>
            <Text>End Use ID: {data.end_use_id}</Text>
            <Text>End Use Segment ID: {data.end_use_segment_id}</Text>
            <Text>Payment Terms ID: {data.payment_terms_id}</Text>
            <Text>Valid From: {data.valid_from}</Text>
            <Text>Valid To: {data.valid_to}</Text>
            <Text>FSC: {data.fsc}</Text>
            <Text>Mapping Type: {data.mapping_type}</Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableColHeader}>Grade</Text>
              <Text style={styles.tableColHeader}>Grade Type</Text>
              <Text style={styles.tableColHeader}>GSM From</Text>
              <Text style={styles.tableColHeader}>GSM To</Text>
              <Text style={styles.tableColHeader}>Agreed Price</Text>
              <Text style={styles.tableColHeader}>Special Discount</Text>
              <Text style={styles.tableColHeader}>Reel Discount</Text>
              <Text style={styles.tableColHeader}>TPC</Text>
              <Text style={styles.tableColHeader}>Offline Discount</Text>
              <Text style={styles.tableColHeader}>Net NSR</Text>
              <Text style={styles.tableColHeader}>Old Net NSR</Text>
            </View>
            {data.price.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCol}>{item.grade}</Text>
                <Text style={styles.tableCol}>{item.grade_type}</Text>
                <Text style={styles.tableCol}>{item.gsm_range_from}</Text>
                <Text style={styles.tableCol}>{item.gsm_range_to}</Text>
                <Text style={styles.tableCol}>{item.agreed_price}</Text>
                <Text style={styles.tableCol}>{item.special_discount}</Text>
                <Text style={styles.tableCol}>{item.reel_discount}</Text>
                <Text style={styles.tableCol}>{item.tpc}</Text>
                <Text style={styles.tableCol}>{item.offline_discount}</Text>
                <Text style={styles.tableCol}>{item.net_nsr}</Text>
                <Text style={styles.tableCol}>{item.old_net_nsr}</Text>
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );
  }
}

export default MyDocument;
