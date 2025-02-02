import moment from "moment";

const validateFile = (sheet) => {
    const errors = [];

    sheet.forEach((rowD, rowIndex) => {
        rowD.forEach((row) => {
            const rowErrors = [];

            if (isNaN(row.Amount) || row.Amount <= 0) {
                rowErrors.push("Amount must be greater than zero");
            }

            const date = moment(row.Date, "DD-MM-YYYY", true);
            if (!date.isValid()) {
                rowErrors.push("Invalid date format");
            }
            if (row.Verified !== "Yes" && row.Verified !== "No") {
                rowErrors.push('Verified must be either "Yes" or "No"');
            }
            // Store errors if any
            if (rowErrors.length > 0) {
                errors.push({
                    row: rowIndex + 1,
                    errors: rowErrors,
                });
            }
        });
    });

    return errors;
};

export default validateFile;
