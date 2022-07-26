

const axios = require("axios");

const defaultSender = {
	name: "Leets",
	email: "hey@leets.it",
};

class Mailer {
	constructor(options) {
		this.sender = defaultSender;
	}

	to() {
		// rome-ignore lint(correctness/noArguments): reason
		if (arguments.length === 2) {
			// rome-ignore lint(correctness/noArguments): reason
			this.name = arguments[0];
			// rome-ignore lint(correctness/noArguments): reason
			this.email = arguments[1];
			// rome-ignore lint(correctness/noArguments): reason
		} else if (1 === arguments.length) {
			// rome-ignore lint(correctness/noArguments): reason
			this.name = arguments[0].name;
			// rome-ignore lint(correctness/noArguments): reason
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

	async send(admins = null) {
		const payload = {
			to: admins ? admins : [{ name: this.name, email: this.email }],
		};

		if (this.params) { payload.params = this.params; }

		if (this.subject) { payload.subject = this.subject; }

		if (this.attachments) { payload.attachment = this.attachments; }

		if (this.template) {
			payload.templateId = parseInt(this.template);

			if (this.params) {
				payload.params = this.params;
			}
		}

		if (this.sender) {
			payload.sender = this.sender;
		}

		try {
			await axios({
				headers: {
					accept: "application/json",
					"Content-Type": "application/json",
					"api-key": process.env.SENDINBLUE_API_KEY,
				},
				method: "post",
				url: "https://api.sendinblue.com/v3/smtp/email",
				data: payload,
				timeout: 10000,
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
