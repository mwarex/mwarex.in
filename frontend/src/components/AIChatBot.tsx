import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Loader2, Bot, User, Maximize2, Minimize2 } from 'lucide-react';
import { aiAPI } from '@/lib/api';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I am the MWareX AI. How can I assist you with your platform or video editing today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await aiAPI.chat({ messages: newMessages });
      setMessages([...newMessages, { role: 'model', text: res.data.reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages([...newMessages, { role: 'model', text: 'Looks like I encountered a connection issue. Please try again in a moment.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <button
              onClick={toggleChat}
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-14 h-14 rounded-full shadow-2xl flex items-center justify-center relative group"
            >
              <Bot className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className={`fixed bottom-6 right-6 z-50 flex flex-col bg-card border border-border/50 shadow-2xl overflow-hidden backdrop-blur-xl supports-[backdrop-filter]:bg-card/80 ${
              isExpanded ? "w-[90vw] md:w-[600px] h-[80vh]" : "w-[350px] h-[500px] rounded-2xl"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">MWareX Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 text-muted-foreground">
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-secondary rounded-md transition hover:text-foreground">
                  {isExpanded ? <Minimize2 className="w-4 h-4"/> : <Maximize2 className="w-4 h-4"/>}
                </button>
                <button onClick={toggleChat} className="p-1.5 hover:bg-secondary rounded-md transition hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-background/30">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-secondary/80 mt-1">
                      {msg.role === 'user' ? <User className="w-3 h-3 text-muted-foreground"/> : <Bot className="w-3.5 h-3.5 text-primary"/>}
                    </div>
                    <div
                      className={`p-3 text-sm shadow-sm rounded-2xl whitespace-pre-wrap leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-card border border-border/40 rounded-tl-none text-foreground/90'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[80%]">
                    <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-secondary/80 mt-1">
                       <Bot className="w-3.5 h-3.5 text-primary"/>
                    </div>
                    <div className="p-4 text-sm bg-card border border-border/40 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-foreground/50 rounded-full" />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-2 h-2 bg-foreground/50 rounded-full" />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-2 h-2 bg-foreground/50 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} className="h-2" />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-border bg-card/80">
              <form onSubmit={sendMessage} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full bg-secondary/50 border border-border/50 text-sm rounded-xl pl-4 pr-12 py-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground/70"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 transition-opacity hover:opacity-90"
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
              <div className="text-[10px] text-center text-muted-foreground/60 mt-2 font-medium">MWareX Generative AI</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
