const appRoot = require('app-root-path').path;

global.i18n = require("i18n");

global.i18n.configure({
    locales:['it'],
    defaultLocale: 'it',
    directory: appRoot + '/app/locales',
    updateFiles: !!(process.env.I18N_UPDATE_FILES && process.env.I18N_UPDATE_FILES === 'true')
});