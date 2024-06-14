import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from '.././firebase';

const FileUploader = ({ onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    const storageRef = ref(storage, `uploads/${newFileName || selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      }, 
      (error) => {
        console.error('Error uploading file:', error);
      }, 
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          onFileUpload(downloadURL);
          alert('File uploaded successfully');
          setSelectedFile(null);
          setNewFileName('');
          setProgress(0);
        });
      }
    );
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
      <div>Progress: {progress}%</div>
    </div>
  );
};

export default FileUploader;