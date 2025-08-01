import React, { FC } from 'react';
import * as web3 from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';

import { StudentIntro} from '../../models/serialize/StudentIntro';
import { StudentIntroCoordinator } from '../../scripts/serialize/StudentIntroCoordinator'
const Starter: FC= () => {
// what will be sent to the program
    const [name, setName] = React.useState<string>("");
    const [thoughts, setThoughts] = React.useState<string>("");
//what will be displayed on the page from the program
    const [studentIntros, setStudentIntros] = React.useState<StudentIntro[]>([]);
    const [page, setPage] = React.useState<number>(1);
    const [search, setSearch] = React.useState<string>("");

    const TARGET_PROGRAM_ID = 'HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf';

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    
    //to submit a new entry to the program
    const createSubmission = async (event: { preventDefault: () => void}) => {
        event.preventDefault();
        const studentIntro = new StudentIntro(name, thoughts);
        await handleTransactionSubmit(studentIntro);
    };
   //to create a new transaction
const handleTransactionSubmit = async (studentIntro : StudentIntro) => {
    if (!publicKey || !connection || !sendTransaction) {
        toast.error("Wallet not connected");
        return;
    }

    try {
        // ✅ Step 1: Fetch recent blockhash
        const latestBlockhash = await connection.getLatestBlockhash();
        console.log("Latest Blockhash:", latestBlockhash);

        // ✅ Step 2: Derive PDA
        const [pda] = web3.PublicKey.findProgramAddressSync(
            [publicKey.toBuffer()],
            new web3.PublicKey(TARGET_PROGRAM_ID)
        );
        console.log("Derived PDA:", pda.toBase58());

        const buffer = studentIntro.serialize();

        // ✅ Step 3: Create Instruction
        const instruction = new web3.TransactionInstruction({
            programId: new web3.PublicKey(TARGET_PROGRAM_ID),
            keys: [
                {
                    pubkey: publicKey,
                    isSigner: true,
                    isWritable: false,
                },
                {
                    pubkey: pda,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: web3.SystemProgram.programId,
                    isSigner: false,
                    isWritable: false,
                },
            ],
            data: buffer, // no data for now
        });
        console.log("Instruction created");

        // ✅ Step 4: Create Transaction
        const transaction = new web3.Transaction().add(instruction);
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.feePayer = publicKey;
        console.log("Transaction constructed");

        // ✅ Step 5: Send transaction via wallet
        const signature = await sendTransaction(transaction, connection);
        console.log("Transaction signature:", signature);

        // ✅ Step 6: Confirm transaction using updated method
        const confirmation = await connection.confirmTransaction(
            {
                signature,
                ...latestBlockhash,
            },
            "confirmed"
        );
        console.log("Transaction confirmation:", confirmation);

        toast.success("Transaction confirmed!");
        setName("");
        setThoughts("");
    } catch (error: any) {
        console.error("Transaction failed:", error);
        toast.error("Transaction failed: " + (error?.message || "Unknown error"));
    } 
};


    React.useEffect(() => {
        StudentIntroCoordinator.fetchpage(
            connection,
            page,
            5,
            search,
            search !== ''
        ).then(setStudentIntros)
    }, [page, search]);

     return (
           <main className='min-h-screen text-white'>
               {/* FORM */}
               <section className='grid grid-cols-1 sm:grid-cols-6 gap-4 p-4'>
                   <form className='rounded-lg min-h-content p-4 bg-[#2a302f] sm:col-span-6 lg:col-start-2 lg:col-end-6'>
                       <div className='flex justify-between items-center'>
                           <h2 className='font-bold text-2xl text-helius-orange'>
                               Introduce yourself ✌️
                           </h2>
                           <button
                               disabled={name === '' || thoughts === ''}
                               onClick={event => createSubmission(event)}
                               className='disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-helius-orange bg-helius-orange rounded-lg w-24 py-1 font-semibold transition-all duration-200 hover:bg-transparent border-2 border-transparent hover:border-helius-orange'
                           >
                               Submit
                           </button>
                       </div>
                       <div className='pb-2'>
                           <div className='mt-4'>
                               <h3 className='italic text-sm'>
                                   What do we call you?
                               </h3>
                               <input
                                   id='name'
                                   type="text"
                                   placeholder='Your name'
                                   className='py-1 w-full bg-transparent outline-none resize-none border-2 border-transparent border-b-white'
                                   onChange={event => setName(event.target.value)}
                                   value={name}
                               />
                           </div>
                           <div className='mt-6'>
                               <h3 className='italic text-sm'>
                                   What brings you to Solana?
                               </h3>
                               <input
                                   id='thoughts'
                                   type="text"
                                   placeholder='Your thoughts'
                                   className='py-1 w-full bg-transparent outline-none resize-none border-2 border-transparent border-b-white'
                                   onChange={event => setThoughts(event.target.value)}
                                   value={thoughts}
                               />
                           </div>
                       </div>
                   </form>
               </section>
   
               {/* LIST OF RESPONSES */}
               <section className='mb-4 grid grid-cols-1 sm:grid-cols-6 gap-4 px-4'>
                   <div className='rounded-lg min-h-content p-4 bg-[#2a302f] sm:col-span-6 lg:col-start-2 lg:col-end-6'>
                       <h2 className='font-bold text-2xl text-helius-orange mb-6'>
                           Meet the students
                       </h2>
                       <div>
                           <div className='mt-6'>
                               {
                                   studentIntros.map((studentIntro: StudentIntro, index: number) => (
                                       (studentIntro.name && studentIntro.message) &&
                                       <div
                                           key={`${studentIntro.name}-${index}`}
                                           className='bg-[#222524] border-2 border-gray-500 my-4 p-4 rounded-lg'
                                       >
                                           <h4 className='text-[#80ebff] font-semibold tracking-wide italic text-lg'>
                                               {studentIntro.name}
                                           </h4>
                                           <p className='text-sm mt-2'>
                                               {studentIntro.message}
                                           </p>
                                       </div>
                                   ))
                               }
                           </div>
                           <div className='mt-6 flex justify-between'>
                               <div>
                                   {
                                       page > 1 &&
                                       <button
                                           onClick={() => setPage(page - 1)}
                                           className='bg-helius-orange rounded-lg w-24 py-1 font-semibold transition-all duration-200 hover:bg-transparent border-2 border-transparent hover:border-helius-orange'
                                       >
                                           Previous
                                       </button>
                                   }
                               </div>
                               <div>
                                   {
                                       StudentIntroCoordinator.accounts.length > page * 5 &&
                                       <button
                                           onClick={() => setPage(page + 1)}
                                           className='bg-helius-orange rounded-lg w-24 py-1 font-semibold transition-all duration-200 hover:bg-transparent border-2 border-transparent hover:border-helius-orange'
                                           disabled={studentIntros.length === 0}
                                       >
                                           Next
                                       </button>
                                   }
                               </div>
                           </div>
                       </div>
                   </div>
               </section>
           </main>
       );
}

export default Starter;