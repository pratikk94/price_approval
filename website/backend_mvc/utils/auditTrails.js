// Function to add audit log
const db = require("../config/db");

exports.addAuditLog = async function (tableName, rowId, operation, userId) {
    try {
        // Insert audit log record
        let query = `
            INSERT INTO audit_log (tableName, rowId, operation, userId)
            VALUES (@tableName, @rowId, @operation, @userId)
        `;
        let inputs = { 
            "tableName": tableName, 
            "rowId": rowId, 
            "operation": operation, 
            "userId": userId 
        }
        let result = await db.executeQuery(query, inputs);

        console.log('Audit log added successfully', result);
    } catch (err) {
        console.error('Error adding audit log:', err);
        throw err;
    }
}