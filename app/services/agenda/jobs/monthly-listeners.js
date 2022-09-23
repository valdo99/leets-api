const tagLabel = 'updateMonthlyListenersJob';

module.exports = agenda =>

    agenda.define('monthly listeners', { concurrency: 10 }, async job => {

        const { post } = job.attrs.data;

        const mongoose = require('mongoose');
        const Post = mongoose.model('Post');



        // if (!post) return job.fail("Cannot calculate capitalGain and update transactions");


    });


