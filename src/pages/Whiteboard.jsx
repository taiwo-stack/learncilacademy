import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MousePointer, 
  Pencil, 
  Eraser, 
  Highlighter,
  Zap,
  Minus, 
  ArrowUpRight, 
  Square, 
  Circle, 
  Type, 
  Image as ImageIcon, 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Trash2, 
  Download, 
  Maximize2, 
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Settings,
  Grid,
  Sun,
  Moon,
  Trash,
  Share2,
  Users,
  Mic,
  MicOff,
  Copy,
  Volume2,
  Video,
  VideoOff,
  MonitorPlay
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import '../styles/Whiteboard.css';

// Curated designer color palette for professional online teaching
const PRESET_COLORS = [
  '#ffffff', // Pure White
  '#1e293b', // Slate Charcoal
  '#6366f1', // Premium Indigo
  '#3b82f6', // Bright Sky Blue
  '#10b981', // Emerald Green
  '#eab308', // Lemon Yellow
  '#f97316', // Coral Orange
  '#f43f5e', // Rose Crimson
  '#a855f7', // Amethyst Purple
  '#06b6d4'  // Deep Teal
];

const ANIMAL_NAMES = ['Fox', 'Owl', 'Koala', 'Panda', 'Dolphin', 'Tiger', 'Rabbit', 'Eagle', 'Cheetah', 'Falcon'];
const ADJECTIVES = ['Creative', 'Smart', 'Curious', 'Active', 'Friendly', 'Joyful', 'Bright', 'Clever'];
const generateRandomName = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)];
  return `${adj} ${animal}`;
};
const AVATAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#ef4444', '#14b8a6'];

