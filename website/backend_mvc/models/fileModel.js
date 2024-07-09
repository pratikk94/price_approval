const db = require("../config/db");
const { addAuditLog } = require("../utils/auditTrails");
const logger = require("../utils/logger");

async function uploadFile(originalname, buffer, request_id) {
    try {
        logger.info(`Uploading file with Original Name: ${originalname}, Request ID: ${request_id}`);

        let result = await db.executeQuery(`EXEC InsertFile @RequestId,@FileName,@FileData`, { "RequestId": request_id, "FileName": originalname, "FileData": buffer });
        
        logger.info(`File uploaded successfully. Result: ${JSON.stringify(result.recordset)}`);

        await addAuditLog("files", result.recordset[0].id, "INSERT", null);
        
        // Send the results as a response
        return result;
    } catch (error) {
        logger.error(`Error uploading file. Original Name: ${originalname}, Request ID: ${request_id}. Error: ${error.message}`);
        throw error;
    }
}

async function downloadFile(requestId) {
    try {
        logger.info(`Downloading file for Request ID: ${requestId}`);
        
        let result = await db.executeQuery(`EXEC GetFilesByRequestID @requestId`, { "requestId": requestId });
        
        if (result.recordset.length === 0) {
            logger.warn(`File not found for Request ID: ${requestId}`);
            return res.status(404).send('File not found');
        }
        
        logger.info(`File downloaded successfully. Result: ${JSON.stringify(result.recordset)}`);
        
        // Send the results as a response
        return result;
    } catch (error) {
        logger.error(`Error downloading file. Request ID: ${requestId}. Error: ${error.message}`);
        throw error;
    }
}

async function deleteFile(requestId) {
    try {
        logger.info(`Deleting file for Request ID: ${requestId}`);

        let result = await db.executeQuery(`EXEC DeleteFileById @RequestID`, { "RequestID": requestId });
        
        logger.info(`File deleted successfully. Result: ${JSON.stringify(result.recordset)}`);
        
        await addAuditLog("files", result.recordset[0].id, "DELETE", null);
        
        // Send the results as a response
        return result;
    } catch (error) {
        logger.error(`Error deleting file. Request ID: ${requestId}. Error: ${error.message}`);
        throw error;
    }
}


module.exports = {
    uploadFile,
    downloadFile,
    deleteFile
};
