const { nanoid } = require('nanoid');

const generateShortCode = () => nanoid(7);

module.exports = generateShortCode;