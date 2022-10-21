const PostHog = require("posthog-node").PostHog;

const tagLabel = "posthog";

utilities.dependencyLocator.register(
	tagLabel,
	(() => {
		const client = new PostHog(process.env.POSTHOG_API_KEY, {
			host: "https://app.posthog.com",
		});

		return client;
	})(),
);
