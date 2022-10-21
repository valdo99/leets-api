const errorManager = (err, next) => {
	if (err.name === "ValidationError" && err.errors) {
		let result = {};
		Object.keys(err.errors).map((fieldName) => {
			if (fieldName.includes(".")) {
				const parts = fieldName.split(".");
				const firstPart = parts.shift();
				result[firstPart] = parts.reduceRight(
					(obj, next) => ({ [next]: obj }),
					err.errors[fieldName].message,
				);
			} else {
				result[fieldName] = err.errors[fieldName].message;
			}
		});
		return next({ name: "ValidationError", data: result });
	} else {
		return next(err);
	}
};

module.exports = (schema) => {
	schema.post("validate", function (error, doc, next) {
		errorManager(error, next);
	});

	schema.post("save", function (error, doc, next) {
		errorManager(error, next);
	});

	schema.post("findOneAndUpdate", function (error, doc, next) {
		errorManager(error, next);
	});
};
