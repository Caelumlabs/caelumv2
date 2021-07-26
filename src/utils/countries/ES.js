// Code from : https://gist.github.com/carlos-mg89/4aaafa310c9e4b91f5fb890540f38cae
// const DNI_REGEX = /^(\d{8})([A-Z])$/
// const NIE_REGEX = /^[XYZ]\d{7,8}[A-Z]$/
// const CIF_REGEX = /^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/

const sanitize = function (taxID) {
  // Ensure uppercase and remove whitespace ang hyphens
  return taxID.toUpperCase().replace(/\s/g, '').replace(/-/g, '');
};

module.exports = {
  isTaxID: (taxID) => {
    taxID = sanitize(taxID);
    if (!taxID || taxID.length !== 9) {
      return false;
    }

    const letters = ['J', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    const digits = taxID.substr(1, taxID.length - 2);
    const letter = taxID.substr(0, 1);
    const control = taxID.substr(taxID.length - 1);
    let sum = 0;
    let i;
    let digit;

    if (!letter.match(/[A-Z]/)) {
      return false;
    }

    for (i = 0; i < digits.length; ++i) {
      digit = parseInt(digits[i]);

      if (isNaN(digit)) {
        return false;
      }

      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) {
          digit = parseInt(digit / 10) + (digit % 10);
        }

        sum += digit;
      } else {
        sum += digit;
      }
    }

    sum %= 10;
    if (sum !== 0) {
      digit = 10 - sum;
    } else {
      digit = sum;
    }

    let isValid = false;
    if (letter.match(/[ABEH]/)) {
      isValid = String(digit) === control;
    }
    if (letter.match(/[NPQRSW]/)) {
      isValid = letters[digit] === control;
    } else {
      isValid = (String(digit) === control || letters[digit] === control);
    }
    if (!isValid) {
      throw (new Error('Invalid taxID'));
    } else return true;
  },
};
