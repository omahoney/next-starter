"use client";

import React, { useState, useCallback } from "react";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { upload } from "thirdweb/storage";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { client } from "../client";

// Contract address for the UAP NFT contract on Amoy testnet
const NFT_CONTRACT_ADDRESS = "0xAFbbbB0579cC0d1570B77d4298DE3EFa97B5E93e";
// Define Amoy testnet chain for Polygon
const CHAIN_ID = 80002; // Amoy testnet chain ID

// Define Amoy testnet chain configuration
const amoyChain = {
  id: CHAIN_ID,
  name: "Amoy",
  rpc: "https://80002.rpc.thirdweb.com/1c002788740f2de58e2cba6bc1a4399c",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
};

export default function Evidence() {
  const activeAccount = useActiveAccount();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [ipfsUri, setIpfsUri] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  
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

  const mintNFT = async (uri: string) => {
    if (!activeAccount || !uri) {
      setMintError("Cannot mint: Missing wallet connection or IPFS URI");
      return null;
    }

    try {
      setIsMinting(true);
      setMintError(null);
      
      console.log("Starting NFT mint on Amoy chain:", amoyChain.id);
      console.log("Contract address:", NFT_CONTRACT_ADDRESS);
      console.log("Token URI:", uri);
      
      // Connect to the NFT contract on Amoy network
      const contract = getContract({
        client,
        address: NFT_CONTRACT_ADDRESS,
        chain: amoyChain,
      });
      
      console.log("Contract connected successfully");
      
      // Prepare the mint transaction
      console.log("Preparing transaction for contract:", NFT_CONTRACT_ADDRESS);
      
      // Try the simplest mint function that just takes a URI
      let transaction;
      try {
        transaction = await prepareContractCall({
          contract,
          method: "function mint(string memory tokenURI) returns (uint256)",
          params: [uri],
        });
      } catch (mintError) {
        console.log("Standard mint method failed, trying alternative:", mintError);
        
        // Try alternative mint method that might take recipient address and URI
        transaction = await prepareContractCall({
          contract,
          method: "function safeMint(address to, string memory uri) returns (uint256)",
          params: [activeAccount.address, uri],
        });
      }
      
      console.log("Transaction prepared successfully");
      
      // Send the transaction
      console.log("Sending transaction with account:", activeAccount.address);
      
      try {
        const result = await sendTransaction({
          transaction,
          account: activeAccount,
        });
        
        console.log("Transaction result:", result);
        console.log("NFT minted successfully:", result.transactionHash);
        setTxHash(result.transactionHash);
        return result.transactionHash;
      } catch (sendError) {
        console.error("Send transaction error:", sendError);
        
        // Check if this is a JSON-RPC error with data
        if (sendError.message && sendError.message.includes("execution reverted")) {
          throw new Error(`Contract execution reverted: ${sendError.message}`);
        }
        
        throw sendError;
      }
    } catch (error) {
      console.error("Error minting NFT:", error);
      setMintError(`Failed to mint NFT: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    } finally {
      setIsMinting(false);
    }
  };

  const uploadToIpfs = async () => {
    if (!file) {
      setUploadError("Please select a file first");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Upload file to IPFS
      console.log("Starting IPFS upload with file:", file.name);
      
      const result = await upload({
        client,
        files: [file]
      });
      
      console.log("IPFS upload raw result:", result);
      
      let ipfsUri = "";
      
      if (Array.isArray(result)) {
        console.log("Result is an array with length:", result.length);
        ipfsUri = result[0];
      } else if (typeof result === 'string') {
        console.log("Result is a direct string");
        ipfsUri = result;
      } else if (result && typeof result === 'object') {
        // Handle potential object response with URLs or other formats
        console.log("Result is an object:", Object.keys(result));
        // Try common properties that might contain the URI
        ipfsUri = result.url || result.uri || result.ipfsUrl || result.ipfsUri || JSON.stringify(result);
      } else {
        console.log("Unexpected result type:", typeof result);
        ipfsUri = String(result);
      }
      
      console.log("Processed IPFS URI:", ipfsUri);
      
      // Save whatever we got for now
      setIpfsUri(ipfsUri);
      
      console.log("File uploaded to IPFS, result:", ipfsUri);
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
            
            {!ipfsUri && (
              <>
                {/* File Dropzone - Only show if no IPFS upload yet */}
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
                
                {/* Upload Button - Only show if no IPFS upload yet */}
                <div className="flex flex-col items-center mt-4">
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
                </div>
              </>
            )}
            
            {/* IPFS Results and Mint Button */}
            {ipfsUri && (
              <div className="mt-4 text-center">
                <p className="text-green-400 font-medium">Successfully uploaded to IPFS!</p>
                <p className="mt-2 break-all text-sm bg-gray-900 p-3 rounded">{ipfsUri}</p>
                
                {/* Only show mint button if not minting and no transaction hash yet */}
                {!isMinting && !txHash && (
                  <button 
                    onClick={() => mintNFT(ipfsUri)}
                    className="mt-4 px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    Mint as NFT
                  </button>
                )}
                
                {isMinting && (
                  <p className="mt-3 text-yellow-400">Minting NFT...</p>
                )}
                
                {mintError && (
                  <p className="mt-3 text-red-400">{mintError}</p>
                )}
                
                {txHash && (
                  <div className="mt-4">
                    <p className="text-green-400 font-medium">NFT Minted Successfully!</p>
                    <p className="mt-1 text-sm text-gray-300">Transaction Hash:</p>
                    <p className="mt-1 break-all text-sm bg-gray-900 p-3 rounded">{txHash}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}