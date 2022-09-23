require('dotenv').config();
require('./app/utils/i18n');

process.name = 'agendaWorker';

const tagLabel = process.name;

const glob = require('glob');

require('./bootstrap-application');


const patterns = [
    "app/plugins/*.js",
    "app/services/**/index.js",
    "app/services/*.js",
    "app/models/*.js"
];

for (const pattern of patterns) {
    const files = glob.sync(pattern, null);

    for (const filePath of files) {
        require("./" + filePath);
    }
}

const agenda = utilities.dependencyLocator.get('agenda');

process.on('SIGINT', async () => {
    utilities.logger.info('Gracefully stopping queue', { tagLabel });

    try {
        await agenda.stop();
    }
    catch (error) {
        api.logger.error('Cannot kill agenda', { tagLabel, error });
    }

    process.exit(0);
});

(async () => {

    const db = await require('./app/utils/db');
    global.db = db;

    utilities.logger.info(`Successfully connected to MongoDB cluster.`, { tagLabel, env: process.env.NODE_ENV });

    await agenda.start();

    const files = glob.sync('app/services/agenda/jobs/*.js', null);

    for (const filePath of files) {

        const cron = require("./" + filePath)(agenda);

        if (cron) {
            agenda.every(cron.time, cron.job, cron.options || {});
            utilities.logger.info('A cron job has been set', { tagLabel, filePath, time: cron.time });
        } else {
            utilities.logger.info('A job has been set', { tagLabel, filePath });
        }

    }

    try {
        process.send('ready');
    }
    catch (e) { }


})();