// models/paymentModel.js
// remarksModel.js
const sql = require("mssql");
const config = require("../config"); // Assuming your config file is named dbConfig.js
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to MSSQL");
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));
// models/paymentModel.js
const { poolPromise } = require("../config/database");

const calculateMinPaymentTerm = async (
  customers = [],
  consignees = [],
  endUses = []
) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();

    // Conditionally prepare the table variable inputs based on whether arrays are empty
    const customerValues =
      customers.length > 0
        ? customers.map((c) => `('${c}')`).join(",")
        : "SELECT customer_id FROM dbo.payment_terms_master";
    const consigneeValues =
      consignees.length > 0
        ? consignees.map((co) => `('${co}')`).join(",")
        : "SELECT consignee_id FROM dbo.payment_terms_master WHERE consignee_id IS NOT NULL";
    const endUseValues =
      endUses.length > 0
        ? endUses.map((e) => `('${e}')`).join(",")
        : "SELECT end_use_id FROM dbo.payment_terms_master WHERE end_use_id IS NOT NULL";

    // Dynamic SQL query
    const query = `
            DECLARE @Customers TABLE (customer_id NVARCHAR(10));
            DECLARE @Consignees TABLE (consignee_id NVARCHAR(10));
            DECLARE @EndUses TABLE (end_use_id NVARCHAR(10));

            INSERT INTO @Customers ${
              customers.length > 0
                ? `VALUES ${customerValues}`
                : `EXEC('${customerValues}')`
            };
            INSERT INTO @Consignees ${
              consignees.length > 0
                ? `VALUES ${consigneeValues}`
                : `EXEC('${consigneeValues}')`
            };
            INSERT INTO @EndUses ${
              endUses.length > 0
                ? `VALUES ${endUseValues}`
                : `EXEC('${endUseValues}')`
            };

            CREATE TABLE #PaymentTermsAutoPopulate (
                customer_id NVARCHAR(10),
                consignee_id NVARCHAR(10),
                end_use_id NVARCHAR(10),
                payment_term INT
            );

            ;WITH Permutations AS (
                SELECT 
                    c.customer_id, 
                    co.consignee_id, 
                    e.end_use_id
                FROM 
                    @Customers c
                CROSS JOIN 
                    @Consignees co
                CROSS JOIN 
                    @EndUses e
            )
            INSERT INTO #PaymentTermsAutoPopulate (customer_id, consignee_id, end_use_id, payment_term)
            SELECT 
                p.customer_id, 
                p.consignee_id, 
                p.end_use_id, 
                ISNULL(ptm.payment_term_id, 5)
            FROM 
                Permutations p
            LEFT JOIN 
                dbo.payment_terms_master ptm ON ptm.customer_id = p.customer_id 
                                              AND (ptm.consignee_id = p.consignee_id OR ptm.consignee_id IS NULL)
                                              AND (ptm.end_use_id = p.end_use_id OR ptm.end_use_id IS NULL);

            DECLARE @MinPaymentTerm INT;
            SELECT @MinPaymentTerm = MIN(payment_term) FROM #PaymentTermsAutoPopulate;

            IF @MinPaymentTerm IS NULL
                SET @MinPaymentTerm = 5;

            SELECT 
                ptm.*, 
                @MinPaymentTerm AS LowestPaymentTerm
            FROM 
                dbo.payment_terms_master ptm
            WHERE 
                ptm.payment_term_id = @MinPaymentTerm;

            DROP TABLE #PaymentTermsAutoPopulate;
        `;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};

module.exports = {
  calculateMinPaymentTerm,
};
