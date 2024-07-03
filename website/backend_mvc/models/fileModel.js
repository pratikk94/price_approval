const db = require("../config/db");
const { addAuditLog } = require("../utils/auditTrails");

async function uploadFile(originalname, buffer, request_id) {
    try {
        // const query = `INSERT INTO files (request_id, file_name, file_data)INSERTED.* VALUES (@requestId, @name, @data);`;
        let result = await db.executeQuery(`EXEC InsertFile @RequestId,@FileName,@FileData`, { "RequestId": request_id, "FileName": originalname, "FileData": buffer });
        console.log(result);
        await addAuditLog("files", result.recordset[0].id, "INSERT", null);
        // Send the results as a response
        return result;
    } catch (error) {
        console.error("An error occurred while fetching plants", error);
        throw error;
    }
}

async function downloadFile(requestId) {
    try {
        let result = await db.executeQuery(`EXEC GetFilesByRequestID @requestId`, { "requestId": requestId });
        if (result.recordset.length === 0) {
            return res.status(404).send('File not found');
        }
        // Send the results as a response
        return result;
    } catch (error) {
        console.error("An error occurred while fetching plants", error);
        throw error;
    }
}

async function deleteFile(requestId) {
    try {
        let result = await db.executeQuery(`EXEC DeleteFileById @RequestID`, { "RequestID": requestId });
        console.log(result);
        console.log(result.recordset);
        await addAuditLog("files", result.recordset[0].id, "DELETE", null);
        // Send the results as a response
        return result;
    } catch (error) {
        console.error("An error occurred while fetching plants", error);
        throw error;
    }
}


module.exports = {
    uploadFile,
    downloadFile,
    deleteFile
};
