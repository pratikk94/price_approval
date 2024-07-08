import React, { useState, useEffect, useCallback } from "react";
import { backend_mvc, backend_url } from "../../util";
import FileUploader from "./FileUploader"; // Make sure this path is correct
import FilesForRequest from "./FileForRequest";
import { useSession } from "../../Login_Controller/SessionContext";

export default function FileHandling({ requestId }) {
  const [files, setFiles] = useState([]);
  const [tempFiles, setTempFiles] = useState([]);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const { session } = useSession();
  // Attempt to retrieve requestId from local storage or use the initialRequestId if not found
  const storedRequestId = requestId || localStorage.getItem("request_id");
  // If there's no storedRequestId in localStorage, you should set it
  if (!localStorage.getItem("request_id")) {
    localStorage.setItem("request_id", requestId);
  }

  console.log("Stored request id:", storedRequestId);

  const fetchFiles = useCallback(() => {
    fetch(`${backend_mvc}api/files/${requestId ?? storedRequestId}`) // Corrected for dynamic backend_url usage
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
      {session.role === "AM" && (
        <FileUploader onSuccess={onUploadSuccess} requestId={storedRequestId} />
      )}
    </div>
  );
}
