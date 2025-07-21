require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const si = require('systeminformation');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

// Database connection pool
const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Function to create table if it doesn't exist
async function setupDatabase() {
    try {
        const connection = await dbPool.getConnection();
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        connection.release();
        console.log('Database table "users" is ready.');
    } catch (error) {
        console.error('Error setting up the database:', error);
        process.exit(1); // Exit if we can't connect to the DB
    }
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Registration endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        // In a real app, hash the password here!
        const [rows] = await dbPool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0) {
            return res.status(400).send('User already exists');
        }
        await dbPool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send('Error registering user');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // In a real app, compare hashed passwords!
        const [rows] = await dbPool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (rows.length > 0) {
            res.json({ redirectUrl: '/welcome.html' });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Error logging in');
    }
});

// Performance endpoint
app.get('/performance', async (req, res) => {
    try {
        const cpu = await si.currentLoad();
        const mem = await si.mem();
        const os = await si.osInfo();
        res.json({
            os: {
                platform: os.platform,
                distro: os.distro,
                release: os.release,
            },
            cpu: {
                cores: cpu.cpus.length,
                load: `${cpu.currentLoad.toFixed(2)}%`,
            },
            memory: {
                total: `${(mem.total / 1024 / 1024 / 1024).toFixed(2)} GB`,
                free: `${(mem.free / 1024 / 1024 / 1024).toFixed(2)} GB`,
                used: `${(mem.used / 1024 / 1024 / 1024).toFixed(2)} GB`,
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Could not fetch performance data' });
    }
});

// Endpoint to view all registered users
app.get('/users', async (req, res) => {
    try {
        const [rows] = await dbPool.query('SELECT id, username, created_at FROM users');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users');
    }
});

// Start the server after ensuring the database is set up
setupDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
});
