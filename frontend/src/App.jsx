// src/App.js
import React from "react";
import Upload from "./components/Upload";
import "./index.css";  // or "./App.css"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      <h1 className="text-center text-3xl my-8">Upload Excel File</h1>
      <Upload />
      <ToastContainer />
    </div>
  );
}

export default App;
