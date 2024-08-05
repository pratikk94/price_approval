const { SYMMETRIC_KEY_NAME, CERTIFICATE_NAME } = require("../config/constants");
const db = require("../config/db");

async function fetchLowestPaymentTermDetails(customers, consignees, endUses) {
  try {
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

    // const query = `
    // DECLARE @Customers TABLE (customer_id NVARCHAR(10));
    // DECLARE @Consignees TABLE (consignee_id NVARCHAR(10));
    // DECLARE @EndUses TABLE (end_use_id NVARCHAR(10));


    // -- contain properly formatted SQL values like "('value1'),('value2'),('value3')"
    // INSERT INTO @Customers (customer_id) VALUES ${insertCustomers}; -- e.g., VALUES ('c1'),('c2'),('c3')
    // INSERT INTO @Consignees (consignee_id) VALUES ${insertConsignees}; -- e.g., VALUES ('co1'),('co2'),('co3')
    // INSERT INTO @EndUses (end_use_id) VALUES ${insertEndUses}; -- e.g., VALUES ('e1'),('e2'),('e3')

    // -- Running the query to find the lowest payment term and its corresponding terms
    // SELECT MIN(ptm.payment_term_id) AS LowestPaymentTerm, CONCAT(pt.payment_terms_id,pt.terms) as terms
    // FROM dbo.payment_terms_master ptm
    // INNER JOIN payment_terms pt ON pt.id = ptm.payment_term_id
    // WHERE (ptm.customer_id IN (SELECT customer_id FROM @Customers) OR ptm.customer_id IS NULL)
    //   AND (ptm.consignee_id IN (SELECT consignee_id FROM @Consignees) OR ptm.consignee_id IS NULL)
    //   AND (ptm.end_use_id IN (SELECT end_use_id FROM @EndUses) OR ptm.end_use_id IS NULL)
    // GROUP BY pt.terms,pt.payment_terms_id;
    // `;

    const query = `
    -- Define your dynamic key and certificate names
DECLARE @SymmetricKeyName NVARCHAR(128) = ${SYMMETRIC_KEY_NAME};
DECLARE @CertificateName NVARCHAR(128) = ${CERTIFICATE_NAME};

-- Open the symmetric key using the certificate
OPEN SYMMETRIC KEY @SymmetricKeyName DECRYPTION BY CERTIFICATE @CertificateName;

-- Declare and populate temporary tables
DECLARE @Customers TABLE (customer_id NVARCHAR(10));
DECLARE @Consignees TABLE (consignee_id NVARCHAR(10));
DECLARE @EndUses TABLE (end_use_id NVARCHAR(10));

-- Insert data into @Customers, @Consignees, and @EndUses
INSERT INTO @Customers (customer_id) VALUES ('c1'),('c2'),('c3');
INSERT INTO @Consignees (consignee_id) VALUES ('co1'),('co2'),('co3');
INSERT INTO @EndUses (end_use_id) VALUES ('e1'),('e2'),('e3');

-- Running the query to find the lowest payment term and its corresponding terms with decryption
SELECT 
    MIN(ptm.payment_term_id) AS LowestPaymentTerm, 
    CONCAT(
        CONVERT(NVARCHAR(50), DECRYPTBYKEY(pt.payment_terms_id)), 
        CONVERT(NVARCHAR(50), DECRYPTBYKEY(pt.terms))
    ) AS terms
FROM 
    dbo.payment_terms_master ptm
INNER JOIN 
    payment_terms pt ON pt.id = ptm.payment_term_id
WHERE 
    (ptm.customer_id IN (SELECT customer_id FROM @Customers) OR ptm.customer_id IS NULL)
    AND (ptm.consignee_id IN (SELECT consignee_id FROM @Consignees) OR ptm.consignee_id IS NULL)
    AND (ptm.end_use_id IN (SELECT end_use_id FROM @EndUses) OR ptm.end_use_id IS NULL)
GROUP BY 
    pt.terms, pt.payment_terms_id;

-- Close the symmetric key
CLOSE SYMMETRIC KEY @SymmetricKeyName;
`

    let result = await db.executeQuery(query);

    // let result = await db.executeQuery(`EXEC FindLowestPaymentTermForDynamicIds
    //       @InsertCustomers,
    //       @InsertConsignees,
    //       @InsertEndUses`,{"InsertCustomers":insertCustomers,
    //         "InsertConsignees":insertConsignees,"InsertEndUses":insertEndUses});
    if (result.recordset.length) {
      return result.recordset[0];
    } else {
      return { LowestPaymentTerm: 5, terms: "C030 - Payment within 30 days" };
    }
  } catch (error) {
    console.error("Failed to fetch lowest payment term details", error);
    throw error;
  }
}

async function fetchProfitCenter() {
  try {
    let result = await db.executeQuery(`EXEC FetchProfitCenters`);
    // Send the results as a response
    return result;
  } catch (error) {
    console.error("An error occurred while fetching plants", error);
    throw error;
  }
}

module.exports = {
  fetchLowestPaymentTermDetails,
  fetchProfitCenter,
};
