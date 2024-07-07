import React from "react";
import { backend_mvc, backend_url } from "../../util";

export default function FilesForRequest({ files, tempFiles }) {
  // Check if there are no files or tempFiles
  if (files.length === 0 && (!tempFiles || tempFiles.length === 0)) {
    return <div>No attachments for this request.</div>;
  }

  console.log("Files", files);
  console.log("Temporary Files", tempFiles);

  return (
    <div>
      {/* <h2>Attachments</h2> */}
      {/* Render permanent files */}
      {files.length > 0 && (
        <>
          {/* <h3>Permanent Files</h3> */}
          <ul>
            {files.map((file, index) => (
              <li key={file.file_name || index}>
                {file.file_name} -{" "}
                <a
                  href={`${backend_mvc}api/download/${file.request_id}`} // Assuming `file_name` is used for download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Render temporary files */}
      {Array.isArray(tempFiles) && tempFiles.length > 0 && (
        <>
          {/* <h3>Temporary Files</h3> */}
          <ul>
            {tempFiles.map((tempFile) => (
              <li key={tempFile.id}>
                {tempFile.name} -{" "}
                <a
                  href={`${backend_url}api/g_files/download/${tempFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
