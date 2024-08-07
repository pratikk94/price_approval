const { CERTIFICATE_NAME, SYMMETRIC_KEY_NAME } = require("../config/constants");
const db = require("../config/db");

class User {
  static async findUserByEmployeeId(employee_id) {
    try {
            
      let result = await db.executeQuery(`EXEC FetchUserByEmployeeId @employee_id, @SymmetricKeyName,@CertificateName`, {"employee_id":employee_id, "SymmetricKeyName": SYMMETRIC_KEY_NAME,
        "CertificateName": CERTIFICATE_NAME});
      
      return result.recordset[0];
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

module.exports = User;
