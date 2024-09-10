import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction, clusterApiUrl } from '@solana/web3.js';
import {  ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { config } from 'dotenv';

config();

// Devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Prepare secret key from .env
const secretKey = process.env.SOLANA_SECRET_KEY ? JSON.parse(process.env.SOLANA_SECRET_KEY) : [];
const payer = Keypair.fromSecretKey(new Uint8Array(secretKey));

// USDC Mint address
const usdcMintAddress = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// Recipient
const recipientPublicKey = new PublicKey('8UMv4hhDngnT7HFSaqJTCYeWbNzp5BkXzR24MgSgXqD8');

// Replace with the amount of USDC to send (in base units)
const amount = 10000; // For example, 1 USDC if USDC has 6 decimal places

async function sendUSDC() {
    // Get sender's token account
    const senderTokenAccount = await getAssociatedTokenAddress(
        usdcMintAddress,
        payer.publicKey
    );

    // Get recipient's token account
    const recipientTokenAccount = await getAssociatedTokenAddress(
        usdcMintAddress,
        recipientPublicKey
    );

    // Create the associated token account for the recipient if it doesn’t exist
    const recipientTokenAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
    if (!recipientTokenAccountInfo) {
        const createAccountIx = createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            usdcMintAddress,
            recipientTokenAccount,
            recipientPublicKey,
            payer.publicKey
        );

        const transaction = new Transaction().add(createAccountIx);
        await sendAndConfirmTransaction(connection, transaction, [payer]);
    }

    // Create the transfer transaction
    const transferIx = createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        payer.publicKey,
        amount,
        [],
        TOKEN_PROGRAM_ID
    );

    const transaction = new Transaction().add(transferIx);

    // Send the transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);
    console.log('Transaction signature:', signature);
}

sendUSDC().catch(console.error);