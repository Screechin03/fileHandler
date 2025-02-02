import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Modal from 'react-modal';
import { formatDate, formatNumber } from './utils';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import moment from 'moment/moment';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [sheets, setSheets] = useState([]);
    const [selectedSheet, setSelectedSheet] = useState(0);
    const [validationErrors, setValidationErrors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // Track the current page
    const [rowsPerPage, setRowsPerPage] = useState(10); // Set how many rows per page

    const { getRootProps, getInputProps, open } = useDropzone({
        accept: '.xlsx',
        maxSize: 2 * 1024 * 1024,
        onDragEnter: () => setIsDragging(true),
        onDragLeave: () => setIsDragging(false),
        onDrop: (acceptedFiles) => {
            setIsDragging(false);
            if (acceptedFiles.length > 0) {
                handleFileUpload(acceptedFiles[0]);
            } else {
                setErrorMessage('Please upload a valid .xlsx file.');
            }
        }
    });

    const handleFileUpload = async (uploadedFile) => {
        if (uploadedFile.size > 2 * 1024 * 1024) {
            setErrorMessage('File size exceeds the limit of 2 MB.');
            toast.error('File size exceeds the limit of 2 MB.');
            return;
        }
        setFile(null);
        setSheets([]);
        setSelectedSheet(null);
        setValidationErrors([]);
        setErrorMessage('');
        setIsLoading(true);
        setFile(uploadedFile);
        const formData = new FormData();
        formData.append('file', uploadedFile);

        try {
            const response = await axios.post(
                import.meta.env.MODE === "development"
                    ? "http://localhost:3000/upload"
                    : "/upload",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.sheets) {
                setSheets(response.data.sheets);
                toast.success('File uploaded successfully!');
            }
            setValidationErrors(response.data.errors || []);
            if (response.data.errors?.length > 0) {
                setShowModal(true);
            }
        } catch (error) {
            console.error('Upload error:', error.response ? error.response.data : error.message);
            setErrorMessage('Error uploading file.');
            toast.error('Error uploading file.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSheetChange = (e) => {
        const index = Number(e.target.value);
        if (index >= 0 && index < sheets.length) {
            setSelectedSheet(index); // Set selected sheet only if the index is valid
            setCurrentPage(1); // Reset pagination to the first page when sheet changes
        }
    };


    const handleDeleteRow = (rowIndex) => {
        if (selectedSheet === null) return;

        const confirmDelete = window.confirm("Are you sure you want to delete this row?");
        if (!confirmDelete) return;

        const updatedSheets = [...sheets];
        updatedSheets[selectedSheet].splice(rowIndex, 1);
        setSheets(updatedSheets);
    };

    const handleExport = () => {
        if (!sheets || sheets.length === 0 || selectedSheet === null) return;

        const sheetData = sheets[selectedSheet].map(row => {
            const data = {
                Name: row.Name || row.name,
                Amount: formatNumber(row.Amount || row.amount),
                Date: formatDate(row.Date || row.date),
                Verified: row.Verified || row.verified ? 'Yes' : 'No',
            };

            const invoiceDate = row.invoiceDate?.trim();
            if (invoiceDate) {
                if (moment(invoiceDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ', true).isValid()) {
                    data['Invoice Date'] = moment(invoiceDate).format('DD-MM-YYYY');
                } else {
                    data['Invoice Date'] = 'Not provided';
                }
            } else {
                data['Invoice Date'] = 'Not provided';
            }

            const receiptDate = row.receiptDate?.trim();
            if (receiptDate) {
                if (moment(receiptDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ', true).isValid()) {
                    data['Receipt Date'] = moment(receiptDate).format('DD-MM-YYYY');
                } else {
                    data['Receipt Date'] = 'Not provided';
                }
            } else {
                data['Receipt Date'] = 'Not provided';
            }

            return data;
        });

        const ws = XLSX.utils.json_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Validated Data');
        XLSX.writeFile(wb, 'validated_data.xlsx');
    };

    // Pagination Logic
    const currentRows = () => {
        if (!sheets[selectedSheet] || sheets[selectedSheet].length === 0) {
            return []; // Return empty array if no data exists for the selected sheet
        }

        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        console.log('Displaying rows for current page:', sheets[selectedSheet].slice(startIndex, endIndex)); // Log the sliced data
        return sheets[selectedSheet].slice(startIndex, endIndex);
    };


    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages()) return;
        setCurrentPage(page);
    };

    const totalPages = () => {
        if (!sheets || sheets.length === 0 || selectedSheet === null) return 1;
        return Math.ceil(sheets[selectedSheet].length / rowsPerPage);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <div {...getRootProps()}
                className={`border-2 border-dashed p-10 rounded-lg text-center transition-all duration-300 
                ${isDragging ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-gray-50'}`}>
                <input {...getInputProps()} />
                <p className="text-gray-600">Drag & Drop your Excel file here, or click to select</p>
            </div>
            <div className="mt-4 text-center">
                <button
                    onClick={open}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                >
                    Upload File
                </button>
            </div>
            {isLoading && (
                <div className="flex justify-center mt-4">
                    <div className="animate-spin rounded-full border-t-4 border-blue-500 w-16 h-16"></div>
                </div>
            )}

            {file && sheets.length > 0 && (
                <div className="mt-6">
                    <select onChange={handleSheetChange} className="p-2 border rounded-lg">
                        <option value="">Select a Sheet</option>
                        {sheets.map((_, index) => (
                            <option key={index} value={index}>Sheet {index + 1}</option>
                        ))}
                    </select>
                    {selectedSheet !== null && (
                        <table className="w-full mt-4 border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2">Date</th>
                                    <th className="border p-2">Amount</th>
                                    <th className="border p-2">Name</th>
                                    <th className="border p-2">Verified</th>

                                    {/* Conditionally render Invoice and Receipt Date columns */}
                                    {sheets[selectedSheet].some(row => row.invoiceDate) && (
                                        <th className="border p-2">Invoice Date</th>
                                    )}
                                    {sheets[selectedSheet].some(row => row.receiptDate) && (
                                        <th className="border p-2">Receipt Date</th>
                                    )}

                                    {/* Action column for Delete */}
                                    <th className="border p-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sheets[selectedSheet] && currentRows().map((row, index) => (
                                    <tr key={index} className="border">
                                        <td className="border p-2">{formatDate(row.date)}</td>
                                        <td className="border p-2">{formatNumber(row.amount)}</td>
                                        <td className="border p-2">{row.name}</td>
                                        <td className="border p-2">{row.verified ? 'Yes' : 'No'}</td>
                                        {row.invoiceDate ? (
                                            <td className="border p-2">{formatDate(row.invoiceDate)}</td>
                                        ) : (
                                            sheets[selectedSheet].some(row => row.invoiceDate) && (
                                                <td className="border p-2">Not Provided</td>
                                            )
                                        )}
                                        {row.receiptDate ? (
                                            <td className="border p-2">{formatDate(row.receiptDate)}</td>
                                        ) : (
                                            sheets[selectedSheet].some(row => row.receiptDate) && (
                                                <td className="border p-2">Not Provided</td>
                                            )
                                        )}
                                        <td className="border p-2">
                                            <button onClick={() => handleDeleteRow(index)} className="text-red-600 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Pagination Controls */}
                    <div className="mt-4 flex justify-center space-x-4">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="flex items-center">
                            Page {currentPage} of {totalPages()}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Export Button */}
            {sheets.length > 0 && selectedSheet !== null && (
                <div className="mt-6 text-center">
                    <button
                        onClick={handleExport}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
                    >
                        Export Validated Data
                    </button>
                </div>
            )}

            {errorMessage && (
                <div className="mt-4 text-red-600">{errorMessage}</div>
            )}
        </div>
    );
};

export default Upload;