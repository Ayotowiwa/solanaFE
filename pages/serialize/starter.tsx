import React, { FC } from 'react';
import * as web3 from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';

import { StudentIntro} from '../../models/serialize/StudentIntro';
import { StudentIntroCoordinator } from '../../scripts/serialize/StudentIntroCoordinator'
const Starter: FC= () => {

    const [name, setName] = React.useState<string>("");
    const [thoughts, setThoughts] = React.useState<string>("");

    const [stundentIntros, setStudentIntros] = React.useState<StudentIntro[]>([]);
    const [page, setPage] = React.useState<number>(1);
    const [search, setSearch] = React.useState<string>("");

    const TARGET_PROGRAM_ID = 'HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf';

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const createSubmission = async (event: { preventDefault: () => void}) => {
        event.preventDefault();
        const studentIntro = new StudentIntro(name, thoughts);
        await handleTransactionSubmit(studentIntro);
    };

    const handleTransactionSubmit = async (studentIntro: StudentIntro) => {
        if (!connection || !publicKey) {
            toast.error("connect you wallet please");
            return;
        }
        const buffer = studentIntro.serialize();
        const transaction = new web3.Transaction();

        const [ pda , bump ] = web3.PublicKey.findProgramAddressSync(
            [ publicKey.toBuffer() ],
            new web3.PublicKey(TARGET_PROGRAM_ID),
        );
    }

    return (
        <>
        </>
    )
}

export default Starter;