const mongoose = require("mongoose");
const Video = require("./models/video");
mongoose.connect("mongodb://127.0.0.1:27017/mwarex");
(async () => {
    const video = await Video.findById("69be409d5224fefa47aebb86");
    console.log("Status:", video.status);
    console.log("FileUrl:", video.fileUrl);
    process.exit(0);
})();
