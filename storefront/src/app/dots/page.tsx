'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Terminal,
  Cpu,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Folder,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  Code2,
  ExternalLink,
  Zap,
  Download,
  Eye,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  Sliders,
  Database,
  ArrowRight
} from 'lucide-react';

type DotState = 'Sleeping' | 'Thinking' | 'Running Code' | 'Awaiting Approval' | 'Completed';

interface TerminalLog {
  stream: 'stdout' | 'stderr' | 'stdin' | 'system';
  text: string;
  timestamp: number;
}

interface PendingApproval {
  action_id: string;
  command: string;
  reason: string;
  details?: Record<string, any>;
  created_at: number;
}

interface FileItem {
  name: string;
  path: string;
  extension: string;
  type: string;
  size_bytes: number;
  modified_at: number;
  is_code?: boolean;
  is_image?: boolean;
}

interface CronJob {
  id: string;
  name: string;
  prompt: string;
  interval_seconds: number;
  enabled: boolean;
  last_run?: number | null;
  next_run?: number | null;
  created_at: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  approval?: PendingApproval;
}

export default function DotsDashboardPage() {
  // State
  const [agentState, setAgentState] = useState<DotState>('Sleeping');
  const [sessionId, setSessionId] = useState<string>('dots_session');
  const [activeTab, setActiveTab] = useState<'terminal' | 'canvas' | 'files' | 'crons' | 'memory'>('terminal');
  
  // Realtime & Connection
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [gatewayStatus, setGatewayStatus] = useState<'connecting' | 'online' | 'offline'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);

  // Terminal & Logs
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      stream: 'system',
      text: '🤖 [SYSTEM INIT] OpenAI Dots / Hermes Agent Gateway Initializing...\nSandboxed execution sandbox ready. Real-time stdout/stderr active.\n',
      timestamp: Date.now() / 1000
    }
  ]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Chat & Approvals
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '⚡ **Hermes Dot Brain Active.** I am your autonomous OpenAI Dots clone for Hermes Agent. I have full sandboxed bash capabilities, 24/7 background cron scheduling, real-time memory persistence, and an approval firewall for destructive operations. What shall we execute?',
      timestamp: Date.now() / 1000
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeApprovals, setActiveApprovals] = useState<PendingApproval[]>([]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Files Explorer
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileSearch, setFileSearch] = useState<string>('');
  const [loadingFile, setLoadingFile] = useState<boolean>(false);

  // Crons
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [newCronName, setNewCronName] = useState<string>('');
  const [newCronPrompt, setNewCronPrompt] = useState<string>('');
  const [newCronInterval, setNewCronInterval] = useState<number>(1800);
  const [showAddCronModal, setShowAddCronModal] = useState<boolean>(false);

  // Canvas & Memory
  const [canvasCode, setCanvasCode] = useState<string>(
    '# Hermes Autonomous Plan\n\n- [x] High-speed Meesho direct supplier routing\n- [x] Zero-load cloud execution via GitHub Actions\n- [x] 100% free 24/7 autonomous loop\n- [ ] Daily viral social media campaign trigger\n- [ ] Indian domestic express fulfillment tracking\n'
  );
  const [memoryState, setMemoryState] = useState<{ memory_md: string; user_md: string }>({
    memory_md: '',
    user_md: ''
  });

  // Auto-scroll terminal
  useEffect(() => {
    if (activeTab === 'terminal') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  // Connect WebSocket & Fetch Initial Data
  useEffect(() => {
    const wsUrl = typeof window !== 'undefined'
      ? (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + (process.env.NEXT_PUBLIC_DOTS_WS_HOST || '127.0.0.1:8000') + `/ws/terminal/${sessionId}`
      : `ws://127.0.0.1:8000/ws/terminal/${sessionId}`;

    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;

    function connectWs() {
      try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          setWsConnected(true);
          setGatewayStatus('online');
          socket?.send(JSON.stringify({ type: 'ping' }));
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'init') {
              if (data.state) setAgentState(data.state);
              if (data.logs) setLogs((prev) => [...prev, ...data.logs]);
              if (data.pending_approvals) setActiveApprovals(data.pending_approvals);
            } else if (data.type === 'terminal_stream') {
              setLogs((prev) => [...prev.slice(-800), { stream: data.stream, text: data.text, timestamp: Date.now() / 1000 }]);
            } else if (data.type === 'state_change') {
              setAgentState(data.state);
            } else if (data.type === 'approval_required') {
              const newApproval: PendingApproval = {
                action_id: data.action_id,
                command: data.command,
                reason: data.reason,
                details: data.details,
                created_at: data.timestamp || Date.now() / 1000
              };
              setActiveApprovals((prev) => [...prev.filter((a) => a.action_id !== data.action_id), newApproval]);
              setAgentState('Awaiting Approval');
              // Append to chat
              setMessages((prev) => [
                ...prev,
                {
                  id: `approval_${data.action_id}`,
                  role: 'system',
                  content: `🛑 **Security Interceptor Triggered**\nAction requires operator authorization before proceeding.`,
                  timestamp: Date.now() / 1000,
                  approval: newApproval
                }
              ]);
            }
          } catch (e) {
            console.error('WS parse error:', e);
          }
        };

        socket.onclose = () => {
          setWsConnected(false);
          setGatewayStatus('connecting');
          reconnectTimeout = setTimeout(connectWs, 3000);
        };

        socket.onerror = () => {
          setWsConnected(false);
          setGatewayStatus('offline');
        };

        wsRef.current = socket;
      } catch (err) {
        setGatewayStatus('offline');
      }
    }

    connectWs();
    fetchFiles();
    fetchCrons();
    fetchMemory();

    const pollInterval = setInterval(() => {
      fetchHealth();
    }, 5000);

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      clearInterval(pollInterval);
      socket?.close();
    };
  }, []);

  // REST API Helpers
  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/dots/api/v1/health');
      if (res.ok) {
        const data = await res.json();
        if (data.agent_state) setAgentState(data.agent_state);
        setGatewayStatus('online');
      }
    } catch {}
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/dots/api/v1/files?limit=100');
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch {}
  };

  const fetchCrons = async () => {
    try {
      const res = await fetch('/api/dots/api/v1/crons');
      if (res.ok) {
        const data = await res.json();
        setCronJobs(data);
      }
    } catch {}
  };

  const fetchMemory = async () => {
    try {
      const res = await fetch('/api/dots/api/v1/memory');
      if (res.ok) {
        const data = await res.json();
        setMemoryState(data);
      }
    } catch {}
  };

  const loadFileContent = async (filePath: string) => {
    setLoadingFile(true);
    setSelectedFile(filePath);
    try {
      const res = await fetch(`/api/dots/api/v1/files/content?path=${encodeURIComponent(filePath)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.content !== undefined) {
          setFileContent(data.content);
        } else if (data.is_binary) {
          setFileContent(`[Binary File: ${data.name} (${Math.round(data.size_bytes / 1024)} KB)]`);
        }
      }
    } catch {
      setFileContent('Error loading file content.');
    } finally {
      setLoadingFile(false);
    }
  };

  // Submit Prompt to Hermes Dot
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isSubmitting) return;

    const userText = inputPrompt.trim();
    setInputPrompt('');
    setIsSubmitting(true);
    setAgentState('Thinking');

    // Add user message to thread
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now() / 1000
    };
    setMessages((prev) => [...prev, userMsg]);

    // Check if direct shell execute via WS
    if (userText.startsWith('$') && wsConnected && wsRef.current) {
      const cmd = userText.substring(1).trim();
      wsRef.current.send(JSON.stringify({ type: 'execute', command: cmd }));
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/dots/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, session_id: sessionId })
      });

      if (!res.ok) {
        throw new Error('Failed to communicate with Hermes Dot Gateway');
      }

      // Read SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMsgText = '';

      const assistantMsgId = `assistant_${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '...',
          timestamp: Date.now() / 1000
        }
      ]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const rawData = line.replace('data: ', '').trim();
              if (rawData === '[DONE]') continue;
              try {
                const parsed = JSON.parse(rawData);
                if (parsed.type === 'status') {
                  setAgentState(parsed.state as DotState);
                } else if (parsed.type === 'message') {
                  assistantMsgText = parsed.content;
                  setMessages((prev) =>
                    prev.map((m) => (m.id === assistantMsgId ? { ...m, content: assistantMsgText } : m))
                  );
                }
              } catch {}
            }
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Notice: ${err.message}. If local gateway daemon is paused, ensure 'dots_gateway' is active or trigger via webhook.`,
          timestamp: Date.now() / 1000
        }
      ]);
    } finally {
      setIsSubmitting(false);
      setAgentState('Sleeping');
      fetchFiles();
    }
  };

  // Resolve Human-In-The-Loop Approval
  const handleResolveApproval = async (actionId: string, approved: boolean, feedback = '') => {
    try {
      // Send over WebSocket if available
      if (wsConnected && wsRef.current) {
        wsRef.current.send(
          JSON.stringify({
            type: 'approve',
            action_id: actionId,
            approved,
            feedback
          })
        );
      } else {
        // Fallback REST call
        await fetch(`/api/dots/api/v1/approvals/${actionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approved, feedback })
        });
      }

      // Remove from pending
      setActiveApprovals((prev) => prev.filter((a) => a.action_id !== actionId));
      setAgentState(approved ? 'Running Code' : 'Completed');
    } catch (err) {
      console.error('Approval resolution error:', err);
    }
  };

  // Create Cron Job
  const handleAddCron = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCronName.trim() || !newCronPrompt.trim()) return;

    try {
      const res = await fetch('/api/dots/api/v1/crons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCronName,
          prompt: newCronPrompt,
          interval_seconds: Number(newCronInterval)
        })
      });

      if (res.ok) {
        setNewCronName('');
        setNewCronPrompt('');
        setShowAddCronModal(false);
        fetchCrons();
      }
    } catch {}
  };

  // Toggle Cron Job
  const handleToggleCron = async (job: CronJob) => {
    try {
      await fetch(`/api/dots/api/v1/crons/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !job.enabled })
      });
      fetchCrons();
    } catch {}
  };

  // Trigger Cron Job Immediately
  const handleRunCronNow = async (jobId: string) => {
    try {
      await fetch(`/api/dots/api/v1/crons/${jobId}/run`, { method: 'POST' });
      setActiveTab('terminal');
    } catch {}
  };

  // Delete Cron Job
  const handleDeleteCron = async (jobId: string) => {
    try {
      await fetch(`/api/dots/api/v1/crons/${jobId}`, { method: 'DELETE' });
      fetchCrons();
    } catch {}
  };

  // Status Badge Colors & Dynamic Orb Styles
  const getStatusConfig = (state: DotState) => {
    switch (state) {
      case 'Thinking':
        return {
          pill: 'bg-purple-950/80 text-purple-300 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
          dot: 'bg-purple-400 animate-ping',
          orb: 'from-purple-500 via-indigo-600 to-pink-500 animate-pulse scale-105',
          label: 'Thinking...'
        };
      case 'Running Code':
        return {
          pill: 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
          dot: 'bg-amber-400 animate-bounce',
          orb: 'from-amber-400 via-orange-500 to-red-500 animate-spin',
          label: 'Running Code'
        };
      case 'Awaiting Approval':
        return {
          pill: 'bg-red-950/90 text-red-300 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse',
          dot: 'bg-red-500 animate-ping',
          orb: 'from-red-600 via-rose-700 to-orange-600 animate-ping',
          label: 'Awaiting Approval'
        };
      case 'Completed':
        return {
          pill: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400',
          orb: 'from-emerald-400 via-teal-500 to-cyan-500',
          label: 'Completed'
        };
      case 'Sleeping':
      default:
        return {
          pill: 'bg-slate-900/90 text-slate-300 border-slate-700/60',
          dot: 'bg-slate-500 animate-pulse',
          orb: 'from-indigo-600 via-purple-700 to-slate-800 opacity-70',
          label: 'Sleeping'
        };
    }
  };

  const statusConfig = getStatusConfig(agentState);
  const filteredFiles = files.filter((f) => f.name.toLowerCase().includes(fileSearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#070709] text-slate-200 font-sans selection:bg-purple-500/30 selection:text-white flex flex-col">
      {/* ────────────────── TOP NAVIGATION / STATUS BAR ────────────────── */}
      <header className="sticky top-0 z-50 h-16 border-b border-[#1A1D27] bg-[#0A0B10]/95 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wider text-white flex items-center gap-1.5">
                <span>DOTS</span>
                <span className="text-xs text-purple-400 font-mono px-1.5 py-0.2 rounded bg-purple-950/60 border border-purple-800/40">
                  HERMES
                </span>
              </div>
              <div className="text-[10px] text-slate-500 tracking-tight">OpenAI Dots Architecture Clone</div>
            </div>
          </Link>
        </div>

        {/* Dynamic Sticky Agent Status Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium tracking-wide transition-all duration-300 ${statusConfig.pill}`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.dot}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.dot.split(' ')[0]}`} />
            </span>
            <span>{statusConfig.label}</span>
          </div>

          {/* Connection status indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 px-3 py-1 rounded-md bg-[#12141D] border border-[#1F2333]">
            <span
              className={`w-2 h-2 rounded-full ${
                gatewayStatus === 'online' ? 'bg-emerald-400' : gatewayStatus === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
              }`}
            />
            <span className="capitalize">{gatewayStatus === 'online' ? 'Live Gateway' : gatewayStatus}</span>
          </div>

          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-[#151722] transition-colors flex items-center gap-1 border border-transparent hover:border-[#262A3D]"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ────────────────── MAIN SPLIT-PANE WORKSPACE ────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ──────── LEFT PANEL: PERSISTENT AGENT CHAT & INTERCEPTOR ──────── */}
        <div className="w-full lg:w-[45%] flex flex-col border-r border-[#1A1D27] bg-[#0A0B10] h-[calc(100vh-4rem)]">
          {/* Persona Header Widget */}
          <div className="p-4 border-b border-[#1A1D27] flex items-center justify-between bg-gradient-to-b from-[#0F111A] to-[#0A0B10]">
            <div className="flex items-center gap-3">
              {/* Dynamic Animated Avatar Widget */}
              <div className="relative w-11 h-11 flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br blur-md transition-all duration-500 ${statusConfig.orb}`}
                />
                <div className="relative w-9 h-9 rounded-full bg-[#10121C] border border-white/20 flex items-center justify-center shadow-inner">
                  <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#fff]" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  Hermes Dot Executive Brain
                  {activeApprovals.length > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-500/20 text-red-400 border border-red-500/40">
                      {activeApprovals.length} Approval Pending
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">Autonomous loop active • 24/7 background worker</p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    id: `new_${Date.now()}`,
                    role: 'assistant',
                    content: '✨ Thread refreshed. Ready for autonomous tasks, shell runs, or market actions.',
                    timestamp: Date.now() / 1000
                  }
                ]);
              }}
              className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-[#161824] rounded-md transition-colors"
              title="Reset Chat Thread"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-sm ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/10'
                      : 'bg-[#12141F] border border-[#1E2233] text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">{msg.content}</div>

                  {/* 🛑 Interactive Approval Card (Human-In-The-Loop Security Interceptor) */}
                  {msg.approval && (
                    <div className="mt-3.5 pt-3 border-t border-red-500/30 bg-red-950/20 -mx-2 px-3 py-2.5 rounded-lg border border-red-500/40">
                      <div className="flex items-center gap-2 text-red-400 font-semibold text-xs mb-1.5">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Destructive Action Intercepted</span>
                      </div>
                      <div className="text-[11px] text-slate-300 mb-2 font-mono bg-[#070709] p-2 rounded border border-red-900/50 break-all">
                        {msg.approval.command}
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3 italic">Reason: {msg.approval.reason}</p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolveApproval(msg.approval!.action_id, true)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve Action
                        </button>
                        <button
                          onClick={() => handleResolveApproval(msg.approval!.action_id, false, 'Rejected by operator')}
                          className="flex-1 bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 font-medium text-xs py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Reject & Stop
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isSubmitting && (
              <div className="flex gap-3 items-center text-xs text-purple-400 italic">
                <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                <span>Hermes Dot is reasoning and executing sandbox actions...</span>
              </div>
            )}
          </div>

          {/* Quick Command Suggestions */}
          <div className="px-4 py-2 border-t border-[#161824] flex gap-2 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => setInputPrompt('$ python hermes_seo_engine.py')}
              className="px-2.5 py-1 rounded bg-[#131520] hover:bg-[#1A1D2D] text-slate-400 hover:text-slate-200 whitespace-nowrap border border-[#202436] transition-colors"
            >
              $ Run SEO Engine
            </button>
            <button
              onClick={() => setInputPrompt('Check catalog health and verify 103 Meesho products')}
              className="px-2.5 py-1 rounded bg-[#131520] hover:bg-[#1A1D2D] text-slate-400 hover:text-slate-200 whitespace-nowrap border border-[#202436] transition-colors"
            >
              Verify Catalog
            </button>
            <button
              onClick={() => setInputPrompt('$ python -c "print(\'Hello Hermes Sandbox\')"')}
              className="px-2.5 py-1 rounded bg-[#131520] hover:bg-[#1A1D2D] text-slate-400 hover:text-slate-200 whitespace-nowrap border border-[#202436] transition-colors"
            >
              $ Test Shell Sandbox
            </button>
            <button
              onClick={() => setInputPrompt('What is our latest memory state regarding Indian dropshipping?')}
              className="px-2.5 py-1 rounded bg-[#131520] hover:bg-[#1A1D2D] text-slate-400 hover:text-slate-200 whitespace-nowrap border border-[#202436] transition-colors"
            >
              Query Memory
            </button>
          </div>

          {/* Bottom Chat Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#1A1D27] bg-[#0A0B10]">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Give Hermes Dot a task or prefix with $ for direct shell execution..."
                className="w-full bg-[#12141F] text-slate-200 placeholder-slate-500 text-xs sm:text-sm pl-4 pr-12 py-3 rounded-xl border border-[#1E2233] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isSubmitting}
                className="absolute right-2 p-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-lg transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-1.5 text-[10px] text-slate-500 text-center">
              Type <code className="text-purple-400">$ command</code> to run in sandbox • Destructive calls trigger approval
            </div>
          </form>
        </div>

        {/* ──────── RIGHT PANEL: CANVAS / TERMINAL / FILES / CRONS ──────── */}
        <div className="w-full lg:w-[55%] flex flex-col bg-[#070709] h-[calc(100vh-4rem)]">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between px-4 border-b border-[#1A1D27] bg-[#0A0B10]">
            <div className="flex gap-1 py-2">
              <button
                onClick={() => setActiveTab('terminal')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'terminal'
                    ? 'bg-[#161824] text-white border border-[#25283B]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#10121C]'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                <span>Sandbox Terminal</span>
                {logs.length > 0 && (
                  <span className="text-[10px] px-1.5 rounded bg-purple-950 text-purple-300 font-mono">
                    {logs.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('canvas')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'canvas'
                    ? 'bg-[#161824] text-white border border-[#25283B]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#10121C]'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Canvas</span>
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'files'
                    ? 'bg-[#161824] text-white border border-[#25283B]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#10121C]'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>Files</span>
                <span className="text-[10px] px-1.5 rounded bg-[#181A28] text-slate-400 font-mono">
                  {files.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('crons')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'crons'
                    ? 'bg-[#161824] text-white border border-[#25283B]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#10121C]'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>24/7 Crons</span>
                <span className="text-[10px] px-1.5 rounded bg-emerald-950 text-emerald-300 font-mono">
                  {cronJobs.filter((c) => c.enabled).length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('memory')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'memory'
                    ? 'bg-[#161824] text-white border border-[#25283B]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#10121C]'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-pink-400" />
                <span>Memory</span>
              </button>
            </div>

            {/* Quick action button */}
            {activeTab === 'terminal' && (
              <button
                onClick={() => setLogs([])}
                className="text-[11px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded hover:bg-[#141624] transition-colors"
              >
                Clear Output
              </button>
            )}
            {activeTab === 'crons' && (
              <button
                onClick={() => setShowAddCronModal(true)}
                className="flex items-center gap-1 text-xs bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Schedule</span>
              </button>
            )}
          </div>

          {/* TAB 1: REAL-TIME SANDBOXED TERMINAL */}
          {activeTab === 'terminal' && (
            <div className="flex-1 flex flex-col bg-[#050608] overflow-hidden">
              <div className="px-4 py-2 border-b border-[#141620] bg-[#08090E] flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 text-slate-500">hermes-sandbox: /workspace</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>WS Stream: {wsConnected ? 'Connected' : 'Polling'}</span>
                  <span>Exit: 0</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-1 select-text">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`whitespace-pre-wrap ${
                      log.stream === 'stdout'
                        ? 'text-slate-300'
                        : log.stream === 'stderr'
                        ? 'text-red-400'
                        : log.stream === 'stdin'
                        ? 'text-cyan-400 font-bold'
                        : 'text-purple-400'
                    }`}
                  >
                    {log.text}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            </div>
          )}

          {/* TAB 2: LIVE CANVAS / ARTIFACTS */}
          {activeTab === 'canvas' && (
            <div className="flex-1 flex flex-col bg-[#08090E]">
              <div className="px-4 py-2.5 border-b border-[#161824] flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span>Autonomous Workspace Canvas (Live Collaborative Editor)</span>
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(canvasCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-[#12141F] border border-[#1E2233]"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <textarea
                value={canvasCode}
                onChange={(e) => setCanvasCode(e.target.value)}
                className="flex-1 p-4 bg-[#050608] text-slate-200 font-mono text-xs sm:text-sm resize-none focus:outline-none leading-relaxed border-none"
                placeholder="Live canvas updates generated by Hermes Agent will render here..."
              />
            </div>
          )}

          {/* TAB 3: DYNAMIC FILE EXPLORER */}
          {activeTab === 'files' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar file tree */}
              <div className="w-64 border-r border-[#161824] bg-[#0A0B10] flex flex-col">
                <div className="p-3 border-b border-[#161824]">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={fileSearch}
                      onChange={(e) => setFileSearch(e.target.value)}
                      className="w-full bg-[#12141F] text-xs text-slate-200 pl-8 pr-2 py-1.5 rounded-lg border border-[#1E2233] focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                  {filteredFiles.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => loadFileContent(file.path)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-left transition-colors ${
                        selectedFile === file.path
                          ? 'bg-purple-950/60 text-purple-200 border border-purple-800/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#12141F]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-mono shrink-0 ml-1">
                        {Math.round(file.size_bytes / 1024)}k
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File content viewer */}
              <div className="flex-1 flex flex-col bg-[#050608]">
                {selectedFile ? (
                  <>
                    <div className="px-4 py-2 border-b border-[#161824] bg-[#0A0B10] flex items-center justify-between text-xs">
                      <span className="font-mono text-purple-300">{selectedFile}</span>
                      <button
                        onClick={() => {
                          const blob = new Blob([fileContent], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = selectedFile.split('/').pop() || 'download';
                          a.click();
                        }}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-[#12141F] border border-[#1E2233]"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                    <pre className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-text">
                      {loadingFile ? 'Loading file...' : fileContent}
                    </pre>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
                    <Folder className="w-10 h-10 text-slate-700 mb-2" />
                    <span>Select a file from the explorer to view its contents</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: 24/7 CRON JOB SCHEDULER */}
          {activeTab === 'crons' && (
            <div className="flex-1 p-6 overflow-y-auto bg-[#08090E]">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Autonomous 24/7 Crons & Interval Tasks</h3>
                    <p className="text-xs text-slate-400">
                      These jobs execute continuously in the background, waking Hermes Dot out of IDLE to run scheduled workflows.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddCronModal(true)}
                    className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Schedule Task</span>
                  </button>
                </div>

                <div className="grid gap-3">
                  {cronJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-xl bg-[#0F111A] border border-[#1B1E2D] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{job.name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              job.enabled
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {job.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono bg-[#070709] px-2.5 py-1 rounded border border-[#171926]">
                          {job.prompt}
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                          <span>Interval: Every {Math.round(job.interval_seconds / 60)} minutes</span>
                          {job.last_run && <span>Last run: {new Date(job.last_run * 1000).toLocaleTimeString()}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRunCronNow(job.id)}
                          className="p-2 text-slate-400 hover:text-white bg-[#141624] hover:bg-[#1C1F32] rounded-lg transition-colors border border-[#202436]"
                          title="Run task immediately"
                        >
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => handleToggleCron(job)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                            job.enabled
                              ? 'bg-amber-950/40 text-amber-300 border-amber-800/40 hover:bg-amber-950/60'
                              : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40 hover:bg-emerald-950/60'
                          }`}
                        >
                          {job.enabled ? 'Pause' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDeleteCron(job.id)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                          title="Delete schedule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MEMORY (MEMORY.md / USER.md) */}
          {activeTab === 'memory' && (
            <div className="flex-1 p-6 overflow-y-auto bg-[#08090E]">
              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white">Agent Long-Term State & Memory Files</h3>
                  <p className="text-xs text-slate-400">
                    Read directly from ~/.hermes/MEMORY.md and USER.md (or local RADHA_MEMORY). These dictate persistent goals,
                    operational guidelines, and learned facts.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-mono text-purple-300 flex items-center gap-2">
                    <Database className="w-3.5 h-3.5" />
                    <span>MEMORY.md</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#050608] border border-[#161824] text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto select-text">
                    {memoryState.memory_md || 'No MEMORY.md currently initialized. Will populate as agent operates.'}
                  </pre>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-mono text-indigo-300 flex items-center gap-2">
                    <Database className="w-3.5 h-3.5" />
                    <span>USER.md</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#050608] border border-[#161824] text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto select-text">
                    {memoryState.user_md || 'No USER.md profile initialized.'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ────────────────── CREATE CRON MODAL ────────────────── */}
      {showAddCronModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F111A] border border-[#1E2233] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">Add 24/7 Scheduled Task</h3>
            <form onSubmit={handleAddCron} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Schedule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scrape Winning Products"
                  value={newCronName}
                  onChange={(e) => setNewCronName(e.target.value)}
                  className="w-full bg-[#151724] border border-[#23273B] text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Task Prompt or Command</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. run: python hermes_seo_engine.py or Review order logs"
                  value={newCronPrompt}
                  onChange={(e) => setNewCronPrompt(e.target.value)}
                  className="w-full bg-[#151724] border border-[#23273B] text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Frequency Interval</label>
                <select
                  value={newCronInterval}
                  onChange={(e) => setNewCronInterval(Number(e.target.value))}
                  className="w-full bg-[#151724] border border-[#23273B] text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                >
                  <option value={60}>Every 1 Minute (High Frequency)</option>
                  <option value={300}>Every 5 Minutes</option>
                  <option value={900}>Every 15 Minutes</option>
                  <option value={1800}>Every 30 Minutes</option>
                  <option value={3600}>Every 1 Hour</option>
                  <option value={21600}>Every 6 Hours</option>
                  <option value={86400}>Every 24 Hours (Daily)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCronModal(false)}
                  className="flex-1 bg-[#1A1D2D] hover:bg-[#23273B] text-slate-300 text-xs py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs py-2 rounded-lg transition-colors"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
