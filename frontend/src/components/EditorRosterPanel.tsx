"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  X,
  Mail,
  Copy,
  Check,
  Loader2,
  Trash2,
  ChevronRight,
  Bot,
  UserMinus,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Editor {
  _id: string;
  name: string;
  email: string;
}

interface EditorRosterPanelProps {
  editors: Editor[];
  currentRoom: { _id: string; name: string; inviteToken?: string } | null;
  onRemoveEditor: (id: string) => void;
  onInviteSent: (email: string, link: string) => void;
  sendInvite: (email: string, link: string) => Promise<void>;
  workspaceName?: string;
  videosByEditorId?: Record<string, number>; // how many active videos per editor
}

export default function EditorRosterPanel({
  editors,
  currentRoom,
  onRemoveEditor,
  onInviteSent,
  sendInvite,
  workspaceName,
  videosByEditorId = {},
}: EditorRosterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoom) return;

    let link = `${window.location.origin}/join?token=${currentRoom.inviteToken}`;
    if (inviteEmail.trim()) {
      link += `&email=${encodeURIComponent(inviteEmail.trim())}`;
    }
    setInviteLink(link);
    setIsInviting(true);

    try {
      await sendInvite(inviteEmail.trim(), link);
      toast.success(`Invite sent to ${inviteEmail}!`);
      onInviteSent(inviteEmail.trim(), link);
      setInviteEmail("");
    } catch (err) {
      toast.error("Failed to send invite. Link is still ready to copy.");
    } finally {
      setIsInviting(false);
    }
  };

  const copyLink = () => {
    if (!inviteLink && currentRoom) {
      const link = `${window.location.origin}/join?token=${currentRoom.inviteToken}`;
      navigator.clipboard.writeText(link);
      toast.success("Invite link copied!");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      return;
    }
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied!");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      {/* Sidebar Team Section Toggle */}
      <div className="px-3 pb-1">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between p-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all text-sm group"
        >
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4" />
            <span>Team</span>
            {editors.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary/15 text-primary">
                {editors.length}
              </span>
            )}
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Slide-over Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[70] w-80 bg-[#0f0f0f] border-l border-white/8 flex flex-col"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="font-semibold text-white text-sm">Team</h2>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    {workspaceName || "Current workspace"}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Editor List */}
                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3">
                    Active Editors ({editors.length})
                  </p>

                  {editors.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-white/8 rounded-xl">
                      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white/25" />
                      </div>
                      <p className="text-white/30 text-xs">No editors yet</p>
                      <p className="text-white/20 text-[11px] mt-1">
                        Invite an editor to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {editors.map((editor) => {
                        const activeCount = videosByEditorId[editor._id] || 0;
                        return (
                          <div
                            key={editor._id}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/8 group"
                          >
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-bold shrink-0">
                              {editor.name?.[0]?.toUpperCase() || "E"}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {editor.name}
                              </p>
                              <p className="text-[11px] text-white/35 truncate">
                                {editor.email}
                              </p>
                              {activeCount > 0 && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Bot className="w-3 h-3 text-blue-400" />
                                  <span className="text-[10px] text-blue-400 font-medium">
                                    {activeCount} video{activeCount > 1 ? "s" : ""} in progress
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Status dot */}
                            <div className="flex flex-col items-end gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                              <button
                                onClick={() => onRemoveEditor(editor._id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10"
                                title="Remove editor"
                              >
                                <UserMinus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Invite Section */}
                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <UserPlus className="w-3 h-3" />
                    Invite Editor
                  </p>

                  <form onSubmit={handleInvite} className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="editor@email.com"
                        className="flex-1 bg-white/4 border border-white/10 focus:border-[#C8A97E]/40 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!inviteEmail.trim() || isInviting}
                        className="px-4 py-2 bg-[#C8A97E]/15 hover:bg-[#C8A97E]/25 text-[#C8A97E] border border-[#C8A97E]/25 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all flex items-center gap-1.5 whitespace-nowrap"
                      >
                        {isInviting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Mail className="w-3.5 h-3.5" />
                        )}
                        Send
                      </button>
                    </div>

                    {/* Copy link fallback */}
                    <button
                      type="button"
                      onClick={copyLink}
                      className="w-full flex items-center justify-center gap-2 py-2 border border-white/8 rounded-xl text-xs text-white/40 hover:text-white/70 hover:border-white/15 transition-all"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Link copied!</span>
                        </>
                      ) : (
                        <>
                          <Link2 className="w-3.5 h-3.5" />
                          Copy invite link instead
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
