"use client";

import Image from "next/image";
import { ConnectButton } from "thirdweb/react";
import thirdwebIcon from "@public/sfuap.png";
import { client } from "./client";
import { useRouter } from "next/navigation";
import { useConnect, useActiveAccount } from "thirdweb/react";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const activeAccount = useActiveAccount();
  
  // Redirect to evidence page when connected
  useEffect(() => {
    if (activeAccount) {
      router.push("/evidence");
    }
  }, [activeAccount, router]);

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />

        <div className="flex justify-center mb-20">
          <ConnectButton
            client={client}
            appMetadata={{
              name: "UAP Hackathon",
              url: "http://localhost:3000",
            }}
          />
        </div>

      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <Image
        src={thirdwebIcon}
        alt=""
        className="size-[150px] md:size-[150px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #a726a9a8)",
        }}
      />

    </header>
  )
}