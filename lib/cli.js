(() => {
    const colors = require('colors');
    const pkg = require('../package.json');
    let print;

    exports.print = print = (options) => {
        if (options && options.message && typeof options.message  === 'string') {
            return console.log(`[ ${'generaptr'.white} ] ${options.message.toString().cyan}`);
        } else {
            throw new Error('no message defined to print!');
        }
    };
}).call(this);