export default function Whiteboard() {
  const navigate = useNavigate();

  // Collaboration States
  const [roomId, setRoomId] = useState(null);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [hasDrawAccess, setHasDrawAccess] = useState(true);
  const [userName, setUserName] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [participants, setParticipants] = useState({});
  const [isMicOn, setIsMicOn] = useState(false);
  const [showCollabSidebar, setShowCollabSidebar] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Connection & Media Refs
  const localUserId = useRef('user-' + Math.random().toString(36).substr(2, 9));
  const userColor = useRef(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
  const channelRef = useRef(null);
  const peerConnectionsRef = useRef({}); // { peerId: RTCPeerConnection }
  const activeDrawingsRef = useRef({}); // { userId: { points, color, width, isHighlighter } }
  const participantsRef = useRef({}); // Mirror participants state for draw loop access
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null); // <video> element for local camera preview
  const remoteVideoRefs = useRef({}); // { peerId: HTMLVideoElement }

  // Video call states
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [showVideoGrid, setShowVideoGrid] = useState(false);
  const [remoteVideoStreams, setRemoteVideoStreams] = useState({}); // { peerId: MediaStream }

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Audio level analysis
  const audioCtxRef = useRef(null);          // shared AudioContext
  const localAnalyserRef = useRef(null);     // AnalyserNode for local mic
  const remoteAnalysersRef = useRef({});     // { peerId: AnalyserNode }
  const levelRafRef = useRef(null);          // requestAnimationFrame ID for level loop
  const [micLevel, setMicLevel] = useState(0);         // 0-100 RMS level for local mic
  const [speakingPeers, setSpeakingPeers] = useState(new Set()); // set of peerId strings

  // Participant strip (right side)
  const [showParticipantStrip, setShowParticipantStrip] = useState(true);


  // Layout & Settings State
  const [theme, setTheme] = useState('dark'); // 'light' | 'dark'
  const [gridType, setGridType] = useState('dots'); // 'blank' | 'dots' | 'lines' | 'graph'
  const [activeTool, setActiveTool] = useState('pen'); // 'select' | 'pen' | 'eraser' | 'line' | 'arrow' | 'rectangle' | 'circle' | 'text' | 'highlighter' | 'laser'
  const [activeColor, setActiveColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [fillMode, setFillMode] = useState('none'); // 'none' | 'semi' | 'solid'
  const [fontSize, setFontSize] = useState(24);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [isPressureSensitive, setIsPressureSensitive] = useState(true);

  // Minimization States for Fullscreen Writing Space
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(false);

  // Hover states for elements & handles under 'select' tool
  const [hoveredElement, setHoveredElement] = useState(null);
  const [hoveredResizeHandle, setHoveredResizeHandle] = useState(false);

  // Laser Pointer trail references & animation frame tracker
  const laserPointsRef = useRef([]);
  const laserAnimationRef = useRef(null);
  const laserPointerPos = useRef({ x: 0, y: 0, over: false });

  // View State (Pan & Zoom)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Stylus / Pen State Display
  const [pointerType, setPointerType] = useState('mouse');
  const [pointerPressure, setPointerPressure] = useState(0);

  // Multi-page Slide State — persisted to localStorage per room
  const STORAGE_KEY = () => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room') || 'solo';
    return `wb-pages-${room}`;
  };

  const loadPersistedPages = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY());
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return [{ id: 'page-1', elements: [], undoStack: [], redoStack: [] }];
  };

  const [pages, setPages] = useState(loadPersistedPages);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);


  // Active slide state (mirrors current page elements and history)
  const [elements, setElements] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Sync active page elements & history to pages array whenever they update
  useEffect(() => {
    setPages(prev => {
      if (prev[currentPageIndex] && 
          (prev[currentPageIndex].elements !== elements ||
           prev[currentPageIndex].undoStack !== undoStack ||
           prev[currentPageIndex].redoStack !== redoStack)) {
        const next = [...prev];
        next[currentPageIndex] = {
          ...next[currentPageIndex],
          elements,
          undoStack,
          redoStack
        };
        return next;
      }
      return prev;
    });
  }, [elements, undoStack, redoStack, currentPageIndex]);

  // Persist pages to localStorage on every change (debounced to avoid thrashing)
  useEffect(() => {
    try {
      // Strip undo/redo stacks from storage to keep payload small
      const toStore = pages.map(p => ({ id: p.id, elements: p.elements }));
      localStorage.setItem(STORAGE_KEY(), JSON.stringify(toStore));
    } catch (_) {}
  }, [pages]);

  // On first mount: load persisted elements into active drawing state
  useEffect(() => {
    const persisted = loadPersistedPages();
    const firstPage = persisted[0];
    if (firstPage?.elements?.length) {
      setElements(firstPage.elements);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);
  const [currentShape, setCurrentShape] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [resizeMode, setResizeMode] = useState(null); // 'se' (south-east resize handle)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Text Tool State
  const [editingText, setEditingText] = useState(null); // { id, x, y, screenX, screenY, value }

  // Drag & Drop File State
  const [isDragOver, setIsDragOver] = useState(false);

  // Modal Dialogs
  const [showClearModal, setShowClearModal] = useState(false);

  // Cache loaded images in memory to prevent canvas redraw flashing
  const imageCache = useRef({});

  // Prevent body scrolling when the whiteboard is mounted
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Sync background state with color defaults
  useEffect(() => {
    if (theme === 'dark' && activeColor === '#000000') {
      setActiveColor('#ffffff');
    } else if (theme === 'light' && activeColor === '#ffffff') {
      setActiveColor('#000000');
    }
  }, [theme]);

  // Re-wire local camera stream whenever a video panel is shown/hidden
  useEffect(() => {
    if (isVideoOn && localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [showParticipantStrip, showVideoGrid, isVideoOn]);



  // Toast notifications
  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // On mount: check room ID, join collaboration automatically if URL link exists
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomId(roomParam);
      setIsHost(false);
      setHasDrawAccess(false); // Guest default read-only
      setShowNameModal(true); // Ask guest for name
    } else {
      setIsHost(true);
      setHasDrawAccess(true);
      setUserName('Host Tutor');
    }

    return () => {
      // Cleanup WebRTC and Supabase channel on unmount
      closeAllPeerConnections();
      stopLocalStream();
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, []);

  const updatePresenceState = async (updates = {}) => {
    if (!channelRef.current) return;
    await channelRef.current.track({
      userId: localUserId.current,
      userName: userName,
      isHost: isHost,
      hasDrawAccess: isHost ? true : hasDrawAccess,
      color: userColor.current,
      isMicOn: isMicOn,
      isVideoOn: isVideoOn,
      cursor: null,
      ...updates
    });
  };

  const startCollaboration = async (id, chosenName) => {
    if (!supabase) {
      alert("Supabase configuration not detected. Multiplayer collaboration is unavailable.");
      return;
    }

    const name = chosenName || userName || generateRandomName();
    setUserName(name);
    setRoomId(id);
    setIsCollaborating(true);
    setShowNameModal(false);

    // Update browser URL query parameter without page reload
    const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?room=${id}`;
    window.history.replaceState({ path: newurl }, '', newurl);

    const channel = supabase.channel('room-' + id, {
      config: {
        presence: {
          key: localUserId.current,
        },
      },
    });

    channelRef.current = channel;

    // Track participant joins/leaves
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const mapped = {};
      Object.keys(state).forEach(key => {
        mapped[key] = state[key][0];
      });
      setParticipants(mapped);
      participantsRef.current = mapped;
      
      // Update WebRTC voice streams
      syncVoicePeers(mapped);
      drawCanvas();
    });

    // Handle broadcast signals
    channel.on('broadcast', { event: '*' }, ({ event, payload }) => {
      handleBroadcastEvent(event, payload);
    });

    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userId: localUserId.current,
          userName: name,
          isHost: isHost,
          hasDrawAccess: isHost ? true : hasDrawAccess,
          color: userColor.current,
          isMicOn: isMicOn,
          isVideoOn: isVideoOn,
          cursor: null
        });
        triggerToast(`Connected to room! Welcome ${name}.`);
      }
    });
  };

  const initiateRoomCollab = () => {
    const roomUuid = 'room-' + Math.random().toString(36).substr(2, 9);
    startCollaboration(roomUuid, userName || 'Host Tutor');
  };

  const updateCurrentPageElements = (newElements) => {
    setPages(prev => {
      const updated = [...prev];
      if (updated[currentPageIndex]) {
        updated[currentPageIndex].elements = newElements;
      }
      return updated;
    });
  };

  const broadcastDrawingStroke = (points, color, width, isHighlighter) => {
    if (!channelRef.current) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'drawing-stroke',
      payload: { userId: localUserId.current, points, color, width, isHighlighter }
    });
  };

  const broadcastDrawingEnd = (element) => {
    if (!channelRef.current) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'drawing-end',
      payload: { userId: localUserId.current, element }
    });
  };

  const broadcastElementsUpdate = (updatedElements) => {
    if (!channelRef.current) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'element-update',
      payload: { action: 'update-all', elements: updatedElements }
    });
  };

  const broadcastElementsClear = () => {
    if (!channelRef.current) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'element-update',
      payload: { action: 'clear' }
    });
  };

  const lastCursorBroadcastRef = useRef(0);
  const broadcastCursor = (clientX, clientY) => {
    if (!isCollaborating || !channelRef.current || !canvasRef.current) return;
    const now = Date.now();
    if (now - lastCursorBroadcastRef.current < 80) return; // Throttle cursor events
    lastCursorBroadcastRef.current = now;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / zoom;
    const y = (clientY - rect.top - pan.y) / zoom;

    channelRef.current.send({
      type: 'broadcast',
      event: 'peer-cursor',
      payload: { userId: localUserId.current, cursor: { x, y } }
    });
  };

  const toggleParticipantDrawAccess = (peerId, currentAccess) => {
    if (!isHost || !channelRef.current) return;
    const nextAccess = !currentAccess;
    channelRef.current.send({
      type: 'broadcast',
      event: 'access-changed',
      payload: { targetUserId: peerId, hasDrawAccess: nextAccess }
    });
    
    // Also trigger local state indicator redraw
    setParticipants(prev => {
      const next = { ...prev };
      if (next[peerId]) {
        next[peerId].hasDrawAccess = nextAccess;
      }
      return next;
    });
  };

  const handleBroadcastEvent = (event, payload) => {
    switch (event) {
      case 'drawing-stroke':
        activeDrawingsRef.current[payload.userId] = {
          type: 'stroke',
          points: payload.points,
          color: payload.color,
          width: payload.width,
          isHighlighter: payload.isHighlighter
        };
        drawCanvas();
        break;

      case 'drawing-end':
        delete activeDrawingsRef.current[payload.userId];
        setElements(prev => {
          const next = [...prev, payload.element];
          updateCurrentPageElements(next);
          return next;
        });
        break;

      case 'element-update':
        if (payload.action === 'clear') {
          setElements([]);
          updateCurrentPageElements([]);
          setSelectedElement(null);
        } else if (payload.action === 'update-all') {
          setElements(payload.elements);
          updateCurrentPageElements(payload.elements);
        }
        drawCanvas();
        break;

      case 'page-change':
        if (!isHost) {
          setCurrentPageIndex(payload.pageIndex);
          const page = pages[payload.pageIndex];
          if (page) {
            setElements(page.elements || []);
          }
        }
        break;

      case 'access-changed':
        if (payload.targetUserId === localUserId.current) {
          setHasDrawAccess(payload.hasDrawAccess);
          updatePresenceState({ hasDrawAccess: payload.hasDrawAccess });
          triggerToast(payload.hasDrawAccess ? "Drawing access GRANTED by host!" : "Drawing access REVOKED by host.");
        }
        break;

      case 'peer-cursor':
        if (participantsRef.current[payload.userId]) {
          participantsRef.current[payload.userId].cursor = payload.cursor;
          drawCanvas();
        }
        break;

      // WebRTC voice chat signaling
      case 'webrtc-offer':
        if (payload.targetUserId === localUserId.current) {
          handleWebRTCOffer(payload.offer, payload.senderUserId);
        }
        break;
      case 'webrtc-answer':
        if (payload.targetUserId === localUserId.current) {
          handleWebRTCAnswer(payload.answer, payload.senderUserId);
        }
        break;
      case 'webrtc-ice':
        if (payload.targetUserId === localUserId.current) {
          handleWebRTCIce(payload.candidate, payload.senderUserId);
        }
        break;

      default:
        break;
    }
  };

  // WebRTC Audio + Video Stream Helpers
  const getLocalStream = async (constraints = {}) => {
    // If existing stream already has the right tracks, reuse it
    if (localStreamRef.current) {
      const hasMic = localStreamRef.current.getAudioTracks().length > 0;
      const hasCam = localStreamRef.current.getVideoTracks().length > 0;
      const needsMic = constraints.audio !== false;
      const needsCam = constraints.video !== false && !!constraints.video;
      if ((hasMic || !needsMic) && (hasCam || !needsCam)) {
        return localStreamRef.current;
      }
      // Stop and re-acquire with new constraints
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      return stream;
    } catch (e) {
      console.error("Media capture failed", e);
      if (constraints.video) {
        triggerToast("Camera access failed! Please allow camera permissions.");
        setIsVideoOn(false);
      } else {
        triggerToast("Microphone access failed! Please allow microphone access.");
        setIsMicOn(false);
      }
      return null;
    }
  };

  const stopLocalStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    // Clear local video preview
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  // ─── Audio Level Helpers ─────────────────────────────────────────
  const getAudioContext = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const createAnalyserForStream = (stream) => {
    const ctx = getAudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.7;
    source.connect(analyser);
    return analyser;
  };

  const getRMS = (analyser) => {
    const buf = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    return Math.sqrt(sum / buf.length);
  };

  const startLevelLoop = () => {
    if (levelRafRef.current) return; // already running
    const SPEAKING_THRESHOLD = 0.015;
    const tick = () => {
      // Local mic level
      if (localAnalyserRef.current) {
        const rms = getRMS(localAnalyserRef.current);
        setMicLevel(Math.min(100, Math.round(rms * 600)));
      }
      // Remote peer speaking detection
      const talking = new Set();
      Object.entries(remoteAnalysersRef.current).forEach(([pid, analyser]) => {
        if (getRMS(analyser) > SPEAKING_THRESHOLD) talking.add(pid);
      });
      setSpeakingPeers(talking);
      levelRafRef.current = requestAnimationFrame(tick);
    };
    levelRafRef.current = requestAnimationFrame(tick);
  };

  const stopLevelLoop = () => {
    if (levelRafRef.current) {
      cancelAnimationFrame(levelRafRef.current);
      levelRafRef.current = null;
    }
    setMicLevel(0);
    setSpeakingPeers(new Set());
  };

  const attachRemoteAnalyser = (peerId, stream) => {
    if (remoteAnalysersRef.current[peerId]) return;
    try {
      remoteAnalysersRef.current[peerId] = createAnalyserForStream(stream);
      startLevelLoop();
    } catch (_) {}
  };


  const syncMediaPeers = async (presenceMap) => {
    if (!isMicOn && !isVideoOn) return;
    const constraints = {
      audio: isMicOn,
      video: isVideoOn ? { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15 } } : false
    };
    const stream = await getLocalStream(constraints);
    if (!stream) return;

    // Wire local video preview
    if (isVideoOn && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    Object.keys(presenceMap).forEach(peerId => {
      if (peerId === localUserId.current) return;
      if (!peerConnectionsRef.current[peerId]) {
        const isInitiator = localUserId.current > peerId;
        createPeerConnection(peerId, isInitiator);
      } else {
        // Add new tracks to existing connections if renegotiation needed
        const pc = peerConnectionsRef.current[peerId];
        stream.getTracks().forEach(track => {
          const senders = pc.getSenders();
          const alreadySending = senders.some(s => s.track && s.track.kind === track.kind);
          if (!alreadySending) {
            pc.addTrack(track, stream);
          }
        });
      }
    });
  };

  // Keep backward-compat alias
  const syncVoicePeers = syncMediaPeers;

  const createPeerConnection = async (peerId, isInitiator) => {
    if (peerConnectionsRef.current[peerId]) return;

    const pcConfig = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };

    const pc = new RTCPeerConnection(pcConfig);
    peerConnectionsRef.current[peerId] = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.onicecandidate = (e) => {
      if (e.candidate && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'webrtc-ice',
          payload: { candidate: e.candidate, targetUserId: peerId, senderUserId: localUserId.current }
        });
      }
    };

    pc.ontrack = (e) => {
      const stream = e.streams[0];
      if (!stream) return;

      // Separate audio and video tracks
      const hasVideo = stream.getVideoTracks().length > 0;

      if (hasVideo) {
        // Update React state to trigger video grid render
        setRemoteVideoStreams(prev => ({ ...prev, [peerId]: stream }));
        setShowVideoGrid(true);

        // Wire video element ref if already mounted
        if (remoteVideoRefs.current[peerId]) {
          remoteVideoRefs.current[peerId].srcObject = stream;
        }
      } else {
        // Audio-only — use invisible audio element
        let audio = document.getElementById('peer-audio-' + peerId);
        if (!audio) {
          audio = document.createElement('audio');
          audio.id = 'peer-audio-' + peerId;
          audio.autoplay = true;
          document.body.appendChild(audio);
        }
        audio.srcObject = stream;
        // Attach audio analyser for speaking detection
        attachRemoteAnalyser(peerId, stream);
      }
    };

    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'webrtc-offer',
            payload: { offer, targetUserId: peerId, senderUserId: localUserId.current }
          });
        }
      } catch (e) {
        console.error("Error creating WebRTC P2P offer", e);
      }
    }
  };

  const handleWebRTCOffer = async (offer, senderUserId) => {
    if (!peerConnectionsRef.current[senderUserId]) {
      await createPeerConnection(senderUserId, false);
    }
    const pc = peerConnectionsRef.current[senderUserId];
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'webrtc-answer',
          payload: { answer, targetUserId: senderUserId, senderUserId: localUserId.current }
        });
      }
    } catch (e) {
      console.error("Error setting WebRTC P2P offer description", e);
    }
  };

  const handleWebRTCAnswer = async (answer, senderUserId) => {
    const pc = peerConnectionsRef.current[senderUserId];
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (e) {
        console.error("Error setting WebRTC remote answer", e);
      }
    }
  };

  const handleWebRTCIce = async (candidate, senderUserId) => {
    const pc = peerConnectionsRef.current[senderUserId];
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error setting ICE candidate description", e);
      }
    }
  };

  const closeAllPeerConnections = () => {
    Object.keys(peerConnectionsRef.current).forEach(peerId => {
      peerConnectionsRef.current[peerId].close();
      const audioEl = document.getElementById('peer-audio-' + peerId);
      if (audioEl) audioEl.remove();
    });
    peerConnectionsRef.current = {};
    remoteAnalysersRef.current = {};
    setRemoteVideoStreams({});
  };

  const toggleMicrophone = async () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);

    if (nextState) {
      const constraints = {
        audio: true,
        video: isVideoOn ? { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15 } } : false
      };
      const stream = await getLocalStream(constraints);
      if (stream) {
        stream.getAudioTracks().forEach(t => { t.enabled = true; });
        // Set up local audio analyser for the level indicator
        if (!localAnalyserRef.current) {
          try {
            localAnalyserRef.current = createAnalyserForStream(stream);
          } catch (_) {}
        }
        startLevelLoop();
        if (isCollaborating) {
          syncMediaPeers(participants);
          updatePresenceState({ isMicOn: true });
        }
      }
    } else {
      // Disable audio tracks (keep video if on)
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = false; });
      }
      localAnalyserRef.current = null;
      if (!isVideoOn) {
        stopLocalStream();
        closeAllPeerConnections();
      }
      stopLevelLoop();
      updatePresenceState({ isMicOn: false });
    }
  };


  const toggleCamera = async () => {
    const nextState = !isVideoOn;
    setIsVideoOn(nextState);
    setShowVideoGrid(nextState || Object.keys(remoteVideoStreams).length > 0);

    if (nextState) {
      const constraints = {
        audio: isMicOn,
        video: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15 } }
      };
      const stream = await getLocalStream(constraints);
      if (stream) {
        // Wire local video preview element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        if (isCollaborating) {
          // Need to renegotiate: close existing PCs so they restart with video tracks
          closeAllPeerConnections();
          syncMediaPeers(participants);
        }
        updatePresenceState({ isVideoOn: true });
        triggerToast('Camera ON — peers can now see you.');
      }
    } else {
      // Stop video tracks only
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(t => { t.stop(); });
        // Remove stopped video tracks from the stream
        localStreamRef.current.getVideoTracks().forEach(t => localStreamRef.current.removeTrack(t));
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (!isMicOn) {
        stopLocalStream();
        closeAllPeerConnections();
      }
      updatePresenceState({ isVideoOn: false });
      triggerToast('Camera OFF.');
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      triggerToast("Room share link copied to clipboard!");
    });
  };

  // Adjust canvas bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      drawCanvas();
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial setup

    return () => window.removeEventListener('resize', handleResize);
  }, [elements, zoom, pan, currentStroke, currentShape, selectedElement, theme, gridType]);

  // Redraw Canvas whenever relevant elements update
  useEffect(() => {
    drawCanvas();
  }, [elements, zoom, pan, currentStroke, currentShape, selectedElement, theme, gridType]);

  // Helper to convert screen mouse/touch pointer position to world canvas coordinates
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    return {
      screenX,
      screenY,
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom
    };
  };

  // Helper to determine canvas cursor styling dynamically
  const getCanvasCursor = () => {
    if (isPanning) return 'grabbing';
    if (activeTool === 'select') {
      if (hoveredResizeHandle) return 'se-resize';
      if (hoveredElement) return 'move';
      return 'default';
    }
    if (activeTool === 'eraser') return 'cell';
    if (activeTool === 'text') return 'text';
    if (activeTool === 'laser') return 'none'; // Draw custom pointer core instead
    return 'crosshair';
  };

  // Laser Pointer fading animation loop (runs in requestAnimationFrame for high performance)
  const updateLaser = () => {
    const now = Date.now();
    // Keeps laser points for 1.2s before fading completely
    laserPointsRef.current = laserPointsRef.current.filter(p => now - p.time < 1200);

    drawCanvas();

    if (laserPointsRef.current.length > 0) {
      laserAnimationRef.current = requestAnimationFrame(updateLaser);
    } else {
      laserAnimationRef.current = null;
    }
  };

  // Check if pointer is near/within an element (Hit Testing)
  const getElementAtPosition = (x, y) => {
    // Search elements in reverse order (top to bottom visual layers)
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.type === 'image') {
        const padding = 10;
        if (x >= el.x - padding && x <= el.x + el.width + padding &&
            y >= el.y - padding && y <= el.y + el.height + padding) {
          // Check if user clicked the resize handle (bottom right corner, 15px box)
          const handleSize = 15;
          const isNearResize = (x >= el.x + el.width - handleSize && x <= el.x + el.width + handleSize &&
                                y >= el.y + el.height - handleSize && y <= el.y + el.height + handleSize);
          return { element: el, type: isNearResize ? 'resize' : 'drag' };
        }
      } else if (el.type === 'text') {
        const padding = 10;
        // Text hit boundary calculation is an estimation based on font size and text length
        const estWidth = el.text.length * (el.fontSize * 0.55);
        const estHeight = el.fontSize;
        if (x >= el.x - padding && x <= el.x + estWidth + padding &&
            y >= el.y - estHeight - padding && y <= el.y + padding) {
          const handleSize = 15;
          const isNearResize = (x >= el.x + estWidth - handleSize && x <= el.x + estWidth + handleSize &&
                                y >= el.y - estHeight - handleSize && y <= el.y + handleSize);
          return { element: el, type: isNearResize ? 'resize' : 'drag' };
        }
      } else if (el.type === 'shape') {
        if (el.shapeType === 'rectangle') {
          const minX = Math.min(el.x1, el.x2);
          const maxX = Math.max(el.x1, el.x2);
          const minY = Math.min(el.y1, el.y2);
          const maxY = Math.max(el.y1, el.y2);
          
          // If filled shape, hit testing is easy
          if (el.fill && el.fill !== 'none') {
            if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
              return { element: el, type: 'drag' };
            }
          } else {
            // Outline hit test
            const borderDistance = 8;
            const onTop = Math.abs(y - minY) < borderDistance && x >= minX && x <= maxX;
            const onBottom = Math.abs(y - maxY) < borderDistance && x >= minX && x <= maxX;
            const onLeft = Math.abs(x - minX) < borderDistance && y >= minY && y <= maxY;
            const onRight = Math.abs(x - maxX) < borderDistance && y >= minY && y <= maxY;
            if (onTop || onBottom || onLeft || onRight) {
              return { element: el, type: 'drag' };
            }
          }
        } else if (el.shapeType === 'circle') {
          const cx = el.x1;
          const cy = el.y1;
          const r = Math.hypot(el.x2 - el.x1, el.y2 - el.y1);
          const dist = Math.hypot(x - cx, y - cy);
          
          if (el.fill && el.fill !== 'none') {
            if (dist <= r) return { element: el, type: 'drag' };
          } else {
            if (Math.abs(dist - r) < 8) return { element: el, type: 'drag' };
          }
        } else if (el.shapeType === 'line' || el.shapeType === 'arrow') {
          // Distance from point to line segment
          const A = x - el.x1;
          const B = y - el.y1;
          const C = el.x2 - el.x1;
          const D = el.y2 - el.y1;

          const dot = A * C + B * D;
          const lenSq = C * C + D * D;
          let param = -1;
          if (lenSq !== 0) param = dot / lenSq;

          let xx, yy;
          if (param < 0) {
            xx = el.x1;
            yy = el.y1;
          } else if (param > 1) {
            xx = el.x2;
            yy = el.y2;
          } else {
            xx = el.x1 + param * C;
            yy = el.y1 + param * D;
          }

          const dist = Math.hypot(x - xx, y - yy);
          if (dist < 8) return { element: el, type: 'drag' };
        }
      } else if (el.type === 'stroke') {
        // Proximity hit test for freehand strokes
        const threshold = el.width / 2 + 10;
        const isNear = el.points.some(p => Math.hypot(p.x - x, p.y - y) < threshold);
        if (isNear) {
          return { element: el, type: 'drag' };
        }
      }
    }
    return null;
  };

  // Smart smoothing point low-pass filter
  const getSmoothedPoint = (currentRaw, points) => {
    if (!points || points.length === 0) return currentRaw;
    const last = points[points.length - 1];
    
    // Low-pass filter coefficient (smoothing factor): 0.4 makes the pen smooth out jitter
    const k = 0.45; 
    return {
      x: last.x + (currentRaw.x - last.x) * k,
      y: last.y + (currentRaw.y - last.y) * k,
      pressure: currentRaw.pressure
    };
  };

  // Push new state to undo history
  const pushToHistory = (newElements) => {
    setUndoStack(prev => [...prev, elements]);
    setElements(newElements);
    setRedoStack([]); // Clear redo stack on new action
    
    // Update slide page elements
    updateCurrentPageElements(newElements);
  };

  // Undo operation
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack([elements, ...redoStack]);
    setElements(prev);
    setSelectedElement(null);

    // Sync slide and broadcast update
    updateCurrentPageElements(prev);
    broadcastElementsUpdate(prev);
  };

  // Redo operation
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack(redoStack.slice(1));
    setUndoStack([...undoStack, elements]);
    setElements(next);

    // Sync slide and broadcast update
    updateCurrentPageElements(next);
    broadcastElementsUpdate(next);
  };

  // Slide / Page Management
  const handleAddPage = () => {
    // 1. Save current page state first
    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...updatedPages[currentPageIndex],
      elements,
      undoStack,
      redoStack
    };

    // 2. Append new blank page
    const newPageId = `page-${Date.now()}`;
    const newPage = { id: newPageId, elements: [], undoStack: [], redoStack: [] };
    const nextPages = [...updatedPages, newPage];
    setPages(nextPages);

    // 3. Move to new page
    setCurrentPageIndex(updatedPages.length);
    setElements([]);
    setUndoStack([]);
    setRedoStack([]);
    setSelectedElement(null);
  };

  const navigatePages = (targetIndex) => {
    if (targetIndex < 0 || targetIndex >= pages.length) return;
    
    // Save current page state
    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...updatedPages[currentPageIndex],
      elements,
      undoStack,
      redoStack
    };
    setPages(updatedPages);

    // Load target page state
    const targetPage = updatedPages[targetIndex];
    setCurrentPageIndex(targetIndex);
    setElements(targetPage.elements || []);
    setUndoStack(targetPage.undoStack || []);
    setRedoStack(targetPage.redoStack || []);
    setSelectedElement(null);

    // Broadcast page-change if host
    if (isCollaborating && isHost && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'page-change',
        payload: { pageIndex: targetIndex }
      });
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex === 0) return;
    navigatePages(currentPageIndex - 1);
  };

  const handleNextPage = () => {
    if (currentPageIndex === pages.length - 1) {
      handleAddPage();
    } else {
      navigatePages(currentPageIndex + 1);
    }
  };

  const handleDeletePage = () => {
    if (pages.length <= 1) return; // Cannot delete last remaining page
    
    const updatedPages = pages.filter((_, idx) => idx !== currentPageIndex);
    setPages(updatedPages);

    // Navigate to previous page or index 0
    const newIdx = Math.max(0, currentPageIndex - 1);
    setCurrentPageIndex(newIdx);
    
    const targetPage = updatedPages[newIdx];
    setElements(targetPage.elements || []);
    setUndoStack(targetPage.undoStack || []);
    setRedoStack(targetPage.redoStack || []);
    setSelectedElement(null);
  };

  // Pointer Down event handler
  const handlePointerDown = (e) => {
    if (editingText) {
      finishTextInput();
      return;
    }

    setPointerType(e.pointerType);
    setPointerPressure(e.pressure || 0.5);

    // If middle click or space key drag is active, trigger panning
    if (e.button === 1 || isPanning) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    // Collaboration draw access lock
    if (isCollaborating && !hasDrawAccess) {
      triggerToast("Drawing locked! Ask the tutor (host) to grant you drawing access.");
      return;
    }

    const { x, y, screenX, screenY } = getCanvasCoords(e);

    // ERASER: Stroke / element eraser checks intersection and deletes (restricted to strokes and text)
    if (activeTool === 'eraser') {
      const hit = getElementAtPosition(x, y);
      if (hit && (hit.element.type === 'stroke' || hit.element.type === 'text')) {
        const remaining = elements.filter(el => el.id !== hit.element.id);
        pushToHistory(remaining);
      }
      setIsDrawing(true);
      return;
    }

    // SELECT: Moving or Resizing elements
    if (activeTool === 'select') {
      const hit = getElementAtPosition(x, y);
      if (hit) {
        setSelectedElement(hit.element);
        setDragStart({ x: x, y: y });
        if (hit.type === 'resize') {
          setResizeMode('se');
        } else {
          setResizeMode(null);
        }
        setIsDrawing(true);
      } else {
        setSelectedElement(null);
      }
      return;
    }

    // TEXT: Add new text element
    if (activeTool === 'text') {
      // Find if clicked existing text to edit it
      const hit = getElementAtPosition(x, y);
      if (hit && hit.element.type === 'text') {
        const textEl = hit.element;
        setEditingText({
          id: textEl.id,
          x: textEl.x,
          y: textEl.y,
          screenX,
          screenY,
          value: textEl.text
        });
        // Temp hide during editing
        setElements(elements.filter(el => el.id !== textEl.id));
      } else {
        setEditingText({
          id: Date.now().toString(),
          x,
          y,
          screenX,
          screenY,
          value: ''
        });
      }
      return;
    }

    // PEN: Start handwriting drawing
    if (activeTool === 'pen') {
      setIsDrawing(true);
      const firstPoint = { x, y, pressure: e.pressure || 0.5 };
      setCurrentStroke({
        id: Date.now().toString(),
        type: 'stroke',
        points: [firstPoint],
        color: activeColor,
        width: strokeWidth
      });
      return;
    }

    // HIGHLIGHTER: Start semi-transparent highlight stroke
    if (activeTool === 'highlighter') {
      setIsDrawing(true);
      const firstPoint = { x, y, pressure: e.pressure || 0.5 };
      setCurrentStroke({
        id: Date.now().toString(),
        type: 'stroke',
        points: [firstPoint],
        color: activeColor,
        width: strokeWidth * 2.5, // Highlighter is thicker
        isHighlighter: true
      });
      return;
    }

    // LASER POINTER: Add a temporary point, trigger animation loop
    if (activeTool === 'laser') {
      setIsDrawing(true);
      laserPointsRef.current = [{ x, y, time: Date.now() }];
      laserPointerPos.current = { x, y, over: true };
      if (!laserAnimationRef.current) {
        laserAnimationRef.current = requestAnimationFrame(updateLaser);
      }
      return;
    }

    // SHAPES: Draw Line, Arrow, Rect, Circle (with Snap to Grid check)
    if (['line', 'arrow', 'rectangle', 'circle'].includes(activeTool)) {
      setIsDrawing(true);
      let shapeX = x;
      let shapeY = y;
      if (snapToGrid) {
        shapeX = Math.round(x / 24) * 24;
        shapeY = Math.round(y / 24) * 24;
      }
      setCurrentShape({
        id: Date.now().toString(),
        type: 'shape',
        shapeType: activeTool,
        x1: shapeX,
        y1: shapeY,
        x2: shapeX,
        y2: shapeY,
        color: activeColor,
        width: strokeWidth,
        fill: fillMode
      });
      return;
    }
  };

  // Pointer Move event handler
  const handlePointerMove = (e) => {
    setPointerPressure(e.pressure || 0);

    // Broadcast cursor position to peers
    broadcastCursor(e.clientX, e.clientY);

    const { x, y } = getCanvasCoords(e);

    // Canvas panning
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    // Update hover states when pointer is moving but NOT drawing
    if (!isDrawing) {
      // 1. SELECT tool hover tests
      if (activeTool === 'select') {
        const hit = getElementAtPosition(x, y);
        if (hit) {
          setHoveredElement(hit.element);
          setHoveredResizeHandle(hit.type === 'resize');
        } else {
          setHoveredElement(null);
          setHoveredResizeHandle(false);
        }
      }
      
      // 2. LASER pointer cursor tracking
      if (activeTool === 'laser') {
        laserPointerPos.current = { x, y, over: true };
        drawCanvas();
      } else {
        laserPointerPos.current.over = false;
      }
      return;
    }

    // ERASER: Wipe elements when moving eraser (restricted to strokes and text)
    if (activeTool === 'eraser') {
      const hit = getElementAtPosition(x, y);
      if (hit && (hit.element.type === 'stroke' || hit.element.type === 'text')) {
        const remaining = elements.filter(el => el.id !== hit.element.id);
        setElements(remaining);
      }
      return;
    }

    // SELECT: Move or resize the selected element
    if (activeTool === 'select' && selectedElement) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      
      setElements(elements.map(el => {
        if (el.id === selectedElement.id) {
          if (resizeMode === 'se') {
            if (el.type === 'image') {
              return {
                ...el,
                width: Math.max(20, el.width + dx),
                height: Math.max(20, el.height + dy)
              };
            } else if (el.type === 'text') {
              // Font size adjustment for text elements based on dragging
              const newFontSize = Math.max(10, el.fontSize + dx * 0.4);
              return {
                ...el,
                fontSize: newFontSize
              };
            }
          } else {
            // Drag move
            if (el.type === 'shape') {
              return {
                ...el,
                x1: el.x1 + dx,
                y1: el.y1 + dy,
                x2: el.x2 + dx,
                y2: el.y2 + dy
              };
            } else if (el.type === 'stroke') {
              return {
                ...el,
                points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy, pressure: p.pressure }))
              };
            } else {
              return {
                ...el,
                x: el.x + dx,
                y: el.y + dy
              };
            }
          }
        }
        return el;
      }));

      // Update drag start position to cursor position for cumulative dragging
      setDragStart({ x, y });
      return;
    }

    // PEN / HIGHLIGHTER: Add points with jitter smoothing filter
    if (['pen', 'highlighter'].includes(activeTool) && currentStroke) {
      const rawPoint = { x, y, pressure: e.pressure || 0.5 };
      const smoothed = getSmoothedPoint(rawPoint, currentStroke.points);
      
      const nextPoints = [...currentStroke.points, smoothed];
      setCurrentStroke(prev => ({
        ...prev,
        points: nextPoints
      }));

      // Broadcast live drawing points
      broadcastDrawingStroke(nextPoints, currentStroke.color, currentStroke.width, currentStroke.isHighlighter);
      return;
    }

    // LASER POINTER: Add fading points on drag
    if (activeTool === 'laser') {
      laserPointsRef.current.push({ x, y, time: Date.now() });
      laserPointerPos.current = { x, y, over: true };
      if (!laserAnimationRef.current) {
        laserAnimationRef.current = requestAnimationFrame(updateLaser);
      }
      return;
    }

    // SHAPES: Update boundary coordinate (with Snap to Grid check)
    if (currentShape) {
      let shapeX = x;
      let shapeY = y;
      if (snapToGrid) {
        shapeX = Math.round(shapeX / 24) * 24;
        shapeY = Math.round(shapeY / 24) * 24;
      }
      setCurrentShape(prev => ({
        ...prev,
        x2: shapeX,
        y2: shapeY
      }));
      return;
    }
  };

  // Pointer Up event handler
  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    setIsDrawing(false);

    if (activeTool === 'eraser' && isDrawing) {
      setUndoStack(prev => [...prev, elements]);
      setRedoStack([]);
      // Broadcast elements state after eraser wipe
      broadcastElementsUpdate(elements);
      return;
    }

    if (activeTool === 'select' && selectedElement) {
      // Finished drag/resize, save state in history
      pushToHistory(elements);
      // Broadcast updated layout
      broadcastElementsUpdate(elements);
      return;
    }

    if (['pen', 'highlighter'].includes(activeTool) && currentStroke) {
      // Only keep if the stroke actually contains points
      if (currentStroke.points.length > 0) {
        pushToHistory([...elements, currentStroke]);
        // Broadcast finished drawing stroke
        broadcastDrawingEnd(currentStroke);
      }
      setCurrentStroke(null);
      return;
    }

    if (currentShape) {
      pushToHistory([...elements, currentShape]);
      // Broadcast finished shape
      broadcastDrawingEnd(currentShape);
      setCurrentShape(null);
      return;
    }
  };

  // Double click handler (can edit text easily or add text anywhere)
  const handleDoubleClick = (e) => {
    const { x, y, screenX, screenY } = getCanvasCoords(e);
    const hit = getElementAtPosition(x, y);
    
    if (hit && hit.element.type === 'text') {
      const textEl = hit.element;
      setEditingText({
        id: textEl.id,
        x: textEl.x,
        y: textEl.y,
        screenX,
        screenY,
        value: textEl.text
      });
      setElements(elements.filter(el => el.id !== textEl.id));
    } else if (activeTool === 'select' || activeTool === 'text') {
      // Create new text block on empty canvas double click
      setEditingText({
        id: Date.now().toString(),
        x,
        y,
        screenX,
        screenY,
        value: ''
      });
    }
  };

  // Confirm and finish typing overlay text
  const finishTextInput = () => {
    if (!editingText) return;
    
    const trimmedVal = editingText.value.trim();
    if (trimmedVal !== '') {
      const newTextElement = {
        id: editingText.id,
        type: 'text',
        x: editingText.x,
        y: editingText.y,
        text: trimmedVal,
        fontSize: fontSize,
        color: activeColor
      };
      pushToHistory([...elements, newTextElement]);
      // Broadcast new text element
      broadcastDrawingEnd(newTextElement);
    } else {
      // Re-render elements
      drawCanvas();
    }
    
    setEditingText(null);
  };

  // Keyboard shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore shortcut keys if user is currently typing text
      if (editingText) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (activeTool === 'select' && selectedElement) {
          const remaining = elements.filter(el => el.id !== selectedElement.id);
          pushToHistory(remaining);
          setSelectedElement(null);
          // Broadcast deletion layout update
          broadcastElementsUpdate(remaining);
        }
      } else if (e.key === ' ') {
        // Spacebar activates panning mode
        setIsPanning(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === ' ') {
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [elements, selectedElement, activeTool, undoStack, redoStack, editingText]);

  // Handle uploading locally stored image files
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    loadImageFile(file);
  };

  const loadImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Place in the center of current viewport
        const canvas = canvasRef.current;
        const viewportCenterX = (-pan.x + canvas.width / 2) / zoom;
        const viewportCenterY = (-pan.y + canvas.height / 2) / zoom;
        
        // Scale default size to look good
        const maxW = 350;
        const ratio = img.width / img.height;
        const w = Math.min(maxW, img.width);
        const h = w / ratio;

        // Cache image object locally
        imageCache.current[event.target.result] = img;

        const imgElement = {
          id: Date.now().toString(),
          type: 'image',
          src: event.target.result,
          x: viewportCenterX - w / 2,
          y: viewportCenterY - h / 2,
          width: w,
          height: h
        };
        pushToHistory([...elements, imgElement]);
        setActiveTool('select');
        setSelectedElement(imgElement);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Image Drag & Drop File Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        loadImageFile(file);
      }
    }
  };

  // Clear entire drawing canvas board
  const clearBoard = () => {
    pushToHistory([]);
    setSelectedElement(null);
    setShowClearModal(false);
    // Broadcast clear action
    broadcastElementsClear();
  };

  // Zoom shortcuts
  const handleZoom = (factor) => {
    setZoom(prev => {
      const target = factor === 'reset' ? 1 : Math.max(0.1, Math.min(8, prev + factor));
      // Zoom relative to center screen
      if (factor === 'reset') {
        setPan({ x: 0, y: 0 });
      }
      return target;
    });
  };

  // Draw arrow shape helper on canvas context
  const drawArrow = (ctx, x1, y1, x2, y2, strokeWidth) => {
    const headlen = 12 + strokeWidth * 1.5; // length of head in pixels
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // arrow head points
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  };

  // Canvas Vector Drawing Renderer
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas viewport
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    
    // Transform coordinates using viewport pan and zoom
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Helper: Draw elements (strokes, shapes, text, images)
    const renderElement = (el) => {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.type === 'stroke') {
        const pts = el.points;
        if (pts.length < 2) return;
        
        if (el.isHighlighter) {
          // Render Highlighter stroke
          ctx.save();
          ctx.globalAlpha = 0.45;
          ctx.lineCap = 'square';
          ctx.lineJoin = 'miter';
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length - 2; i++) {
            const xc = (pts[i].x + pts[i + 1].x) / 2;
            const yc = (pts[i].y + pts[i + 1].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
          }
          if (pts.length > 2) {
            ctx.quadraticCurveTo(
              pts[pts.length - 2].x,
              pts[pts.length - 2].y,
              pts[pts.length - 1].x,
              pts[pts.length - 1].y
            );
          } else {
            ctx.lineTo(pts[1].x, pts[1].y);
          }
          ctx.stroke();
          ctx.restore();
        } else if (isPressureSensitive) {
          // Draw pressure-sensitive segmented stroke
          for (let i = 0; i < pts.length - 1; i++) {
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p1Pres = p1.pressure !== undefined ? p1.pressure : 0.5;
            const p2Pres = p2.pressure !== undefined ? p2.pressure : 0.5;
            const segmentPressure = (p1Pres + p2Pres) / 2;
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            // Modulate line width based on pressure
            ctx.lineWidth = el.width * (0.35 + 1.3 * segmentPressure);
            ctx.stroke();
          }
        } else {
          // Draw constant-width smooth stroke
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          
          // Draw using Quadratic Bezier Curve Smoothing
          for (let i = 1; i < pts.length - 2; i++) {
            const xc = (pts[i].x + pts[i + 1].x) / 2;
            const yc = (pts[i].y + pts[i + 1].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
          }
          
          // curve to the last two points
          if (pts.length > 2) {
            ctx.quadraticCurveTo(
              pts[pts.length - 2].x,
              pts[pts.length - 2].y,
              pts[pts.length - 1].x,
              pts[pts.length - 1].y
            );
          } else {
            ctx.lineTo(pts[1].x, pts[1].y);
          }
          ctx.stroke();
        }

      } else if (el.type === 'shape') {
        const x = Math.min(el.x1, el.x2);
        const y = Math.min(el.y1, el.y2);
        const w = Math.abs(el.x2 - el.x1);
        const h = Math.abs(el.y2 - el.y1);

        if (el.shapeType === 'rectangle') {
          if (el.fill === 'solid') {
            ctx.fillRect(x, y, w, h);
          } else if (el.fill === 'semi') {
            ctx.save();
            ctx.globalAlpha = 0.25;
            ctx.fillRect(x, y, w, h);
            ctx.restore();
            ctx.strokeRect(x, y, w, h);
          } else {
            ctx.strokeRect(x, y, w, h);
          }
        } else if (el.shapeType === 'circle') {
          const cx = el.x1;
          const cy = el.y1;
          const r = Math.hypot(el.x2 - el.x1, el.y2 - el.y1);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, 2 * Math.PI);
          if (el.fill === 'solid') {
            ctx.fill();
          } else if (el.fill === 'semi') {
            ctx.save();
            ctx.globalAlpha = 0.25;
            ctx.fill();
            ctx.restore();
            ctx.stroke();
          } else {
            ctx.stroke();
          }
        } else if (el.shapeType === 'line') {
          ctx.beginPath();
          ctx.moveTo(el.x1, el.y1);
          ctx.lineTo(el.x2, el.y2);
          ctx.stroke();
        } else if (el.shapeType === 'arrow') {
          drawArrow(ctx, el.x1, el.y1, el.x2, el.y2, el.width);
        }

      } else if (el.type === 'text') {
        ctx.font = `${el.fontSize}px 'Inter', sans-serif`;
        ctx.textBaseline = 'top';
        ctx.fillText(el.text, el.x, el.y);

      } else if (el.type === 'image') {
        const img = imageCache.current[el.src];
        if (img) {
          ctx.drawImage(img, el.x, el.y, el.width, el.height);
        } else {
          // Preload image if not cached
          const preImg = new Image();
          preImg.onload = () => {
            imageCache.current[el.src] = preImg;
            drawCanvas(); // Trigger redraw
          };
          preImg.src = el.src;
          // Temp outline
          ctx.strokeStyle = '#6366f1';
          ctx.strokeRect(el.x, el.y, el.width, el.height);
          ctx.font = '12px Inter';
          ctx.fillText('Loading image...', el.x + 10, el.y + 20);
        }
      }
    };

    // 1. Draw saved highlighters (rendered first to stay behind handwriting and text)
    elements.filter(el => el.isHighlighter).forEach(renderElement);
    if (currentStroke && currentStroke.isHighlighter) {
      renderElement(currentStroke);
    }
    // Draw active multiplayer highlighter strokes
    Object.values(activeDrawingsRef.current).forEach(stroke => {
      if (stroke.isHighlighter) {
        renderElement(stroke);
      }
    });

    // 2. Draw normal elements (pen, shapes, text, images)
    elements.filter(el => !el.isHighlighter).forEach(renderElement);
    if (currentStroke && !currentStroke.isHighlighter) {
      renderElement(currentStroke);
    }
    if (currentShape) {
      renderElement(currentShape);
    }
    // Draw active multiplayer normal strokes
    Object.values(activeDrawingsRef.current).forEach(stroke => {
      if (!stroke.isHighlighter) {
        renderElement(stroke);
      }
    });

    // 3. Draw bounding box and handles if an element is selected
    if (activeTool === 'select' && selectedElement) {
      const el = elements.find(item => item.id === selectedElement.id);
      if (el) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1.5 / zoom;
        ctx.setLineDash([4, 4]);

        let minX, minY, w, h;
        if (el.type === 'image') {
          minX = el.x;
          minY = el.y;
          w = el.width;
          h = el.height;
        } else if (el.type === 'text') {
          minX = el.x;
          minY = el.y - el.fontSize * 0.1;
          w = el.text.length * (el.fontSize * 0.55);
          h = el.fontSize * 1.1;
        } else if (el.type === 'shape') {
          minX = Math.min(el.x1, el.x2);
          minY = Math.min(el.y1, el.y2);
          w = Math.abs(el.x2 - el.x1);
          h = Math.abs(el.y2 - el.y1);
        } else if (el.type === 'stroke') {
          // Compute bounding box for strokes
          const xs = el.points.map(p => p.x);
          const ys = el.points.map(p => p.y);
          minX = Math.min(...xs);
          minY = Math.min(...ys);
          w = Math.max(...xs) - minX;
          h = Math.max(...ys) - minY;
        }

        // Draw dotted bounding box
        ctx.strokeRect(minX - 4, minY - 4, w + 8, h + 8);
        ctx.setLineDash([]); // Reset line dash

        // Draw resize indicator for text/image objects
        if (el.type === 'image' || el.type === 'text') {
          ctx.fillStyle = '#6366f1';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          const handleSize = 8 / zoom;
          ctx.fillRect(minX + w + 4 - handleSize / 2, minY + h + 4 - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(minX + w + 4 - handleSize / 2, minY + h + 4 - handleSize / 2, handleSize, handleSize);
        }
      }
    }

    // 4. Draw laser pointer trails
    if (laserPointsRef.current && laserPointsRef.current.length > 1) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ef4444';
      
      const now = Date.now();
      for (let i = 0; i < laserPointsRef.current.length - 1; i++) {
        const p1 = laserPointsRef.current[i];
        const p2 = laserPointsRef.current[i + 1];
        const age = now - p1.time;
        const ratio = Math.max(0, 1 - age / 1200);
        
        if (ratio <= 0) continue;
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(239, 68, 68, ${ratio * 0.95})`;
        ctx.lineWidth = strokeWidth * 2.5 * ratio;
        ctx.stroke();
      }
      
      // Draw a glowing pulsing white core at the pointer tip
      const tip = laserPointsRef.current[laserPointsRef.current.length - 1];
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ff3333';
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.restore();
    }
    
    // 5. Draw laser pointer cursor hover dot
    if (activeTool === 'laser' && laserPointerPos.current.over) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(laserPointerPos.current.x, laserPointerPos.current.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#ff3333';
      ctx.shadowColor = '#ff3333';
      ctx.shadowBlur = 12;
      ctx.fill();
      
      // Inner glowing core
      ctx.beginPath();
      ctx.arc(laserPointerPos.current.x, laserPointerPos.current.y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.fill();
      ctx.restore();
    }

    // 6. Draw other participants' cursors
    if (isCollaborating) {
      Object.values(participantsRef.current || {}).forEach(peer => {
        if (peer.userId === localUserId.current || !peer.cursor) return;
        
        ctx.save();
        ctx.translate(peer.cursor.x, peer.cursor.y);
        
        // Draw small pointer cursor
        ctx.fillStyle = peer.color || '#6366f1';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 16);
        ctx.lineTo(4, 12);
        ctx.lineTo(10, 18);
        ctx.lineTo(12, 16);
        ctx.lineTo(6, 10);
        ctx.lineTo(12, 10);
        ctx.closePath();
        ctx.fill();
        
        // Draw name label block
        ctx.font = '10px Inter';
        const textWidth = ctx.measureText(peer.userName).width;
        ctx.fillStyle = peer.color || '#6366f1';
        ctx.fillRect(10, 15, textWidth + 8, 16);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillText(peer.userName, 14, 27);
        ctx.restore();
      });
    }

    ctx.restore();
  };

  // Convert canvas output to PNG download link
  const handleExport = () => {
    if (elements.length === 0) return;
    
    // Create an offscreen canvas to compute bounding boundaries of all drawings
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Find bounding box containing all drawings to crop intelligently
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    elements.forEach(el => {
      if (el.type === 'stroke') {
        el.points.forEach(p => {
          minX = Math.min(minX, p.x);
          minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x);
          maxY = Math.max(maxY, p.y);
        });
      } else if (el.type === 'shape') {
        minX = Math.min(minX, el.x1, el.x2);
        minY = Math.min(minY, el.y1, el.y2);
        maxX = Math.max(maxX, el.x1, el.x2);
        maxY = Math.max(maxY, el.y1, el.y2);
      } else if (el.type === 'text') {
        const estWidth = el.text.length * (el.fontSize * 0.6);
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y - el.fontSize);
        maxX = Math.max(maxX, el.x + estWidth);
        maxY = Math.max(maxY, el.y + el.fontSize * 0.5);
      } else if (el.type === 'image') {
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + el.width);
        maxY = Math.max(maxY, el.y + el.height);
      }
    });

    // Add padding around elements
    const padding = 40;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = maxX - minX;
    const height = maxY - minY;

    if (width <= 0 || height <= 0) return;

    tempCanvas.width = width;
    tempCanvas.height = height;

    // Draw background grid or theme color onto exported canvas
    if (theme === 'light') {
      tempCtx.fillStyle = '#ffffff';
    } else {
      tempCtx.fillStyle = '#121214';
    }
    tempCtx.fillRect(0, 0, width, height);

    // Apply translations relative to bounding offset
    tempCtx.save();
    tempCtx.translate(-minX, -minY);

    // Draw all objects
    const renderExportElement = (el) => {
      tempCtx.strokeStyle = el.color;
      tempCtx.fillStyle = el.color;
      tempCtx.lineWidth = el.width;
      tempCtx.lineCap = 'round';
      tempCtx.lineJoin = 'round';

      if (el.type === 'stroke') {
        const pts = el.points;
        if (pts.length >= 2) {
          if (el.isHighlighter) {
            tempCtx.save();
            tempCtx.globalAlpha = 0.45;
            tempCtx.lineCap = 'square';
            tempCtx.lineJoin = 'miter';
          }
          tempCtx.beginPath();
          tempCtx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length - 2; i++) {
            const xc = (pts[i].x + pts[i + 1].x) / 2;
            const yc = (pts[i].y + pts[i + 1].y) / 2;
            tempCtx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
          }
          if (pts.length > 2) {
            tempCtx.quadraticCurveTo(
              pts[pts.length - 2].x,
              pts[pts.length - 2].y,
              pts[pts.length - 1].x,
              pts[pts.length - 1].y
            );
          } else {
            tempCtx.lineTo(pts[1].x, pts[1].y);
          }
          tempCtx.stroke();
          if (el.isHighlighter) {
            tempCtx.restore();
          }
        }
      } else if (el.type === 'shape') {
        const x = Math.min(el.x1, el.x2);
        const y = Math.min(el.y1, el.y2);
        const w = Math.abs(el.x2 - el.x1);
        const h = Math.abs(el.y2 - el.y1);

        if (el.shapeType === 'rectangle') {
          if (el.fill === 'solid') {
            tempCtx.fillRect(x, y, w, h);
          } else if (el.fill === 'semi') {
            tempCtx.save();
            tempCtx.globalAlpha = 0.25;
            tempCtx.fillRect(x, y, w, h);
            tempCtx.restore();
            tempCtx.strokeRect(x, y, w, h);
          } else {
            tempCtx.strokeRect(x, y, w, h);
          }
        } else if (el.shapeType === 'circle') {
          const cx = el.x1;
          const cy = el.y1;
          const r = Math.hypot(el.x2 - el.x1, el.y2 - el.y1);
          tempCtx.beginPath();
          tempCtx.arc(cx, cy, r, 0, 2 * Math.PI);
          if (el.fill === 'solid') {
            tempCtx.fill();
          } else if (el.fill === 'semi') {
            tempCtx.save();
            tempCtx.globalAlpha = 0.25;
            tempCtx.fill();
            tempCtx.restore();
            tempCtx.stroke();
          } else {
            tempCtx.stroke();
          }
        } else if (el.shapeType === 'line') {
          tempCtx.beginPath();
          tempCtx.moveTo(el.x1, el.y1);
          tempCtx.lineTo(el.x2, el.y2);
          tempCtx.stroke();
        } else if (el.shapeType === 'arrow') {
          drawArrow(tempCtx, el.x1, el.y1, el.x2, el.y2, el.width);
        }
      } else if (el.type === 'text') {
        tempCtx.font = `${el.fontSize}px 'Inter', sans-serif`;
        tempCtx.textBaseline = 'top';
        tempCtx.fillText(el.text, el.x, el.y);
      } else if (el.type === 'image') {
        const img = imageCache.current[el.src];
        if (img) {
          tempCtx.drawImage(img, el.x, el.y, el.width, el.height);
        }
      }
    };

    // Draw highlighters first (so they are rendered behind other drawing elements in export)
    elements.filter(el => el.isHighlighter).forEach(renderExportElement);
    // Draw all non-highlighters on top
    elements.filter(el => !el.isHighlighter).forEach(renderExportElement);

    tempCtx.restore();

    // Trigger PNG image download link
    const link = document.createElement('a');
    link.download = `foundaxia-whiteboard-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };

  // Get selected element screen bounds for rendering delete/resize UI
  const getSelectedElementBounds = () => {
    if (!selectedElement) return null;
    const el = elements.find(item => item.id === selectedElement.id);
    if (!el) return null;

    let minX, minY, w, h;
    if (el.type === 'image') {
      minX = el.x;
      minY = el.y;
      w = el.width;
      h = el.height;
    } else if (el.type === 'text') {
      minX = el.x;
      minY = el.y - el.fontSize * 0.1;
      w = el.text.length * (el.fontSize * 0.55);
      h = el.fontSize * 1.1;
    } else if (el.type === 'shape') {
      minX = Math.min(el.x1, el.x2);
      minY = Math.min(el.y1, el.y2);
      w = Math.abs(el.x2 - el.x1);
      h = Math.abs(el.y2 - el.y1);
    } else if (el.type === 'stroke') {
      const xs = el.points.map(p => p.x);
      const ys = el.points.map(p => p.y);
      minX = Math.min(...xs);
      minY = Math.min(...ys);
      w = Math.max(...xs) - minX;
      h = Math.max(...ys) - minY;
    }

    // Convert world bounds to screen bounds
    const screenLeft = minX * zoom + pan.x;
    const screenTop = minY * zoom + pan.y;
    const screenWidth = w * zoom;
    const screenHeight = h * zoom;

    return {
      left: screenLeft,
      top: screenTop,
      width: screenWidth,
      height: screenHeight,
      right: screenLeft + screenWidth,
      bottom: screenTop + screenHeight
    };
  };

  const selectedBounds = getSelectedElementBounds();

  return (
    <div 
      className="whiteboard-container" 
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* File Drop Highlight Screen */}
      {isDragOver && (
        <div className="drag-drop-overlay">
          <div className="drag-drop-message">
            <ImageIcon size={24} className="text-indigo-400" />
            <span>Drop image files here to upload to whiteboard</span>
          </div>
        </div>
      )}

      {/* Header Panel */}
      <header className={`whiteboard-header ${isHeaderCollapsed ? 'collapsed' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="whiteboard-btn-icon" onClick={() => navigate(-1)} data-tooltip="Go Back">
            <ChevronLeft size={20} />
          </button>
          
          <div className="whiteboard-logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/images/logo_icon.png" alt="Foundaxia Logo" className="whiteboard-logo-icon" />
            <img src="/images/logo_text.png" alt="Foundaxia Text" className="whiteboard-logo-text" />
          </div>
          
          <div className="whiteboard-title-block">
            <span style={{ fontWeight: 600, fontSize: '1.05rem', letterSpacing: '0.2px' }}>Interactive Canvas</span>
            <span className="whiteboard-badge">Online Classroom</span>
          </div>
        </div>

        {/* Undo/Redo & Save Buttons */}
        <div className="whiteboard-top-controls">
          <button 
            className="whiteboard-btn-icon" 
            onClick={handleUndo} 
            disabled={undoStack.length === 0}
            data-tooltip="Undo (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
          <button 
            className="whiteboard-btn-icon" 
            onClick={handleRedo} 
            disabled={redoStack.length === 0}
            data-tooltip="Redo (Ctrl+Y)"
          >
            <Redo2 size={18} />
          </button>

          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 5px' }} />

          <button 
            className="whiteboard-btn primary" 
            onClick={handleExport}
            disabled={elements.length === 0}
            data-tooltip="Export classroom notes"
          >
            <Download size={16} />
            <span>Export Board</span>
          </button>

          <button 
            className="whiteboard-btn danger" 
            onClick={() => setShowClearModal(true)}
            data-tooltip="Wipe canvas board"
          >
            <Trash2 size={16} />
            <span>Clear</span>
          </button>

          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 5px' }} />

          {!isCollaborating ? (
            <button 
              className="whiteboard-btn" 
              style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}
              onClick={initiateRoomCollab}
              data-tooltip="Invite students to collaborate"
            >
              <Share2 size={16} />
              <span>Invite / Collaborate</span>
            </button>
          ) : (
            <>
              <button 
                className={`whiteboard-btn ${showCollabSidebar ? 'primary' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => setShowCollabSidebar(prev => !prev)}
                data-tooltip="View online participants"
              >
                <Users size={16} />
                <span>Classroom ({Object.keys(participants).length})</span>
              </button>

              {/* Mic button with audio level ring */}
              <div className="mic-level-wrapper" data-tooltip={isMicOn ? "Mute Microphone" : "Unmute Microphone"}>
                {isMicOn && (
                  <svg className="mic-level-ring" viewBox="0 0 44 44" width="44" height="44">
                    <circle
                      cx="22" cy="22" r="19"
                      fill="none"
                      stroke="rgba(52,211,153,0.25)"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="22" cy="22" r="19"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="2.5"
                      strokeDasharray={`${(micLevel / 100) * 119.4} 119.4`}
                      strokeLinecap="round"
                      transform="rotate(-90 22 22)"
                      style={{ transition: 'stroke-dasharray 0.05s linear' }}
                    />
                  </svg>
                )}
                <button 
                  className={`whiteboard-btn-icon ${isMicOn ? 'active' : ''}`} 
                  style={{ 
                    background: isMicOn ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: isMicOn ? '#34d399' : '#f87171',
                    borderColor: isMicOn ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px'
                  }}
                  onClick={toggleMicrophone}
                >
                  {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
              </div>

              <button
                className={`whiteboard-btn-icon ${isVideoOn ? 'active' : ''}`}
                style={{
                  background: isVideoOn ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: isVideoOn ? '#34d399' : '#f87171',
                  borderColor: isVideoOn ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px'
                }}
                onClick={toggleCamera}
                data-tooltip={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
              >
                {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>

              <button
                className={`whiteboard-btn-icon`}
                style={{
                  background: showVideoGrid ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                  color: showVideoGrid ? '#818cf8' : 'rgba(255,255,255,0.5)',
                  borderColor: showVideoGrid ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255,255,255,0.1)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px'
                }}
                onClick={() => setShowVideoGrid(prev => !prev)}
                data-tooltip={showVideoGrid ? "Hide Video Grid" : "Show Video Grid"}
              >
                <MonitorPlay size={18} />
              </button>

              <button
                className={`whiteboard-btn-icon`}
                style={{
                  background: showParticipantStrip ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                  color: showParticipantStrip ? '#818cf8' : 'rgba(255,255,255,0.5)',
                  borderColor: showParticipantStrip ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255,255,255,0.1)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px'
                }}
                onClick={() => setShowParticipantStrip(prev => !prev)}
                data-tooltip={showParticipantStrip ? "Hide Participant Strip" : "Show Participant Strip"}
              >
                <Users size={18} />
              </button>
            </>
          )}


          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 5px' }} />


          <button 
            className="whiteboard-btn-icon" 
            onClick={() => setIsHeaderCollapsed(true)}
            data-tooltip="Collapse Header"
          >
            <ChevronUp size={18} />
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className={`whiteboard-workspace ${isHeaderCollapsed ? 'fullscreen' : ''}`}>
        {/* Floating Expand Header Tab */}
        {isHeaderCollapsed && (
          <button 
            className="whiteboard-header-expand-trigger"
            onClick={() => setIsHeaderCollapsed(false)}
            data-tooltip="Expand Header"
          >
            <ChevronDown size={16} />
          </button>
        )}
        {/* Canvas Element */}
        <canvas
          ref={canvasRef}
          className={`whiteboard-canvas theme-${theme} grid-${gridType} ${isPanning ? 'grabbing' : ''}`}
          style={{ cursor: getCanvasCursor() }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={handleDoubleClick}
          onPointerLeave={() => {
            laserPointerPos.current.over = false;
            drawCanvas();
          }}
        />

        {/* Floating Delete Button for active selected element */}
        {selectedBounds && activeTool === 'select' && (
          <button
            className="whiteboard-floating-delete-btn"
            style={{
              position: 'absolute',
              left: `${selectedBounds.right + 10}px`,
              top: `${selectedBounds.top - 15}px`,
              zIndex: 90
            }}
            onClick={() => {
              const remaining = elements.filter(el => el.id !== selectedElement.id);
              pushToHistory(remaining);
              setSelectedElement(null);
            }}
            title="Delete Selected Element"
          >
            <Trash2 size={14} />
          </button>
        )}

        {/* Text Area Overlay Input */}
        {editingText && (
          <div
            className="canvas-text-input-overlay"
            style={{
              left: editingText.screenX + 'px',
              top: editingText.screenY + 'px',
            }}
          >
            <textarea
              autoFocus
              className="canvas-text-input-textarea"
              value={editingText.value}
              rows={Math.max(1, editingText.value.split('\n').length)}
              style={{
                fontSize: fontSize * zoom + 'px',
                color: activeColor,
                minWidth: '150px',
                lineHeight: '1.2'
              }}
              onChange={(e) => setEditingText({ ...editingText, value: e.target.value })}
              onBlur={finishTextInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  finishTextInput();
                }
              }}
            />
          </div>
        )}

        {/* ─── Floating Video Grid Overlay ─────────────────────────────── */}
        {showVideoGrid && isCollaborating && (
          <div className="video-grid-overlay">
            <div className="video-grid-header">
              <span className="video-grid-title">
                <MonitorPlay size={13} style={{ marginRight: 5 }} />
                Live Video
              </span>
              <button className="video-grid-close" onClick={() => setShowVideoGrid(false)} title="Hide Video Grid">✕</button>
            </div>

            <div className="video-grid-tiles">
              {/* Local Camera Tile */}
              <div className="video-tile local-tile">
                {isVideoOn ? (
                  <video
                    ref={(el) => {
                      localVideoRef.current = el;
                      if (el && localStreamRef.current) el.srcObject = localStreamRef.current;
                    }}
                    className="video-tile-stream"
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <div className="video-tile-avatar" style={{ background: userColor.current }}>
                    {(userName || 'Y').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="video-tile-label">
                  {userName || 'You'} (You)
                  <span className="video-tile-icons">
                    {isMicOn ? '🎤' : '🔇'}
                    {isVideoOn ? '📷' : '📷🚫'}
                  </span>
                </div>
              </div>

              {/* Remote Participant Tiles */}
              {Object.entries(participants).map(([peerId, pData]) => {
                if (peerId === localUserId.current) return null;
                const remoteStream = remoteVideoStreams[peerId];
                const pColor = pData?.color || '#6366f1';
                const pName = pData?.userName || 'Participant';
                const pMicOn = pData?.isMicOn;
                const pVideoOn = pData?.isVideoOn;

                return (
                  <div key={peerId} className="video-tile">
                    {remoteStream ? (
                      <video
                        ref={(el) => {
                          if (el) {
                            remoteVideoRefs.current[peerId] = el;
                            if (el.srcObject !== remoteStream) el.srcObject = remoteStream;
                          }
                        }}
                        className="video-tile-stream"
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <div className="video-tile-avatar" style={{ background: pColor }}>
                        {pName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="video-tile-label">
                      {pName}
                      <span className="video-tile-icons">
                        {pMicOn ? '🎤' : '🔇'}
                        {pVideoOn ? '📷' : '📷🚫'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Right-Side Participant Strip ─────────────────────────────── */}
        {isCollaborating && showParticipantStrip && (() => {
          // Build participant list: local user first, then speaking peers, then rest
          const allPeers = Object.entries(participants);
          const sorted = [
            // Local user entry
            [localUserId.current, {
              userName: userName || 'You',
              color: userColor.current,
              isMicOn,
              isVideoOn,
              isLocal: true
            }],
            // Remote peers sorted: speaking first
            ...allPeers
              .filter(([pid]) => pid !== localUserId.current)
              .sort(([a], [b]) => {
                const aSpeak = speakingPeers.has(a) ? 0 : 1;
                const bSpeak = speakingPeers.has(b) ? 0 : 1;
                return aSpeak - bSpeak;
              })
          ];

          return (
            <div className="participant-strip">
              <div className="participant-strip-label">Participants</div>
              <div className="participant-strip-list">
                {sorted.map(([peerId, pData]) => {
                  const pColor = pData?.color || '#6366f1';
                  const pName = pData?.userName || 'User';
                  const pMicOn = pData?.isMicOn;
                  const pVideoOn = pData?.isVideoOn;
                  const isLocal = pData?.isLocal;
                  const isSpeaking = speakingPeers.has(peerId) || (isLocal && micLevel > 5);
                  const remoteStream = !isLocal && remoteVideoStreams[peerId];

                  return (
                    <div
                      key={peerId}
                      className={`pstrip-tile ${isSpeaking ? 'speaking' : ''}`}
                      title={pName + (isLocal ? ' (You)' : '')}
                    >
                      <div className="pstrip-media">
                        {isLocal && isVideoOn ? (
                          <video
                            ref={(el) => {
                              localVideoRef.current = el;
                              if (el && localStreamRef.current) el.srcObject = localStreamRef.current;
                            }}
                            className="pstrip-video"
                            autoPlay muted playsInline
                          />
                        ) : remoteStream ? (
                          <video
                            ref={(el) => {
                              if (el) {
                                remoteVideoRefs.current[peerId] = el;
                                if (el.srcObject !== remoteStream) el.srcObject = remoteStream;
                              }
                            }}
                            className="pstrip-video"
                            autoPlay playsInline
                          />
                        ) : (
                          <div className="pstrip-avatar" style={{ background: pColor }}>
                            {pName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {/* Speaking indicator pulse */}
                        {isSpeaking && <div className="pstrip-speaking-ring" />}
                      </div>
                      <div className="pstrip-name">{isLocal ? 'You' : pName.split(' ')[0]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Floating Left Toolbar */}

        {isToolbarCollapsed ? (

          <button 
            className="whiteboard-floating-trigger toolbar-trigger"
            onClick={() => setIsToolbarCollapsed(false)}
            data-tooltip="Expand Toolbar"
          >
            <ChevronRight size={20} />
          </button>
        ) : (
          <div className="whiteboard-toolbar">
            <button 
              className={`toolbar-btn ${activeTool === 'select' ? 'active' : ''}`} 
              onClick={() => { setActiveTool('select'); setSelectedElement(null); }}
              data-tooltip="Select & Move Objects"
            >
              <MousePointer size={20} />
            </button>
            
            <button 
              className={`toolbar-btn ${activeTool === 'pen' ? 'active' : ''}`} 
              onClick={() => { setActiveTool('pen'); setSelectedElement(null); }}
              data-tooltip="Smart Handwriting Ink"
            >
              <Pencil size={20} />
            </button>

            <button 
              className={`toolbar-btn ${activeTool === 'eraser' ? 'active' : ''}`} 
              onClick={() => { setActiveTool('eraser'); setSelectedElement(null); }}
              data-tooltip="Stroke Eraser"
            >
              <Eraser size={20} />
            </button>

            <button 
              className={`toolbar-btn ${activeTool === 'highlighter' ? 'active' : ''}`} 
              onClick={() => { setActiveTool('highlighter'); setSelectedElement(null); }}
              data-tooltip="Fluorescent Highlighter"
            >
              <Highlighter size={20} />
            </button>

            <button 
              className={`toolbar-btn ${activeTool === 'laser' ? 'active' : ''}`} 
              onClick={() => { setActiveTool('laser'); setSelectedElement(null); }}
              data-tooltip="Glowing Laser Pointer"
            >
              <Zap size={20} />
            </button>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

            <button 
              className={`toolbar-btn ${activeTool === 'line' ? 'active' : ''}`} 
              onClick={() => { setActiveTool('line'); setSelectedElement(null); }}
              data-tooltip="Draw Straight Line"
            >
              <Minus size={20} style={{ transform: 'rotate(-45deg)' }} />
            </button>

            <button 
              className={`toolbar-btn ${activeTool === 'arrow' ? 'active' : ''}`} 
              onClick={() => { setActiveTool('arrow'); setSelectedElement(null); }}
              data-tooltip="Draw Annotation Arrow"
            >
              <ArrowUpRight size={20} />
            </button>

            <button 
              className={`toolbar-btn ${activeTool === 'rectangle' ? 'active' : ''}`} 
              onClick={() => { setActiveTool('rectangle'); setSelectedElement(null); }}
              data-tooltip="Draw Rectangle"
            >
              <Square size={20} />
            </button>

            <button 
              className={`toolbar-btn ${activeTool === 'circle' ? 'active' : ''}`} 
              onClick={() => { setActiveTool('circle'); setSelectedElement(null); }}
              data-tooltip="Draw Circle"
            >
              <Circle size={20} />
            </button>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

            <button 
              className={`toolbar-btn ${activeTool === 'text' ? 'active' : ''}`} 
              onClick={() => { setActiveTool('text'); setSelectedElement(null); }}
              data-tooltip="Insert Typography Label"
            >
              <Type size={20} />
            </button>

            <button 
              className="toolbar-btn" 
              onClick={() => fileInputRef.current.click()}
              data-tooltip="Insert Picture/Image"
            >
              <ImageIcon size={20} />
            </button>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

            <button 
              className="toolbar-btn collapse-btn"
              onClick={() => setIsToolbarCollapsed(true)}
              data-tooltip="Collapse Toolbar"
              style={{ color: '#f87171' }}
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        )}

        {/* Floating Right Properties Panel */}
        {isPropertiesCollapsed ? (
          <button 
            className="whiteboard-floating-trigger properties-trigger"
            onClick={() => setIsPropertiesCollapsed(false)}
            data-tooltip="Expand Options"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <div className="whiteboard-properties">
            <div className="properties-panel-header" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px', marginBottom: '10px' }}>
              <span className="prop-title" style={{ margin: 0 }}>Properties</span>
            </div>

            {/* Scrollable Settings Content */}
            <div className="properties-panel-content">
              {/* Colors Selection */}
              <div className="prop-section">
                <span className="prop-title">Pen & Ink Palette</span>
                <div className="color-palette">
                  {PRESET_COLORS.map(color => (
                    <button 
                      key={color}
                      className={`color-swatch ${activeColor.toLowerCase() === color.toLowerCase() ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setActiveColor(color)}
                    />
                  ))}
                </div>
                
                <div className="custom-color-input-wrapper">
                  <input 
                    type="color" 
                    className="custom-color-picker"
                    value={activeColor}
                    onChange={(e) => setActiveColor(e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="custom-color-hex"
                    value={activeColor.toUpperCase()}
                    onChange={(e) => setActiveColor(e.target.value)}
                  />
                </div>
              </div>

              {/* Width / Size Settings */}
              <div className="prop-section">
                <span className="prop-title">Line / Text Size</span>
                <div className="brush-sizes">
                  {[2, 4, 8, 16].map(size => (
                    <button 
                      key={size}
                      className={`brush-size-btn ${strokeWidth === size ? 'active' : ''}`}
                      onClick={() => {
                        setStrokeWidth(size);
                        setFontSize(size + 16); // Sync font size logically
                      }}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  className="brush-width-slider"
                  value={strokeWidth}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setStrokeWidth(val);
                    setFontSize(val + 16);
                  }}
                />
              </div>

              {/* Shape Fill Modes */}
              {['rectangle', 'circle'].includes(activeTool) && (
                <div className="prop-section">
                  <span className="prop-title">Shape Fill mode</span>
                  <div className="fill-modes">
                    {['none', 'semi', 'solid'].map(mode => (
                      <button
                        key={mode}
                        className={`fill-mode-btn ${fillMode === mode ? 'active' : ''}`}
                        onClick={() => setFillMode(mode)}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Backdrop/Grid Selector */}
              <div className="prop-section">
                <span className="prop-title">Backdrop Canvas Grid</span>
                <div className="backdrop-grid">
                  {['blank', 'dots', 'lines', 'graph'].map(type => (
                    <button
                      key={type}
                      className={`backdrop-btn ${gridType === type ? 'active' : ''}`}
                      onClick={() => setGridType(type)}
                    >
                      {type === 'lines' ? 'Notebook' : type === 'graph' ? 'Math Grid' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Canvas Settings */}
              <div className="prop-section">
                <span className="prop-title">Canvas Options</span>
                <div className="canvas-settings-list">
                  <label className="canvas-setting-item">
                    <input 
                      type="checkbox" 
                      checked={snapToGrid} 
                      onChange={(e) => setSnapToGrid(e.target.checked)} 
                      className="canvas-setting-checkbox"
                    />
                    <span className="setting-label-text">Snap to Grid (24px)</span>
                  </label>
                  <label className="canvas-setting-item">
                    <input 
                      type="checkbox" 
                      checked={isPressureSensitive} 
                      onChange={(e) => setIsPressureSensitive(e.target.checked)} 
                      className="canvas-setting-checkbox"
                    />
                    <span className="setting-label-text">Pressure Sensitive</span>
                  </label>
                </div>
              </div>

              {/* Theme Color Picker */}
              <div className="prop-section">
                <span className="prop-title">Board Theme</span>
                <div className="theme-toggle-container">
                  <button 
                    className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    <Moon size={14} />
                    <span>Blackboard</span>
                  </button>
                  <button 
                    className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    <Sun size={14} />
                    <span>Whiteboard</span>
                  </button>
                </div>
              </div>

              {/* Delete Element option in properties panel when selected */}
              {selectedElement && (
                <div className="prop-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '15px' }}>
                  <span className="prop-title">Manage Selected Element</span>
                  <button
                    className="whiteboard-btn danger"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '5px' }}
                    onClick={() => {
                      const remaining = elements.filter(el => el.id !== selectedElement.id);
                      pushToHistory(remaining);
                      setSelectedElement(null);
                    }}
                  >
                    <Trash size={16} />
                    <span>Delete Element</span>
                  </button>
                </div>
              )}
            </div>

            {/* Non-scrollable Fixed Footer for collapse button */}
            <div className="properties-panel-footer">
              <button
                className="whiteboard-btn-icon"
                style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.25)', color: '#f87171', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setIsPropertiesCollapsed(true)}
                title="Collapse Options"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Center Canvas Zoom Slider */}
        <div className="whiteboard-zoom-controls">
          <button className="zoom-btn" onClick={() => handleZoom(-0.1)} data-tooltip="Zoom Out">
            <ZoomIn size={14} style={{ transform: 'scale(0.8)' }} />
          </button>
          <span className="zoom-text">{Math.round(zoom * 100)}%</span>
          <button className="zoom-btn" onClick={() => handleZoom(0.1)} data-tooltip="Zoom In">
            <ZoomOut size={14} style={{ transform: 'scale(0.8)' }} />
          </button>
          <button className="zoom-btn" onClick={() => handleZoom('reset')} data-tooltip="Recenter Canvas">
            <Maximize size={14} style={{ transform: 'scale(0.8)' }} />
          </button>
        </div>

        {/* Center Bottom Slide Navigator */}
        <div className="whiteboard-slide-controls">
          <button 
            className="slide-btn" 
            onClick={handlePrevPage} 
            disabled={currentPageIndex === 0}
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="slide-text">
            Slide {currentPageIndex + 1} of {pages.length}
          </span>
          
          <button 
            className="slide-btn" 
            onClick={handleNextPage} 
            title={currentPageIndex === pages.length - 1 ? "Add New Page" : "Next Page"}
          >
            {currentPageIndex === pages.length - 1 ? '+' : <ChevronRight size={16} />}
          </button>

          {pages.length > 1 && (
            <button 
              className="slide-btn" 
              onClick={handleDeletePage}
              style={{ color: '#ef4444', marginLeft: '5px' }}
              title="Delete Slide"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Floating Bottom Status Indicator */}
        <div className="whiteboard-statusbar">
          <div className="status-item">
            <span>Pointer:</span>
            <span className="status-highlight" style={{ textTransform: 'capitalize' }}>{pointerType}</span>
          </div>
          {pointerType === 'pen' && (
            <div className="status-item">
              <span>Stylus Pressure:</span>
              <span className="status-highlight">{Math.round(pointerPressure * 100)}%</span>
            </div>
          )}
          <div className="status-item">
            <span>Active elements:</span>
            <span className="status-highlight">{elements.length}</span>
          </div>
        </div>
      </div>

      {/* Hidden local image loader */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden-file-input"
        accept="image/*"
        onChange={handleImageUpload}
      />

      {/* Wipe confirmation Dialog modal */}
      {showClearModal && (
        <div className="whiteboard-modal-overlay">
          <div className="whiteboard-modal">
            <div className="modal-header">Wipe Board Canvas</div>
            <div className="modal-body">
              Are you sure you want to delete all elements and drawings? This action will clear your workspace but can be undone via Undo (Ctrl+Z).
            </div>
            <div className="modal-footer">
              <button className="whiteboard-btn" onClick={() => setShowClearModal(false)}>
                Cancel
              </button>
              <button className="whiteboard-btn danger" onClick={clearBoard}>
                Clear Board
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Sidebar panel */}
      {isCollaborating && showCollabSidebar && (
        <div className="whiteboard-collab-sidebar">
          <div className="collab-sidebar-header">
            <span style={{ fontWeight: 600 }}>Active Classroom</span>
            <button className="whiteboard-btn-icon" onClick={() => setShowCollabSidebar(false)}>
              <ChevronRight size={18} />
            </button>
          </div>
          
          <div className="collab-sidebar-share">
            <span className="prop-title" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '8px' }}>INVITE OTHERS</span>
            <div className="share-link-box">
              <input 
                type="text" 
                readOnly 
                value={`${window.location.origin}${window.location.pathname}?room=${roomId}`}
                className="share-link-input"
              />
              <button className="whiteboard-btn-icon" onClick={copyShareLink} title="Copy link">
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="collab-participants-list">
            <span className="prop-title" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '8px' }}>PARTICIPANTS ({Object.keys(participants).length})</span>
            <div className="participants-scroll-area">
              {Object.values(participants).map(peer => {
                const isPeerHost = peer.isHost;
                const hasPeerAccess = peer.hasDrawAccess;
                const isLocal = peer.userId === localUserId.current;
                const initials = peer.userName ? peer.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
                
                return (
                  <div key={peer.userId} className="participant-card">
                    <div className="participant-avatar" style={{ backgroundColor: peer.color || '#6366f1' }}>
                      {initials}
                    </div>
                    
                    <div className="participant-info">
                      <span className="participant-name">{peer.userName} {isLocal && '(You)'}</span>
                      <span className="participant-role">{isPeerHost ? 'Host / Tutor' : 'Guest Student'}</span>
                    </div>
                    
                    <div className="participant-actions">
                      <span className={`participant-mic-status ${peer.isMicOn ? 'active' : ''}`} title={peer.isMicOn ? 'Microphone Active' : 'Muted'}>
                        {peer.isMicOn ? <Mic size={14} style={{ color: '#10b981' }} /> : <MicOff size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />}
                      </span>

                      {!isPeerHost && (
                        <button 
                          className={`draw-access-badge ${hasPeerAccess ? 'granted' : 'locked'}`}
                          disabled={!isHost} // Only host can toggle draw access for others
                          onClick={() => toggleParticipantDrawAccess(peer.userId, hasPeerAccess)}
                          title={isHost ? (hasPeerAccess ? "Click to revoke drawing" : "Click to grant drawing") : (hasPeerAccess ? "Has drawing access" : "No drawing access")}
                        >
                          {hasPeerAccess ? 'Can Draw' : 'Locked'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Guest Name Modal */}
      {showNameModal && (
        <div className="whiteboard-modal-overlay" style={{ zIndex: 11000 }}>
          <div className="whiteboard-modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">Join Virtual Classroom</div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <p style={{ margin: 0, opacity: 0.85, fontSize: '0.95rem', lineHeight: '1.4' }}>
                Enter your name to start collaborating on the tutor's whiteboard.
              </p>
              <input 
                type="text" 
                placeholder="Enter name (e.g. Student Alex)" 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userName.trim() !== '') {
                    startCollaboration(roomId, userName.trim());
                  }
                }}
              />
            </div>
            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
              <button 
                className="whiteboard-btn" 
                onClick={() => {
                  const defaultName = generateRandomName();
                  startCollaboration(roomId, defaultName);
                }}
              >
                Quick Join
              </button>
              <button 
                className="whiteboard-btn primary" 
                disabled={userName.trim() === ''}
                onClick={() => startCollaboration(roomId, userName.trim())}
              >
                Join Classroom
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Toast banner indicator */}
      {toastMessage && (
        <div className="whiteboard-toast">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
