import mongoose from 'mongoose';

const dataSchema = new mongoose.Schema({
    name: String,
    amount: Number,
    date: Date,
    verified: Boolean,
    invoiceDate: Date,
    receiptDate: Date,
});

const Data = mongoose.model('Data', dataSchema);

export default Data;
