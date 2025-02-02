import express from 'express';
import multer from 'multer';
import processFile from '../utils/processFile.js';
import validateFile from '../utils/validateFile.js';
import Data from '../models/dataModel.js';
import moment from 'moment';

const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()} - ${file.originalname}`);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    },
});


const mapFields = (row) => {
    const mappedData = {
        name: row.Name,
        amount: row.Amount,
        date: moment(row.Date, 'DD-MM-YYYY', true).isValid()
            ? moment(row.Date, 'DD-MM-YYYY').toDate()
            : null,
        verified: row.Verified === 'Yes',
    };

    // Conditionally add `invoiceDate` if valid
    if (row['Invoice Date'] && moment(row['Invoice Date'], 'DD-MM-YYYY', true).isValid()) {
        mappedData.invoiceDate = moment(row['Invoice Date'], 'DD-MM-YYYY').toDate();
    }

    // Conditionally add `receiptDate` if valid
    if (row['Receipt Date'] && moment(row['Receipt Date'], 'DD-MM-YYYY', true).isValid()) {
        mappedData.receiptDate = moment(row['Receipt Date'], 'DD-MM-YYYY').toDate();
    }

    return mappedData;
};

router.post('/upload', upload.single('file'), async (req, res) => {
    console.log('Received file:', req.file);
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const { sheets } = processFile(req.file.path);
        const errors = validateFile(sheets);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        const savedSheets = [];
        for (const sheet of sheets) {
            const savedSheet = [];
            for (const row of sheet) {
                const mappedData = mapFields(row);
                const newData = new Data(mappedData);
                await newData.save();
                savedSheet.push(mappedData);
            }
            savedSheets.push(savedSheet);
        }
        res.status(200).json({
            message: 'Data successfully uploaded and saved.',
            sheets: savedSheets,
        });

    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
});

export default router;