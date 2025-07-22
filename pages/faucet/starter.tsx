import * as React from 'react';
// throws notifications for user friendly error handling
import { toast } from 'react-toastify';
// imports methods for deriving data from the wallet's data store
import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { ExternalLinkIcon } from '@heroicons/react/outline';
// library we use to interact with the solana json rpc api
import * as web3 from '@solana/web3.js';
const Starter = () => {
    const  [txSig, setTxSig] = React.useState<string>('');
    const { connection } = useConnection();
    const { publicKey, sendTransaction} = useWallet();

    const fundwallet = async ( event : { preventDefault: () => void }) => {
        event.preventDefault();

    if (!publicKey || !connection) {
        toast.error('please connect your wallet');
        throw 'please connect your wallet';
    }

    // generate wallet that will send sol
    const sender = web3.Keypair.generate();
    const balance = await connection.getBalance(sender.publicKey);
    if (balance < web3.LAMPORTS_PER_SOL) {
        await connection.requestAirdrop(sender.publicKey, web3.LAMPORTS_PER_SOL * 1);
    }

    }
}

export default Starter;