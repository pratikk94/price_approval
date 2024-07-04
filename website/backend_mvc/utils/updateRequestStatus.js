// models/customerModel.js

const db = require("../config/db");
const { addAuditLog } = require("../utils/auditTrails");
const {
  updatePreApprovedRequestStatus,
} = require("../controllers/requestController");
const requestStatus = async (current_role, region, action, req_id) => {
  //   const { current_role, region, action, req_id } = req.body;
  try {
    const query =
      "SELECT level FROM rule_mvc WHERE approver = @currentRole AND region = @region";
    const roleInfo = await db.executeQuery(query, {
      currentRole: current_role,
      region: region,
    });
    console.log(roleInfo, "testing update status");
    if (roleInfo.recordset.length > 0) {
      const { level } = roleInfo.recordset[0];
      let status = 0;
      let pendingWith = level + 1;
      console.log(action);
      console.log(typeof action);
      switch (action) {
        case "1":
          const query2 =
            "SELECT COUNT(1) AS LevelExists FROM rule_mvc WHERE level = @nextLevel";
          const nextLevelExists = await db.executeQuery(query2, {
            nextLevel: pendingWith,
          });
          if (nextLevelExists.recordset[0].LevelExists === 0) {
            status = 1;
            pendingWith = 0;
          }
          break;
        case "3": // Rework
          if (level === 2) {
            status = -1;
            pendingWith = 1;
          } else if (level > 2) {
            status = -1;
            pendingWith = 2;

            let query3 =
              "INSERT INTO requests_mvc (status, pending, req_id)OUTPUT INSERTED.* VALUES (@status, @pendingWith, @req_id)";
            let result = await db.executeQuery(query3, {
              status: -1,
              pendingWith: 1,
              req_id: req_id,
            });
          }
          updatePreApprovedRequestStatus(req_id, -1);
          break;
        case "7": // Reject
          status = 7;
          pendingWith = 1; // indicates who rejected it
          break;
      }

      let query3 =
        "INSERT INTO requests_mvc (status, pending, req_id)OUTPUT INSERTED.* VALUES (@status, @pendingWith, @req_id)";
      let result = await db.executeQuery(query3, {
        status: status,
        pendingWith: pendingWith,
        req_id: req_id,
      });

      // Add audit log for the INSERT operation
      await addAuditLog("requests_mvc", result.recordset[0].id, "INSERT", null);

      if (pendingWith == 0) {
        updatePreApprovedRequestStatus(req_id, 3);
      }

      return {
        message: "Request status updated successfully",
        status,
        pendingWith,
      };
    } else if (current_role === "AM") {
      const query4 =
        "SELECT COUNT(1) AS LevelExists FROM rule_mvc WHERE level = @nextLevel";
      const nextLevelExists = await db.executeQuery(query4, {
        nextLevel: pendingWith,
      });
      if (nextLevelExists.recordset[0].LevelExists === 0) {
        status = 1;
        pendingWith = -1;
      }

      let query5 =
        "INSERT INTO requests_status_mvc (status, pendingWith, requestStatus)OUTPUT INSERTED.* VALUES (@status, @pendingWith, @requestStatus)";

      let result = await db.executeQuery(query5, {
        status: status,
        pendingWith: pendingWith,
        req_id: req_id,
      });

      // Add audit log for the INSERT operation
      await addAuditLog(
        "requests_status_mvc",
        result.recordset[0].id,
        "INSERT",
        null
      );

      return {
        message: "Request status updated successfully",
        status,
        pendingWith,
      };
    } else {
      throw new Error("Role or region not found", 400);
    }
  } catch (err) {
    throw err;
    // res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  requestStatus,
};
