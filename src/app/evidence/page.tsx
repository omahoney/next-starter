"use client";

import React, { useState, useCallback } from "react";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Storage } from "thirdweb";
import { client } from "../client";

export default function Evidence() {
  const activeAccount = useActiveAccount();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [ipfsUri, setIpfsUri] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Redirect to home if not connected
  React.useEffect(() => {
    if (!activeAccount) {
      router.push("/");
    }
  }, [activeAccount, router]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setUploadError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
      'application/pdf': ['.pdf'],
    }
  });

  const uploadToIpfs = async () => {
    if (!file) {
      setUploadError("Please select a file first");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Create storage instance
      const storage = new Storage({
        clientId: client.clientId,
      });
      
      // Upload file to IPFS using thirdweb storage
      const uri = await storage.upload(file);
      
      setIpfsUri(uri);
      
      console.log("File uploaded to IPFS:", uri);
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      setUploadError("Failed to upload file to IPFS");
    } finally {
      setIsUploading(false);
    }
  };

  if (!activeAccount) {
    return null;
  }

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20 w-full">
        <h1 className="text-3xl font-bold text-center mb-8">UAP Evidence</h1>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <p className="text-center mb-4">
            Connected wallet: <span className="font-mono">{activeAccount.address.slice(0, 6)}...{activeAccount.address.slice(-4)}</span>
          </p>
          
          <div className="space-y-6">
            <p className="text-center mb-6">Submit your UAP evidence to the blockchain.</p>
            
            {/* File Dropzone */}
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-purple-500 bg-purple-50 bg-opacity-5" : "border-gray-600 hover:border-purple-500"
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div>
                  <p className="font-medium text-green-400">File selected:</p>
                  <p className="text-gray-300">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                </div>
              ) : isDragActive ? (
                <p>Drop the files here...</p>
              ) : (
                <div>
                  <p className="mb-2">Drag & drop UAP evidence here, or click to select</p>
                  <p className="text-sm text-gray-400">Supports images, videos, and PDF documents</p>
                </div>
              )}
            </div>
            
            {/* Upload Button */}
            <div className="flex flex-col items-center">
              <button
                onClick={uploadToIpfs}
                disabled={!file || isUploading}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  !file || isUploading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {isUploading ? "Uploading..." : "Upload to IPFS"}
              </button>
              
              {uploadError && (
                <p className="mt-3 text-red-400">{uploadError}</p>
              )}
              
              {ipfsUri && (
                <div className="mt-4 text-center">
                  <p className="text-green-400 font-medium">Successfully uploaded to IPFS!</p>
                  <p className="mt-2 break-all text-sm bg-gray-900 p-3 rounded">{ipfsUri}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}