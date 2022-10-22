export function FunctionStringify(obj) {
    return JSON.stringify(obj, function (key, value) {
        if (value instanceof Function || typeof value == 'function') {
            const fnBody = value.toString();
            return fnBody;
        } else {
            throw new Error('Attempt of stringify non-function object');
        }
    });
};

export function FunctionParse(str) {
    return JSON.parse(str, function (key, value) {
        return eval('(' + value + ')');
    });
};