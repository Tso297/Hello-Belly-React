import React, { useState } from 'react';
import { useZoom } from './ZoomContext'; // Import your ZoomContext to get the doctorId

const FileUploader = ({ onFileUpload }) => {
  const { doctorId } = useZoom(); // Get doctorId from ZoomContext
  const [selectedFile, setSelectedFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('doctor_id', doctorId); // Append doctor_id to formData
    formData.append('new_file_name', newFileName); // Append new file name to formData

    try {
      const response = await fetch('https://hello-belly-flask-1.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onFileUpload(data.filePath);
        alert('File uploaded successfully');
        setSelectedFile(null);
        setNewFileName('');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please check the console for details.');
    }
  };

  return (
    <div className="file-uploader">
      <input type="file" onChange={handleFileChange} />
      <input
        type="text"
        placeholder="New file name (optional)"
        value={newFileName}
        onChange={(e) => setNewFileName(e.target.value)}
      />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default FileUploader;