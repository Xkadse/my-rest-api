import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { Connection, Keypair, PublicKey, clusterApiUrl, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { config } from 'dotenv';

// Load environment variables from the .env file
config();

// Initialize Solana connection to the devnet cluster
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Read Solana secret key from the .env file
// Parse the secret key into a Uint8Array to be used for creating a Keypair
const secretKey = process.env.SOLANA_SECRET_KEY ? JSON.parse(process.env.SOLANA_SECRET_KEY) : [];
const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

const app = express();
const port = 3000;
const API_KEY = '123';  // Hardcoded API key for testing

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public', {
    index: false,
    extensions: ['html']
}));

// Middleware to authenticate requests based on route and method
function authenticate(req: Request, res: Response, next: NextFunction) {
    if (req.path === '/api/send' && req.method === 'POST') {
        // For /api/send, check API key in headers
        const apiKey = req.header('x-api-key');  // Get the API key from the headers
        if (apiKey === API_KEY) {
            return next();  // Proceed to the route handler if the API key is valid
        } else {
            return res.status(401).json({ message: 'Unauthorized' });  // Respond with 401 if the API key is invalid
        }
    } else if (req.path === '/success' && req.method === 'GET') {
        // For /success, check API key in query parameters
        const apiKey = req.query.apiKey as string;  // Get the API key from the query parameters
        if (apiKey === API_KEY) {
            return next();  // Proceed to the route handler if the API key is valid
        } else {
            return res.status(401).json({ message: 'Unauthorized' });  // Respond with 401 if the API key is invalid
        }
    } else {
        return res.status(404).json({ message: 'Not Found' });  // Respond with 404 for other routes
    }
}

// Route for success page (authenticated)
// This route serves the success.html page if the API key is valid
app.get('/success', authenticate, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../protected/success.html'));  // Send the success.html file located in the 'protected' directory
});

//& this is the route for usdc-only.html
app.get('/usdc-only', authenticate, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../protected/usdc-only.html'));  // Send the usdc-only.html file located in the 'protected' directory
});

// Route for sending SOL (authenticated)
// This route handles the POST request to send SOL from the server's keypair to the recipient
app.post('/api/send', authenticate, async (req: Request, res: Response) => {
    try {
        const { recipient, amount } = req.body;  // Extract recipient and amount from the request body
        if (!recipient || !amount) {
            return res.status(400).json({ message: 'Recipient and amount are required.' });  // Respond with 400 if recipient or amount are missing
        }

        const recipientPublicKey = new PublicKey(recipient);  // Create a PublicKey object from the recipient address
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: keypair.publicKey,  // Sender's public key
                toPubkey: recipientPublicKey,  // Recipient's public key
                lamports: amount * 1e9,  // Convert SOL to lamports (1 SOL = 1e9 lamports)
            })
        );

        // Sign and send the transaction
        const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);

        // Get balance of the sender
        const balance = await connection.getBalance(keypair.publicKey);

        // Convert balance from lamports to SOL
        const balanceInSol = balance / 1e9;

        // Respond with the transaction signature and the updated balance
        res.json({
            signature,
            balance: balanceInSol,
        });
    } catch (error: unknown) {
        console.error('Error processing transaction:', error);  // Log error to console
        res.status(500).json({ message: 'Error processing transaction', error: (error as Error).message });  // Respond with 500 if an error occurs
    }
});

// Route for the home page
// This route serves the index.html page from the 'public' directory
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);  // Log server start message
});