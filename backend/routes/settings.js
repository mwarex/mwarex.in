const router = require("express").Router();
const userAuth = require("../middlewares/userMiddleware");
const UserRepository = require("../repositories/UserRepository");

router.get("/get-settings", userAuth, async (req, res) => {
    try {
        const user = await UserRepository.findById(req.userId);
        res.json({ settings: user.settings || {} });
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
});

router.put("/settings", userAuth, async (req, res) => {
    try {
        const user = await UserRepository.updateSettings(req.userId, req.body.settings);
        res.json({ message: "Settings Saved", settings: user.settings });
    } catch (err) {
        res.status(500).json({ message: "Error saving settings" });
    }
});

module.exports = router;
