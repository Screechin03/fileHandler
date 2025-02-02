// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import dataRoutes from './routes/dataRoutes.js';
import multer from 'multer';
import cors from 'cors';
import path from "path";

dotenv.config();
connectDB();

const app = express();
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,POST',

};

app.use(cors(corsOptions));
app.use(express.json());
const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })

}

app.post('/upload', dataRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
