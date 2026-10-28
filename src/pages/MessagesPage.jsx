import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Send, 
  MessageSquare, 
  Users, 
  Search, 
  Sparkles, 
  CheckCheck, 
  ArrowLeft,
  FolderGit2
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';

export default function MessagesPage() {
  const { 
    conversations, 
    activePartnerId, 
    setActivePartnerId, 
    activeMessages, 
    sendMessage 
  } = useChat();

  const { currentUser, users } = useAuth();
  const { projects } = useProjects();
  const location = useLocation();

  const [inputMessage, setInputMessage] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef(null);

  // Parse partnerId from query param if available (e.g. /messages?partnerId=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const partnerParam = params.get('partnerId');
    if (partnerParam) {
      setActivePartnerId(partnerParam);
      setMobileShowChat(true);
    } else if (!activePartnerId && conversations.length > 0) {
      setActivePartnerId(conversations[0].partnerId);
    } else if (!activePartnerId && users.length > 0) {
      // Default to first user who is not current user
      const candidate = users.find(u => u.id !== currentUser?.id);
      if (candidate) {
        setActivePartnerId(candidate.id);
      }
    }
  }, [location.search, conversations, users, currentUser, activePartnerId, setActivePartnerId]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl glass-panel">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold font-heading mb-2">Teammate Messages</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Sign in to direct-message collaborators, coordinate sprints, and chat with project teammates in real time.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild variant="gradient" className="w-full">
              <Link to="/login">Sign in to your account</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Active partner student object
  const activePartner = users.find(u => u.id === activePartnerId) || {
    id: activePartnerId,
    name: 'Teammate',
    niche: 'Collaborator',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    university: 'CollabForge Peer'
  };

  // Find shared projects or projects involving partner
  const partnerProjects = projects.filter(p => 
    (p.ownerId === activePartnerId || (p.members || []).includes(activePartnerId))
  );

  // Filter conversations list or all users by search
  const filteredUsers = users.filter(u => {
    if (u.id === currentUser.id) return false;
    const query = searchFilter.toLowerCase();
    return u.name.toLowerCase().includes(query) || 
           (u.niche && u.niche.toLowerCase().includes(query)) ||
           (u.university && u.university.toLowerCase().includes(query));
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activePartnerId) return;

    sendMessage({
      receiverId: activePartnerId,
      text: inputMessage
    });

    setInputMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 min-h-[calc(100vh-80px)]">
      {/* Top Header Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" /> Real-Time Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Teammate Direct Messaging
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/projects" className="btn btn-secondary text-xs py-1.5 px-3 gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5" /> Project Dashboards
          </Link>
          <Link to="/teammates" className="btn btn-secondary text-xs py-1.5 px-3 gap-1.5">
            <Users className="w-3.5 h-3.5" /> Teammate Directory
          </Link>
        </div>
      </div>

      {/* Main Chat Layout Container */}
      <div className="glass-panel border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl h-[700px] flex flex-col md:flex-row">
        
        {/* LEFT COLUMN: Teammates / Contacts List */}
        <aside className={`w-full md:w-80 lg:w-96 border-r border-zinc-200/80 dark:border-zinc-800/80 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/50 ${
          mobileShowChat ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search Contacts */}
          <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search teammates or skills..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 text-xs h-9 bg-white dark:bg-zinc-950/60"
              />
            </div>
          </div>

          {/* Conversations and Collaborator List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
            <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Active Teammates ({filteredUsers.length})
            </div>

            {filteredUsers.map(student => {
              const isActive = student.id === activePartnerId;
              const conv = conversations.find(c => c.partnerId === student.id);

              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => {
                    setActivePartnerId(student.id);
                    setMobileShowChat(true);
                  }}
                  className={`w-full text-left p-3.5 transition-all flex items-start gap-3 cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-500/10 border-l-4 border-indigo-600 dark:border-indigo-400' 
                      : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`}
                      alt={student.name}
                      className="w-11 h-11 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-semibold text-sm truncate text-zinc-900 dark:text-zinc-100">
                        {student.name}
                      </span>
                      {conv?.lastMessage?.timestamp && (
                        <span className="text-[10px] text-zinc-400 shrink-0">
                          {conv.lastMessage.timestamp}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 truncate mb-1">
                      {student.niche || student.university}
                    </div>

                    {conv?.lastMessage?.text ? (
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {conv.lastMessage.senderId === currentUser.id ? 'You: ' : ''}{conv.lastMessage.text}
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-400 italic">
                        Click to start chatting
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500">
                No teammates matched your search.
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: Active Chat Messages & Composer */}
        <section className={`flex-1 flex flex-col bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md ${
          !mobileShowChat ? 'hidden md:flex' : 'flex'
        }`}>
          {activePartnerId ? (
            <>
              {/* Chat Top Banner */}
              <div className="px-5 py-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  {/* Back button on mobile */}
                  <button 
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    aria-label="Back to contacts"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="relative">
                    <img
                      src={activePartner.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${activePartner.name}`}
                      alt={activePartner.name}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {activePartner.name}
                      </h3>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {activePartner.university || 'Student'}
                      </Badge>
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {activePartner.niche || 'Active collaborator'}
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="flex items-center gap-2">
                  {partnerProjects.length > 0 && (
                    <Button asChild size="sm" variant="outline" className="text-xs h-8">
                      <Link to={`/project/${partnerProjects[0].id}`}>
                        <FolderGit2 className="w-3.5 h-3.5 mr-1" /> View Project
                      </Link>
                    </Button>
                  )}
                  <Link to="/teammates" className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
                    Profile &rarr;
                  </Link>
                </div>
              </div>

              {/* Chat Message Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Conversation welcome header */}
                <div className="text-center py-4 mb-2 border-b border-dashed border-zinc-200/80 dark:border-zinc-800/80">
                  <div className="inline-flex p-2.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-2">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Direct channel with {activePartner.name}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                    Coordinate deliverables, share code snippets, brainstorm architectures, and manage sprint milestones.
                  </p>
                </div>

                {/* Messages stream */}
                {activeMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 items-end ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <img
                          src={msg.senderAvatar || activePartner.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.senderName}`}
                          alt={msg.senderName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-700 mb-1"
                        />
                      )}

                      <div className={`max-w-[78%] sm:max-w-[68%] rounded-2xl p-3.5 text-sm ${
                        isMe 
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md rounded-br-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200/60 dark:border-zinc-700/60 rounded-bl-xs'
                      }`}>
                        <div className="leading-relaxed whitespace-pre-wrap break-words">
                          {msg.text}
                        </div>
                        <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                          isMe ? 'text-indigo-100' : 'text-zinc-400'
                        }`}>
                          <span>{msg.timestamp}</span>
                          {isMe && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/60">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={`Message ${activePartner.name}...`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-white dark:bg-zinc-950/70 border-zinc-200 dark:border-zinc-800 rounded-xl h-11 text-sm focus-visible:ring-indigo-500"
                    autoFocus
                  />
                  <Button type="submit" variant="gradient" className="h-11 px-4 gap-1.5" disabled={!inputMessage.trim()}>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 px-1">
                  <span>Press <b>Enter</b> to send message instantly</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Real-time peer link connected
                  </span>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
              <MessageSquare className="w-12 h-12 mb-3 text-zinc-300 dark:text-zinc-700" />
              <h3 className="font-bold text-base text-zinc-700 dark:text-zinc-300">No conversation selected</h3>
              <p className="text-xs max-w-sm mt-1">Pick a teammate from the left sidebar to start messaging in real time.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
