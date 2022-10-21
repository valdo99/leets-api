const fs = require("fs");
const fileTemplate = ({ tagLabel, method, endpoint, isPrivate }) => `const mongoose = require('mongoose');
const tagLabel = "${tagLabel}";

new utilities.express.Service(tagLabel)
    .${method}()
    .respondsAt('${endpoint}')${isPrivate ? "" : "\n.isPublic()"}
    .controller(async (req, res) => {

    });
`;

module.exports = {
	name: "new controller",
	inputs: [
		{ name: "folder", type: "text" },
		{ name: "name", type: "text" },
		{ name: "endpoint", type: "text" },
		{
			name: "method",
			type: "multiple",
			options: ["isGet", "isPut", "isPost", "isDelete"],
		},
		{ name: "isPrivate", type: "multiple", options: [true, false] },
		{ name: "tagLabel", type: "text" },
	],
	run: async (inputs) => {
		const filePath = `app/controllers/${inputs.folder}/${inputs.name}.js`;
		console.log(filePath);

		fs.writeFileSync(filePath, fileTemplate(inputs));

		process.exit();
	},
};
