import React, { useState, useEffect, useCallback } from "react";
import { backend_url } from "../../util";
import FileUploader from "./FileUploader"; // Make sure this path is correct
import FilesForRequest from "./FileForRequest";

export default function FileHandling({ requestId: initialRequestId }) {
  const [files, setFiles] = useState([]);
  const [tempFiles, setTempFiles] = useState([]);
  const [triggerFetch, setTriggerFetch] = useState(false);

  // Attempt to retrieve requestId from local storage or use the initialRequestId if not found
  const storedRequestId =
    localStorage.getItem("request_id") || initialRequestId;
  // If there's no storedRequestId in localStorage, you should set it
  if (!localStorage.getItem("request_id")) {
    localStorage.setItem("request_id", initialRequestId);
  }

  const fetchFiles = useCallback(() => {
    fetch(`${backend_url}api/files/${storedRequestId}`) // Corrected for dynamic backend_url usage
      .then((res) => res.json())
      .then((data) => {
        setFiles(data);
        setTriggerFetch(false); // Reset trigger after fetch
      })
      .catch(console.error);
  }, [storedRequestId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, triggerFetch]);

  const onUploadSuccess = useCallback((uploadedFile) => {
    setTriggerFetch(true); // Trigger re-fetch of files
    setTempFiles((prev) => [...prev, uploadedFile]); // Add the newly uploaded file to tempFiles
  }, []);

  return (
    <div>
      <FilesForRequest files={files} tempFiles={tempFiles} />
      <FileUploader onSuccess={onUploadSuccess} requestId={storedRequestId} />
    </div>
  );
}
