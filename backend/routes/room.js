const router = require("express").Router();
const RoomController = require("../controllers/RoomController");
const userAuth = require("../middlewares/userMiddleware");

router.post("/create", userAuth, (req, res) => RoomController.create(req, res));
router.get("/verify/:token", (req, res) => RoomController.verifyToken(req, res));
router.get("/list", userAuth, (req, res) => RoomController.list(req, res));
router.post("/join", userAuth, (req, res) => RoomController.join(req, res));
router.get("/:id", userAuth, (req, res) => RoomController.getDetails(req, res));

module.exports = router;
