module.exports = {
    text: {
        engine: "http://searx.bimorphic.com",
        sites: ["en.wikipedia.org", "oercommons.org", "ck12.org"]
    },
    apps: {
        engine: "http://searx.bimorphic.com",
        sites: ["phet.colorado.edu/sims/html"]
    },
    videos: {
        engine: "https://www.googleapis.com/youtube/v3/search",
        key: "AIzaSyBQuBZQy0X_0g-D5bH5MC8Rg2bocnoLolI",
        channels: [
            "UCT7EcU7rC44DiS3RkfZzZMg", // AravindGupta
            "UC4a-Gbdw7vOaccHmFo40b9g", // KhanAcademy
            "UCT0s92hGjqLX6p7qY9BBrSA", // NCERT
            "UCFe6jenM1Bc54qtBsIJGRZQ" // PatrickMT
        ]
    },
    summary: {
        engine: 'http://api.duckduckgo.com'
    }
};
