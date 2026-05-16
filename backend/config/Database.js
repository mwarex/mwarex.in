const mongoose = require("mongoose");

class Database {
    static instance = null;

    constructor() {
        if (Database.instance) {
            return Database.instance;
        }
        this.connection = null;
        Database.instance = this;
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    async connect() {
        try {
            const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mwarex";
            console.log("Connecting to MongoDB...");

            const startTime = Date.now();

            this.connection = await mongoose.connect(mongoURI, {
                maxPoolSize: 5,
                minPoolSize: 1,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 10000,
                heartbeatFrequencyMS: 10000,
                retryWrites: true,
                retryReads: true,
            });

            const connectionTime = Date.now() - startTime;
            console.log(`MongoDB connected in ${connectionTime}ms`);
        } catch (e) {
            console.log("Database Error:", e.message);
        }
    }

    getConnection() {
        return this.connection;
    }
}

mongoose.connection.on("connected", () => {
    console.log("MongoDB connection established");
});

mongoose.connection.on("error", (err) => {
    console.log("MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
});

module.exports = Database;
