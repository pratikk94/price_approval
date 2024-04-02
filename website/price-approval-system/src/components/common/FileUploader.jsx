import { useState } from "react";
import { backend_url } from "../../util";

export default function FileUploader({ onSuccess, requestId }) {
  const [file, setFile] = useState();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("request_id", "123");
    try {
      const response = await fetch(`${backend_url}api/upload_file`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        alert("File uploaded successfully");
        onSuccess();
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
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
