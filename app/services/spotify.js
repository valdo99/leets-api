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
			const res = await axios({
				url: `https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryArtistOverview&variables={"uri":"spotify:artist:${artist}"}&extensions={"persistedQuery":{"version":1,"sha256Hash":"bc00d8721c7aca91d3507c01a3e3dcca448a6582c51f7fc64a48c491b4369ad1"}}`,
				headers: await headers(),
			});
			return res.data.data.artist;
		};

		const getTrack = async (track) => {
			const res = await axios({
				url: `https://api-partner.spotify.com/pathfinder/v1/query?operationName=getTrack&variables={"uri":"spotify:track:${track}"}&extensions={"persistedQuery":{"version":1,"sha256Hash":"f9c8447cac06d3c6d6f4c9e4ef7e848a837a7b4eb582e35efc484654abaeb472"}}`,
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
