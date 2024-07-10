const db = require("../config/db");

class User {
  static async findUserByEmployeeId(employee_id) {
    try {
      logger.info(`Fetching user by employee ID: ${employee_id}`);
      let result = await db.executeQuery(`EXEC FetchUserByEmployeeId @employee_id`, { "employee_id": employee_id });
      logger.info(`User fetched successfully for employee ID: ${employee_id}`);
      return result.recordset[0];
    } catch (err) {
      logger.error(`Error fetching user for employee ID ${employee_id}: ${err.message}`);
      return null;
    }
  }
}

module.exports = User;
