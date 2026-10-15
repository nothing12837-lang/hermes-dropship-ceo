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
  ArrowRight,
  Boxes,
  GraduationCap,
  Server,
  Cloud,
  Box,
  Laptop,
  Film,
  Video,
  Volume2,
  PlayCircle,
  Globe,
  Lock,
  Camera,
  MousePointer,
  Maximize2
} from 'lucide-react';

type DotState = 'Sleeping' | 'Thinking' | 'Running Code' | 'Awaiting Approval' | 'Completed';
type ExecutionBackend = 'local' | 'docker' | 'modal';

interface TerminalLog {
  stream: 'stdout' | 'stderr' | 'stdin' | 'system';
  text: string;
  timestamp: number;
  backend?: string;
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

interface MCPServer {
  name: string;
  description: string;
  transport: string;
  connected: boolean;
  category: string;
  tools_count: number;
  tools?: Array<{ name: string; description?: string }>;
}

interface SkillItem {
  name: string;
  category: string;
  description: string;
  path: string;
  size_bytes?: number;
  modified_at: number;
  is_custom: boolean;
  full_content?: string;
}

interface GoogleVidsScene {
  scene_number: number;
  title: string;
  layout: string;
  voiceover_text: string;
  duration_seconds: number;
  image_url?: string;
  badge_text?: string;
  slide_image_path?: string;
  audio_path?: string;
}

interface GoogleVidsProject {
  project_id: string;
  title: string;
  product_id?: string;
  product_title?: string;
  aspect_ratio: string;
  voice_id: string;
  scenes: GoogleVidsScene[];
  total_duration_seconds: number;
  created_at: number;
  manifest_file?: string;
  full_audio_path?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  approval?: PendingApproval;
}

const EXECUTIVE_TEAM = [
  { id: 'radha', name: 'Radha', role: 'CEO', icon: '👑', color: 'from-amber-500 to-rose-500', prompt: 'Review executive operations, daily GMV, and board execution metrics.' },
  { id: 'vikram', name: 'Vikram', role: 'CCO', icon: '💼', color: 'from-blue-500 to-cyan-500', prompt: 'Audit catalog pricing, markup elasticity, and 55%-65% margin preservation.' },
  { id: 'aarav', name: 'Aarav', role: 'SEO', icon: '🔍', color: 'from-emerald-500 to-teal-500', prompt: 'Check Google Search indexing status and sitemap for 103 domestic products.' },
  { id: 'pooja', name: 'Pooja', role: 'Ops & COD', icon: '🚚', color: 'from-indigo-500 to-purple-500', prompt: 'Verify live Cash on Delivery (COD) dispatches and BlueDart/Delhivery tracking.' },
  { id: 'meera', name: 'Meera', role: 'Google Vids', icon: '🎬', color: 'from-pink-500 to-rose-500', prompt: 'Synthesize a high-converting Google Vids AI reel for top trending winner.' },
  { id: 'kabir', name: 'Kabir', role: 'CFO', icon: '💰', color: 'from-green-500 to-emerald-500', prompt: 'Run real-time unit economics breakdown and confirm ₹0 negative margin policy.' },
  { id: 'arjun', name: 'Arjun', role: 'Procurement', icon: '📦', color: 'from-orange-500 to-amber-500', prompt: 'Inspect Surat & Meesho manufacturer pricing and check for stock updates.' },
];

export default function DotsDashboardPage() {
  // State
  const [agentState, setAgentState] = useState<DotState>('Sleeping');
  const [selectedExecutive, setSelectedExecutive] = useState<string>('radha');
  const [backend, setBackend] = useState<ExecutionBackend>('local');
  const [sessionId, setSessionId] = useState<string>('dots_session');
  const [activeTab, setActiveTab] = useState<'terminal' | 'browser' | 'mcp' | 'skills' | 'vids' | 'canvas' | 'files' | 'crons' | 'memory'>('terminal');
  
  // Realtime & Connection
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [gatewayStatus, setGatewayStatus] = useState<'connecting' | 'online' | 'offline'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);

