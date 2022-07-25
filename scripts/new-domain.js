const fs = require('fs');
const mongoose = require('mongoose');
const Domain = mongoose.model("Domain");

module.exports = {
    name: "new domain",
    inputs: [
        { name: 'name', type: 'text' },
    ],
    run: async (inputs) => {

        let domain = new Domain(inputs);
        await domain.save();

        process.exit();
    }
};