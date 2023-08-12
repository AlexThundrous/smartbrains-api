import express from 'express';
import cors from 'cors';
import db from './db/conn.mjs'

const app = express();

app.use(express.json());
app.use(cors());

const database = db.collection("users");

app.get('/', async (req, res) => {
    try {
        const users = await database.find({}).toArray();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json('internal server error');
    }
});


app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Find the last user in the database to get the latest ID
        const lastUser = await database.find().sort({ id: -1 }).limit(1).toArray();
        const newId = lastUser.length > 0 ? lastUser[0].id + 1 : 1;

        // Create a new user object with the generated ID and other data
        const newUser = {
            id: newId,
            name: name,
            email: email,
            password: password,
            entries: 0,
            joined: new Date(),
        };
        
        // Insert the new user into the database
        const result = await database.insertOne(newUser);
        
        // Check if the insertion was successful
        if (result.acknowledged) {
            res.json(newUser); // Return the new user data
        } else {
            console.log("Registration Failed:", result);
            res.status(500).json('registration failed');// Throw an error if insertion failed
        }
    } catch (error) {
        console.error(error);
        res.status(500).json('internal server error'); // Handle any errors
    }
});



app.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await database.findOne({ email, password });

        if (user) {
            res.json(user);
        } else {
            res.status(400).json('error logging in');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json('internal server error');
    }
});

app.get('/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await database.findOne({ id });
        if (user) {
            res.json('success');
        }
        else {
            res.status('400').json('user not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json('internal server error');
    }
});

app.put('/image', async (req, res) => {
    try {
        const { id } = req.body;
        const user = await database.findOne({ id });
        if (user) {
            user.entries++
            res.json(user.entries);
        }
        else {
            res.status('400').json('user not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json('internal server error');
    }
});

app.listen(3002, () => {
    console.log('Server is running on port 3002');
});
