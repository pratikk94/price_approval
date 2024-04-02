import React, { useState, useEffect, useCallback } from "react";

import { backend_url } from "../../util";
import FileUploader from "./FileUploader";
import FilesForRequest from "./FileForRequest";

export default function FileHandling({ requestId }) {
  const [files, setFiles] = useState([]);
  const [triggerFetch, setTriggerFetch] = useState(false);

  const fetchFiles = useCallback(() => {
    fetch(`${backend_url}api/files/${requestId}`)
      .then((res) => res.json())
      .then((data) => {
        setFiles(data);
        setTriggerFetch(false); // Reset trigger after fetch
      })
      .catch(console.error);
  }, [requestId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, triggerFetch]);

  const onUploadSuccess = () => {
    setTriggerFetch(true); // Trigger re-fetch of files
  };

  return (
    <div>
      <FilesForRequest files={files} />
      <FileUploader onSuccess={onUploadSuccess} requestId={requestId} />
    </div>
  );
}
