const express = require("express");
const router = express.Router();
const sql = require("mssql");
const { Readable } = require("stream"); // Correctly import Readable from 'stream' module

const config = {
  user: "sa",
  password: "Innominds@123",
  server: "localhost",
  port: 1433,
  database: "PriceApprovalSystem",
  options: {
    enableArithAbort: true,
    encrypt: true,
    trustServerCertificate: true, // Set to true in local dev environments
  },
};

// Route to download files based on request id
router.get("/g_files/download/:id", async (req, res) => {
  console.log("In here");
  try {
    await sql.connect(config);
    const result = await sql.query`WITH RelevantRequests AS (
        SELECT parent_req_id 
        FROM [request_status]
        WHERE id = ${req.params.id}
    ),
    ParentRequests AS (
        SELECT req_id, request_name
        FROM [request_status]
        WHERE parent_req_id IN (SELECT parent_req_id FROM RelevantRequests)
    )
    SELECT 
        f.id,f.file_name,f.file_data
    FROM 
        files f
    INNER JOIN 
        ParentRequests pr ON f.request_id = pr.request_name
    INNER JOIN
        [request_status] rs ON f.request_id = rs.request_name`;

    if (result.recordset.length > 0) {
      const file = result.recordset[0];
      const buffer = file.file_data;
      const fileName = file.file_name;

      // Set headers for file download
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      res.setHeader("Content-Type", "application/pdf");

      // Create a readable stream and push the buffer to it
      const readStream = new Readable({
        read() {},
      });
      readStream.push(buffer); // Push data to stream
      readStream.push(null); // Signal the end of stream
      readStream.pipe(res); // Pipe it to response
    } else {
      res.status(404).send("File not found");
    }
  } catch (err) {
    console.error("Error when trying to download file:", err);
    res.status(500).send("Error when trying to download file");
  }
});

module.exports = router;
