"use client";

import React from "react";
import { useAddress } from "thirdweb/react";
import { useRouter } from "next/navigation";

export default function Evidence() {
  const address = useAddress();
  const router = useRouter();
  
  // Redirect to home if not connected
  React.useEffect(() => {
    if (!address) {
      router.push("/");
    }
  }, [address, router]);

  if (!address) {
    return null;
  }

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20 w-full">
        <h1 className="text-3xl font-bold text-center mb-8">UAP Evidence</h1>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <p className="text-center mb-4">
            Connected wallet: <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
          </p>
          <div className="space-y-6">
            <p>Submit your UAP evidence to the blockchain.</p>
            {/* Evidence submission form would go here */}
          </div>
        </div>
      </div>
    </main>
  );
}