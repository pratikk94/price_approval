// models/paymentModel.js
// remarksModel.js
const sql = require("mssql");
const config = require("../config"); // Assuming your config file is named dbConfig.js
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to MSSQL successfully! Payment Model");
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));

async function fetchLowestPaymentTermDetails(customers, consignees, endUses) {
  try {
    const pool = await poolPromise;
    const request = pool.request();

    // Convert customer, consignee, and end use lists to string literals for SQL IN clause
    const insertCustomers =
      customers.length > 0
        ? customers.map((c) => `('${c}')`).join(",")
        : `('')`;
    const insertConsignees =
      consignees.length > 0
        ? consignees.map((co) => `('${co}')`).join(",")
        : `('')`;
    const insertEndUses =
      endUses.length > 0 ? endUses.map((e) => `('${e}')`).join(",") : `('')`;

    const query = `
    DECLARE @Customers TABLE (customer_id NVARCHAR(10));
    DECLARE @Consignees TABLE (consignee_id NVARCHAR(10));
    DECLARE @EndUses TABLE (end_use_id NVARCHAR(10));
    
    
    -- contain properly formatted SQL values like "('value1'),('value2'),('value3')"
    INSERT INTO @Customers (customer_id) VALUES ${insertCustomers}; -- e.g., VALUES ('c1'),('c2'),('c3')
    INSERT INTO @Consignees (consignee_id) VALUES ${insertConsignees}; -- e.g., VALUES ('co1'),('co2'),('co3')
    INSERT INTO @EndUses (end_use_id) VALUES ${insertEndUses}; -- e.g., VALUES ('e1'),('e2'),('e3')
    
    -- Running the query to find the lowest payment term and its corresponding terms
    SELECT MIN(ptm.payment_term_id) AS LowestPaymentTerm, pt.terms
    FROM dbo.payment_terms_master ptm
    INNER JOIN payment_terms pt ON pt.id = ptm.payment_term_id
    WHERE (ptm.customer_id IN (SELECT customer_id FROM @Customers) OR ptm.customer_id IS NULL)
      AND (ptm.consignee_id IN (SELECT consignee_id FROM @Consignees) OR ptm.consignee_id IS NULL)
      AND (ptm.end_use_id IN (SELECT end_use_id FROM @EndUses) OR ptm.end_use_id IS NULL)
    GROUP BY pt.terms;
    `;

    console.log(query);

    const result = await request.query(query);
    if (result.recordset.length) {
      return result.recordset[0];
    } else {
      return { LowestPaymentTerm: 5, terms: "Payment within 30 days" };
    }
  } catch (error) {
    console.error("Failed to fetch lowest payment term details", error);
    throw error;
  }
}

module.exports = {
  fetchLowestPaymentTermDetails,
};
