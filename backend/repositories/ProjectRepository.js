const BaseRepository = require("./BaseRepository");
const Project = require("../models/Project");

class ProjectRepository extends BaseRepository {
    constructor() {
        super(Project);
    }
    
    async findOpenProjects(filters = {}) {
        return await this.model.find({ status: "Open", ...filters })
            .populate("creatorId", "name email profilePicture creatorProfile")
            .sort({ createdAt: -1 });
    }

    async findProjectsByCreator(creatorId) {
        return await this.model.find({ creatorId }).sort({ createdAt: -1 });
    }
}

module.exports = new ProjectRepository();
