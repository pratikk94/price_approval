// models/customerModel.js
const sql = require("mssql");
const config = require("../../backend_mvc/config");
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to MSSQL");
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));

exports.updateRequestStatus = async (req, res) => {
  const { current_role, region, action, req_id } = req.body;
  try {
    const pool = await poolPromise;
    const roleInfo = await pool
      .request()
      .input("currentRole", sql.VarChar, current_role)
      .input("region", sql.VarChar, region)
      .query(
        "SELECT level FROM rule_mvc WHERE approver = @currentRole AND region = @region"
      );

    if (roleInfo.recordset.length > 0) {
      const { level } = roleInfo.recordset[0];
      let status = 0;
      let pendingWith = level + 1;
      console.log(action);
      console.log(typeof action);
      switch (action) {
        case "1": // Approve
          const nextLevelExists = await pool
            .request()
            .input("nextLevel", sql.Int, pendingWith)
            .query(
              "SELECT COUNT(1) AS LevelExists FROM rule_mvc WHERE level = @nextLevel"
            );
          if (nextLevelExists.recordset[0].LevelExists === 0) {
            status = 1;
            pendingWith = 0;
          }
          break;
        case "2": // Rework
          if (level === 2) {
            status = 2;
            pendingWith = 1;
          } else if (level > 2) {
            status = 2;
            pendingWith = 2;
          }
          break;
        case "3": // Reject
          status = 3;
          pendingWith = level; // indicates who rejected it
          break;
      }

      // Insert the status update into requests_status_mvc
      await pool
        .request()
        .input("status", sql.Int, status)
        .input("pendingWith", sql.Int, pendingWith)
        .input("req_id", sql.VarChar, req_id)
        .query(
          "INSERT INTO requests_mvc (status, pending, req_id) VALUES (@status, @pendingWith, @req_id)"
        );

      res.json({
        message: "Request status updated successfully",
        status,
        pendingWith,
      });
    } else if (current_role === "AM") {
      const nextLevelExists = await pool
        .request()
        .input("nextLevel", sql.Int, pendingWith)
        .query(
          "SELECT COUNT(1) AS LevelExists FROM rule_mvc WHERE level = @nextLevel"
        );
      if (nextLevelExists.recordset[0].LevelExists === 0) {
        status = 1;
        pendingWith = -1;
      }
      await pool
        .request()
        .input("status", sql.Int, status)
        .input("pendingWith", sql.Int, pendingWith)
        .input("req_id", sql.VarChar, req_id)
        .query(
          "INSERT INTO requests_status_mvc (status, pendingWith, requestStatus) VALUES (@status, @pendingWith, @requestStatus)"
        );

      res.json({
        message: "Request status updated successfully",
        status,
        pendingWith,
      });
    } else {
      res.status(404).json({ message: "Role or region not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};