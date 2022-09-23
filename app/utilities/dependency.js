const dependencies = {};

module.exports.register = (name, fn) => {
    dependencies[name] = fn;
};

module.exports.get = name => dependencies[name];

module.exports.purge = name => delete dependencies[name];