const BaseRepository = require("./BaseRepository");
const Application = require("../models/Application");

class ApplicationRepository extends BaseRepository {
    constructor() {
        super(Application);
    }
    
    async findByProject(projectId) {
        return await this.model.find({ projectId })
            .populate("editorId", "name email profilePicture editorProfile")
            .sort({ appliedAt: -1 });
    }

    async findByEditor(editorId) {
        return await this.model.find({ editorId })
            .populate({
                path: "projectId",
                populate: {
                    path: "creatorId", 
                    select: "name email"
                }
            })
            .sort({ appliedAt: -1 });
    }

    async findExistingApplication(projectId, editorId) {
        return await this.model.findOne({ projectId, editorId });
    }
}

module.exports = new ApplicationRepository();
