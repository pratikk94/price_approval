const db = require("../config/db");
const { addAuditLog } = require("../utils/auditTrails");
const logger = require("../utils/logger");

const getRoleDetails = async (role) => {
  logger.info(`getRoleDetails called with role: ${role}`);
  try {
    const result = await db.executeQuery(`EXEC FetchRoleByRoleId @role`, {
      role: role,
    });
    logger.info(`getRoleDetails result: ${result}`);
    return result.recordset[0]; // returns the first record or undefined
  } catch (err) {
    logger.error(`SQL error in getRoleDetails: ${err}`);
    throw err;
  }
};

const updateEmployeRole = async (roleDetails) => {
  logger.info(`updateEmployeRole called with roleDetails: ${roleDetails}`);
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
    logger.info(`updateEmployeRole result: ${result}`);
    // Add audit log for the update operation

    await addAuditLog("define_roles", result.recordset[0].id, "UPDATE", null);

    return result;
  } catch (err) {
    logger.error(`SQL error in updateEmployeRole:${err}`);
    throw err;
  }
};


const fetchRoleData = async () => {
  logger.info("fetchRoleData called");
  try {
    let result = await db.executeQuery('EXEC FetchDefinedRoles');
    logger.info(`fetchRoleData result: ${result}`);
    return result;


  } catch (err) {
    logger.error(`SQL error in fetchRoleData: ${err}`);
    throw err;
  }
};

const fetchRoleId = async (id) => {
  logger.info(`fetchRoleId called with id: ${id}`);
  try {
    console.log(id, "check the id.......")
    let result = await db.executeQuery('EXEC FetchDefinedRoleById @id', { "id": id });
    logger.info(`fetchRoleId result: ${result}`);
    return result;
  } catch (err) {
    logger.error(`SQL error in fetchRoleId: ${err}`);
    throw err;
  }
};

module.exports = {
  getRoleDetails,
  updateEmployeRole,
  fetchRoleData,
  fetchRoleId
};