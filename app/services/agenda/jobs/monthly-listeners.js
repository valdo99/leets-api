const tagLabel = 'updateMonthlyListenersJob';

module.exports = agenda =>

    agenda.define('monthly listeners', { concurrency: 10 }, async job => {

        const { post } = job.attrs.data;

        const puppeteer = require('puppeteer')
        const mongoose = require('mongoose');
        const Artist = mongoose.model("Artist");

        const artist = await Artist.findOne({ _id: post.artist });

        if (!artist) {
            return job.fail("artist doesn't exist in db")
        }

        let browser;
        if (process.env.NODE_ENV === "DEV") {
            browser = await puppeteer.launch({
                headless: true,
                executablePath: '/usr/bin/chromium-browser'
            });
        } else {
            browser = await puppeteer.launch({
                headless: true,
            });
        }


        let listeners;

        const page = await browser.newPage();
        await page.goto('https://open.spotify.com/artist/'.concat(artist.spotify_id), { waitUntil: 'networkidle0' });

        let texts = await page.evaluate(() => {
            let data = [];
            let elements = document.getElementsByClassName('Ydwa1P5GkCggtLlSvphs');
            for (var element of elements)
                data.push(element.textContent);
            return data;
        });

        await browser.close();

        if (texts.length === 0) {
            return job.fail("Cannot find monthly listeners, check spotify classname");
        }

        listeners = parseInt(texts[0].split(" ")[0].split(",").join(""))

        artist.monthly_listeners = listeners;
        await artist.save()

    });


