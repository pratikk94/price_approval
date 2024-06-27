import React, { useState, useEffect, useCallback } from "react";

import { backend_url, backend_mvc } from "../../util";

export default function FileUploader({
  onSuccess,
  requestId: initialRequestId,
}) {
  const [file, setFile] = useState();
  // Ensuring a local state for requestId that either uses the prop or generates a new one
  const [requestId, setRequestId] = useState(Date.now().toString());

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const onUploadSuccess = useCallback((uploadedFile) => {
    setTriggerFetch(true); // Trigger re-fetch of files
    setTempFiles((prev) => [...prev, uploadedFile]); // Add the newly uploaded file to tempFiles
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    // Assuming requestId is available in the component's scope
    formDataUpload.append("request_id", requestId);

    localStorage.setItem("request_id", requestId);
    console.log("requestId", requestId);
    console.log("Time", Date.now().toString());
    console.log("Form Data", formDataUpload);
    try {
      const response = await fetch(`${backend_mvc}api/upload_file`, {
        method: "POST",
        // headers: { "Content-Type": "application/json" },
        body: formDataUpload,
      });

      console.log("Response", response);

      if (response.ok) {
        alert("File uploaded successfully");
        onSuccess(file); // Pass the file object to the onSuccess handler
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ backgroundColor: "#156760" }}>
        Upload
      </button>
    </div>
  );
}
