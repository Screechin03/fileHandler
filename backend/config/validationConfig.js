export const sheetValidationRules = {
    name: {
        required: true,
        validate: (name) => name && name.trim() !== '', // Name cannot be empty
    },
    amount: {
        required: true,
        type: 'number',
        validate: (amount) => !isNaN(amount) && amount > 0,
    },
    date: {
        required: true,
        type: 'date',
        validate: (date) => {
            const parsedDate = moment(date, 'DD-MM-YYYY', true);
            return parsedDate.isValid() && parsedDate.isSameOrBefore(moment(), 'day');

        },
    },
    verified: {
        required: true,
        type: 'string',
        validate: (verified) => verified === 'Yes' || verified === 'No',
    },
    invoiceDate: {
        required: false,
        type: 'date',
        validate: (date) => {
            const parsedDate = moment(date, 'DD-MM-YYYY', true);
            return parsedDate.isValid() && parsedDate.isSameOrBefore(moment(), 'day');

        },
    },
    receiptDate: {
        required: false,
        type: 'date',
        validate: (date) => {
            const parsedDate = moment(date, 'DD-MM-YYYY', true);
            return parsedDate.isValid() && parsedDate.isSameOrBefore(moment(), 'day');

        },
    }
};

// Default columns to validate
export const defaultColumns = ['Name', 'Amount', 'Date', 'Verified'];
