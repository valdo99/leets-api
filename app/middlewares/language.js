const parser = require('accept-language-parser');

const tagLabel = 'acceptLanguageMiddleware';

module.exports = async (req, res, next) => {
    try {

        let lan = req.headers['x-accpet-language'];

        if (!lan)
            return next();

        const languages = parser.parse(lan);

        if (languages.length === 0)
            return next();

        i18n.setLocale(languages[0].code);

        next();
    }
    catch (error) {
        next();
        utilities.logger.error("Error while parsing accept-language header", { tagLabel, error });
    }
}