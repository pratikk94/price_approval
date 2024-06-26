const db = require("../config/db");

class User {
  static async findUserByEmployeeId(employee_id) {
    try {
            
      let result = await db.executeQuery(`EXEC FetchUserByEmployeeId @employee_id`, {"employee_id":employee_id});
      
      return result.recordset[0];
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

module.exports = User;
