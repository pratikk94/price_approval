const db = require("../config/db");
const { addAuditLog } = require("../utils/auditTrails");
const {
  updatePreApprovedRequestStatus,
} = require("../controllers/requestController");
const { STATUS } = require("../config/constants");
const logger = require("../utils/logger");

const requestStatus = async (current_role, region, action, req_id) => {
  try {
    logger.info(`RequestStatus called with role: ${current_role}, region: ${region}, action: ${action}, req_id: ${req_id}`);
    const query =
      "SELECT level FROM rule_mvc WHERE approver = @currentRole AND region = @region";
    const roleInfo = await db.executeQuery(query, {
      currentRole: current_role,
      region: region,
    });
    logger.info(`Role Info: ${JSON.stringify(roleInfo.recordset)}`);
    if (roleInfo.recordset.length > 0) {
      const { level } = roleInfo.recordset[0];
      let status = 0;
      let pendingWith = level + 1;
      logger.info(`Action: ${action}, Level: ${level}`);
      switch (action) {
        case STATUS.APPROVED:
          const query2 =
            "SELECT COUNT(1) AS LevelExists FROM rule_mvc WHERE level = @nextLevel";
          const nextLevelExists = await db.executeQuery(query2, {
            nextLevel: pendingWith,
          });
          logger.info(`Next Level Exists: ${nextLevelExists.recordset[0].LevelExists}`);
          // If request has no more levels, set status to approved
          if (nextLevelExists.recordset[0].LevelExists === 0) {
            status = STATUS.APPROVED;
            pendingWith = 0;
          }
          break;
        case STATUS.REWORK: // Rework
          if (level === 2) {
            status = STATUS.REWORK;
            pendingWith = 1;
          } else if (level > 2) {
            status = STATUS.REWORK;
            pendingWith = 2;
          }
          updatePreApprovedRequestStatus(req_id, STATUS.REWORK);
          break;
        case STATUS.REJECTED: // Reject
          status = STATUS.REJECTED;
          pendingWith = 1; // indicates who rejected it
          break;
        //do nothing for the below
        case STATUS.BLOCKED:
        case STATUS.PENDING:
        case STATUS.COPY:
        case STATUS.MERGE:
          break;
      }

      let query3 =
        "INSERT INTO requests_mvc (status, pending, req_id)OUTPUT INSERTED.* VALUES (@status, @pendingWith, @req_id)";
      let result = await db.executeQuery(query3, {
        status: status,
        pendingWith: pendingWith,
        req_id: req_id,
      });
      logger.info(`Request Inserted: ${JSON.stringify(result.recordset[0])}`);
      // Add audit log for the INSERT operation
      await addAuditLog("requests_mvc", result.recordset[0].id, "INSERT", null);

      //REQUEST COMPLETELY APPROVED.
      if (pendingWith == 0) {
        updatePreApprovedRequestStatus(req_id, STATUS.COMPLETELY_APPROVED);
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

      switch (action) {
        case STATUS.APPROVED:
          updatePreApprovedRequestStatus(req_id, STATUS.APPROVED);
          break;
        case STATUS.BLOCKED:
        case STATUS.PENDING:
        case STATUS.COPY:
        case STATUS.MERGE:
          break;
      }

      let query5 =
        "INSERT INTO requests_status_mvc (status, pendingWith, requestStatus)OUTPUT INSERTED.* VALUES (@status, @pendingWith, @req_id)";

      let result = await db.executeQuery(query5, {
        status: status,
        pendingWith: pendingWith,
        req_id: req_id,
      });
      logger.info(`Request Inserted: ${JSON.stringify(result.recordset[0])}`);
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
    logger.error(`Error updating request status: ${err.message}`, { stack: err.stack });
    throw err;
    // res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  requestStatus,
};
