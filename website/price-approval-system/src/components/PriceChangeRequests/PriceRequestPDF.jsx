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
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 10,
  },
  section: {
    margin: 10,
    padding: 5,
    flexGrow: 1,
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    textDecoration: "underline",
  },
  subheader: {
    fontSize: 16,
    margin: 5,
  },
  text: {
    margin: 5,
    fontSize: 14,
    textAlign: "left",
  },
  priceTable: {
    marginTop: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
  },
  priceCell: {
    fontSize: 12,
  },
});
// Create document component
const MyDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.row}>
        {/* Customer ID and Consignee ID in the first row */}
        <View style={styles.column}>
          <Text style={styles.label}>Customer ID:</Text>
          <Text style={styles.value}>cust1, cust2</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Consignee ID:</Text>
          <Text style={styles.value}>cons1, cons2</Text>
        </View>
      </View>
      {/* Other details in subsequent rows */}
      {/* Display price details in a table */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCell}>Grade</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCell}>Grade Type</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCell}>GSM Range</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCell}>Agreed Price</Text>
          </View>
          {/* Add more headers as needed */}
        </View>
        {data[0].price.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.grade}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.grade_type}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text
                style={styles.tableCell}
              >{`${item.gsm_range_from} - ${item.gsm_range_to}`}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.agreed_price}</Text>
            </View>
            {/* Add more cells as needed */}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default MyDocument;
