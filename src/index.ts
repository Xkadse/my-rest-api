import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

const app = express();
const port = 3000;
const API_KEY = '123';  // Hardcoded API key for testing

app.use(express.json());
app.use(express.static('public', {
    index: false,
    extensions: ['html']
}));


function authenticate(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.header('x-api-key');
    console.log('Expected API Key:', API_KEY);  // Log expected API key
    console.log('Received API Key:', apiKey);   // Log received API key

    if (apiKey === API_KEY) {
        next();
    } else {
        console.log('Unauthorized attempt with API Key:', apiKey);  // Log unauthorized attempts
        res.status(401).json({ message: 'Unauthorized' });
    }
}



// Route for protected data
app.get('/api/protected', authenticate, (req: Request, res: Response) => {
    res.json({ message: 'This is protected data' });
});

// Route for success page
app.get('/success', authenticate, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../protected/success.html'));
});

// Route for the home page
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
