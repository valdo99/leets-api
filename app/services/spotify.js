const axios = require("axios");

const tagLabel = "spotify";

const headers = async () => {
	return {
		"User-Agent":
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:105.0) Gecko/20100101 Firefox/105.0",
		Accept: "application/json",
		"Accept-Language": "en",
		"Sec-Fetch-Dest": "empty",
		"Sec-Fetch-Mode": "no-cors",
		"Sec-Fetch-Site": "same-site",
		authorization: `Bearer ${await getToken()}`,
		"app-platform": "WebPlayer",
		"spotify-app-version": "1.1.96.520.g8443bb7e",
		"content-type": "application/json;charset=UTF-8",
		Pragma: "no-cache",
		"Cache-Control": "no-cache",
	};
};

const getToken = async () => {
	const spotyHTML = await axios.get("https://open.spotify.com");
	const token = spotyHTML.data.split('"accessToken":"')[1].split('"')[0];
	return token;


};

utilities.dependencyLocator.register(
	tagLabel,
	(() => {
		const getArtist = async (artist) => {
			try {
				const res = await axios({
					url: `https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryArtistOverview&variables={"uri":"spotify:artist:${artist}"}&extensions={"persistedQuery":{"version":1,"sha256Hash":"0b84fdc8c874d3020a119be614b8f0ee0f08c69c1c37aeb0a8b17758f63ef7fe"}}`,
					headers: await headers(),
				});
				console.log(res.data);

				console.log(res.data.errors);
				return res.data.data.artist;
			} catch (error) {
				console.log(error);
				throw error;
			}

		};

		const getTrack = async (track) => {
			const res = await axios({
				url: `https://api-partner.spotify.com/pathfinder/v1/query?operationName=getTrack&variables={"uri":"spotify:track:${track}"}&extensions={"persistedQuery":{"version":1,"sha256Hash":"6af75b996d93636e4f1980c170f1171a457bf936f47d6ee1e38f57671d3ae7bd"}}`,
				headers: await headers(),
			});
			return res.data.data;
		};

		return {
			getArtist,
			getTrack,
		};
	})(),
);
