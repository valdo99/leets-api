const httpContext = require("express-http-context");

const apiMiddleware = require('./api-middleware');

const logger = require('./logger');

let app;
let authMiddleware;

module.exports.init = (_app, _authMiddleware = null) => {

    app = _app;
    authMiddleware = _authMiddleware;
    app.use(apiMiddleware);
    app.use(httpContext.middleware);

};

module.exports.Service = class Service {

    constructor(name) {
        this.name = name;
        this.method = 'get';
        this.middlewares = [];
        this.public = false;
    }

    isGet() {
        this.method = 'get';
        return this;
    }

    isPost() {
        this.method = 'post';
        return this;
    }

    isPut() {
        this.method = 'put';
        return this;
    }

    isDelete() {
        this.method = 'delete';
        return this;
    }

    isPublic() {
        this.public = true;
        return this;
    }

    respondsAt(route) {
        this.route = route;
        return this;
    }

    setMiddlewares(m) {
        this.middlewares = m;
        return this;
    }

    controller(fn) {

        const me = this;

        const ctrl = async function(req, res) {
            try {
                logger.debug('Running...', { tagLabel: me.name });
                await fn(req, res);
            } catch (error) {
                res.apiErrorResponse(error, me.name);
            }
        };

        if(typeof authMiddleware === 'function' && !this.public)
            return app[this.method](this.route, authMiddleware, ...this.middlewares, ctrl);
        else
            return app[this.method](this.route, ...this.middlewares, ctrl);

    }

};