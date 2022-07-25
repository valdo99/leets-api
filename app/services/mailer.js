const axios = require('axios');

const defaultSender = {
    name: 'Clear Connect',
    email: process.env.NODE_ENV === "PROD" ? 'info@clearconnection.it' : "clear.connection.sendinblue@gmail.com"
};

class Mailer {

    constructor(options) {
        this.sender = defaultSender;
    }


    to() {

        if(arguments.length === 2) {
            this.name = arguments[0];
            this.email = arguments[1];
        } else if(arguments.length === 1) {
            this.name = arguments[0].name;
            this.email = arguments[0].email;
        }

        return this;
    }

    setSubject(text) {

        this.subject = text;

        return this;

    }

    setTemplate(name) {
        this.template = name;
        return this;
    }

    setReplyTo(){
        this.replyTo = {"email":"info@cleaerconnection.it", "name":"ClearConnection"};
        return this;
    }

    setContent(html) {

        this.content = html;

        return this;

    }

    setParams(params) {

        this.params = params;
        return this;

    }

    setAttachments(attachments) {

        this.attachments = attachments;
        return this;

    }

    setSender() {

        this.sender = defaultSender;
        return this;

    }


    async send(admins=null) {


        const payload = {
            to: admins ? admins : [{name: this.name, email: this.email}],
        };

        if (this.params)
            payload.params = this.params;

        if (this.subject)
            payload.subject = this.subject;

        if(this.attachments)
            payload.attachment = this.attachments;

        if (this.template) {
            payload.templateId = parseInt(this.template);

            if (this.params) {
                payload.params = this.params;
            }

        } else if (this.content) {
            payload.htmlContent = this.content;
            payload.replyTo = this.replyTo;
        }

        if(this.sender){
            payload.sender = this.sender;
        }


        try {
            await axios({
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'api-key': process.env.SENDINBLUE_API_KEY
                },
                method: 'post',
                url: 'https://api.sendinblue.com/v3/smtp/email',
                data: payload,
                timeout: 10000
            });

        } catch (error) {
            utilities.logger.error(error);
        }

        this.name = null;
        this.email = null;
        this.subject = null;
        this.params = null;
        this.content = null;
        this.template = null;
        this.attachments = null;

    }

}

module.exports = Mailer;