'use strict';

exports.isStar = true;

var phoneBook = [];

function isValidPhone(phone) {
    return typeof(phone) === 'string' && /^(\d){10}$/.test(phone);
}

function isValidEmail(email) {
    if (email === undefined) {
        return true;
    }

    return typeof(email) === 'string' && email !== '' && email.indexOf('@') !== -1;
}

function isValidName(name) {
    return typeof(name) === 'string' && name !== undefined && name !== '';
}

function checkExists(value, phone) {
    return value.phone === phone;
}

exports.add = function (phone, name, email) {
    if (isValidPhone(phone) && isValidName(name) && isValidEmail(email)) {
        var samePhones = phoneBook.filter(function (value) {
            return checkExists(value, phone);
        });
        if (samePhones.length === 0) {
            phoneBook.push({ 'phone': phone, 'name': name, 'email': email });

            return true;
        }
    }

    return false;
};

function updateField(value, phone, name, email) {
    if (value.phone === phone && (value.name !== name ||
        value.email !== email)) {
        value.name = name;
        value.email = email;
    }

    return value;
}

function isExistedPhone(phone) {
    return phoneBook.some(
        function (value) {
            return value.phone === phone;
        }
    );
}

exports.update = function (phone, name, email) {
    if (isValidPhone(phone) && isValidName(name) && isValidEmail(email)) {
        if (isExistedPhone(phone)) {
            var updatedFields = phoneBook.map(function (value) {
                return updateField(value, phone, name, email);
            });
            phoneBook = updatedFields;

            return true;
        }
    }

    return false;
};

exports.findAndRemove = function (query) {
    var diff = 0;
    if (isValidQuery(query)) {
        if (query === '*') {
            diff = phoneBook.length;
            phoneBook = [];

            return diff;
        }
        var otherFields = phoneBook.filter(function (value) {
            return !findQuery(value, query);
        });
        diff = phoneBook.length - otherFields.length;
        phoneBook = otherFields;

        return diff;
    }

    return 0;
};

function isValidQuery(query) {
    return typeof(query) === 'string' && query.length > 0;
}

function findQuery(value, query) {
    if (value.email !== undefined) {
        return value.phone.indexOf(query) !== -1 ||
                value.name.indexOf(query) !== -1 ||
                value.email.indexOf(query) !== -1;
    }

    return value.phone.indexOf(query) !== -1 ||
            value.name.indexOf(query) !== -1;
}

function convertForHumans(value) {
    if (value.email !== undefined) {
        return value.name + ', +7 (' +
                value.phone.substring(0, 3) + ') ' +
                value.phone.substring(3, 6) + '-' +
                value.phone.substring(6, 8) + '-' +
                value.phone.substring(8) + ', ' +
                value.email;
    }

    return value.name + ', +7 (' +
            value.phone.substring(0, 3) + ') ' +
            value.phone.substring(3, 6) + '-' +
            value.phone.substring(6, 8) + '-' +
            value.phone.substring(8);

}

exports.find = function (query) {
    if (isValidQuery(query)) {
        if (query === '*') {
            return phoneBook.map(convertForHumans).sort();
        }
        var foundMatches = phoneBook.filter(function (value) {
            return findQuery(value, query);
        });

        return foundMatches.map(convertForHumans).sort();
    }

    return [];
};

function isValidCSV(csv) {
    return typeof(csv) === 'string' && csv.length > 0 &&
            csv.indexOf(';') !== -1;
}

function tryToAdd(value) {
    var splitted = value.split(';');
    if (splitted.length <= 3) {
        var name = splitted[0];
        var phone = splitted[1];
        var email = splitted[2];
        if (exports.add(phone, name, email)) {
            return 1;
        }
    }

    return 0;
}

function tryToUpdate(value) {
    var splitted = value.split(';');
    if (splitted.length <= 3) {
        var name = splitted[0];
        var phone = splitted[1];
        var email = splitted[2];
        if (exports.update(phone, name, email)) {
            return 1;
        }
    }

    return 0;
}

exports.importFromCsv = function (csv) {
    var amount = 0;
    if (isValidCSV(csv)) {
        var fields = csv.split('\n');
        fields.forEach(function processField(value) {
            amount += Math.max(tryToUpdate(value), tryToAdd(value));
        });
    }

    return amount;
};
