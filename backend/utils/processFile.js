import xlsx from 'xlsx';

const processFile = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheets = [];
    console.log(workbook.SheetNames);
    workbook.SheetNames.forEach((sheetName) => {
        const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        console.log(`Sheet: ${sheetName}`, sheet);

        sheets.push(sheet);
    });

    return { sheets };
};

export default processFile;
