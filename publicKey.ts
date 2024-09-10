import { Keypair } from '@solana/web3.js';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Parse the secret key from the .env file
const secretKey = process.env.SOLANA_SECRET_KEY ? JSON.parse(process.env.SOLANA_SECRET_KEY) : [];

// Check if the secret key is valid
if (!secretKey || secretKey.length === 0) {
    console.error("Secret key is missing or invalid.");
    process.exit(1);
}

// Convert the secret key to a Uint8Array and generate the Keypair
const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

// Get the public key
const publicKey = keypair.publicKey.toBase58();

// Output the public key
console.log('Public Key:', publicKey);
