const ProjectRepository = require("../repositories/ProjectRepository");
const ApplicationRepository = require("../repositories/ApplicationRepository");
const RoomService = require("./RoomService");
const MessageRepository = require("../repositories/MessageRepository");
const { sendInviteEmail } = require("./emailService");

class MarketplaceService {
    constructor(projectRepo, applicationRepo, roomService, messageRepo) {
        this.projectRepo = projectRepo;
        this.applicationRepo = applicationRepo;
        this.roomService = roomService;
        this.messageRepo = messageRepo;
    }

    async createProject(creatorId, projectData) {
        return await this.projectRepo.create({
            ...projectData,
            creatorId,
            status: "Open"
        });
    }

    async getMarketplaceProjects(filters) {
        return await this.projectRepo.findOpenProjects(filters);
    }

    async getCreatorProjects(creatorId) {
        return await this.projectRepo.findProjectsByCreator(creatorId);
    }

    async applyToProject(editorId, projectId, applicationData) {
        // Check if project exists and is open
        const project = await this.projectRepo.findById(projectId);
        if (!project || project.status !== "Open") {
            throw { status: 400, message: "Project is not open for applications" };
        }

        // Check if already applied
        const existing = await this.applicationRepo.findExistingApplication(projectId, editorId);
        if (existing) {
            throw { status: 400, message: "Already applied to this project" };
        }

        return await this.applicationRepo.create({
            projectId,
            editorId,
            email: applicationData.email,
            pitchMessage: applicationData.pitchMessage,
            expectedPrice: applicationData.expectedPrice,
            status: "Pending"
        });
    }

    async getProjectApplications(creatorId, projectId) {
        // Validate creator owns this project
        const project = await this.projectRepo.findById(projectId);
        if (!project) throw { status: 404, message: "Project not found" };
        
        // Safe string comparison for ObjectId vs string
        const projectCreatorId = project.creatorId?._id 
            ? project.creatorId._id.toString() 
            : project.creatorId.toString();
            
        if (projectCreatorId !== creatorId.toString()) {
            console.log("[Marketplace] Auth mismatch:", projectCreatorId, "vs", creatorId);
            throw { status: 403, message: "Unauthorized access" };
        }

        return await this.applicationRepo.findByProject(projectId);
    }
    
    async getEditorApplications(editorId) {
        return await this.applicationRepo.findByEditor(editorId);
    }

    async acceptApplication(creatorId, applicationId) {
        // Find application
        const application = await this.applicationRepo.findById(applicationId);
        if (!application || application.status !== "Pending") {
            throw { status: 400, message: "Invalid or already processed application" };
        }

        // Validate creator owns the project
        const project = await this.projectRepo.findById(application.projectId);
        if (!project || project.creatorId.toString() !== creatorId) {
            throw { status: 403, message: "Unauthorized access" };
        }
        
        // 1. Mark Application as Accepted
        await this.applicationRepo.updateById(applicationId, { status: "Accepted" });
        
        // 2. Reject other pending applications for this project
        // Note: For a simpler version, we could skip this or do it automatically
        const otherApps = await this.applicationRepo.findByProject(project._id);
        for (let app of otherApps) {
             if (app._id.toString() !== applicationId.toString() && app.status === "Pending") {
                 await this.applicationRepo.updateById(app._id, { status: "Rejected" });
             }
        }

        // 3. Create a Room/Workspace automatically
        // Naming the room after the project
        const roomName = `Workspace_Proj_${project.title.substring(0, 15)}`;
        const room = await this.roomService.createRoom(creatorId, roomName);

        // Add the accepted editor to the room automatically
        // Because createRoom generates an invite token, we can use the join mechanism, 
        // or just directly add them via RoomRepository which is safer for backend automation.
        // I will use joinRoom trick from service, but bypassing token check by directly mutating.
        // Actually, joinRoom requires a token. Let's just use the roomService token.
        await this.roomService.joinRoom(application.editorId.toString(), room.inviteToken);

        // 4. Update Project status
        await this.projectRepo.updateById(project._id, {
            status: "Assigned",
            assignedEditorId: application.editorId,
            roomId: room._id
        });

        // 5. Send Invite Email to Editor
        try {
            // We need creator's name. Fetch creator from userModel. Instead of calling generic DB, 
            // since this is just an email, let's try to get it. If it fails softly, it's fine.
            const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
            const inviteLink = `${FRONTEND_URL}/join/${room.inviteToken}`;
            const creatorName = "A Creator"; // we can fetch creator name if we want, ignoring for simpler flow
            
            await sendInviteEmail(application.email, inviteLink, creatorName);
        } catch (emailErr) {
            console.error("Failed to send invite email to editor:", emailErr.message);
        }

        return { message: "Application accepted and workspace created", projectId: project._id, roomId: room._id };
    }

    async getApplicationMessages(userId, applicationId) {
        const application = await this.applicationRepo.findById(applicationId);
        if (!application) throw { status: 404, message: "Application not found" };

        const project = await this.projectRepo.findById(application.projectId);
        
        // Ensure user is either the creator or the editor
        if (userId !== application.editorId.toString() && userId !== project.creatorId.toString()) {
            throw { status: 403, message: "Unauthorized access to chat" };
        }

        return await this.messageRepo.findByApplication(applicationId);
    }

    async sendMessage(userId, applicationId, content) {
        const application = await this.applicationRepo.findById(applicationId);
        if (!application) throw { status: 404, message: "Application not found" };

        const project = await this.projectRepo.findById(application.projectId);
        
        // Ensure user is either the creator or the editor
        if (userId !== application.editorId.toString() && userId !== project.creatorId.toString()) {
            throw { status: 403, message: "Unauthorized access to chat" };
        }

        // Must be in pending state (or accepted, depending on if you want chat after accepting)
        // If they still want to chat? We'll allow it anytime.

        const messageData = {
           applicationId,
           senderId: userId,
           content
        };

        const message = await this.messageRepo.create(messageData);
        return await message.populate("senderId", "name email");
    }
}

module.exports = new MarketplaceService(ProjectRepository, ApplicationRepository, RoomService, MessageRepository);
