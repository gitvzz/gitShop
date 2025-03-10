"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatId = exports.formatImage = exports.formatStringOrObject = exports.isEmpty = void 0;
exports.has = has;
exports.is = is;
function has(source, key) {
    return Object.prototype.hasOwnProperty.call(source, key);
}
function is(source, eq) {
    const whatTheType = (something) => {
        const t = Object.prototype.toString.call(something).replace(/^\[object |]$/gi, '');
        if (t === 'Object' && has(source, 'componentOptions')) {
            return 'vnode';
        }
        else {
            return t;
        }
    };
    const type = whatTheType(source);
    if (eq && whatTheType(eq) === 'Array') {
        eq = eq.join('|');
    }
    return eq ? new RegExp('^(' + eq + ')$', 'i').test(type) : type.toLowerCase();
}
const isEmpty = (value) => {
    const type = is(value);
    let state = false;
    switch (type) {
        case 'null':
            state = true;
            break;
        case 'undefined':
            state = true;
            break;
        case 'boolean':
            state = value === false;
            break;
        case 'string':
            state = value === '';
            break;
        case 'number':
            state = (value === 0);
            break;
        case 'array':
            state = value.length === 0;
            break;
        case 'object':
            state = Object.keys(value).length === 0;
            break;
        default:
            break;
    }
    return state;
};
exports.isEmpty = isEmpty;
const formatStringOrObject = (key, value, required = true, lengths) => {
    if (required && (0, exports.isEmpty)(value)) {
        throw new Error(`${key} is required`);
    }
    if (typeof value === 'string') {
        value = { _: value };
    }
    if (!is(value, 'object')) {
        throw new Error(`${key} is invalid`);
    }
    for (const i in value) {
        if (typeof value[i] !== 'string') {
            throw new Error(`${key} is invalid`);
        }
        else if (lengths && (value[i].length > lengths[1] || value[i].length < lengths[0])) {
            throw new Error(`${key} length is invalid,length:${value[i].length},min:${lengths[0]},max:${lengths[1]}`);
        }
    }
    return value;
};
exports.formatStringOrObject = formatStringOrObject;
const formatImage = (image) => {
    if ((0, exports.isEmpty)(image)) {
        throw new Error('image is required');
    }
    if (typeof image === 'string') {
        return { src: image, alt: '' };
    }
    if (!is(image, 'object')) {
        throw new Error('image is invalid');
    }
    if (!image.src || typeof image.src !== 'string') {
        throw new Error('image.src is invalid');
    }
    if (image.alt && typeof image.alt !== 'string') {
        throw new Error('image.alt is invalid');
    }
    if (image.alt && image.alt.length > 20) {
        image.alt = image.alt.slice(0, 20);
    }
    return { src: image.src, alt: image.alt || '' };
};
exports.formatImage = formatImage;
const formatId = (id) => {
    if (!id || typeof id !== 'string' || !/^[\w-]{3,20}$/.test(id)) {
        throw new Error('id is invalid');
    }
    return id;
};
exports.formatId = formatId;
