require('dotenv').config();
require('./app/utils/i18n');


const tagLabel = 'Initialization routine';

const glob = require('glob');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const bodyParser = require('body-parser');
const helmet = require('helmet');


require('./application-boot');


const authMiddleware = require('./app/middlewares/client-auth');

const apiApp = express();

apiApp.disable('x-powered-by');

apiApp.use(cors());
apiApp.options('*', cors());

apiApp.use(require('morgan')("combined", {"stream": utilities.logger.stream}));
apiApp.use(express.static('app/public'));
apiApp.use(compression());
apiApp.use(helmet());
apiApp.use(bodyParser.json({limit: '1mb'}));


apiApp.get('/favicon.ico', (req, res) => res.status(204));

utilities.express.init(apiApp, authMiddleware);


(async ()=>{

    const db = await require('./app/utils/db');
    utilities.logger.info(`Successfully connected to MongoDB cluster.`, {tagLabel, env: process.env.NODE_ENV});




    //Loads plugins, services, models and controllers
    const patterns = [
        "app/plugins/*.js",
        "app/models/*.js",
        "app/services/**/index.js",
        "app/services/*.js",
        "app/controllers/**/*.js"
    ];

    for(const pattern of patterns) {
        const files = glob.sync(pattern, null);

        for (const filePath of files) {
            require("./" + filePath);
        }
    }

    apiApp.use('*', (req, res) => res.notFound());

    apiApp.use(function (error, req, res, next) {

        if (error) {

            utilities.logger.error("API ERROR NOT HANDLED", {error});
            res.status(400).json({code: 400, data: {}});

        }

        next();

    });

    apiApp.listen(process.env.PORT, async () => {

        utilities.logger.info('API server running', {tagLabel, port: process.env.PORT});

        if (process && typeof process.send === 'function') process.send('ready');

    });

})();

const shutdown = () => {
    utilities.logger.info("Goodbye!", {tagLabel});
    process.exit();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);