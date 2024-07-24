const { SYMMETRIC_KEY_NAME, CERTIFICATE_NAME } = require("../config/constants");
const db = require("../config/db");
const { addAuditLog } = require("../utils/auditTrails");

const getRoleDetails = async (role) => {
  try {
    const result = await db.executeQuery(`EXEC FetchRoleByRoleId @role,@SymmetricKeyName,@CertificateName`, {
      role: role,
      SymmetricKeyName: SYMMETRIC_KEY_NAME,
      CertificateName: CERTIFICATE_NAME
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
    let result = await db.executeQuery("EXEC FetchDefinedRoles");
    return result;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};

const fetchRoleId = async (id) => {
  try {
    console.log(id, "check the id.......");
    let result = await db.executeQuery("EXEC FetchDefinedRoleById @id, @SymmetricKeyName,@CertificateName`", {
      id: id,
      SymmetricKeyName: SYMMETRIC_KEY_NAME,
      CertificateName: CERTIFICATE_NAME
    });

    return result;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};

async function fetchRoles() {
  try {
    let result = await db.executeQuery(
      "SELECT [id], [role], [can_approve], [can_initiate], [can_rework], [can_view], [hierarchy] FROM role_matrix ORDER BY hierarchy ASC"
    );
    console.log(result.recordset);
    return result.recordset;
  } catch (err) {
    console.error(err);
  }
}

async function addRole(role, adjustHierarchy) {
  try {
    await db.executeQuery(
      "UPDATE role_matrix SET hierarchy = hierarchy + 1 WHERE hierarchy >= @hierarchy",
      { hierarchy: role.hierarchy }
    );

    let result = await db.executeQuery(
      `INSERT INTO role_matrix (role, can_approve, can_initiate, can_rework, can_view, hierarchy) VALUES (@role, @can_approve, @can_initiate, @can_rework, @can_view, @hierarchy)`,
      {
        role: role.role,
        can_approve: role.can_approve,
        can_initiate: role.can_initiate,
        can_rework: role.can_rework,
        can_view: role.can_view,
        hierarchy: role.hierarchy,
      }
    );

    return result;
  } catch (err) {
    console.error(err);
    if (transaction) await transaction.rollback();
  }
}

async function updateRole(role) {
  try {
    // result = await db.executeQuery(
    //   "UPDATE role_matrix SET can_approve = @can_approve, can_initiate = @can_initiate, can_rework = @can_rework, can_view = @can_view WHERE id = @id",
    //   {
        // can_approve: role.can_approve,
        // can_initiate: role.can_initiate,
        // can_rework: role.can_rework,
        // can_view: role.can_view,
        // id: role.id,
    //   }
    // );
    let result = await db.executeQuery("EXEC UpdateRoleMatrix @can_approve,@can_initiate,@can_rework,@can_view,@id, @SymmetricKeyName,@CertificateName`", {
      can_approve: role.can_approve,
      can_initiate: role.can_initiate,
      can_rework: role.can_rework,
      can_view: role.can_view,
      id: role.id,
      SymmetricKeyName: SYMMETRIC_KEY_NAME,
      CertificateName: CERTIFICATE_NAME
    });
    return result;
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  getRoleDetails,
  updateEmployeRole,
  fetchRoleData,
  fetchRoleId,
  fetchRoles,
  addRole,
  updateRole,
};
