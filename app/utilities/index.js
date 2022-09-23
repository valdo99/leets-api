module.exports = {
    logger: require('./logger'),
    mongooseErrorFormatterPlugin: require('./mongoose-error-formatter-plugin'),
    express: require('./express'),
    apiMiddleware: require("./api-middleware"),
    dependencyLocator: require('./dependency')
};