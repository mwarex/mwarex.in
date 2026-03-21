import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2, Check, DollarSign, Calendar, Target, Search, Send, MessageCircle } from "lucide-react";
import { marketplaceAPI } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function EditorMarketplaceView() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Application State
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [pitchMessage, setPitchMessage] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [email, setEmail] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  // My Applications & Chat State
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [chatAppId, setChatAppId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMarketplaceProjects();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMarketplaceProjects = async () => {
    try {
      setLoading(true);
      const [projRes, appRes] = await Promise.all([
        marketplaceAPI.getMarketplaceProjects(),
        marketplaceAPI.getEditorApplications()
      ]);
      setProjects(projRes.data);
      setMyApplications(appRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load marketplace data");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !pitchMessage || !expectedPrice || !email) return;

    try {
      setIsApplying(true);
      await marketplaceAPI.applyToProject(selectedProject._id, {
        pitchMessage,
        expectedPrice: Number(expectedPrice),
        email
      });
      toast.success("Application submitted successfully!");
      setSelectedProject(null);
      setPitchMessage("");
      setExpectedPrice("");
      setEmail("");
      fetchMarketplaceProjects();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setIsApplying(false);
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

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.editingStyle.toLowerCase().includes(search.toLowerCase())
  );

  const getApplicationForProject = (projectId: string) => {
    return myApplications.find(a => a.projectId === projectId || a.projectId?._id === projectId);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Project Marketplace
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Find creators looking for editors like you.</p>
        </div>
        
        <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-primary transition-colors"
            />
        </div>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
            <Search className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No open projects found</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Check back later! Creators are posting new jobs every day.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project, i) => {
            const appliedApp = getApplicationForProject(project._id);
            
            return (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col aspect-square"
              >
                {/* Top Gradient Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-violet-500/60 to-pink-500/60" />
                
                {/* Card Body */}
                <div className="flex flex-col flex-1 p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/80 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
                        {project.creatorId?.name?.[0]?.toUpperCase() || 'C'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground truncate">{project.creatorId?.name || "Creator"}</p>
                        <h3 className="font-semibold text-sm leading-tight truncate">{project.title}</h3>
                      </div>
                    </div>
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
                      <Calendar className="w-3 h-3" /> {format(new Date(project.deadline), 'MMM dd')}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground line-clamp-3 flex-1 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Footer Actions */}
                  <div className="pt-3 mt-auto border-t border-border/50">
                    {appliedApp ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openChat(appliedApp._id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-secondary text-foreground rounded-lg text-xs font-medium hover:bg-secondary/80 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Chat
                        </button>
                        <div className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border",
                          appliedApp.status === "Accepted" 
                            ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/25" 
                            : appliedApp.status === "Rejected"
                            ? "bg-red-500/15 text-red-500 border-red-500/25"
                            : "bg-emerald-500/15 text-emerald-500 border-emerald-500/25"
                        )}>
                          <Check className="w-3.5 h-3.5" />
                          {appliedApp.status === "Pending" ? "Applied ✓" : appliedApp.status}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-border flex justify-between items-center bg-secondary/10">
                <div>
                  <h3 className="font-semibold text-lg">Apply to Project</h3>
                  <p className="text-xs text-muted-foreground">Pitch yourself to the creator</p>
                </div>
                <button onClick={() => setSelectedProject(null)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
              </div>
              
              <div className="p-4 bg-secondary/30 border-b border-border">
                  <h4 className="font-medium text-sm">{selectedProject.title}</h4>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Budget: <strong className="text-foreground">${selectedProject.budget}</strong></span>
                    <span>Style: <strong className="text-foreground">{selectedProject.editingStyle}</strong></span>
                  </div>
              </div>

              <form onSubmit={handleApply} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Expected Price ($)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={expectedPrice}
                      onChange={(e) => setExpectedPrice(e.target.value)}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:bg-background transition-colors"
                      placeholder={`Budget: $${selectedProject.budget}`}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Your Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:bg-background transition-colors"
                      placeholder="For workspace invite"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Your Pitch</label>
                  <textarea
                    required
                    value={pitchMessage}
                    onChange={(e) => setPitchMessage(e.target.value)}
                    className="w-full h-28 resize-none bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:bg-background transition-colors"
                    placeholder="Why are you the best fit? Share relevant past work..."
                  />
                </div>
               
                <button
                  type="submit"
                  disabled={isApplying}
                  className="w-full py-2.5 mt-2 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                >
                  {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Application"}
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
                    <p className="text-[11px] text-muted-foreground">Chat with the project creator</p>
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
                         <p className="text-muted-foreground/60 text-xs mt-1">Say hi to the creator! 👋</p>
                      </div>
                  ) : (
                      <>
                      {messages.map((msg: any) => {
                          const isMe = msg.senderId?._id === 'me' || msg.senderId?._id === myApplications.find(a => a._id === chatAppId)?.editorId;
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
