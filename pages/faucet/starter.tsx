import * as React from "react";
// throws notifications for user friendly error handling
import { toast } from "react-toastify";
// imports methods for deriving data from the wallet's data store
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { ExternalLinkIcon } from "@heroicons/react/outline";
// library we use to interact with the solana json rpc api
import * as web3 from "@solana/web3.js";
const Starter = () => {
  const [txSig, setTxSig] = React.useState<string>("");
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const fundwallet = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!publicKey || !connection) {
      toast.error("please connect your wallet");
      throw "please connect your wallet";
    }

    // generate wallet that will send sol
    const sender = web3.Keypair.generate();
    const balance = await connection.getBalance(sender.publicKey);
    if (balance < web3.LAMPORTS_PER_SOL) {
      await connection.requestAirdrop(
        sender.publicKey,
        web3.LAMPORTS_PER_SOL * 1
      );
    }
    // transaction to trnasfer the sol from sender to reciever
    const transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: publicKey,
        lamports: web3.LAMPORTS_PER_SOL * 1,
      })
    );

    try {
      // Fetch a recent blockhash manually
const { blockhash } = await connection.getLatestBlockhash();
transaction.recentBlockhash = blockhash;
transaction.feePayer = publicKey;

const signature = await sendTransaction(transaction, connection, {
  signers: [sender],
});

      setTxSig(signature);
    } catch (error) {
      toast.error("Error funding wallet");
      throw error;
    }
  };
  const outputs = [
    {
      title: "Transaction signature...",
      dependency: txSig,
      href: `https://explorer.solana.com/tx/${txSig}?cluster=devnet`,
    },
  ];

  return (
    <main className="max-w-7xl grid grid-cols-1 sm:grid-cols-6 gap-4 p-4 text-white">
      <form
        onSubmit={(event) => fundwallet(event)}
        className="rounded-lg min-h-content bg-[#2a302f] p-4 sm:col-span-6 lg:col-start-2 lg:col-end-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-2xl font-semibold">Faucet 🚰</h2>
          <button
            type="submit"
            className="bg-helius-orange rounded-lg py-1 sm:py-2 px-4 font-semibold transition-all duration-200 border-2 border-transparent hover:border-helius-orange disabled:opacity-50 disabled:hover:bg-[#fa6ece] hover:bg-transparent disabled:cursor-not-allowed"
          >
            Fund
          </button>
        </div>

        <div className="text-sm font-semibold mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-2">
          <ul className="p-2">
            {outputs.map(({ title, dependency, href }, index) => (
              <li
                key={title}
                className={`flex justify-between items-center ${
                  index !== 0 && "mt-4"
                }`}
              >
                <p className="tracking-wider">{title}</p>
                {dependency && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex text-[#80ebff] italic hover:text-white transition-all duration-200"
                  >
                    {dependency.toString().slice(0, 25)}...
                    <ExternalLinkIcon className="w-5 ml-1" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </form>
    </main>
  );
};

export default Starter;
