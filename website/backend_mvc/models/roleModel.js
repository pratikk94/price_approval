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


const fetchRoleData = async () => {
  try {
    let result = await db.executeQuery('EXEC FetchDefinedRoles');
    return result;

    
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};

const fetchRoleId = async (id) => {
  try {
    console.log(id,"check the id.......")
    let result = await db.executeQuery('EXEC FetchDefinedRoleById @id',{"id":id});
    return result;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};

module.exports = {
   getRoleDetails, 
   updateEmployeRole, 
   fetchRoleData,
   fetchRoleId
  };