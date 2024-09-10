import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction, clusterApiUrl } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { config } from 'dotenv';

config();

const app = express();
const port = 3000; // Choose your port
const API_KEY = '123';  // Hardcoded API key for testing

// Middleware
app.use(bodyParser.json());

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

// Devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Prepare secret key from .env
const secretKey = process.env.SOLANA_SECRET_KEY ? JSON.parse(process.env.SOLANA_SECRET_KEY) : [];
const payer = Keypair.fromSecretKey(new Uint8Array(secretKey));

// USDC Mint address
const usdcMintAddress = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

app.post('/api/send', async (req, res) => {
    const { recipient, amount } = req.body;

    if (!recipient || !amount) {
        return res.status(400).json({ message: 'Recipient and amount are required' });
    }

    try {
        const recipientPublicKey = new PublicKey(recipient);

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

        // Get the balance (example for SOL, you might want to fetch USDC balance)
        const balance = await connection.getTokenAccountBalance(senderTokenAccount);

        res.json({
            signature,
            balance: balance.value.uiAmountString
        });
    } catch (error) {
        // Type assertion to `Error` to access the `message` property
        const errorMessage = (error as Error).message;
        res.status(500).json({ message: errorMessage });
    }
});

// Route for the home page
// This route serves the index.html page from the 'public' directory
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
