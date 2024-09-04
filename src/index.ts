import express, { Request, Response, NextFunction } from 'express';

const app = express();
const port = 3000;
const API_KEY = process.env.API_KEY || 'supersecretkey';

// Middleware zum Parsen von JSON-Anfragen
app.use(express.json());
app.use(express.static('public'));
// Middleware zur Authentifizierung (optional: nur auf bestimmten Routen verwenden)
function authenticate(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.header('x-api-key');

    if (apiKey === API_KEY) {
        // Wenn der API-Schlüssel übereinstimmt, die Anfrage weiterleiten
        next();
    } else {
        // Andernfalls eine 401 Unauthorized Antwort senden
        res.status(401).json({ message: 'Unauthorized' });
    }
}

// Beispiel-Routen
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.get('/api/greet/:name', (req: Request, res: Response) => {
    const name = req.params.name;
    res.json({ message: `Hello, ${name}!` });
});

app.post('/api/data', (req: Request, res: Response) => {
    const data = req.body;
    res.json({ received: data });
});

// Geschützte Route
app.get('/api/protected', authenticate, (req: Request, res: Response) => {
    res.json({ message: 'This is protected data' });
});

// Server starten
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