  // Terminal & Logs
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      stream: 'system',
      text: '🤖 [SYSTEM INIT] OpenAI Dots // Hermes Agent Cloud Gateway Initializing...\nExecution sandbox: Local Shell (Docker / Modal flag switchable)\n4,000+ MCP Servers & SKILL.md pipeline ready.\n',
      timestamp: Date.now() / 1000
    }
  ]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Chat & Approvals
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '⚡ **Hermes Dot Brain Active.** Cloned directly from OpenAI Dots architecture with Hermes native backend flags:\n\n• **Cloud Terminal:** Local / Docker / Modal execution backends\n• **4,000+ App Connections:** Native Model Context Protocol (MCP) tool mesh\n• **Skill Retention Loop:** Continuous task synthesis writing to version-controlled `SKILL.md`\n\nWhat workflow shall we execute?',
      timestamp: Date.now() / 1000
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeApprovals, setActiveApprovals] = useState<PendingApproval[]>([]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // MCP Servers
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [mcpSearch, setMcpSearch] = useState<string>('');
  const [selectedMcpServer, setSelectedMcpServer] = useState<MCPServer | null>(null);

  // Skills
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [skillsSearch, setSkillsSearch] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [skillDetailContent, setSkillDetailContent] = useState<string>('');
  const [showRetainModal, setShowRetainModal] = useState<boolean>(false);
  const [retainTaskName, setRetainTaskName] = useState<string>('');
  const [retainGoal, setRetainGoal] = useState<string>('');
  const [retainSummary, setRetainSummary] = useState<string>('');

  // Google Vids Studio
  const [vidsProjects, setVidsProjects] = useState<GoogleVidsProject[]>([]);
  const [selectedVidProject, setSelectedVidProject] = useState<GoogleVidsProject | null>(null);
  const [vidPrompt, setVidPrompt] = useState<string>('meesho-crystal-ball-3d-galaxy-led-lamp-wooden-base');
  const [vidAspectRatio, setVidAspectRatio] = useState<string>('9:16');
  const [vidVoice, setVidVoice] = useState<string>('en-IN-NeerjaNeural');
  const [isGeneratingVid, setIsGeneratingVid] = useState<boolean>(false);

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
    '# Hermes Autonomous Plan\n\n- [x] High-speed Meesho direct supplier routing\n- [x] Zero-load cloud execution via GitHub Actions\n- [x] 100% free 24/7 autonomous loop\n- [x] 4,000+ App Connections via Model Context Protocol (MCP)\n- [x] Hermes SKILL.md automatic retention loop\n'
  );
  const [memoryState, setMemoryState] = useState<{ memory_md: string; user_md: string }>({
    memory_md: '',
    user_md: ''
  });

  // Virtual Laptop / Agent Browser State
  const [browserUrl, setBrowserUrl] = useState<string>('https://rareember-store.vercel.app');
  const [browserInputUrl, setBrowserInputUrl] = useState<string>('https://rareember-store.vercel.app');
  const [browserTitle, setBrowserTitle] = useState<string>('RareEmber | Rare finds, daily drops');
  const [browserScreenshot, setBrowserScreenshot] = useState<string>('');
  const [isBrowserLoading, setIsBrowserLoading] = useState<boolean>(false);
  const [browserLogs, setBrowserLogs] = useState<Array<{ time_str: string; action: string; details: string; level?: string }>>([
    { time_str: '05:25:00', action: 'init_success', details: 'Chromium 128 Virtual Laptop initialized (1280x800)' },
    { time_str: '05:25:02', action: 'navigate_success', details: "Loaded 'RareEmber | Rare finds, daily drops'" }
  ]);
  const [browserExtractedData, setBrowserExtractedData] = useState<any>(null);
  const [showDomDrawer, setShowDomDrawer] = useState<boolean>(false);
  const [virtualCursorPos, setVirtualCursorPos] = useState<{ x: number; y: number }>({ x: 48, y: 32 });

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
              if (data.backend) setBackend(data.backend);
              if (data.logs) setLogs((prev) => [...prev, ...data.logs]);
              if (data.pending_approvals) setActiveApprovals(data.pending_approvals);
            } else if (data.type === 'terminal_stream') {
              setLogs((prev) => [...prev.slice(-800), { stream: data.stream, text: data.text, timestamp: Date.now() / 1000, backend: data.backend }]);
            } else if (data.type === 'state_change') {
              setAgentState(data.state);
              if (data.backend) setBackend(data.backend);
            } else if (data.type === 'backend_change') {
              setBackend(data.backend);
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
    fetchBackend();
    fetchFiles();
    fetchCrons();
    fetchMcpServers();
    fetchSkills();
    fetchVidsProjects();
    fetchBrowserStatus();
    fetchMemory();
    fetchTerminalLogs();

    const pollInterval = setInterval(() => {
      fetchHealth();
      fetchTerminalLogs();
    }, 4000);

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
        if (data.execution_backend) setBackend(data.execution_backend);
        setGatewayStatus('online');
      }
    } catch {}
  };

  const fetchBackend = async () => {
    try {
      const res = await fetch('/api/dots/api/v1/backend');
      if (res.ok) {
        const data = await res.json();
        if (data.backend) setBackend(data.backend);
      }
    } catch {}
  };

  const switchBackend = async (newBackend: ExecutionBackend) => {
    setBackend(newBackend);
    try {
      if (wsConnected && wsRef.current) {
        wsRef.current.send(JSON.stringify({ type: 'backend', backend: newBackend }));
      }
      await fetch('/api/dots/api/v1/backend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: newBackend })
      });
    } catch {}
  };

  const fetchMcpServers = async () => {
    try {
      const res = await fetch('/api/dots/api/v1/mcp/servers');
      if (res.ok) {
        const data = await res.json();
        setMcpServers(data);
      }
    } catch {}
  };

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/dots/api/v1/skills');
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
      }
    } catch {}
  };

  const fetchVidsProjects = async () => {
    try {
      const res = await fetch('/api/dots/api/v1/vids');
      if (res.ok) {
        const data = await res.json();
        setVidsProjects(data);
        if (data.length > 0) {
          setSelectedVidProject((prev) => prev || data[0]);
        }
      }
    } catch {}
  };

  const handleGenerateVid = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!vidPrompt.trim() || isGeneratingVid) return;

    setIsGeneratingVid(true);
    try {
      const res = await fetch('/api/dots/api/v1/vids/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_or_product: vidPrompt,
          aspect_ratio: vidAspectRatio,
          voice_id: vidVoice
        })
      });

      if (res.ok) {
        const project = await res.json();
        setVidsProjects((prev) => [project, ...prev.filter((p) => p.project_id !== project.project_id)]);
        setSelectedVidProject(project);
        setActiveTab('vids');
      }
    } catch (err) {
      console.error('Error generating Google Vid:', err);
    } finally {
      setIsGeneratingVid(false);
    }
  };

  const fetchBrowserStatus = async () => {
    try {
      const res = await fetch('/api/dots/api/v1/browser/status');
      if (res.ok) {
        const data = await res.json();
        if (data.current_url) {
          setBrowserUrl(data.current_url);
          setBrowserInputUrl(data.current_url);
        }
        if (data.current_title) setBrowserTitle(data.current_title);
        if (data.recent_logs) setBrowserLogs(data.recent_logs);
      }
    } catch {}
  };

  const handleBrowserNavigate = async (urlToNavigate?: string) => {
    const target = urlToNavigate || browserInputUrl;
    if (!target.trim()) return;
    setIsBrowserLoading(true);
    setVirtualCursorPos({ x: 25 + Math.random() * 50, y: 25 + Math.random() * 45 });
    try {
      const res = await fetch('/api/dots/api/v1/browser/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target })
      });
      if (res.ok) {
        const data = await res.json();
        const finalUrl = data.url || target;
        setBrowserUrl(finalUrl);
        setBrowserInputUrl(finalUrl);
        if (data.title) setBrowserTitle(data.title);
        if (data.screenshot) setBrowserScreenshot(data.screenshot);
        fetchBrowserStatus();
      }
    } catch (err) {
      console.error('Browser navigate error:', err);
    } finally {
      setIsBrowserLoading(false);
    }
  };

  const handleBrowserExtract = async () => {
    try {
      const res = await fetch('/api/dots/api/v1/browser/extract');
      if (res.ok) {
        const data = await res.json();
        setBrowserExtractedData(data.data || data);
        setShowDomDrawer(true);
      }
    } catch {}
  };

  const handleTakeScreenshot = async () => {
    setIsBrowserLoading(true);
    try {
      const res = await fetch('/api/dots/api/v1/browser/screenshot');
      if (res.ok) {
        const data = await res.json();
        if (data.screenshot) setBrowserScreenshot(data.screenshot);
      }
    } catch {}
    finally {
      setIsBrowserLoading(false);
    }
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

  const fetchTerminalLogs = async () => {
    try {
      const res = await fetch('/api/dots/api/v1/terminal/logs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLogs((prev) => {
            const existingTexts = new Set(prev.map((l) => l.text));
            const newLogs = data.filter((l: any) => !existingTexts.has(l.text));
            if (newLogs.length === 0) return prev;
            return [...prev, ...newLogs];
          });
        }
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

  const loadSkillContent = async (skill: SkillItem) => {
    setSelectedSkill(skill);
    if (skill.full_content) {
      setSkillDetailContent(skill.full_content);
      return;
    }
    try {
      const res = await fetch(`/api/dots/api/v1/skills/content?path=${encodeURIComponent(skill.path)}`);
      if (res.ok) {
        const data = await res.json();
        setSkillDetailContent(data.content || '');
      }
    } catch {
      setSkillDetailContent('Failed to load skill details.');
    }
  };

  const handleRetainSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retainTaskName.trim() || !retainGoal.trim()) return;

    try {
      const res = await fetch('/api/dots/api/v1/skills/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_name: retainTaskName,
          goal: retainGoal,
          solution_summary: retainSummary || 'Executed autonomously by Hermes Dot with verified zero error output.',
          commands_run: [inputPrompt || 'python -c "print(\'Hermes Skill Retained\')"'],
          category: 'custom'
        })
      });

      if (res.ok) {
        setShowRetainModal(false);
        setRetainTaskName('');
        setRetainGoal('');
        setRetainSummary('');
        fetchSkills();
      }
    } catch {}
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
                  if (parsed.backend) setBackend(parsed.backend);
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
      fetchSkills();
    }
  };

  // Resolve Human-In-The-Loop Approval
  const handleResolveApproval = async (actionId: string, approved: boolean, feedback = '') => {
    try {
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
        await fetch(`/api/dots/api/v1/approvals/${actionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approved, feedback })
        });
      }

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

  const handleRunCronNow = async (jobId: string) => {
    try {
      await fetch(`/api/dots/api/v1/crons/${jobId}/run`, { method: 'POST' });
      setActiveTab('terminal');
    } catch {}
  };

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
  const filteredMcp = mcpServers.filter((s) => s.name.toLowerCase().includes(mcpSearch.toLowerCase()) || s.description.toLowerCase().includes(mcpSearch.toLowerCase()));
  const filteredSkills = skills.filter((s) => s.name.toLowerCase().includes(skillsSearch.toLowerCase()) || s.description.toLowerCase().includes(skillsSearch.toLowerCase()));

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

        {/* Dynamic Sticky Agent Status Badge & Hermes Terminal Backend Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hermes Terminal Execution Backend Switcher */}
          <div className="flex items-center rounded-lg bg-[#11131C] p-0.5 border border-[#1E2233]">
            <button
              onClick={() => switchBackend('local')}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md transition-all ${
                backend === 'local'
                  ? 'bg-purple-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Hermes Local Subprocess Shell"
            >
              <Laptop className="w-3 h-3" />
              <span className="hidden sm:inline">Local</span>
            </button>
            <button
              onClick={() => switchBackend('docker')}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md transition-all ${
                backend === 'docker'
                  ? 'bg-purple-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Hermes Docker Sandbox Container (--backend docker)"
            >
              <Box className="w-3 h-3" />
              <span className="hidden sm:inline">Docker</span>
            </button>
            <button
              onClick={() => switchBackend('modal')}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md transition-all ${
                backend === 'modal'
                  ? 'bg-purple-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Hermes Serverless Cloud Sandbox (--backend modal)"
            >
              <Cloud className="w-3 h-3" />
              <span className="hidden sm:inline">Modal Cloud</span>
            </button>
          </div>

          {/* Sticky Agent Status Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium tracking-wide transition-all duration-300 ${statusConfig.pill}`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.dot}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.dot.split(' ')[0]}`} />
            </span>
            <span>{statusConfig.label}</span>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs text-amber-400 hover:text-amber-300 px-2.5 py-1.5 rounded-md bg-amber-950/40 border border-amber-800/40 transition-colors flex items-center gap-1.5"
          >
            <span>👑</span>
            <span className="hidden sm:inline">Admin Console</span>
          </Link>

          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white px-2 py-1.5 rounded-md hover:bg-[#151722] transition-colors flex items-center gap-1 border border-transparent hover:border-[#262A3D]"
          >
            <span>Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ────────────────── MAIN SPLIT-PANE WORKSPACE ────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ──────── LEFT PANEL: PERSISTENT AGENT CHAT & INTERCEPTOR ──────── */}
        <div className="w-full lg:w-[42%] flex flex-col border-r border-[#1A1D27] bg-[#0A0B10] h-[calc(100vh-4rem)]">
          {/* Persona Header Widget */}
          <div className="p-3.5 border-b border-[#1A1D27] flex items-center justify-between bg-gradient-to-b from-[#0F111A] to-[#0A0B10]">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br blur-md transition-all duration-500 ${statusConfig.orb}`}
                />
                <div className="relative w-8 h-8 rounded-full bg-[#10121C] border border-white/20 flex items-center justify-center shadow-inner">
                  <span className="text-sm">
                    {EXECUTIVE_TEAM.find((e) => e.id === selectedExecutive)?.icon || '👑'}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                  <span>Radha CEO &amp; Autonomous Board</span>
                  {activeApprovals.length > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-500/20 text-red-400 border border-red-500/40">
                      {activeApprovals.length} Approval Pending
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Active: <strong className="text-amber-400 font-medium">{EXECUTIVE_TEAM.find((e) => e.id === selectedExecutive)?.name} ({EXECUTIVE_TEAM.find((e) => e.id === selectedExecutive)?.role})</strong></span>
                  <span>•</span>
                  <span>Backend: <strong className="text-purple-400 uppercase">{backend}</strong></span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    id: `new_${Date.now()}`,
                    role: 'assistant',
                    content: '✨ Executive thread refreshed. Radha CEO, Vikram, Aarav, Pooja, Meera, Kabir, and Arjun stand ready at your command.',
                    timestamp: Date.now() / 1000
                  }
                ]);
              }}
              className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-[#161824] rounded-md transition-colors"
              title="Reset Chat Thread"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Executive Board Team Switcher Bar */}
          <div className="px-3 py-2 border-b border-[#161824] bg-[#08090E] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {EXECUTIVE_TEAM.map((exec) => (
              <button
                key={exec.id}
                onClick={() => {
                  setSelectedExecutive(exec.id);
                  setInputPrompt(exec.prompt);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedExecutive === exec.id
                    ? 'bg-amber-950/80 text-amber-200 border border-amber-600/50 shadow-sm'
                    : 'bg-[#11131E] hover:bg-[#181B2A] text-slate-400 hover:text-slate-200 border border-[#1E2235]'
                }`}
                title={`${exec.name} (${exec.role})`}
              >
                <span>{exec.icon}</span>
                <span>{exec.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">({exec.role})</span>
              </button>
            ))}
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
                <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                <span>Hermes Dot is reasoning via {backend} sandbox...</span>
              </div>
            )}
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-4 py-2 border-t border-[#161824] flex gap-2 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => setInputPrompt('$ python hermes_seo_engine.py')}
              className="px-2 py-1 rounded bg-[#131520] hover:bg-[#1A1D2D] text-slate-400 hover:text-slate-200 whitespace-nowrap border border-[#202436] transition-colors"
            >
              $ SEO Engine
            </button>
            <button
              onClick={() => setInputPrompt('Query Supabase via MCP postgres to inspect active products')}
              className="px-2 py-1 rounded bg-[#131520] hover:bg-[#1A1D2D] text-slate-400 hover:text-slate-200 whitespace-nowrap border border-[#202436] transition-colors"
            >
              🔌 Query Supabase MCP
            </button>
            <button
              onClick={() => {
                setShowRetainModal(true);
                setRetainTaskName('meesho-fast-catalog-sync');
                setRetainGoal('Sync 103 high-margin Indian supplier products direct to Supabase');
              }}
              className="px-2 py-1 rounded bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 whitespace-nowrap border border-indigo-800/40 transition-colors"
            >
              🎓 Distill Skill to SKILL.md
            </button>
            <button
              onClick={() => setInputPrompt('$ python -c "print(\'Testing Sandbox\')"')}
              className="px-2 py-1 rounded bg-[#131520] hover:bg-[#1A1D2D] text-slate-400 hover:text-slate-200 whitespace-nowrap border border-[#202436] transition-colors"
            >
              $ Test Sandbox
            </button>
          </div>

          {/* Bottom Chat Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#1A1D27] bg-[#0A0B10]">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Instruct Hermes Dot or prefix with $ for direct shell execution..."
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
          </form>
        </div>

        {/* ──────── RIGHT PANEL: CANVAS / TERMINAL / MCP / SKILLS / FILES / CRONS ──────── */}
        <div className="w-full lg:w-[58%] flex flex-col bg-[#070709] h-[calc(100vh-4rem)]">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between px-3 border-b border-[#1A1D27] bg-[#0A0B10] overflow-x-auto no-scrollbar">
            <div className="flex gap-1 py-2">
              <button
                onClick={() => setActiveTab('terminal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'terminal'
                    ? 'bg-[#161824] text-white border border-[#25283B]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#10121C]'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                <span>Cloud Terminal</span>
                <span className="text-[10px] px-1 rounded bg-[#1C1F30] text-purple-300 font-mono">
                  {backend}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('browser');
                  fetchBrowserStatus();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'browser'
                    ? 'bg-[#161824] text-white border border-[#25283B]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#10121C]'
                }`}
              >
                <Laptop className="w-3.5 h-3.5 text-blue-400" />
                <span>Virtual Laptop</span>
                <span className="text-[10px] px-1 rounded bg-blue-950 text-blue-300 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Live Browser
                </span>
              </button>

              <button
                onClick={() => setActiveTab('mcp')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'mcp'
                    ? 'bg-[#161824] text-white border border-[#25283B]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#10121C]'
                }`}
              >
                <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                <span>4,000+ MCP Apps</span>
                <span className="text-[10px] px-1 rounded bg-emerald-950 text-emerald-300 font-mono">
                  {mcpServers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('skills')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'skills'
                    ? 'bg-[#161824] text-white border border-[#25283B]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#10121C]'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Skill Retention</span>
                <span className="text-[10px] px-1 rounded bg-indigo-950 text-indigo-300 font-mono">
                  {skills.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('vids')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'vids'
                    ? 'bg-[#161824] text-white border border-[#25283B]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#10121C]'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-pink-400" />
                <span>Google Vids</span>
                {vidsProjects.length > 0 && (
                  <span className="text-[10px] px-1 rounded bg-pink-950 text-pink-300 font-mono">
                    {vidsProjects.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('canvas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'canvas'
                    ? 'bg-[#161824] text-white border border-[#25283B]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#10121C]'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Canvas</span>
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'files'
                    ? 'bg-[#161824] text-white border border-[#25283B]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#10121C]'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>Files</span>
              </button>

              <button
                onClick={() => setActiveTab('crons')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'crons'
                    ? 'bg-[#161824] text-white border border-[#25283B]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#10121C]'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-pink-400" />
                <span>Crons</span>
              </button>

              <button
                onClick={() => setActiveTab('memory')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'memory'
                    ? 'bg-[#161824] text-white border border-[#25283B]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#10121C]'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span>Memory</span>
              </button>
            </div>

            {/* Quick action button */}
            {activeTab === 'terminal' && (
              <button
                onClick={() => setLogs([])}
                className="text-[11px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded hover:bg-[#141624] transition-colors"
              >
                Clear
              </button>
            )}
            {activeTab === 'browser' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleTakeScreenshot}
                  disabled={isBrowserLoading}
                  className="flex items-center gap-1 text-[11px] bg-[#161824] hover:bg-[#202336] text-slate-300 px-2.5 py-1 rounded-md border border-[#25283B] transition-colors"
                  title="Capture live screenshot from Chromium"
                >
                  <Camera className="w-3 h-3 text-blue-400" />
                  <span>Snapshot</span>
                </button>
                <button
                  onClick={handleBrowserExtract}
                  className="flex items-center gap-1 text-[11px] bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-md transition-colors"
                  title="Extract DOM headings and supplier prices"
                >
                  <Search className="w-3 h-3" />
                  <span>Scrape DOM</span>
                </button>
              </div>
            )}
            {activeTab === 'skills' && (
              <button
                onClick={() => setShowRetainModal(true)}
                className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Retain Skill</span>
              </button>
            )}
            {activeTab === 'crons' && (
              <button
                onClick={() => setShowAddCronModal(true)}
                className="flex items-center gap-1 text-xs bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>New Cron</span>
              </button>
            )}
          </div>

          {/* TAB 1: CLOUD TERMINAL */}
          {activeTab === 'terminal' && (
            <div className="flex-1 flex flex-col bg-[#050608] overflow-hidden">
              <div className="px-4 py-2 border-b border-[#141620] bg-[#08090E] flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 text-slate-400">hermes-terminal: <strong className="text-purple-300 uppercase">{backend}</strong></span>
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

          {/* TAB: VIRTUAL BROWSER LAPTOP (OPENAI DOTS BROWSER CANVAS) */}
          {activeTab === 'browser' && (
            <div className="flex-1 flex flex-col bg-[#050608] overflow-hidden p-3 sm:p-4">
              {/* Virtual Laptop Device Frame */}
              <div className="flex-1 flex flex-col rounded-2xl border-2 border-[#202438] bg-[#0E1019] shadow-2xl overflow-hidden">
                {/* Top Laptop Bezel with Camera & Sensor */}
                <div className="h-6 bg-[#0B0D14] flex items-center justify-center relative border-b border-[#1A1D2B]">
                  {/* Laptop Camera Notch & LED */}
                  <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#141622] border border-[#23273A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700" title="HD Webcam" />
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" title="Camera Sensor Active" />
                  </div>
                  <div className="absolute right-3 text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Radha Executive Virtual Display</span>
                  </div>
                </div>

                {/* Chrome Window Header: Controls, Tabs & Title */}
                <div className="bg-[#12141F] px-3 pt-2 pb-1.5 border-b border-[#1E2235] flex items-center justify-between gap-3">
                  {/* Traffic Light Dots */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block hover:opacity-100 cursor-pointer" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block hover:opacity-100 cursor-pointer" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block hover:opacity-100 cursor-pointer" />
                  </div>

                  {/* Browser Tab Pill */}
                  <div className="flex-1 max-w-sm flex items-center gap-2 bg-[#0C0E16] px-3 py-1.5 rounded-t-lg border-t border-x border-[#23273C] text-xs text-slate-200">
                    <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate font-medium">{browserTitle}</span>
                    <button
                      onClick={() => handleBrowserNavigate('https://rareember-store.vercel.app')}
                      className="ml-auto text-slate-500 hover:text-slate-300 text-xs"
                    >
                      ×
                    </button>
                  </div>

                  {/* Sandbox Spec Pill */}
                  <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-[#181B28] text-slate-300">1280×800</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-900/40">Playwright 128</span>
                  </div>
                </div>

                {/* Omnibar & Navigation Bar */}
                <div className="bg-[#0F111A] px-3 py-2 border-b border-[#1A1D2B] flex items-center gap-2">
                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => handleBrowserNavigate('https://rareember-store.vercel.app')}
                      className="p-1 rounded hover:bg-[#1A1D2B] hover:text-slate-200"
                      title="Back / Home"
                    >
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                    <button
                      onClick={() => handleBrowserNavigate()}
                      className={`p-1 rounded hover:bg-[#1A1D2B] hover:text-slate-200 ${isBrowserLoading ? 'animate-spin text-blue-400' : ''}`}
                      title="Reload Page"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* URL Input Bar */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleBrowserNavigate();
                    }}
                    className="flex-1 flex items-center gap-2 bg-[#090A10] border border-[#222638] focus-within:border-blue-500 rounded-lg px-2.5 py-1 text-xs"
                  >
                    <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                    <input
                      type="text"
                      value={browserInputUrl}
                      onChange={(e) => setBrowserInputUrl(e.target.value)}
                      placeholder="Enter URL to navigate agent (e.g. https://www.meesho.com or rareember-store.vercel.app)..."
                      className="flex-1 bg-transparent text-slate-200 focus:outline-none font-mono text-[11px]"
                    />
                    <button
                      type="submit"
                      disabled={isBrowserLoading}
                      className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded font-semibold transition-colors shrink-0"
                    >
                      {isBrowserLoading ? 'Loading...' : 'Go'}
                    </button>
                  </form>
                </div>

                {/* Quick Bookmarks Bar */}
                <div className="bg-[#0A0C13] px-3 py-1 border-b border-[#161824] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
                  <span className="text-slate-500 text-[10px] font-mono mr-1">Bookmarks:</span>
                  {[
                    { label: '🛒 RareEmber Store (Live)', url: 'https://rareember-store.vercel.app' },
                    { label: '📦 Meesho Viral Sourcing', url: 'https://www.meesho.com' },
                    { label: '🚚 CJ Dropshipping', url: 'https://cjdropshipping.com' },
                    { label: '⚡ Admin Orders Console', url: 'https://rareember-store.vercel.app/admin/orders' },
                    { label: '📈 Google Trends India', url: 'https://trends.google.com/trends/trendingsearches/daily?geo=IN' },
                  ].map((bm) => (
                    <button
                      key={bm.url}
                      onClick={() => {
                        setBrowserInputUrl(bm.url);
                        handleBrowserNavigate(bm.url);
                      }}
                      className="px-2 py-0.5 rounded bg-[#131520] hover:bg-[#1E2235] text-slate-300 hover:text-white border border-[#1E2233] transition-colors whitespace-nowrap text-[10px]"
                    >
                      {bm.label}
                    </button>
                  ))}
                </div>

                {/* Screen Viewport & Live Canvas */}
                <div className="flex-1 relative bg-[#06070B] overflow-auto flex items-center justify-center p-2">
                  {/* Simulated Floating Agent Mouse Cursor */}
                  <div
                    className="absolute z-20 pointer-events-none transition-all duration-700 ease-out flex items-center gap-1.5"
                    style={{ left: `${virtualCursorPos.x}%`, top: `${virtualCursorPos.y}%` }}
                  >
                    <MousePointer className="w-4 h-4 text-amber-400 drop-shadow-md" />
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-black shadow-lg">
                      👑 Radha Browsing
                    </span>
                  </div>

                  {/* Loading Overlay */}
                  {isBrowserLoading && (
                    <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                      <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-xs font-mono text-slate-300">Playwright Chromium Navigating...</span>
                      <span className="text-[10px] font-mono text-slate-500 mt-1">{browserUrl}</span>
                    </div>
                  )}

                  {/* Browser Screen Content */}
                  {browserScreenshot ? (
                    <div className="max-w-full max-h-full flex items-center justify-center overflow-auto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={browserScreenshot}
                        alt="Virtual Laptop Screen Viewport"
                        className="rounded-lg shadow-xl max-w-full max-h-[520px] object-contain border border-[#1C1F30]"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full max-w-4xl flex flex-col rounded-lg border border-[#1E2233] bg-[#0A0C14] overflow-hidden">
                      <div className="p-4 border-b border-[#161824] bg-[#0E101B] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-semibold text-white">{browserTitle}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-900/40">
                          Live Active Session
                        </span>
                      </div>

                      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-blue-950/40 border border-blue-900/50 flex items-center justify-center mb-4 text-blue-400">
                          <Laptop className="w-8 h-8" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">
                          Radha Executive Virtual Laptop Online
                        </h4>
                        <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
                          Your self-hosted Hermes Dot executive team possesses its own headless Chromium browser laptop for live supplier product scraping, competitor price intelligence, and automated checkout validation.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <button
                            onClick={() => handleBrowserNavigate('https://rareember-store.vercel.app')}
                            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Browse RareEmber Live Store</span>
                          </button>
                          <button
                            onClick={() => handleBrowserNavigate('https://www.meesho.com')}
                            className="text-xs bg-[#161824] hover:bg-[#202336] text-slate-200 border border-[#25283B] font-medium px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <Search className="w-3.5 h-3.5 text-pink-400" />
                            <span>Scrape Meesho Suppliers</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DOM Extractor Drawer Overlay */}
                  {showDomDrawer && browserExtractedData && (
                    <div className="absolute right-4 bottom-4 w-96 max-h-72 bg-[#0E101B]/95 backdrop-blur-md border border-[#25283E] rounded-xl shadow-2xl p-3 overflow-y-auto text-xs z-30">
                      <div className="flex items-center justify-between pb-2 border-b border-[#1E2235] mb-2">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5 text-blue-400" />
                          <span>Extracted Page Data</span>
                        </span>
                        <button
                          onClick={() => setShowDomDrawer(false)}
                          className="text-slate-400 hover:text-white text-xs"
                        >
                          ✕
                        </button>
                      </div>

                      {browserExtractedData.headings && browserExtractedData.headings.length > 0 && (
                        <div className="mb-2">
                          <span className="text-[10px] text-slate-500 uppercase font-mono block">Key Headings</span>
                          <ul className="list-disc pl-4 text-slate-300 space-y-0.5 text-[11px] mt-1">
                            {browserExtractedData.headings.slice(0, 5).map((h: string, idx: number) => (
                              <li key={idx} className="truncate">{h}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {browserExtractedData.prices && browserExtractedData.prices.length > 0 && (
                        <div className="mb-2">
                          <span className="text-[10px] text-slate-500 uppercase font-mono block">Detected Supplier Prices</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {browserExtractedData.prices.slice(0, 6).map((p: string, idx: number) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px]">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {browserExtractedData.bodySnippet && (
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-mono block">Text Snippet</span>
                          <p className="text-[10px] text-slate-400 font-mono line-clamp-3 mt-0.5">
                            {browserExtractedData.bodySnippet}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Laptop Chassis Bar & Hardware Metrics */}
                <div className="h-8 bg-[#090A11] px-4 border-t border-[#181A26] flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Chromium 128 (Playwright Sandbox)</span>
                    <span className="text-slate-600">|</span>
                    <span>1280×800 Viewport</span>
                  </div>

                  {/* Centered Trackpad Indent */}
                  <div className="w-28 h-1 bg-[#1E2235] rounded-full hidden md:block" />

                  <div className="flex items-center gap-3">
                    <span className="text-blue-300">Residential Proxy (India)</span>
                    <span className="text-emerald-400">⚡ 100% Battery (Cloud Relay)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 4,000+ APP CONNECTIONS (MCP ECOSYSTEM) */}
          {activeTab === 'mcp' && (
            <div className="flex-1 flex flex-col bg-[#08090E] overflow-hidden">
              <div className="p-4 border-b border-[#161824] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-emerald-400" />
                    <span>Hermes Model Context Protocol (MCP) Mesh</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Direct integration connecting Hermes to 4,000+ open-source MCP tools, databases, APIs, and headless browsers.
                  </p>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search MCP servers..."
                    value={mcpSearch}
                    onChange={(e) => setMcpSearch(e.target.value)}
                    className="bg-[#12141F] text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-[#1E2233] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredMcp.map((srv) => (
                  <div
                    key={srv.name}
                    className="p-4 rounded-xl bg-[#0D0F17] border border-[#1B1E2D] hover:border-emerald-500/40 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-semibold text-emerald-400">{srv.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                          {srv.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-3">{srv.description}</p>
                      {srv.tools && srv.tools.length > 0 && (
                        <div className="space-y-1 bg-[#070709] p-2.5 rounded-lg border border-[#151722]">
                          <div className="text-[10px] font-semibold text-slate-400 mb-1">Available Tools ({srv.tools.length}):</div>
                          <div className="flex flex-wrap gap-1">
                            {srv.tools.map((t, i) => (
                              <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#12141F] text-slate-300 border border-[#1E2233]">
                                {t.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#161824] flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Transport: {srv.transport}</span>
                      <button
                        onClick={() => {
                          setInputPrompt(`Query ${srv.name} via MCP tools to inspect state`);
                        }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                      >
                        <span>Query via Agent</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SKILL RETENTION LOOP (SKILL.MD PIPELINE) */}
          {activeTab === 'skills' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Skill list sidebar */}
              <div className="w-72 border-r border-[#161824] bg-[#0A0B10] flex flex-col">
                <div className="p-3 border-b border-[#161824]">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search skills..."
                      value={skillsSearch}
                      onChange={(e) => setSkillsSearch(e.target.value)}
                      className="w-full bg-[#12141F] text-xs text-slate-200 pl-8 pr-2 py-1.5 rounded-lg border border-[#1E2233] focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredSkills.map((sk) => (
                    <button
                      key={sk.path}
                      onClick={() => loadSkillContent(sk)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors ${
                        selectedSkill?.path === sk.path
                          ? 'bg-indigo-950/70 border border-indigo-800/50 text-indigo-200'
                          : 'bg-[#0D0F17] hover:bg-[#12141F] text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold truncate">{sk.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#161824] text-slate-400">
                          {sk.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{sk.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill content viewer */}
              <div className="flex-1 flex flex-col bg-[#050608]">
                {selectedSkill ? (
                  <>
                    <div className="px-4 py-2.5 border-b border-[#161824] bg-[#0A0B10] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-indigo-400" />
                        <span className="font-mono text-indigo-300">skills/{selectedSkill.path}</span>
                      </div>
                      <button
                        onClick={() => {
                          setInputPrompt(`Execute skill '${selectedSkill.name}' from skills/${selectedSkill.path}`);
                        }}
                        className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-2.5 py-1 rounded-md transition-colors"
                      >
                        Execute Skill
                      </button>
                    </div>
                    <pre className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-text">
                      {skillDetailContent}
                    </pre>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
                    <GraduationCap className="w-10 h-10 text-slate-700 mb-2" />
                    <span>Select any retained skill from the library to inspect its SKILL.md</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: GOOGLE VIDS AI STUDIO */}
          {activeTab === 'vids' && (
            <div className="flex-1 flex flex-col bg-[#08090E] overflow-hidden">
              {/* Generator control panel */}
              <div className="p-4 border-b border-[#161824] bg-[#0A0B10]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Film className="w-4 h-4 text-pink-400" />
                      <span>Google Vids AI Studio</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-800/40">
                        Workspace AI Pipeline
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Convert any product into a high-converting multi-scene storyboard with synchronized neural voiceovers and Google Workspace manifests.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleGenerateVid} className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={vidPrompt}
                      onChange={(e) => setVidPrompt(e.target.value)}
                      placeholder="Product ID, title, or video prompt (e.g. 3D Crystal Ball Galaxy Lamp)..."
                      className="w-full bg-[#12141F] text-xs text-slate-200 pl-3 pr-2 py-2 rounded-lg border border-[#1E2233] focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={vidAspectRatio}
                      onChange={(e) => setVidAspectRatio(e.target.value)}
                      className="bg-[#12141F] text-xs text-slate-200 px-2.5 py-2 rounded-lg border border-[#1E2233] focus:outline-none focus:border-pink-500"
                    >
                      <option value="9:16">9:16 Reels / Shorts</option>
                      <option value="16:9">16:9 Presentation</option>
                    </select>
                    <select
                      value={vidVoice}
                      onChange={(e) => setVidVoice(e.target.value)}
                      className="bg-[#12141F] text-xs text-slate-200 px-2.5 py-2 rounded-lg border border-[#1E2233] focus:outline-none focus:border-pink-500"
                    >
                      <option value="en-IN-NeerjaNeural">Indian English (Neerja)</option>
                      <option value="hi-IN-SwaraNeural">Hindi (Swara)</option>
                      <option value="en-US-JennyNeural">US English (Jenny)</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isGeneratingVid || !vidPrompt.trim()}
                      className="bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      {isGeneratingVid ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Vid</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Storyboard and Project Inspector */}
              <div className="flex-1 flex overflow-hidden">
                {/* Project selector sidebar */}
                <div className="w-64 border-r border-[#161824] bg-[#0A0B10] flex flex-col">
                  <div className="p-3 border-b border-[#161824] text-[11px] font-semibold text-slate-400">
                    Video Projects ({vidsProjects.length})
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {vidsProjects.map((proj) => (
                      <button
                        key={proj.project_id}
                        onClick={() => setSelectedVidProject(proj)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors ${
                          selectedVidProject?.project_id === proj.project_id
                            ? 'bg-pink-950/70 border border-pink-800/50 text-pink-200'
                            : 'bg-[#0D0F17] hover:bg-[#12141F] text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="font-medium truncate">{proj.title}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                          <span>{proj.aspect_ratio}</span>
                          <span>•</span>
                          <span>{proj.scenes?.length || 5} Scenes</span>
                          <span>•</span>
                          <span>{proj.total_duration_seconds}s</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected project details */}
                <div className="flex-1 flex flex-col bg-[#050608] overflow-y-auto">
                  {selectedVidProject ? (
                    <div className="p-4 space-y-4">
                      {/* Project Header & Export Bar */}
                      <div className="p-4 rounded-xl bg-[#0D0F17] border border-[#1B1E2D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{selectedVidProject.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span>Format: <strong className="text-pink-300">{selectedVidProject.aspect_ratio}</strong></span>
                            <span>•</span>
                            <span>Voice: <strong className="text-slate-300">{selectedVidProject.voice_id}</strong></span>
                            <span>•</span>
                            <span>Total Runtime: <strong className="text-emerald-400">{selectedVidProject.total_duration_seconds}s</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const manifestStr = JSON.stringify(selectedVidProject, null, 2);
                              const blob = new Blob([manifestStr], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${selectedVidProject.project_id}_manifest.json`;
                              a.click();
                            }}
                            className="flex items-center gap-1 text-xs bg-[#151724] hover:bg-[#1E2235] text-slate-300 border border-[#23273D] px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export Manifest</span>
                          </button>
                          <button
                            onClick={() => {
                              setInputPrompt(`Publish Google Vid project ${selectedVidProject.project_id} as a video reel`);
                            }}
                            className="flex items-center gap-1 text-xs bg-pink-600 hover:bg-pink-500 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Publish via Agent</span>
                          </button>
                        </div>
                      </div>

                      {/* Scene Cards Grid */}
                      <div className="space-y-3">
                        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-pink-400" />
                          <span>Storyboard Timeline ({selectedVidProject.scenes?.length || 0} Scenes)</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedVidProject.scenes?.map((scene) => (
                            <div
                              key={scene.scene_number}
                              className="p-3.5 rounded-xl bg-[#0D0F17] border border-[#191C2B] flex flex-col justify-between space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-white">{scene.title}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                                  {scene.duration_seconds}s
                                </span>
                              </div>

                              {scene.badge_text && (
                                <div className="text-[10px] font-semibold text-pink-300 bg-pink-950/40 border border-pink-900/50 px-2 py-0.5 rounded w-fit">
                                  {scene.badge_text}
                                </div>
                              )}

                              <div className="text-xs text-slate-300 bg-[#070709] p-2.5 rounded-lg border border-[#141622] leading-relaxed">
                                <div className="text-[10px] text-slate-500 font-semibold mb-1 flex items-center gap-1">
                                  <Volume2 className="w-3 h-3 text-pink-400" />
                                  <span>Voiceover Narration:</span>
                                </div>
                                &ldquo;{scene.voiceover_text}&rdquo;
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-[#151724]">
                                <span>Layout: {scene.layout}</span>
                                <span className="text-pink-400 font-mono">Scene {scene.scene_number}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs p-8 text-center">
                      <Film className="w-12 h-12 text-slate-700 mb-3" />
                      <span className="text-slate-400 font-medium">No Google Vids project selected</span>
                      <span className="text-slate-600 mt-1">Select any project from the sidebar or click &quot;Generate Vid&quot; above to create a new storyboard.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE CANVAS */}
          {activeTab === 'canvas' && (
            <div className="flex-1 flex flex-col bg-[#08090E]">
              <div className="px-4 py-2.5 border-b border-[#161824] flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-cyan-400" />
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

          {/* TAB 5: FILES */}
          {activeTab === 'files' && (
            <div className="flex-1 flex overflow-hidden">
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

          {/* TAB 6: CRONS */}
          {activeTab === 'crons' && (
            <div className="flex-1 p-6 overflow-y-auto bg-[#08090E]">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Autonomous 24/7 Crons & Interval Tasks</h3>
                    <p className="text-xs text-slate-400">
                      Background worker triggers tasks continuously without requiring laptop power.
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

          {/* TAB 7: MEMORY */}
          {activeTab === 'memory' && (
            <div className="flex-1 p-6 overflow-y-auto bg-[#08090E]">
              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white">Agent Long-Term State & Memory Files</h3>
                  <p className="text-xs text-slate-400">
                    Read directly from ~/.hermes/MEMORY.md and USER.md (or local RADHA_MEMORY).
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-mono text-purple-300 flex items-center gap-2">
                    <Database className="w-3.5 h-3.5" />
                    <span>MEMORY.md</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#050608] border border-[#161824] text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto select-text">
                    {memoryState.memory_md || 'No MEMORY.md currently initialized.'}
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

      {/* ────────────────── RETAIN SKILL MODAL ────────────────── */}
      {showRetainModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F111A] border border-[#1E2233] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              <span>Retain Task into Hermes SKILL.md</span>
            </h3>
            <p className="text-xs text-slate-400">
              Hermes will synthesize this workflow and write a version-controlled, reusable <code className="text-indigo-300 font-mono">SKILL.md</code> file into <code className="text-indigo-300 font-mono">skills/custom/</code>.
            </p>
            <form onSubmit={handleRetainSkill} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Skill Identifier / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. viral-reels-automation"
                  value={retainTaskName}
                  onChange={(e) => setRetainTaskName(e.target.value)}
                  className="w-full bg-[#151724] border border-[#23273B] text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Goal & Purpose</label>
                <textarea
                  required
                  rows={2}
                  placeholder="What does this skill accomplish?"
                  value={retainGoal}
                  onChange={(e) => setRetainGoal(e.target.value)}
                  className="w-full bg-[#151724] border border-[#23273B] text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Workflow Summary (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Steps and tool sequences executed"
                  value={retainSummary}
                  onChange={(e) => setRetainSummary(e.target.value)}
                  className="w-full bg-[#151724] border border-[#23273B] text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRetainModal(false)}
                  className="flex-1 bg-[#1A1D2D] hover:bg-[#23273B] text-slate-300 text-xs py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2 rounded-lg transition-colors"
                >
                  Save to SKILL.md
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
