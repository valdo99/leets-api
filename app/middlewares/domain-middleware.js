require('dotenv').config();

const httpContext = require("express-http-context");
const Domain = require("../models/domain");

const tagLabel  = 'domainAuthMiddleware';

module.exports = async (req, res, next) => {

    try {

        if(!req.params.domain){
            return res.forbidden("Domain mandatory");
        }

        const domain = await Domain.findOne({name:req.params.domain});

        if(!domain){
            return res.forbidden("Domain not found");
        }
        req.locals.domain = domain;
        httpContext.set("context", {req, res});
        return await httpContext.ns.runPromise(async () => {
            next();
        });
        
    }
    catch (error) {

        res.apiErrorResponse(error);
        utilities.logger.error('Cannot run domain authentication', { tagLabel, error });

    }

};