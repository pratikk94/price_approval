const db = require("../config/db");

async function uploadFile(originalname, buffer, request_id) {
    try {
        const query = `INSERT INTO files (request_id, file_name, file_data) VALUES (@requestId, @name, @data);`;
        let result = await db.executeQuery(query, { "requestId": request_id, "name": originalname, "data": buffer });
        // Send the results as a response
        return result;
    } catch (error) {
        console.error("An error occurred while fetching plants", error);
        throw error;
    }
}


module.exports = {
    uploadFile
};
