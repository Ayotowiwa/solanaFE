import React, { useState, useEffect } from 'react';
import * as web3 from '@solana/web3.js';
import { toast } from 'react-toastify';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ExternalLinkIcon } from '@heroicons/react/outline';

const Starter = () => {
    const [account, setAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState('');
    const [txSig, setTxSig] = useState('');
    const [isSending, setIsSending] = useState(false);

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

            const fetchBalance = async () => {
  if (!publicKey) return;

  try {
    const balance = await connection.getBalance(publicKey);
    setBalance(balance / web3.LAMPORTS_PER_SOL); 
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    toast.error('Could not refresh wallet balance');
  }
};

    const handleTransaction = async (e) => {
        e.preventDefault();

        if (!connection || !publicKey) {
            toast.error('Please connect your wallet.');
            return;
        }

        let toPubkey;
        try {
            toPubkey = new web3.PublicKey(account);
        } catch {
            toast.error('Invalid recipient public key.');
            return;
        }

        const solAmount = Number(amount);
        if (Number.isNaN(solAmount) || solAmount <= 0) {
            toast.error('Enter a valid amount greater than 0.');
            return;
        }

        setIsSending(true);

        try {
            const transaction = new web3.Transaction();

            const instruction = web3.SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey,
                lamports: solAmount * web3.LAMPORTS_PER_SOL,
            });

            transaction.add(instruction);

            // ✅ Manually fetch recent blockhash and set feePayer
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            const signature = await sendTransaction(transaction, connection);
            toast.success('Transaction successful!');

            await new Promise((res) => setTimeout(res, 1500));
            setTxSig(signature);

            // Fetch updated balance
            await fetchBalance();
            setAccount('');
            setAmount('');
        } catch (error) {
            console.error(error);
            toast.error('Transaction failed.');
        } finally {
            setIsSending(false);
        }
    };

    useEffect(() => {
    if (connection && publicKey) {
        fetchBalance();
    }
}, [connection, publicKey]);


    const outputs = [
        {
            title: 'Account Balance...',
            dependency: balance,
        },
        {
            title: 'Transaction Signature...',
            dependency: txSig,
            href: `https://explorer.solana.com/tx/${txSig}?cluster=devnet`,
        },
    ];

    return (
        <main className='min-h-screen text-white max-w-7xl'>
            <section className='grid grid-cols-1 sm:grid-cols-6 gap-4 p-4'>
                <form
                    onSubmit={handleTransaction}
                    className='rounded-lg min-h-content p-4 bg-[#2a302f] sm:col-span-6 lg:col-start-2 lg:col-end-6'
                >
                    <div className='flex justify-between items-center'>
                        <h2 className='font-bold text-2xl text-[#fa6ece]'>Send Sol 💸</h2>
                        <button
                            type='submit'
                            disabled={!account || !amount || isSending}
                            className='disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fa6ece] bg-[#fa6ece] rounded-lg w-24 py-1 font-semibold transition-all duration-200 hover:bg-transparent border-2 border-transparent hover:border-[#fa6ece]'
                        >
                            {isSending ? 'Sending...' : 'Submit'}
                        </button>
                    </div>

                    <div className='mt-6'>
                        <h3 className='italic text-sm'>Address of receiver</h3>
                        <input
                            id='account'
                            type='text'
                            placeholder='Public key of receiver'
                            value={account}
                            className='text-[#9e80ff] py-1 w-full bg-transparent outline-none resize-none border-2 border-transparent border-b-white'
                            onChange={event => setAccount(event.target.value)}
                        />
                    </div>

                    <div className='mt-6'>
                        <h3 className='italic text-sm'>Number amount</h3>
                        <input
                            id='amount'
                            type='number'
                            step='any'
                            min={0}
                            placeholder='Amount of SOL'
                            value={amount}
                            className='text-[#9e80ff] py-1 w-full bg-transparent outline-none resize-none border-2 border-transparent border-b-white'
                            onChange={event => setAmount(event.target.value)}
                        />
                    </div>

                    <div className='text-sm font-semibold mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-2'>
                        <ul className='p-2'>
                            {outputs.map(({ title, dependency, href }, index) => (
                                <li
                                    key={title}
                                    className={`flex justify-between items-center ${index !== 0 && 'mt-4'}`}
                                >
                                    <p className='tracking-wider'>{title}</p>
                                    {dependency && (
                                        <a
                                            href={href}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className={`flex text-[#80ebff] italic ${href && 'hover:text-white'} transition-all duration-200`}
                                        >
                                            {dependency.toString().slice(0, 25)}
                                            {href && <ExternalLinkIcon className='w-5 ml-1' />}
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </form>
            </section>
        </main>
    );
};

export default Starter;
