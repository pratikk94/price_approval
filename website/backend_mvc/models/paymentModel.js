const db = require("../config/db");
const logger = require("../utils/logger");

async function fetchLowestPaymentTermDetails(customers, consignees, endUses) {
  try {
    logger.info(`Fetching lowest payment term details for customers: ${customers}, consignees: ${consignees}, endUses: ${endUses}`);
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
    SELECT MIN(ptm.payment_term_id) AS LowestPaymentTerm, CONCAT(pt.payment_terms_id,pt.terms) as terms
    FROM dbo.payment_terms_master ptm
    INNER JOIN payment_terms pt ON pt.id = ptm.payment_term_id
    WHERE (ptm.customer_id IN (SELECT customer_id FROM @Customers) OR ptm.customer_id IS NULL)
      AND (ptm.consignee_id IN (SELECT consignee_id FROM @Consignees) OR ptm.consignee_id IS NULL)
      AND (ptm.end_use_id IN (SELECT end_use_id FROM @EndUses) OR ptm.end_use_id IS NULL)
    GROUP BY pt.terms,pt.payment_terms_id;
    `;

    let result = await db.executeQuery(query);

    if (result.recordset.length) {
      logger.info(`Lowest payment term details fetched successfully. Result: ${JSON.stringify(result.recordset[0])}`);
      return result.recordset[0];
    } else {
      const defaultResult = { LowestPaymentTerm: 5, terms: "C030 - Payment within 30 days" };
      logger.info(`No specific payment term found, returning default. Default result: ${JSON.stringify(defaultResult)}`);
      return defaultResult;
    }
  } catch (error) {
    logger.error(`Failed to fetch lowest payment term details. Error: ${error.message}`);
    throw error;
  }
}

async function fetchProfitCenter() {
  try {
    logger.info("Fetching profit centers");

    let result = await db.executeQuery(`EXEC FetchProfitCenters`);

    logger.info(`Profit centers fetched successfully. Result count: ${result.recordset.length}`);
    // Send the results as a response
    return result;
  } catch (error) {
    logger
    logger.error(`An error occurred while fetching profit centers. Error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  fetchLowestPaymentTermDetails,
  fetchProfitCenter,
};
