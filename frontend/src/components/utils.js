
import moment from 'moment';
export const formatNumber = (number) => {
    return new Intl.NumberFormat('en-IN').format(number);
};


export const formatDate = (date) => {
    return moment(date).format('DD-MM-YYYY');
};
