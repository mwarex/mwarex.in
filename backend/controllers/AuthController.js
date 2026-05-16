const BaseController = require("./BaseController");
const AuthService = require("../services/AuthService");

class AuthController extends BaseController {
    constructor(authService) {
        super();
        this.authService = authService;
    }

    async signup(req, res) {
        try {
            const user = await this.authService.signup(req.body);
            return this.success(res, { message: "User Created", user });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async signin(req, res) {
        try {
            const { token, email, name, id, role } = await this.authService.signin(req.body);
            res.cookie("auth", token, this.authService.getCookieOptions());
            return this.success(res, { token, email, name, id, role });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async getProfile(req, res) {
        try {
            const user = await this.authService.getProfile(req.userId);
            return this.success(res, user);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async updateSettings(req, res) {
        try {
            const UserRepository = require("../repositories/UserRepository");
            const user = await UserRepository.updateSettings(req.userId, req.body.settings);
            return this.success(res, { message: "Settings updated", user });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async getEditors(req, res) {
        try {
            const editors = await this.authService.getEditors(req.userId);
            return this.success(res, editors);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async removeEditor(req, res) {
        try {
            const result = await this.authService.removeEditor(req.params.id, req.userId);
            return this.success(res, result);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async forgotPassword(req, res) {
        try {
            const result = await this.authService.forgotPassword(req.body.email);
            return this.success(res, result);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async verifyOTP(req, res) {
        try {
            const result = await this.authService.verifyOTP(req.body.email, req.body.otp);
            return this.success(res, result);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async resetPassword(req, res) {
        try {
            const result = await this.authService.resetPassword(req.body.email, req.body.otp, req.body.newPassword);
            return this.success(res, result);
        } catch (err) {
            return this.handleError(res, err);
        }
    }
}

module.exports = new AuthController(AuthService);
