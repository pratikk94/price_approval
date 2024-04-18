export default function FilesForRequest({ files, tempFiles }) {
  if (files.length === 0 && (!tempFiles || tempFiles.length === 0)) {
    return <div>No attachments for this request.</div>;
  }

  return (
    <div>
      <h2>Files</h2>
      <ul>
        {files.map((file) => (
          <li key={file.id}>
            {file.file_name} -{" "}
            <a
              href={`/files/download/${file.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
