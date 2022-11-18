const tagLabel = "healthController";

new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt("/qr-code")
    .controller(async (req, res) => {
        return res.redirect("https://leets.it/utm_source=qr-code");
    });
