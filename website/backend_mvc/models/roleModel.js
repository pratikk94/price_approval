const db = require("../config/db");
const { addAuditLog } = require("../utils/auditTrails");

const getRoleDetails = async (role) => {
  try {
    const result = await db.executeQuery(`EXEC FetchRoleByRoleId @role`, {
      role: role,
    });
    return result.recordset[0]; // returns the first record or undefined
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};

const updateEmployeRole = async (roleDetails) => {
  try {
    let query = `UPDATE define_roles
    SET employee_name = @newName, role = @newRole, region = @newRegion, active=@newActive
    OUTPUT INSERTED.*
    WHERE employee_id = @employeeId`;

    let input = {
      employeeId: roleDetails.employee_id,
      newName: roleDetails.employee_name,
      newRole: roleDetails.role,
      newActive: roleDetails.active,
      newRegion: roleDetails.region,
    };

    let result = await db.executeQuery(query, input);
    // Add audit log for the update operation

    await addAuditLog("define_roles", result.recordset[0].id, "UPDATE", null);

    return result;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};

// roleModel.js
const sql = require("mssql");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
};

async function fetchRoles() {
  try {
    await sql.connect(config);
    const result =
      await sql.query`SELECT TOP (1000) [employee_name], [employee_id], [role], [region], [created_by], [created_date], [active], [id] FROM [PriceApprovalSystem].[dbo].[define_roles]`;
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}

module.exports = { getRoleDetails, updateEmployeRole, fetchRoles };
