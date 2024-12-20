const express = require('express');
const fs = require('fs'); // For file operations
const bodyParser = require('body-parser'); // Middleware to parse JSON

const app = express();
const PORT = 3000;

// Middleware to parse JSON data
app.use(bodyParser.json());

// File containing user data
const DATA_FILE = 'users.json';

// Utility function to read user data
const readUsers = () => {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
};

// Utility function to write user data
const writeUsers = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// Default route
app.get('/', (req, res) => {
    res.send('Welcome to the REST API!');
});

// Example: GET /users
app.get('/users', (req, res) => {
    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).send('Internal Server Error');
        }
        res.json(JSON.parse(data || '[]'));
    });
});

// POST: Add a new user
app.post('/users', (req, res) => {
    const newUser = req.body;
    const users = readUsers();

    // Assign a new ID
    newUser.id = users.length ? users[users.length - 1].id + 1 : 1;

    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ message: 'User added successfully!', user: newUser });
});

// DELETE: Remove a user by ID
app.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    let users = readUsers();

    // Filter out the user with the given ID
    const filteredUsers = users.filter(user => user.id !== userId);

    if (filteredUsers.length === users.length) {
        return res.status(404).json({ message: 'User not found!' });
    }

    writeUsers(filteredUsers);
    res.json({ message: `User with ID ${userId} deleted successfully!` });
});

// PUT: Update a user by ID
app.put('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const updatedData = req.body;
    let users = readUsers();

    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found!' });
    }

    // Update the user data
    users[userIndex] = { ...users[userIndex], ...updatedData };
    writeUsers(users);

    res.json({ message: `User with ID ${userId} updated successfully!`, user: users[userIndex] });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
