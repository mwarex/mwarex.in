import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2, Users, Check, DollarSign, Calendar, Target, Briefcase, MessageCircle, Send } from "lucide-react";
import { marketplaceAPI } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function CreatorProjectsView() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  
  // New Project Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [editingStyle, setEditingStyle] = useState("");
  const [deadline, setDeadline] = useState("");

  // Applications View
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Chat View
  const [chatAppId, setChatAppId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await marketplaceAPI.getCreatorProjects();
      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects", error);
      toast.error("Failed to load your projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (projectId: string) => {
    try {
      setLoadingApps(true);
      const res = await marketplaceAPI.getProjectApplications(projectId);
      setApplications(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch applications");
    } finally {
      setLoadingApps(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !budget || !editingStyle || !deadline) {
       toast.error("Please fill all fields");
       return;
    }

    try {
      setIsPosting(true);
      await marketplaceAPI.createProject({
        title,
        description,
        budget: Number(budget),
        editingStyle,
        deadline
      });
      toast.success("Project posted successfully!");
      setIsPostModalOpen(false);
      setTitle("");
      setDescription("");
      setBudget("");
      setEditingStyle("");
      setDeadline("");
      fetchProjects();
    } catch (error) {
      console.error("Error posting project", error);
      toast.error("Failed to post project");
    } finally {
      setIsPosting(false);
    }
  };

  const handleAcceptApplication = async (appId: string) => {
    try {
      await marketplaceAPI.acceptApplication(appId);
      toast.success("Editor hired! Workspace created & invite sent to editor's email.");
      if (activeProjectId) fetchApplications(activeProjectId);
      fetchProjects();
    } catch (error) {
      console.error("Error accepting application", error);
      toast.error("Failed to hire editor");
    }
  };

  const openChat = async (appId: string) => {
     setChatAppId(appId);
     try {
       setLoadingMessages(true);
       const res = await marketplaceAPI.getApplicationMessages(appId);
       setMessages(res.data);
     } catch (error) {
       console.error("Failed to load messages", error);
     } finally {
       setLoadingMessages(false);
     }
  };

  const sendMessage = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!newMessage.trim() || !chatAppId) return;
     
     const tempMsg = { _id: Date.now().toString(), senderId: { _id: 'me', name: 'You' }, content: newMessage, timestamp: new Date() };
     setMessages([...messages, tempMsg]);
     setNewMessage("");

     try {
        const res = await marketplaceAPI.sendMessage(chatAppId, tempMsg.content);
        setMessages(prev => prev.map(m => m._id === tempMsg._id ? res.data : m));
     } catch (error) {
        console.error("Failed to send message", error);
        toast.error("Failed to send message");
     }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Marketplace Projects
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Post a job to find the perfect editor.</p>
        </div>
        <button
          onClick={() => setIsPostModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Post New Project
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
            <Briefcase className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No projects posted yet</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Create a project describing what you need to start getting pitches from editors.
          </p>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Post First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col"
            >
              {/* Top Gradient Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-violet-500/60 to-pink-500/60" />
              
              {/* Card Body */}
              <div className="flex flex-col flex-1 p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-base leading-tight">{project.title}</h3>
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0",
                    project.status === "Open" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    project.status === "Assigned" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                    "bg-secondary text-muted-foreground border-border"
                  )}>
                    {project.status}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> ${project.budget}
                  </span>
                  <span className="bg-primary/10 text-primary border border-primary/15 px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1">
                    <Target className="w-3 h-3" /> {project.editingStyle}
                  </span>
                  <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {format(new Date(project.deadline), 'MMM dd, yyyy')}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                  {project.description}
                </p>
                
                {/* View Applications Button */}
                <div className="mt-auto pt-3 border-t border-border/50">
                  <button 
                    onClick={() => {
                      setActiveProjectId(activeProjectId === project._id ? null : project._id);
                      if (activeProjectId !== project._id) fetchApplications(project._id);
                    }}
                    className="w-full py-2 bg-secondary text-foreground rounded-lg text-xs font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5" />
                    {activeProjectId === project._id ? "Hide Applications" : "View Applications"}
                  </button>
                </div>

                {/* Applications Panel */}
                <AnimatePresence>
                  {activeProjectId === project._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-3"
                    >
                      <div className="bg-secondary/20 rounded-lg p-3 space-y-2.5 border border-border/50">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Editor Applications</h4>
                        {loadingApps ? (
                          <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>
                        ) : applications.length === 0 ? (
                           <p className="text-xs text-muted-foreground text-center py-4 italic">No applications yet. Share your project to get applicants!</p>
                        ) : (
                          applications.map((app) => (
                             <div key={app._id} className="bg-card border border-border/50 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[11px] text-white font-bold">
                                    {app.editorId?.name?.[0] || "E"}
                                  </div>
                                  <div>
                                    <span className="font-medium text-sm block leading-tight">{app.editorId?.name || "Editor"}</span>
                                    <span className="text-[10px] text-muted-foreground">{app.email}</span>
                                  </div>
                                 </div>
                                 <span className="text-xs font-bold text-emerald-500">${app.expectedPrice}</span>
                                </div>
                                
                                <p className="text-[11px] text-muted-foreground italic bg-secondary/30 p-2 rounded-md leading-relaxed">"{app.pitchMessage}"</p>

                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    onClick={() => openChat(app._id)}
                                    className="px-3 py-1.5 bg-secondary text-foreground text-[11px] rounded-md font-medium hover:bg-secondary/80 transition-colors flex items-center gap-1"
                                  >
                                    <MessageCircle className="w-3 h-3" /> Chat
                                  </button>
                                  
                                  {app.status === "Pending" && project.status === "Open" && (
                                    <button
                                      onClick={() => handleAcceptApplication(app._id)}
                                      className="px-3 py-1.5 bg-primary text-primary-foreground text-[11px] rounded-md font-semibold hover:opacity-90 flex items-center gap-1 transition-opacity"
                                    >
                                      <Check className="w-3 h-3" /> Hire
                                    </button>
                                  )}
                                  {app.status === "Accepted" && (
                                    <span className="px-3 py-1.5 bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 text-[11px] rounded-md font-semibold flex items-center gap-1">
                                      <Check className="w-3 h-3" /> Hired 🎉
                                    </span>
                                  )}
                                </div>
                             </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Post Project Modal */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPostModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-violet-500/60 to-pink-500/60" />
              <div className="p-5 border-b border-border flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">Post a New Project</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Describe your project to attract the right editor</p>
                </div>
                <button onClick={() => setIsPostModalOpen(false)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
              </div>
              <form onSubmit={handleCreateProject} className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Project Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-background transition-colors"
                    placeholder="e.g. 10 Min Roblox Gameplay Edit"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-24 resize-none bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-background transition-colors"
                    placeholder="Describe what you need, raw footage length, references..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Budget ($)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-background transition-colors"
                      placeholder="e.g. 150"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Deadline</label>
                    <input
                      type="date"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-background transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Editing Style / Niche</label>
                  <input
                    type="text"
                    required
                    value={editingStyle}
                    onChange={(e) => setEditingStyle(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-background transition-colors"
                    placeholder="e.g. MrBeast Style, Documentaries, Cashcow Vlogs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="w-full py-2.5 mt-2 bg-gradient-to-r from-primary to-violet-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20 transition-opacity"
                >
                  {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Project to Marketplace"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {chatAppId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatAppId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[550px]"
            >
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-gradient-to-r from-secondary/20 to-primary/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Application Chat</h3>
                    <p className="text-[11px] text-muted-foreground">Negotiate details with the editor</p>
                  </div>
                </div>
                <button onClick={() => setChatAppId(null)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {loadingMessages ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                  ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                         <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                           <MessageCircle className="w-7 h-7 text-muted-foreground" />
                         </div>
                         <p className="text-muted-foreground text-sm">No messages yet</p>
                         <p className="text-muted-foreground/60 text-xs mt-1">Start a conversation! 👋</p>
                      </div>
                  ) : (
                      <>
                      {messages.map((msg: any) => {
                          const isMe = msg.senderId?._id === 'me' || msg.senderId?._id !== applications.find(a => a._id === chatAppId)?.editorId?._id;
                          return (
                              <motion.div 
                                key={msg._id} 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn("flex flex-col max-w-[75%]", isMe ? "ml-auto items-end" : "items-start")}
                              >
                                <div className={cn(
                                    "px-3.5 py-2 text-sm leading-relaxed",
                                    isMe 
                                      ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-sm" 
                                      : "bg-secondary text-foreground border border-border rounded-2xl rounded-bl-md"
                                )}>
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-muted-foreground/70 mt-1 px-1">
                                    {format(new Date(msg.timestamp), 'p')}
                                </span>
                              </motion.div>
                          );
                      })}
                      <div ref={chatEndRef} />
                      </>
                  )}
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="px-4 py-3 border-t border-border bg-secondary/5 shrink-0 flex gap-2 items-center">
                 <input 
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-background border border-border rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                 />
                 <button 
                   type="submit" 
                   disabled={!newMessage.trim()}
                   className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                 >
                    <Send className="w-4 h-4" />
                 </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
