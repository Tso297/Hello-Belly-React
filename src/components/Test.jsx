import React, { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { storage } from '.././firebase';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import '.././CSS/Test.css'

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
  
      const storageRef = ref(storage, `files/${newFileName || selectedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);
  
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(progress);
        },
        (error) => {
          console.error('Error uploading file:', error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            onFileUpload({ url: downloadURL, name: newFileName || selectedFile.name });
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
        <button className="upload-button" onClick={handleUpload}>Upload</button>
        <div>Progress: {progress}%</div>
      </div>
    );
  };
  
  const Test = () => {
    const [files, setFiles] = useState([]);
    const [selectedFileUrl, setSelectedFileUrl] = useState(null);
    const [renameFileId, setRenameFileId] = useState(null);
    const [newFileName, setNewFileName] = useState('');
  
    useEffect(() => {
      fetchFiles();
    }, []);
  
    const fetchFiles = async () => {
      const filesRef = ref(storage, 'files/');
      const filesSnapshot = await listAll(filesRef);
      const filesList = await Promise.all(
        filesSnapshot.items.map(async (itemRef) => {
          const downloadURL = await getDownloadURL(itemRef);
          return { url: downloadURL, name: itemRef.name, fullPath: itemRef.fullPath };
        })
      );
      setFiles(filesList);
    };
  
    const handleFileUpload = (file) => {
      setFiles((prevFiles) => [...prevFiles, file]);
    };
  
    const handleDeleteFile = async (file) => {
      const fileRef = ref(storage, file.fullPath);
      await deleteObject(fileRef);
      setFiles((prevFiles) => prevFiles.filter((f) => f.url !== file.url));
    };
  
    const handleOpenFile = (fileUrl) => {
      setSelectedFileUrl(fileUrl);
    };
  
    const handleCloseImage = () => {
      setSelectedFileUrl(null);
    };
  
    const handleRenameFile = async (file) => {
      const oldFileRef = ref(storage, file.fullPath);
      const response = await fetch(file.url);
      const blob = await response.blob();
      const newFileRef = ref(storage, `files/${newFileName}`);
  
      await uploadBytesResumable(newFileRef, blob);
      const downloadURL = await getDownloadURL(newFileRef);
  
      await deleteObject(oldFileRef);
  
      setFiles((prevFiles) =>
        prevFiles.map((f) => (f.url === file.url ? { ...f, url: downloadURL, name: newFileName } : f))
      );
  
      setRenameFileId(null);
      setNewFileName('');
    };
  
    return (
      <div className="test-container">
        <FileUploader onFileUpload={handleFileUpload} />
        <h3 className="doctor-dashboard-section-title">Uploaded Files</h3>
        <ul className="file-list">
          {files.map((file) => (
            <li key={file.url} className="file-item">
              <a href="#" onClick={() => handleOpenFile(file.url)}>
                {file.name}
              </a>
              <button className="delete-button" onClick={() => handleDeleteFile(file)}>Delete</button>
              <button className="rename-button" onClick={() => setRenameFileId(file.url)}>Rename</button>
              {renameFileId === file.url && (
                <div>
                  <input
                    type="text"
                    placeholder="New file name"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                  />
                  <button className="rename-button" onClick={() => handleRenameFile(file)}>Save</button>
                </div>
              )}
            </li>
          ))}
        </ul>
  
        {selectedFileUrl && (
          <div className="image-popup-container">
            <div className="image-popup-content">
              <button className="close-button" onClick={handleCloseImage}>Close</button>
              <TransformWrapper initialScale={1} minScale={0.5} maxScale={3}>
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <React.Fragment>
                    <TransformComponent>
                      <img src={selectedFileUrl} alt="File" className="image-popup" />
                    </TransformComponent>
                  </React.Fragment>
                )}
              </TransformWrapper>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default Test;