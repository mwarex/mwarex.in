class BaseController {
    success(res, data, statusCode = 200) {
        return res.status(statusCode).json(data);
    }

    error(res, message, statusCode = 500) {
        return res.status(statusCode).json({ message });
    }

    handleError(res, err) {
        const statusCode = err.status || 500;
        const message = err.message || "Internal Server Error";
        console.error(`[${this.constructor.name}] Error:`, message);
        return res.status(statusCode).json({ message });
    }

    badRequest(res, message) {
        return res.status(400).json({ message });
    }
}

module.exports = BaseController;
