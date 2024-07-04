const attachmentModel = require("../models/attachmentModel");

/**
 * @swagger
 * /api/files/{request_id}:
 *  get:
 *   summary: Get File Details By Request Id
 *   tags: [files]
 *   security:
 *       - JWT: []
 *   parameters:
 *    - name: request_id
 *      in: path
 *      schema:
 *        type: string
 *        example: user-details
 *      description: ""
 *      required: true
 *   produces:
 *     - application/json
 *   responses:
 *     200:
 *      description: Successfully fetched channel number
 *      content:
 *        application/json
 *
 *     404:
 *       description: Not Found
 *     401:
 *       description: Unauthorized
 *     400:
 *       description: Bad Request
 *     5XX:
 *       description: Unexpected error
 */
async function fetchFiles(req, res) {
  try {
    const { request_id } = req.params;
    const files = await attachmentModel.getFilesByRequestId(request_id);
    if (files.length > 0) {
      res.json(files);
    } else {
      res.status(404).send("No files found for the provided request_id.");
    }
  } catch (err) {
    console.error("Controller error:", err);
    res.status(500).send("Failed to fetch files.");
  }
}

module.exports = {
  fetchFiles,
};
