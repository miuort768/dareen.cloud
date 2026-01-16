import app from './app';
import { getDb } from './utils/db';

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Initialize DB before starting server
        await getDb();

        app.listen(PORT, () => {
            console.log(`🚀 [TS Server]: Running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();
