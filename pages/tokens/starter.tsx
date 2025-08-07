import * as React from "react";
import * as web3 from "@solana/web3.js";
import * as token from '@solana/spl-token';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { toast } from "react-toastify";
import { ExternalLinkIcon } from '@heroicons/react/outline';

const Starter = () => {
    const [mintTX, setMintTx] = React.useState<string>("");
    const [mintAddress, setMintAddress] = React.useState<web3.PublicKey | undefined>(undefined);
    const [tokenAccount, setTokenAccount] = React.useState<string>("");
    const [tokenAccountAddress, setTokenAccountAddress] = React.useState<web3.PublicKey | undefined>(undefined);

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const checkWallet = () => {
        if (!publicKey || !connection) {
            toast.error("Please connect your wallet first.");
            return true;
        } else { return false; }
    };

    const createMint = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        if (checkWallet()) return;

        try {
            const tokenMint = web3.Keypair.generate();
            const lamports = await token.getMinimumBalanceForRentExemptMint(connection);

            const transaction = new web3.Transaction().add(
                web3.SystemProgram.createAccount({
                    fromPubkey: publicKey!,
                    newAccountPubkey: tokenMint.publicKey,
                    space: token.MINT_SIZE,
                    lamports,
                    programId: token.TOKEN_PROGRAM_ID,
                }),
                token.createInitializeMintInstruction(
                    tokenMint.publicKey,
                    0,
                    publicKey!,
                    null // corrected freezeAuthority
                )
            );

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey!;

            const signature = await sendTransaction(transaction, connection, { signers: [tokenMint] });
            

            setMintTx(signature);
            setMintAddress(tokenMint.publicKey);
            toast.success("Mint created successfully!");
        } catch (err) {
            console.error("Error creating mint:", err);
            toast.error("Failed to create mint account.");
        }
    };

    const createAccount = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        if (checkWallet()) return;
        if (!mintAddress) {
            toast.error("Please create the mint first.");
            return;
        }

        try {
            const tokenAccount = web3.Keypair.generate();
            const space = token.ACCOUNT_SIZE;
            const lamports = await connection.getMinimumBalanceForRentExemption(space);

            const transaction = new web3.Transaction().add(
                web3.SystemProgram.createAccount({
                    fromPubkey: publicKey!,
                    newAccountPubkey: tokenAccount.publicKey,
                    space,
                    lamports,
                    programId: token.TOKEN_PROGRAM_ID,
                }),
                token.createInitializeAccountInstruction(
                    tokenAccount.publicKey,
                    mintAddress,
                    publicKey!,
                    token.TOKEN_PROGRAM_ID
                )
            );

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey!;

            const signature = await sendTransaction(transaction, connection, { signers: [tokenAccount] });
            await connection.confirmTransaction(signature, "confirmed");

            setTokenAccount(signature);
            setTokenAccountAddress(tokenAccount.publicKey);
            toast.success("Token account created successfully!");
        } catch (err) {
            console.error("Error creating token account:", err);
            toast.error("Failed to create token account.");
        }
    };

    const createAccountOutputs = [
        {
            title: "Token Account Address...",
            dependency: tokenAccountAddress!,
            href: `https://explorer.solana.com/address/${tokenAccountAddress}?cluster=devnet`,
        },
        {
            title: "Transaction Signature...",
            dependency: tokenAccount,
            href: `https://explorer.solana.com/tx/${tokenAccount}?cluster=devnet`,
        }
    ];

    const createMintOutputs = [
        {
            title: 'Token Mint Address...',
            dependency: mintAddress!,
            href: `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`,
        },
        {
            title: 'Transaction Signature...',
            dependency: mintTX,
            href: `https://explorer.solana.com/tx/${mintTX}?cluster=devnet`,
        }
    ];

    return (
        <main className="max-w-7xl grid grid-cols-1 sm:grid-cols-6 gap-4 p-4 text-white">
            <form onSubmit={event => createMint(event)} className='rounded-lg min-h-content bg-[#2a302f] p-4 sm:col-span-6 lg:col-start-2 lg:col-end-6'>
                <div className='flex justify-between items-center'>
                    <h2 className='text-lg sm:text-2xl font-semibold'>
                        Create Mint 🦄
                    </h2>
                    <button
                        type='submit'
                        className='bg-helius-orange rounded-lg py-1 sm:py-2 px-4 font-semibold transition-all duration-200 border-2 border-transparent hover:border-helius-orange disabled:opacity-50 disabled:hover:bg-helius-orange hover:bg-transparent disabled:cursor-not-allowed'
                    >
                        Submit
                    </button>
                </div>
                <div className='text-sm font-semibold mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-2'>
                    <ul className='p-2'>
                        {createMintOutputs.map(({ title, dependency, href }, index) => (
                            <li key={title} className={`flex justify-between items-center ${index !== 0 && 'mt-4'}`}>
                                <p className='tracking-wider'>{title}</p>
                                {
                                    dependency &&
                                    <a
                                        href={href}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='flex text-[#80ebff] italic hover:text-white transition-all duration-200'
                                    >
                                        {dependency.toString().slice(0, 25)}...
                                        <ExternalLinkIcon className='w-5 ml-1' />
                                    </a>
                                }
                            </li>
                        ))}
                    </ul>
                </div>
            </form>

            <form onSubmit={event => createAccount(event)} className='rounded-lg min-h-content bg-[#2a302f] p-4 sm:col-span-6 lg:col-start-2 lg:col-end-6'>
                <div className='flex justify-between items-center'>
                    <h2 className='text-lg sm:text-2xl font-semibold'>
                        Create Account ✨
                    </h2>
                    <button
                        type='submit'
                        className='bg-helius-orange rounded-lg py-1 sm:py-2 px-4 font-semibold transition-all duration-200 border-2 border-transparent hover:border-helius-orange disabled:opacity-50 disabled:hover:bg-helius-orange hover:bg-transparent disabled:cursor-not-allowed'
                    >
                        Submit
                    </button>
                </div>
                <div className='text-sm font-semibold mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-2'>
                    <ul className='p-2'>
                        {createAccountOutputs.map(({ title, dependency, href }, index) => (
                            <li key={title} className={`flex justify-between items-center ${index !== 0 && 'mt-4'}`}>
                                <p className='tracking-wider'>{title}</p>
                                {
                                    dependency &&
                                    <a
                                        href={href}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='flex text-[#80ebff] italic hover:text-white transition-all duration-200'
                                    >
                                        {dependency.toString().slice(0, 25)}...
                                        <ExternalLinkIcon className='w-5 ml-1' />
                                    </a>
                                }
                            </li>
                        ))}
                    </ul>
                </div>
            </form>
        </main>
    );
};

export default Starter;
