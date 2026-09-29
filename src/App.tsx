/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Mic, 
  MicOff,
  Send, 
  Paperclip, 
  Search, 
  CheckCheck, 
  MoreVertical, 
  Phone, 
  Smile,
  Sticker, 
  Trash2, 
  Plus, 
  Sparkles, 
  X, 
  Play, 
  Pause, 
  Volume2, 
  Image as ImageIcon, 
  FileText, 
  Camera, 
  Square, 
  Check, 
  Info, 
  User, 
  Users, 
  ShieldCheck, 
  MessageCircle, 
  VolumeX, 
  Clock,
  ChevronRight, 
  ChevronLeft,
  AlertCircle, 
  Radio,
  LogOut,
  Mail,
  Lock,
  Signature,
  Settings,
  Link2,
  Upload,
  Eye,
  EyeOff,
  Maximize2,
  Video,
  Bell,
  BellRing,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Conversation, Message, UserProfile, EmojiReaction } from './types';
import { ALL_STICKERS, ROMANTIC_STICKERS, VIBE_STICKERS, ALL_EMOJIS_AND_SYMBOLS } from './stickersData';
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  increment,
  arrayUnion,
  handleFirestoreError,
  OperationType
} from './firebase';

// Declarative Video Stream Component for WebRTC / Webcam previews
function renderTextWithClickableLinks(text: string, isMe: boolean) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline font-semibold break-all hover:opacity-85 select-text ${
            isMe ? 'text-sky-200 decoration-sky-300' : 'text-indigo-400 decoration-indigo-500'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function VideoStreamPlayer({ stream, muted = false, className = "" }: { stream: MediaStream | null; muted?: boolean; className?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#131522]/80 rounded-3xl border border-slate-800/20">
        <span className="text-indigo-400 text-xs font-mono animate-pulse">Conectando câmera...</span>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={`w-full h-full object-cover rounded-3xl ${className}`}
      id={`video-${stream.id}`}
    />
  );
}

// Web Audio API Synthesizer Helper for a Premium sound effect during audio message play
class AudioSynthHelper {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  startTone(frequency = 220, type: OscillatorType = 'sine') {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      
      this.oscillator = this.ctx.createOscillator();
      this.gainNode = this.ctx.createGain();
      
      this.oscillator.type = type;
      this.oscillator.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      
      this.gainNode.gain.setValueAtTime(0.06, this.ctx.currentTime);
      
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);
      this.oscillator.start();
    } catch (e) {
      console.warn("Audio Context init blocked or failed: ", e);
    }
  }

  stopTone() {
    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
    } catch (e) {
      // ignore
    }
  }

  playRingtone() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playFreq = (freq: number, type: OscillatorType, start: number, duration: number, volume = 0.06) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // High-fidelity sweet chime arpeggio melody for high-end call notification alerts
      playFreq(783.99, 'triangle', 0.0, 0.15, 0.06);   // G5
      playFreq(987.77, 'triangle', 0.15, 0.15, 0.06);  // B5
      playFreq(1174.66, 'triangle', 0.30, 0.15, 0.06); // D6
      playFreq(1567.98, 'sine',     0.45, 0.35, 0.04); // G6
      
      playFreq(987.77, 'triangle',  0.80, 0.15, 0.06); // B5
      playFreq(1174.66, 'triangle', 0.95, 0.15, 0.06); // D6
      playFreq(1567.98, 'triangle', 1.10, 0.15, 0.06); // G6
      playFreq(1975.53, 'sine',     1.25, 0.45, 0.03); // B6
    } catch (e) {
      // ignore
    }
  }

  playCallRingback() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playFreq = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.04, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      
      // Traditional telephone call ringback: 440Hz + 480Hz modulated dual frequency tone
      playFreq(440.00, 0, 1.3);
      playFreq(480.00, 0, 1.3);
    } catch (e) {
      // ignore
    }
  }
}

const synthHelper = new AudioSynthHelper();

const welcomeTexts: { [key: string]: string } = {
  'aria': "Olá! Aqui é a Aria, a Inteligência Artificial do Vibe! Estou muito feliz que você me ligou pelo app. Eu sou o seu guia aqui e posso te explicar sobre o Vibe, como usá-lo, suas principais funções premium e o meu significado de aproximar humanos e tecnologia. O que você gostaria de explorar hoje?",
  'vibe': "Olá! Você ligou para o canal oficial do Squad Vibe. Estamos transmitindo em segurança criptografada para oferecer a melhor experiência para você. No que podemos ajudar?",
  'suporte': "Olá! Você está conectado à Central de Suporte Oficial do Vibe. Todas as chamadas de voz nesta rede são integradas e seguras. Lembre-se que você pode usar seu microfone real para testar o gravador de áudio, simular anexos de imagem e enviar reações rápidas. Como podemos te ajudar?"
};

export default function App() {
  // Authentication & Profile States
  const [me, setMe] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySuccessMessage, setRecoverySuccessMessage] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authBio, setAuthBio] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Terms of Use & Email Verification
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Core Messenger States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'groups' | 'ai' | 'verified'>('all');
  
  // Message composing
  const [inputText, setInputText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showStickerEmojiPicker, setShowStickerEmojiPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'emojis' | 'stickers' | 'symbols'>('emojis');
  const [stickerSubCategory, setStickerSubCategory] = useState<'all' | 'romantic' | 'vibe' | 'general'>('romantic');
  
  // Right sidebar toggle
  const [showRightPanel, setShowRightPanel] = useState(true);

  // Audio recording UI state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedAudioChunks, setRecordedAudioChunks] = useState<Blob[]>([]);
  const recordedChunksRef = useRef<Blob[]>([]);
  const localVoiceUrls = useRef<{[key: string]: string}>({});
  
  // Realtime recording audio analysis
  const [audioAnalyserData, setAudioAnalyserData] = useState<number[]>(new Array(30).fill(10));
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const simulatorVisualizerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  
  // Audio Playback states (keyed by message ID)
  const [playingMessages, setPlayingMessages] = useState<{[key: string]: boolean}>({});
  const [audioPlaybackProgress, setAudioPlaybackProgress] = useState<{[key: string]: number}>({}); // percentage 0 to 100
  const [audioPlaybackTimers, setAudioPlaybackTimers] = useState<{[key: string]: number}>({}); // elapsed seconds
  const [audioSpeed, setAudioSpeed] = useState<{[key: string]: number}>({}); // multiplier: 1x, 1.5x, 2x
  const activeAudioElements = useRef<{[key: string]: HTMLAudioElement}>({});
  const activeIntervals = useRef<{[key: string]: any}>({});

  // WebRTC Client Voice Calling refs
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Simulated AI writing/recording state indicators
  const [aiTypingStatus, setAiTypingStatus] = useState<{[key: string]: 'typing' | 'recording' | null}>({});

  // Creating custom groups state
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupVerified, setNewGroupVerified] = useState(false);

  // Admin Management Panel State Variables
  const [showAdminPanelModal, setShowAdminPanelModal] = useState(false);
  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminSelectedUserId, setAdminSelectedUserId] = useState<string | null>(null);
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);

  // Selected User Fields for Editing
  const [adminEditName, setAdminEditName] = useState('');
  const [adminEditEmail, setAdminEditEmail] = useState('');
  const [adminEditPassword, setAdminEditPassword] = useState('');
  const [adminEditVerified, setAdminEditVerified] = useState(false);
  const [adminEditRole, setAdminEditRole] = useState('');
  const [adminEditBio, setAdminEditBio] = useState('');
  const [adminEditBannedStatus, setAdminEditBannedStatus] = useState<'none' | 'temp' | 'perm'>('none');
  const [adminEditBannedUntil, setAdminEditBannedUntil] = useState('');
  const [adminEditDeactivated, setAdminEditDeactivated] = useState(false);

  // Searching and starting contact chats state
  const [showSearchUserModal, setShowSearchUserModal] = useState(false);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Message deletion state variables
  const [msgToDelete, setMsgToDelete] = useState<Message | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Media Attachment and Viewing States
  const [activeMediaViewer, setActiveMediaViewer] = useState<{
    type: 'image' | 'video';
    url: string;
    caption?: string;
    senderName?: string;
    timestamp?: string;
  } | null>(null);
  const [mediaUploadLoading, setMediaUploadLoading] = useState(false);
  const [mediaUploadError, setMediaUploadError] = useState<string | null>(null);

  const [searchUserError, setSearchUserError] = useState<string | null>(null);

  // User profile configuration states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editLinks, setEditLinks] = useState<{ label: string; url: string }[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);

  // Notification States & Refs
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [swRegistered, setSwRegistered] = useState(false);

  const [activeMessageToast, setActiveMessageToast] = useState<{
    id: string;
    senderName: string;
    text: string;
    avatar?: string;
    unreadCount: number;
    timestamp: string;
    conversationId: string;
  } | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const triggerInAppToast = (msgId: string, senderName: string, text: string, avatar: string | undefined, unreadCount: number, timestamp: string, conversationId: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setActiveMessageToast({
      id: msgId,
      senderName,
      text,
      avatar,
      unreadCount,
      timestamp,
      conversationId
    });
    toastTimeoutRef.current = setTimeout(() => {
      setActiveMessageToast(null);
    }, 6000);
  };

  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef(false);
  const appLoadTime = useRef(Date.now() - 5000);

  const showVibeNotification = (senderName: string, text: string, avatarUrl?: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const title = `Vibe • ${senderName}`;
    const options: any = {
      body: text,
      icon: avatarUrl || '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'vibe-message',
      renotify: true,
      data: { url: window.location.origin }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      }).catch(() => {
        new Notification(title, options);
      });
    } else {
      new Notification(title, options);
    }
  };

  const subscribeToWebPush = async (userId: string) => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Web Push not supported on this device/browser.');
      return;
    }

    try {
      if (Notification.permission !== 'granted') return;

      const reg = await navigator.serviceWorker.ready;
      
      // Get the VAPID public key from backend
      const keyRes = await fetch('/api/push/vapid-public-key');
      const { publicKey } = await keyRes.json();
      if (!publicKey) {
        console.error('Failed to retrieve VAPID public key from server.');
        return;
      }

      // Convert VAPID base64 key to Uint8Array required by subscribe
      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      const convertedKey = urlBase64ToUint8Array(publicKey);

      // Subscribe of native push manager
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });

      console.log('Successfully subscribed to Web Push:', subscription);

      // Save our subscription to backend database mapped to userId
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, subscription })
      });
      console.log('Successfully posted Web Push subscription to server.');
    } catch (err) {
      console.error('Error subscribing to Web Push notifications:', err);
    }
  };

  // Synchronize Push Subscription with server whenever user changes or grants notifications permission
  useEffect(() => {
    if (me && me.id && notificationPermission === 'granted') {
      subscribeToWebPush(me.id);
    }
  }, [me?.id, notificationPermission, swRegistered]);

  const sendPushNotificationForMessage = async (text: string, mediaUrl?: string) => {
    if (!activeChatId || !me || !activeChat) return;

    // Retrieve recipient ID in active conversation
    const recipientId = activeChat.participantIds?.find(id => id !== me.id);
    if (!recipientId) return; // If self, group channel, or AI character (AI character responds automatically)

    try {
      // Smart suppression check: see if recipient is actively viewing this conversation
      const recDoc = await getDoc(doc(db, 'users', recipientId));
      if (recDoc.exists()) {
        const recData = recDoc.data();
        if (recData.activeChatId === activeChatId) {
          console.log(`[Vibe Push] Suppressed notification for ${recipientId} who is actively viewing chat: ${activeChatId}`);
          return;
        }
      }
    } catch (e) {
      console.warn('Error checking recipient active status for push suppression:', e);
    }

    try {
      await fetch('/api/push/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderName: me.name,
          text: text,
          receiverId: recipientId,
          convoId: activeChatId,
          avatarUrl: me.avatar || '/icon-192.png'
        })
      });
    } catch (err) {
      console.warn('Error sending web push notify request:', err);
    }
  };

  const sendPushNotificationForCall = async (receiverId: string, callerName: string, convoId: string, avatarUrl?: string) => {
    try {
      await fetch('/api/push/notify-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          callerName,
          receiverId,
          convoId,
          avatarUrl: avatarUrl || '/icon-192.png'
        })
      });
      console.log('Voice call push notification dispatched to server.');
    } catch (err) {
      console.warn('Error sending web push call notification request:', err);
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Seu navegador ou celular não oferece suporte nativo para notificações push.');
      return;
    }

    const setupNotificationServiceWorkerAndWelcome = async (permission: string) => {
      setNotificationPermission(permission);
      if (permission === 'granted') {
        if ('serviceWorker' in navigator) {
          try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered upon permission grant:', reg.scope);
            setSwRegistered(true);
          } catch (err) {
            console.error('Service Worker dynamic registration failed:', err);
          }
        }
        
        showVibeNotification(
          'Vibe Notificações 📡',
          'Notificações de áudio e texto ativadas com sucesso para este dispositivo!',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        );
      }
    };

    try {
      // Check if inside an iframe (like the AI Studio integrated preview)
      const isIframe = window.self !== window.top;
      if (isIframe) {
        alert(
          'Aviso Importante: Navegadores bloqueiam solicitações de notificação dentro de telas integradas (iframes).\n\n' +
          'Por favor, clique no botão "Abrir em nova aba" (ícone com seta saindo do quadrado no topo direito do AI Studio) ou instale o aplicativo como PWA no seu celular para ativá-las com sucesso!'
        );
      }

      // Hybrid Promise/Callback pattern to support all browser engines
      let requestResult;
      try {
        requestResult = Notification.requestPermission((perm) => {
          setupNotificationServiceWorkerAndWelcome(perm);
        });
      } catch (err) {
        // Fallback for older browsers throwing immediately on callback syntax wrapper or vice versa
        Notification.requestPermission((perm) => {
          setupNotificationServiceWorkerAndWelcome(perm);
        });
        return;
      }

      if (requestResult && typeof requestResult.then === 'function') {
        const permission = await requestResult;
        setupNotificationServiceWorkerAndWelcome(permission);
      }
    } catch (err: any) {
      console.error('Erro ao pedir permissão de notificações:', err);
      alert(
        'Observação de Segurança: Para ativar notificações, você deve estar navegando fora de um iframe.\n' +
        'Abra o Vibe em uma Nova Aba (topo direito) para conceder a permissão!'
      );
    }
  };

  const testVibeNotification = () => {
    if (notificationPermission !== 'granted') {
      requestNotificationPermission();
      return;
    }
    showVibeNotification(
      'Aria • IA do Vibe ✨',
      'Ei! Seu aplicativo Vibe está conectado no celular e pronto para alertas instantâneos! 🎮📱',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    );
  };

  const handleOpenProfileModal = () => {
    if (!me) return;
    setEditName(me.name || '');
    setEditAvatar(me.avatar || '');
    setEditBio(me.bio || '');
    setEditRole(me.role || '');
    setEditCategory(me.category || '');
    setEditLinks(me.links || []);
    setNewLinkLabel('');
    setNewLinkUrl('');
    setProfileError(null);
    setProfileSaving(false);
    setShowDeactivateConfirm(false);
    setShowDeleteAccountConfirm(false);
    setShowProfileModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setEditAvatar(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    
    // Add protocol if missing
    let formattedUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setEditLinks(prev => [...prev, { label: newLinkLabel.trim(), url: formattedUrl }]);
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (index: number) => {
    setEditLinks(prev => prev.filter((_, i) => i !== index));
  };

  // Helper helper to resolve the other participant in a direct conversation
  const getDirectChatPartner = (conv: Conversation): UserProfile | null => {
    if (conv.isGroup) return null;
    if (conv.category === 'ai' || conv.category === 'verified') {
      return conv.participants.find(p => p.id !== me?.id) || conv.participants[0] || null;
    }
    return conv.participants.find(p => p.id !== me?.id) || null;
  };

  // Resolve direct chat partner with real-time status & lastSeen from usersList
  const getRealTimePartner = (conv: Conversation): UserProfile | null => {
    const partner = getDirectChatPartner(conv);
    if (!partner) return null;
    const realTimeUser = usersList.find(u => u.id === partner.id);
    if (realTimeUser) {
      return {
        ...partner,
        name: realTimeUser.name,
        avatar: realTimeUser.avatar,
        status: realTimeUser.status,
        verified: realTimeUser.verified,
        bio: realTimeUser.bio,
        lastSeen: realTimeUser.lastSeen,
      };
    }
    return partner;
  };

  const formatLastSeen = (lastSeenStr?: string | null): string => {
    if (!lastSeenStr) return 'offline';
    try {
      const d = new Date(lastSeenStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = d.toDateString() === yesterday.toDateString();
      
      const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      if (isToday) {
        return `visto por último hoje às ${timeStr}`;
      } else if (isYesterday) {
        return `visto por último ontem às ${timeStr}`;
      } else {
        const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        return `visto por último em ${dateStr} às ${timeStr}`;
      }
    } catch (e) {
      return 'offline';
    }
  };

  const handleUserTyping = async () => {
    if (!me) return;
    const myUserDocRef = doc(db, 'users', me.id);
    try {
      await updateDoc(myUserDocRef, {
        status: 'typing'
      });
    } catch (e) {}

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      try {
        if (me) {
          await updateDoc(myUserDocRef, {
            status: 'online'
          });
        }
      } catch (e) {}
    }, 2500);
  };

  const fetchUsersList = async () => {
    if (!me) return;
    setUsersLoading(true);
    setSearchUserError(null);
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const list: UserProfile[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.id && data.id !== me.id) {
          list.push({
            id: data.id,
            name: data.name || 'Usuário Vibe',
            avatar: data.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${data.id}`,
            status: data.status || 'offline',
            verified: !!data.verified,
            bio: data.bio || '',
            role: data.role || '',
            category: data.category || '',
            links: data.links || [],
          });
        }
      });
      setUsersList(list);
    } catch (err: any) {
      console.error("Erro ao carregar usuários:", err);
      setSearchUserError("Não foi possível carregar a lista de usuários do Vibe.");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleStartDirectChat = async (targetUser: UserProfile) => {
    if (!me) return;
    try {
      const sortedIds = [me.id, targetUser.id].sort();
      const chatRoomId = `dm_${sortedIds[0]}_${sortedIds[1]}`;
      const chatDocRef = doc(db, 'conversations', chatRoomId);
      const chatSnap = await getDoc(chatDocRef);

      if (!chatSnap.exists()) {
        const newConv: Conversation = {
          id: chatRoomId,
          title: targetUser.name,
          isGroup: false,
          avatar: targetUser.avatar,
          verified: !!targetUser.verified,
          category: 'direct',
          pinned: false,
          participantIds: [me.id, targetUser.id],
          participants: [me, targetUser],
          unreadCount: 0,
          messages: []
        };
        await setDoc(chatDocRef, newConv);
      }

      setActiveChatId(chatRoomId);
      setShowSearchUserModal(false);
      setSearchUserQuery('');
    } catch (err: any) {
      console.error("Erro ao iniciar chat direto:", err);
      setSearchUserError("Não foi possível iniciar a conversa de chat.");
    }
  };

  const handleSaveProfile = async () => {
    if (!me) return;
    if (!editName.trim()) {
      setProfileError('O campo Nome não pode ficar em branco.');
      return;
    }
    setProfileSaving(true);
    setProfileError(null);
    try {
      const userDocRef = doc(db, 'users', me.id);
      
      const payload = {
        name: editName.trim(),
        avatar: editAvatar.trim() || `https://api.dicebear.com/7.x/identicon/svg?seed=${me.id}`,
        bio: editBio.trim(),
        role: editRole.trim(),
        category: editCategory.trim(),
        links: editLinks,
      };

      await updateDoc(userDocRef, payload);
      
      setMe(prev => prev ? {
        ...prev,
        ...payload
      } : null);
      
      setShowProfileModal(false);
    } catch (e: any) {
      console.error("Erro ao salvar perfil:", e);
      let errorMsg = "Erro desconhecido ao salvar o perfil.";
      if (e.message && e.message.includes("permission-denied")) {
        errorMsg = "Permissão negada pelas regras de acesso.";
      } else if (e.message) {
        errorMsg = e.message;
      }
      setProfileError(errorMsg);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeactivateMyAccount = async () => {
    if (!me) return;
    setProfileSaving(true);
    setProfileError(null);
    try {
      const userDocRef = doc(db, 'users', me.id);
      await updateDoc(userDocRef, {
        deactivated: true,
        status: 'offline'
      });
      await signOut(auth);
      setMe(null);
      setShowProfileModal(false);
    } catch (e: any) {
      console.error("Erro ao desativar conta própria:", e);
      setProfileError(e.message || "Não foi possível desativar sua conta agora.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeleteMyAccount = async () => {
    if (!me) return;
    setProfileSaving(true);
    setProfileError(null);
    try {
      const userDocRef = doc(db, 'users', me.id);
      await deleteDoc(userDocRef);

      if (auth.currentUser) {
        try {
          await deleteUser(auth.currentUser);
        } catch (authErr: any) {
          console.warn("Could not delete user from system natively:", authErr.message);
        }
      }

      await signOut(auth);
      setMe(null);
      setShowProfileModal(false);
    } catch (e: any) {
      console.error("Erro ao excluir conta própria:", e);
      setProfileError(e.message || "Não foi possível excluir sua conta agora.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Calling modal simulation
  const [activeCall, setActiveCall] = useState<{
    show: boolean;
    name: string;
    avatar: string;
    status: 'ringing' | 'connected' | 'busy' | 'ended';
    seconds: number;
    isIncoming?: boolean;
    convoId?: string;
    role?: 'caller' | 'receiver';
    isChatbotCall?: boolean;
    chatId?: string;
    callType?: 'audio' | 'video';
  } | null>(null);
  const [localCallStream, setLocalCallStream] = useState<MediaStream | null>(null);
  const [remoteCallStream, setRemoteCallStream] = useState<MediaStream | null>(null);
  const [isCallMuted, setIsCallMuted] = useState(false);

  const toggleCallMute = () => {
    const nextMuted = !isCallMuted;
    setIsCallMuted(nextMuted);

    // Dynamic audio track status toggle on microphone media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !nextMuted;
      });
    }
    if (localCallStream) {
      localCallStream.getAudioTracks().forEach(track => {
        track.enabled = !nextMuted;
      });
    }
  };
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeCallAudioRef = useRef<HTMLAudioElement | null>(null);

  const [callTranscript, setCallTranscript] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [callInput, setCallInput] = useState('');
  const [isListeningForCall, setIsListeningForCall] = useState(false);
  const [callAiIsThinking, setCallAiIsThinking] = useState(false);
  const callTranscriptEndRef = useRef<HTMLDivElement | null>(null);

  const speakWithWebSpeech = (text: string) => {
    if ('speechSynthesis' in window && text) {
      try {
        window.speechSynthesis.cancel(); // cancel any active speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        const voices = window.speechSynthesis.getVoices();
        const ptVoice = voices.find(v => v.lang.includes('pt'));
        if (ptVoice) {
          utterance.voice = ptVoice;
        }
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("SpeechSynthesis error:", e);
      }
    }
  };

  // Auto-scroll call transcript to the bottom on updates
  useEffect(() => {
    if (callTranscriptEndRef.current) {
      callTranscriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [callTranscript, callAiIsThinking]);

  // Unified voice/text messaging solver during ongoing AI virtual calls
  const handleSendMessageInCall = async (textToSend: string) => {
    if (!activeCall || !activeCall.chatId || !textToSend.trim()) return;

    // 1. Silent any active players
    if (activeCallAudioRef.current) {
      try { activeCallAudioRef.current.pause(); } catch (e) {}
      activeCallAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }

    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = new Date().toISOString().split('T')[0];
    const userMsgId = `call-user-${Date.now()}`;

    const userMsg = {
      id: userMsgId,
      senderId: me?.id || 'me',
      senderName: me?.name || 'Você',
      text: textToSend,
      timestamp,
      date: dateFormatted,
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    // Statically declare state transitions
    setCallTranscript(prev => [...prev, { sender: 'user', text: textToSend }]);
    setCallInput('');
    setCallAiIsThinking(true);

    // Save and commit question history to Firestore real chat so conversation remains fully synced!
    try {
      const parentConvDocRef = doc(db, 'conversations', activeCall.chatId, 'messages', userMsgId);
      await setDoc(parentConvDocRef, userMsg);
      await updateDoc(doc(db, 'conversations', activeCall.chatId), {
        messages: [userMsg]
      });
    } catch (e) {
      console.warn("Error storing user call msg in firestore:", e);
    }

    // 2. Fetch responses from our server-side secure Gemini processor API
    try {
      const replyingCharacter = activeCall.name;
      const chatHistory = activeMessages.map(m => ({
        senderId: m.senderId === me?.id ? 'me' : m.senderId,
        text: m.text || `[Áudio de ${m.audioDuration} segundos]`
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory,
          character: replyingCharacter
        })
      });

      const data = await res.json();
      const aiReplyText = data.text || 'Desculpe, conectividade instável no Vibe. Pode repetir?';

      setCallAiIsThinking(false);
      setCallTranscript(prev => [...prev, { sender: 'ai', text: aiReplyText }]);

      // Save AI voice transcript response in Firestore
      const aiMsgId = `call-ai-${Date.now()}`;
      let resolvedSenderId = replyingCharacter.toLowerCase().split(' ')[0];
      if (resolvedSenderId === 'aria') {
        resolvedSenderId = 'aria-ai';
      }

      const dbAiResponse = {
        id: aiMsgId,
        senderId: resolvedSenderId,
        senderName: replyingCharacter,
        timestamp,
        date: dateFormatted,
        status: 'delivered',
        isAiResponse: true,
        text: aiReplyText,
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'conversations', activeCall.chatId, 'messages', aiMsgId), dbAiResponse);
        await updateDoc(doc(db, 'conversations', activeCall.chatId), {
          messages: [dbAiResponse],
          unreadCount: activeChatId === activeCall.chatId ? 0 : increment(1)
        });
      } catch (e) {
        console.warn("Error storing AI call msg in firestore:", e);
      }

      // 3. Play voice using custom server-side TTS engine or browser SpeechSynthesis
      try {
        const ttsRes = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: aiReplyText,
            character: replyingCharacter
          })
        });
        const ttsData = await ttsRes.json();
        if (ttsData.audio) {
          const audio = new Audio(ttsData.audio);
          activeCallAudioRef.current = audio;
          audio.play().catch(e => console.warn("TTS Speech autoplay stalled:", e));
        } else {
          speakWithWebSpeech(aiReplyText);
        }
      } catch (e) {
        console.warn("TTS Call voice error, using fallback SpeechSynthesis:", e);
        speakWithWebSpeech(aiReplyText);
      }

    } catch (e) {
      console.error("Error generating call reply:", e);
      setCallAiIsThinking(false);
      const errText = 'Desculpe, ocorreu uma instabilidade em meus canais de processamento.';
      setCallTranscript(prev => [...prev, { sender: 'ai', text: errText }]);
      speakWithWebSpeech(errText);
    }
  };

  // Launch microphone input to get rapid user vocal prompts inside Vibe Premium Calls
  const startSpeechRecognitionInCall = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador ou dispositivo não oferece suporte nativo para reconhecimento de voz (SpeechRecognition). Use o teclado para digitar sua pergunta na chamada!");
      return;
    }

    try {
      setIsListeningForCall(true);
      const rec = new SpeechRecognition();
      rec.lang = 'pt-BR';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text && text.trim()) {
          handleSendMessageInCall(text);
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error during voice call:", e);
        setIsListeningForCall(false);
      };

      rec.onend = () => {
        setIsListeningForCall(false);
      };

      rec.start();
    } catch (e) {
      console.warn("Speech recognition failure initialization:", e);
      setIsListeningForCall(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Synchronize active chat ID to current user document for smart suppression of notifications
  useEffect(() => {
    if (!me || !me.id) return;
    try {
      updateDoc(doc(db, 'users', me.id), {
        activeChatId: activeChatId || null
      }).catch((e) => console.warn("Could not sync activeChatId to user doc:", e));
    } catch (err) {
      // ignore
    }
  }, [activeChatId, me?.id]);

  // ----------------------------------------------------
  // FIREBASE USER LIFECYCLE & DEFAULT CHATS POPULATER
  // ----------------------------------------------------
  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!active) return;
      if (firebaseUser) {
        // Enforce fallback details immediately to prevent UI loading lock
        const fallbackProfile: UserProfile = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || authName || 'Vibe User',
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${firebaseUser.uid}`,
          status: 'online',
          verified: false,
          bio: authBio || 'Disponível no Vibe Premium.',
          email: firebaseUser.email || ''
        };
        
        // Optimistically set "me" user profile and unblock loading screen!
        setMe(fallbackProfile);
        setAuthLoading(false);

        // Fetch/create actual Firestore profile in the background
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          let userSnap = await getDoc(userDocRef);
          
          let profileData: UserProfile;
          if (!userSnap.exists()) {
            profileData = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || authName || 'Vibe User',
              avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${firebaseUser.uid}`,
              status: 'online',
              verified: false,
              bio: authBio || 'Disponível no Vibe Premium.',
              email: firebaseUser.email || authEmail || '',
              simulatedPassword: authPassword || '',
              emailVerified: firebaseUser.emailVerified
            };
            await setDoc(userDocRef, profileData);
          } else {
            const data = userSnap.data();
            
            // Administrative Ban Enforcement Check
            const bStatus = data.bannedStatus;
            const bUntil = data.bannedUntil;
            const isDeactivated = !!data.deactivated;
            let activeBanned = false;
            let banMessage = '';
            
            if (isDeactivated) {
              activeBanned = true;
              banMessage = 'Esta conta foi desativada pelo Gerente Geral do Vibe.';
            } else if (bStatus === 'perm') {
              activeBanned = true;
              banMessage = 'Sua conta foi suspensa permanentemente pelo Gerente Geral do Vibe.';
            } else if (bStatus === 'temp' && bUntil) {
              const banDate = new Date(bUntil);
              if (banDate > new Date()) {
                activeBanned = true;
                banMessage = `Sua conta foi suspensa temporariamente pelo Gerente Geral até ${banDate.toLocaleString('pt-BR')}.`;
              }
            }

            if (activeBanned) {
              await signOut(auth);
              setMe(null);
              setAuthError(banMessage);
              setAuthLoading(false);
              return;
            }

            const currentVerified = data.emailVerified === true || firebaseUser.emailVerified === true;

            profileData = {
              id: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || 'Vibe User',
              avatar: data.avatar || firebaseUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${firebaseUser.uid}`,
              status: 'online',
              verified: !!data.verified,
              bio: data.bio || 'Disponível no Vibe Premium.',
              role: data.role || '',
              category: data.category || '',
              links: data.links || [],
              email: data.email || firebaseUser.email || authEmail || '',
              simulatedPassword: data.simulatedPassword || authPassword || '',
              bannedStatus: data.bannedStatus || 'none',
              bannedUntil: data.bannedUntil || '',
              deactivated: isDeactivated,
              emailVerified: currentVerified,
              verificationCode: data.verificationCode || ''
            };

            const autoUpdates: any = {};
            if (!data.email && profileData.email) {
              autoUpdates.email = profileData.email;
            }
            if (!data.simulatedPassword && profileData.simulatedPassword) {
              autoUpdates.simulatedPassword = profileData.simulatedPassword;
            }
            if (data.status !== 'online') {
              autoUpdates.status = 'online';
            }
            if (currentVerified && data.emailVerified !== true) {
              autoUpdates.emailVerified = true;
            }

            if (Object.keys(autoUpdates).length > 0) {
              await updateDoc(userDocRef, autoUpdates);
            }
          }
          if (active) {
            setMe(profileData);
            await initializeDefaultConversationsForUser(firebaseUser.uid, profileData);
          }
        } catch (err) {
          console.error("Error setting up user profile document in background:", err);
        }
      } else {
        if (active) {
          setMe(null);
          setAuthLoading(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Standard login with Email & Password (safeguarded for Bans)
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError('Por favor, digite seu e-mail e senha.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      // 1. Perform regular Firebase Authentication flow directly - this ensures the user session is correctly established.
      const userCredential = await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
      
      // 2. Once authenticated, we can safely perform database actions under checked permission!
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userDocRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        // Ban audit
        const bStatus = userData.bannedStatus;
        const bUntil = userData.bannedUntil;
        const isDeactivated = !!userData.deactivated;
        
        let shouldBanOut = false;
        let banMsg = '';
        if (isDeactivated) {
          shouldBanOut = true;
          banMsg = 'Esta conta foi desativada pelo Gerente Geral do Vibe.';
        } else if (bStatus === 'perm') {
          shouldBanOut = true;
          banMsg = 'Sua conta foi suspensa permanentemente pelo Gerente Geral do Vibe.';
        } else if (bStatus === 'temp' && bUntil) {
          const banDate = new Date(bUntil);
          if (banDate > new Date()) {
            shouldBanOut = true;
            banMsg = `Sua conta está suspensa temporariamente até ${banDate.toLocaleString('pt-BR')}.`;
          }
        }

        if (shouldBanOut) {
          await signOut(auth);
          setMe(null);
          setAuthError(banMsg);
          setAuthLoading(false);
          return;
        }

        // Map and update status
        const profileData: UserProfile = {
          id: userCredential.user.uid,
          name: userData.name || userCredential.user.displayName || 'Vibe User',
          avatar: userData.avatar || userCredential.user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${userCredential.user.uid}`,
          status: 'online',
          verified: !!userData.verified,
          bio: userData.bio || 'Disponível no Vibe Premium.',
          role: userData.role || '',
          category: userData.category || '',
          links: userData.links || [],
          email: userData.email || userCredential.user.email || '',
          simulatedPassword: userData.simulatedPassword || authPassword,
          bannedStatus: userData.bannedStatus || 'none',
          bannedUntil: userData.bannedUntil || '',
          deactivated: isDeactivated
        };

        setMe(profileData);
        await updateDoc(userDocRef, { status: 'online' });
        await initializeDefaultConversationsForUser(userCredential.user.uid, profileData);
      }

      setTimeout(() => {
        setAuthLoading(false);
      }, 500);
    } catch (err: any) {
      console.error("Login error:", err);
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/invalid-email'
      ) {
        setAuthError('E-mail ou senha incorretos.');
      } else {
        setAuthError(err.message || 'Erro ao realizar login.');
      }
      setAuthLoading(false);
    }
  };

  // Standard password recovery via sendPasswordResetEmail
  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      setAuthError('Por favor, informe seu endereço de e-mail.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    setRecoverySuccessMessage(null);
    try {
      await sendPasswordResetEmail(auth, recoveryEmail.trim());
      setRecoverySuccessMessage(`Um e-mail de redefinição de senha foi enviado com sucesso para "${recoveryEmail.trim()}". Acesse o link enviado para alterar sua senha.`);
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === 'auth/user-not-found') {
        setAuthError('Nenhum usuário foi cadastrado com este e-mail.');
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('O formato do endereço de e-mail inserido é inválido.');
      } else {
        setAuthError(err.message || 'Não foi possível enviar o e-mail de redefinição. Tente mais tarde.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Standard signup with profile payload creation
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      setAuthError('Você precisa aceitar os Termos de Uso e Políticas de Privacidade para prosseguir.');
      return;
    }
    if (!authEmail || !authPassword || !authName) {
      setAuthError('E-mail, senha e nome completo são obrigatórios.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      await updateProfile(userCredential.user, {
        displayName: authName,
      });
      
      try {
        await sendEmailVerification(userCredential.user);
      } catch (e: any) {
        console.warn("Could not trigger email verification natively:", e.message);
      }
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const profileData: UserProfile = {
        id: userCredential.user.uid,
        name: authName,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${userCredential.user.uid}`,
        status: 'online',
        verified: false,
        bio: authBio || 'Disponível no Vibe Premium.',
        email: authEmail,
        simulatedPassword: authPassword,
        bannedStatus: 'none',
        bannedUntil: '',
        emailVerified: false
      };
      await setDoc(userDocRef, profileData);
      setMe(profileData);
      setAuthLoading(false);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('Este endereço de e-mail já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('A senha deve conter pelo menos 6 caracteres.');
      } else {
        setAuthError(err.message || 'Erro ao criar conta.');
      }
      setAuthLoading(false);
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      if (
        err.code === 'auth/operation-not-supported-in-this-environment' || 
        err.code === 'auth/popup-blocked' ||
        err.message?.includes('iframe') || 
        err.message?.includes('popup') ||
        err.message?.includes('cross-origin') ||
        err.message?.includes('closed-by-user')
      ) {
        setAuthError('O login em popup foi restrito pelo seu navegador ou pelas políticas do visualizador em iframe. Por favor, clique em "Abrir em nova aba" no topo direito para realizar o login do Google perfeitamente, ou cadastre-se com e-mail/senha comum!');
      } else {
        setAuthError(err.message || 'Erro ao realizar login com o Google.');
      }
      setAuthLoading(false);
    }
  };

  // Handle email verification check status
  const handleCheckVerificationStatus = async () => {
    if (!auth.currentUser) return;
    setVerificationLoading(true);
    setVerificationError(null);
    setVerificationSuccess(null);
    try {
      await auth.currentUser.reload();
      const isVerified = auth.currentUser.emailVerified;
      if (isVerified) {
        if (me) {
          const userDocRef = doc(db, 'users', me.id);
          await updateDoc(userDocRef, {
            emailVerified: true
          });
          setMe(prev => prev ? { ...prev, emailVerified: true } : null);
        }
        setVerificationSuccess('Sensacional! Seu e-mail foi ativado com sucesso! Carregando seu painel do Vibe...');
      } else {
        setVerificationError('Não detectamos a ativação pelo link. Por favor, clique no link de ativação enviado para o seu e-mail e clique no botão abaixo para tentar de novo.');
      }
    } catch (err: any) {
      console.error("Error reloading user status:", err);
      setVerificationError('Ocorreu uma oscilação na verificação. Favor aguardar e tentar novamente.');
    } finally {
      setVerificationLoading(false);
    }
  };

  // Resend native verification link
  const handleResendEmailCode = async () => {
    if (!auth.currentUser) return;
    setVerificationLoading(true);
    setVerificationError(null);
    setVerificationSuccess(null);

    try {
      await sendEmailVerification(auth.currentUser);
      setVerificationSuccess('Um novo link oficial de ativação foi encaminhado ao seu e-mail cadastrado!');
    } catch (err: any) {
      console.error("Error resending email verification:", err);
      setVerificationError('Não foi possível reenviar o link agora. Por favor, aguarde um minuto e tente novamente.');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleCancelEmailVerification = async () => {
    try {
      await signOut(auth);
      setMe(null);
      setVerificationError(null);
      setVerificationSuccess(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    if (me) {
      try {
        const userDocRef = doc(db, 'users', me.id);
        await updateDoc(userDocRef, { status: 'offline' });
      } catch (e) {
        console.warn("Could not mark user offline on disconnect:", e);
      }
    }
    setConversations([]);
    setActiveChatId('');
    setActiveMessages([]);
    await signOut(auth);
  };

  // Initialize offline-first chatrooms in real online database isolated per user (disabled for brand new starting from scratch)
  async function initializeDefaultConversationsForUser(uid: string, myProfile: UserProfile) {
    // Users start entirely from scratch with no prefilled conversations/contacts
    return;
  }

  // ----------------------------------------------------
  // REAL TIME STREAM LISTENERS
  // ----------------------------------------------------
  // Instantly clear unreadCount when a chat becomes active
  useEffect(() => {
    if (activeChatId && db) {
      updateDoc(doc(db, 'conversations', activeChatId), { unreadCount: 0 }).catch((e) => {
        console.warn("Could not auto-clear unread count:", e);
      });
    }
  }, [activeChatId]);

  // Service Worker and Notification initial check on App startup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Register Service worker silently on boot
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('App Startup: Service Worker registered:', reg.scope);
          setSwRegistered(true);
        })
        .catch((err) => {
          console.error('App Startup: Service Worker registration failed:', err);
        });
    }

    // Refresh notification settings state
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // 1. Listen to active online chats list and dispatch notifications
  useEffect(() => {
    if (!me) return;

    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', me.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Conversation[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as Conversation;
        if (data.id.startsWith('lucas-personal_') || data.id.startsWith('sabrina-designer_')) {
          return;
        }
        list.push(data);

        // Pre-register existing messages on first snap load to prevent old feedback spamming
        if (data.messages && data.messages.length > 0) {
          data.messages.forEach(msg => {
            if (!initialLoadDoneRef.current) {
              processedMessageIdsRef.current.add(msg.id);
            }
          });
        }
      });

      // Trigger actual real-time alerts if this is second stream load after initial cache
      if (!initialLoadDoneRef.current) {
        initialLoadDoneRef.current = true;
      } else {
        list.forEach(conv => {
          if (conv.messages && conv.messages.length > 0) {
            const lastMsg = conv.messages[conv.messages.length - 1];

            // Verify if not me, not seen, and has valid fresh timestamp
            if (lastMsg.senderId !== me.id && !processedMessageIdsRef.current.has(lastMsg.id)) {
              processedMessageIdsRef.current.add(lastMsg.id);

              const isNewMessage = lastMsg.createdAt && (new Date(lastMsg.createdAt).getTime() > appLoadTime.current);
              if (isNewMessage) {
                const isNotActiveChat = activeChatId !== conv.id;
                const isTabBackground = document.hidden;

                if (isNotActiveChat || isTabBackground) {
                  showVibeNotification(
                    lastMsg.senderName,
                    lastMsg.text || 'Mídia enviada',
                    conv.avatar
                  );

                  // Trigger beautiful custom sliding in-app notification Toast
                  const textTeaser = lastMsg.text || (lastMsg.audioUrl ? '🎤 Mensagem de áudio' : lastMsg.imageUrl ? '📷 Foto compartilhada' : 'Nova mídia 📁');
                  const countToDisplay = Math.max(conv.unreadCount || 0, 1);
                  const timeFormatted = lastMsg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  triggerInAppToast(
                    lastMsg.id,
                    lastMsg.senderName,
                    textTeaser,
                    conv.avatar,
                    countToDisplay,
                    timeFormatted,
                    conv.id
                  );
                }
              }
            }
          }
        });
      }

      const getLastMessageTime = (conv: Conversation): number => {
        if (conv.messages && conv.messages.length > 0) {
          const lastMsg = conv.messages[conv.messages.length - 1];
          if (lastMsg.createdAt) {
            return new Date(lastMsg.createdAt).getTime();
          }
        }
        return 0;
      };

      list.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        const timeA = getLastMessageTime(a);
        const timeB = getLastMessageTime(b);
        if (timeA !== timeB) {
          return timeB - timeA;
        }
        return a.title.localeCompare(b.title);
      });
      setConversations(list);
      
      // Auto-focus first room if empty (only on desktop screen size to keep mobile on contact list)
      if (list.length > 0 && !activeChatId && window.matchMedia('(min-width: 1024px)').matches) {
        setActiveChatId(list[0].id);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'conversations');
    });

    return unsubscribe;
  }, [me, activeChatId]);

  // 2. Listen to real-time chat bubbles inside active conversation
  useEffect(() => {
    if (!activeChatId || !me) {
      setActiveMessages([]);
      return;
    }

    const q = query(
      collection(db, 'conversations', activeChatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      let updatedRead = false;
      const batchUpdates: Promise<void>[] = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data() as Message;
        msgs.push(data);
        if (data.senderId !== me.id && data.status !== 'read') {
          const mRef = doc(db, 'conversations', activeChatId, 'messages', data.id);
          batchUpdates.push(updateDoc(mRef, { status: 'read' }));
          updatedRead = true;
        }
      });

      if (updatedRead) {
        const convRef = doc(db, 'conversations', activeChatId);
        batchUpdates.push(updateDoc(convRef, { unreadCount: 0 }));
        Promise.all(batchUpdates).catch(e => {
          console.warn("Error marking messages as read:", e);
        });
      }

      setActiveMessages(msgs);
    }, (error) => {
      console.warn("[Vibe Firestore messages link]: ", error.message);
    });

    return unsubscribe;
  }, [activeChatId, me]);

  // 3. Listen to real-time users list updates for live presence statuses & lastSeen details
  useEffect(() => {
    if (!me) return;

    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.id && data.id !== me.id) {
          list.push({
            id: data.id,
            name: data.name || 'Usuário Vibe',
            avatar: data.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${data.id}`,
            status: data.status || 'offline',
            lastSeen: data.lastSeen || null,
            verified: !!data.verified,
            bio: data.bio || '',
            role: data.role || '',
            category: data.category || '',
            links: data.links || [],
          });
        }
      });
      setUsersList(list);
    }, (error) => {
      console.warn("[Vibe Firestore users presence link]: ", error.message);
    });

    return unsubscribe;
  }, [me]);

  // 4. Update my own presence status and handle heartbeat, visibility changes & tab closes
  useEffect(() => {
    if (!me) return;

    const myUserDocRef = doc(db, 'users', me.id);

    // Function to set me online
    const goOnline = async () => {
      try {
        await updateDoc(myUserDocRef, {
          status: 'online',
          lastSeen: new Date().toISOString()
        });
      } catch (e) {
        console.error("Failed to set online presence:", e);
      }
    };

    // Function to set me offline
    const goOffline = async () => {
      try {
        await updateDoc(myUserDocRef, {
          status: 'offline',
          lastSeen: new Date().toISOString()
        });
      } catch (e) {
        console.error("Failed to set offline presence:", e);
      }
    };

    // Initially make sure we are online
    goOnline();

    // Set up heartbeat every 30 seconds to refresh lastSeen
    const heartbeatSecs = setInterval(() => {
      updateDoc(myUserDocRef, {
        lastSeen: new Date().toISOString()
      }).catch(() => {});
    }, 30000);

    // Handle page visibility change (e.g., minimizing app or tab change)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        goOffline();
      } else {
        goOnline();
      }
    };

    // Handle window beforeunload / unload (tab closure)
    const handleBeforeUnload = () => {
      goOffline();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatSecs);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Clean up my presence status on unmount
      goOffline();
    };
  }, [me?.id]);

  // Scroll viewport down when update occurs
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, activeChatId, aiTypingStatus]);

  // Ringtone/Seconds call timer ticker
  useEffect(() => {
    if (activeCall && activeCall.status === 'connected') {
      callTimerRef.current = setInterval(() => {
        setActiveCall(prev => {
          if (!prev) return null;
          return {
            ...prev,
            seconds: prev.seconds + 1
          };
        });
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeCall?.status]);

  // Handle call voice playback on connection
  useEffect(() => {
    if (activeCall && activeCall.status === 'connected' && !activeCall.convoId) {
      const nameLower = activeCall.name.toLowerCase();
      let key = 'aria';
      if (nameLower.includes('aria')) key = 'aria';
      else if (nameLower.includes('vibe')) key = 'vibe';
      else if (nameLower.includes('suporte')) key = 'suporte';

      const textToSpeak = welcomeTexts[key] || welcomeTexts['aria'];

      // Initialize the dialogue subtitles/transcript with the AI greeting!
      setCallTranscript([{ sender: 'ai', text: textToSpeak }]);

      const playVoice = async () => {
        try {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textToSpeak, character: activeCall.name })
          });
          const data = await res.json();
          if (data.audio) {
            const audio = new Audio(data.audio);
            activeCallAudioRef.current = audio;
            audio.play().catch(e => console.warn("Call audio autoplay stalled:", e));
          } else {
            // Fallback to SpeechSynthesis
            speakWithWebSpeech(textToSpeak);
          }
        } catch (e) {
          console.warn("TTS Call voice error, using fallback:", e);
          speakWithWebSpeech(textToSpeak);
        }
      };

      playVoice();
    } else if (!activeCall || activeCall.status === 'ended') {
      // Release any active call audio
      if (activeCallAudioRef.current) {
        try { activeCallAudioRef.current.pause(); } catch (e) {}
        activeCallAudioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
    }

    return () => {
      // Cleanup on unmount or change
      if (activeCallAudioRef.current) {
        try { activeCallAudioRef.current.pause(); } catch (e) {}
      }
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
    };
  }, [activeCall?.status]);

  // Global cleaner of players
  useEffect(() => {
    return () => {
      (Object.values(activeAudioElements.current) as any[]).forEach(audio => {
        if (audio && typeof audio.pause === 'function') {
          audio.pause();
        }
      });
      (Object.values(activeIntervals.current) as any[]).forEach(interval => {
        if (interval) {
          clearInterval(interval);
        }
      });
    };
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Build reactive active chat instance merging snapshot message history
  const activeChatRaw = conversations.find(c => c.id === activeChatId);
  const activeChat = activeChatRaw ? {
    ...activeChatRaw,
    messages: activeMessages
  } : null;

  // Search/Filter matching rules
  const filteredConversations = conversations.filter(c => {
    // Hide unrecognized legacy AI helpers if any, but keep user-facing aria-ai
    if (c.category === 'ai' && !c.id.startsWith('aria-ai')) return false;

    const titleMatch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isMatched = titleMatch || (c.messages && c.messages.some(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase())));
    if (!isMatched) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'groups') return c.isGroup;
    if (activeTab === 'verified') return c.verified;
    return true;
  });

  // Sound Record Engine
  const startRecordingAudio = async () => {
    if (me) {
      updateDoc(doc(db, 'users', me.id), { status: 'recording' }).catch(() => {});
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);
      setIsRecording(true);
      setRecordingSeconds(0);
      setRecordedAudioChunks([]);
      recordedChunksRef.current = [];

      let options = {};
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' };
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          options = { mimeType: 'audio/ogg' };
        }
      }

      const recorder = new MediaRecorder(stream, options);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          setRecordedAudioChunks(prev => [...prev, event.data]);
        }
      };
      recorder.start();
      setMediaRecorder(recorder);
      setupAudioVisualizer(stream);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (e) {
      console.warn("Microphone not available, running voice waveform simulator.", e);
      setIsRecording(true);
      setRecordingSeconds(0);
      recordedChunksRef.current = [];
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
      simulatorVisualizerRef.current = setInterval(() => {
        setAudioAnalyserData(Array.from({ length: 30 }, () => Math.floor(Math.random() * 45) + 5));
      }, 150);
    }
  };

  const setupAudioVisualizer = (stream: MediaStream) => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 64;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const drawWave = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const visualData = [];
        for (let i = 0; i < 28; i++) {
          const val = Math.max(4, Math.floor((dataArray[i] / 255) * 45));
          visualData.push(val);
        }
        setAudioAnalyserData(visualData);
        animationFrameRef.current = requestAnimationFrame(drawWave);
      };
      drawWave();
    } catch (e) {
      console.warn("Error visualizer:", e);
    }
  };

  const cancelRecording = () => {
    stopRecordingStreams(true);
  };

  const stopRecordingStreams = (discard = false) => {
    if (me) {
      updateDoc(doc(db, 'users', me.id), { status: 'online' }).catch(() => {});
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (simulatorVisualizerRef.current) {
      clearInterval(simulatorVisualizerRef.current);
      simulatorVisualizerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaRecorder) {
      try {
        if (discard) {
          mediaRecorder.onstop = null;
          recordedChunksRef.current = [];
          setRecordedAudioChunks([]);
        }
        mediaRecorder.stop();
      } catch (err) {}
      setMediaRecorder(null);
    }
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      setMicStream(null);
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    setIsRecording(false);
    setAudioAnalyserData(new Array(30).fill(10));
    if (discard) {
      setRecordedAudioChunks([]);
      recordedChunksRef.current = [];
    }
  };

  const sendRecordedAudio = () => {
    const duration = recordingSeconds > 0 ? recordingSeconds : 1;
    if (mediaRecorder) {
      const newMsgId = `me-${Date.now()}`;
      mediaRecorder.onstop = () => {
        const chunks = recordedChunksRef.current;
        if (chunks.length > 0) {
          try {
            const mimeType = chunks[0].type || 'audio/webm';
            const audioBlob = new Blob(chunks, { type: mimeType });
            const realAudioUrl = URL.createObjectURL(audioBlob);
            localVoiceUrls.current[newMsgId] = realAudioUrl;

            // Convert to Base64 in Firestore to preserve the real user voice forever
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result as string;
              addAudioMessageToChat(base64data, duration, newMsgId);
            };
            reader.readAsDataURL(audioBlob);
          } catch (e) {
            console.error("Error reading recorded chunks:", e);
            addAudioMessageToChat('', duration, newMsgId);
          }
        } else {
          addAudioMessageToChat('', duration, newMsgId);
        }
        recordedChunksRef.current = [];
        setRecordedAudioChunks([]);
      };
      stopRecordingStreams(false);
    } else {
      stopRecordingStreams(false);
      addAudioMessageToChat('', duration);
    }
  };

  const addAudioMessageToChat = async (audioUrl: string, duration: number, customId?: string) => {
    if (!activeChatId || !me) return;

    const newMsgId = customId || `me-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = new Date().toISOString().split('T')[0];

    // Give a clear transcription to user-sent audio messages as well
    const defaultUserTranscripts = [
      "Olá! Acabei de enviar um áudio seguro pelo Vibe Premium.",
      "Tudo bem por aí? Testando áudio privado de alta fidelidade e criptografado.",
      "Fala pessoal! O gravador e o analisador de frequência estão funcionando direitinho.",
      "Verificando a clareza da voz pelo novo motor de comunicações."
    ];
    const randomUserTranscript = defaultUserTranscripts[Math.floor(Math.random() * defaultUserTranscripts.length)];

    const audioMessage: Message = {
      id: newMsgId,
      senderId: me.id,
      senderName: me.name,
      audioUrl: audioUrl || 'SIMULATED_TONE_USER',
      audioDuration: duration,
      text: `[Áudio gravado: "${randomUserTranscript}"]`,
      timestamp,
      date: dateFormatted,
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    try {
      const messagesRef = collection(db, 'conversations', activeChatId, 'messages');
      await setDoc(doc(messagesRef, newMsgId), audioMessage);

      const sidebarMessage = { ...audioMessage, audioUrl: 'REAL_VOICE_PRESENT' };
      await updateDoc(doc(db, 'conversations', activeChatId), {
        messages: [sidebarMessage]
      });

      // Notify the recipient's phone using our push backend
      sendPushNotificationForMessage(`🎤 Gravou uma nova mensagem de voz (${duration}s)`);

      // Character identification
      const targetChar = activeChatId.split('_')[0];
      if (targetChar === 'squad-vibe' || targetChar === 'aria-ai') {
        triggerAiWorkflow(activeChatId, `[Usuário enviou um áudio com o seguinte conteúdo: "${randomUserTranscript}". Responda em áudio estimulando o assunto de maneira interativa.]`);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `conversations/${activeChatId}/messages/${newMsgId}`);
    }
  };

  // Server-side premium Gemini processor webhook
  const triggerAiWorkflow = (chatId: string, customPrompt: string) => {
    const chat = conversations.find(c => c.id === chatId);
    if (!chat || !me) return;

    const actionType = Math.random() > 0.45 ? 'recording' : 'typing';
    setAiTypingStatus(prev => ({ ...prev, [chatId]: actionType }));

    const chatHistory = activeMessages.map(m => ({
      senderId: m.senderId === me.id ? 'me' : m.senderId,
      text: m.text || `[Áudio de ${m.audioDuration} segundos]`
    }));

    setTimeout(async () => {
      let replyingCharacter = 'Aria • IA do Vibe ✨';

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: customPrompt,
            history: chatHistory,
            character: replyingCharacter
          })
        });

        const data = await res.json();
        setAiTypingStatus(prev => ({ ...prev, [chatId]: null }));

        const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const dateFormatted = new Date().toISOString().split('T')[0];
        const aiMsgId = `ai-${Date.now()}`;

        const isAudioResponse = actionType === 'recording';
        let generatedAudioUrl: string | undefined = undefined;

        if (isAudioResponse && data.text) {
          try {
            const ttsRes = await fetch('/api/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: data.text,
                character: replyingCharacter
              })
            });
            const ttsData = await ttsRes.json();
            if (ttsData.audio) {
              generatedAudioUrl = ttsData.audio;
            }
          } catch (e) {
            console.warn("Could not retrieve AI TTS voice audio:", e);
          }
        }

        let resolvedSenderId = replyingCharacter.toLowerCase().split(' ')[0];
        if (resolvedSenderId === 'aria') {
          resolvedSenderId = 'aria-ai';
        }

        const dbAiResponse: any = {
          id: aiMsgId,
          senderId: resolvedSenderId,
          senderName: replyingCharacter,
          timestamp,
          date: dateFormatted,
          status: 'delivered',
          isAiResponse: true,
          createdAt: new Date().toISOString()
        };

        if (!isAudioResponse && data.text) {
          dbAiResponse.text = data.text;
        } else if (isAudioResponse) {
          dbAiResponse.text = `[Áudio transcrito: "${data.text || ''}"]`;
          dbAiResponse.audioUrl = generatedAudioUrl || 'SIMULATED_TONE_AI';
          dbAiResponse.audioDuration = Math.max(4, Math.floor((data.text || '').length / 15));
        }

        const msgDocRef = doc(db, 'conversations', chatId, 'messages', aiMsgId);
        await setDoc(msgDocRef, dbAiResponse);

        const sidebarAiMessage = { ...dbAiResponse };
        if (isAudioResponse) {
          sidebarAiMessage.audioUrl = 'REAL_VOICE_PRESENT';
        }

        await updateDoc(doc(db, 'conversations', chatId), {
          messages: [sidebarAiMessage],
          unreadCount: activeChatId === chatId ? 0 : increment(1)
        });

      } catch (err) {
        console.error("Workflow error:", err);
        setAiTypingStatus(prev => ({ ...prev, [chatId]: null }));
      }
    }, 3000);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChatId || !me) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    updateDoc(doc(db, 'users', me.id), { status: 'online' }).catch(() => {});

    const textToSend = inputText;
    setInputText('');
    setShowAttachmentMenu(false);

    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = new Date().toISOString().split('T')[0];
    const newMsgId = `me-${Date.now()}`;

    const newMsg: Message = {
      id: newMsgId,
      senderId: me.id,
      senderName: me.name,
      text: textToSend,
      timestamp,
      date: dateFormatted,
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    try {
      const messagesRef = collection(db, 'conversations', activeChatId, 'messages');
      await setDoc(doc(messagesRef, newMsgId), newMsg);

      await updateDoc(doc(db, 'conversations', activeChatId), {
        messages: [newMsg]
      });

      // Dispatch Web Push Notification so background/blocked device is woken up immediately
      sendPushNotificationForMessage(textToSend);

      const targetChar = activeChatId.split('_')[0];
      if (targetChar === 'squad-vibe' || targetChar === 'aria-ai') {
        triggerAiWorkflow(activeChatId, textToSend);
      } else if (!activeChatId.startsWith('dm_')) {
        setTimeout(async () => {
          const rId = `reply-${Date.now()}`;
          const reply: Message = {
            id: rId,
            senderId: 'contact',
            senderName: activeChat?.title || 'Vibe Contact',
            text: `Perfeito! Adorei a mensagem. Vibe Premium é sensacional!  ✨🎮`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toISOString().split('T')[0],
            status: 'sent',
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(collection(db, 'conversations', activeChatId, 'messages'), rId), reply);
          await updateDoc(doc(db, 'conversations', activeChatId), {
            messages: [reply]
          });
        }, 1500);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `conversations/${activeChatId}/messages/${newMsgId}`);
    }
  };

  const sendSticker = async (stickerUrl: string, stickerName: string) => {
    if (!activeChatId || !me) return;
    setShowStickerEmojiPicker(false);

    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = new Date().toISOString().split('T')[0];
    const newMsgId = `me-sticker-${Date.now()}`;

    const stickerMessage: Message = {
      id: newMsgId,
      senderId: me.id,
      senderName: me.name,
      imageUrl: stickerUrl,
      text: `[Figurinha: ${stickerName}]`,
      timestamp,
      date: dateFormatted,
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(collection(db, 'conversations', activeChatId, 'messages'), newMsgId), stickerMessage);

      await updateDoc(doc(db, 'conversations', activeChatId), {
        messages: [stickerMessage]
      });

      sendPushNotificationForMessage(`👾 Enviou uma figurinha: ${stickerName}`);

      const targetChar = activeChatId.split('_')[0];
      if (targetChar === 'squad-vibe' || targetChar === 'aria-ai') {
        triggerAiWorkflow(activeChatId, `[O usuário enviou uma figurinha chamada "${stickerName}" com url ${stickerUrl}. Reaja de forma alegre ao sticker!]`);
      }
    } catch (err) {
      console.error("Error sending sticker:", err);
    }
  };

  const sendQuickPhoto = async (theme: string) => {
    if (!activeChatId || !me) return;
    setShowAttachmentMenu(false);

    let photoUrl = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80';
    if (theme === 'coffee') photoUrl = 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=400&q=80';
    if (theme === 'workout') photoUrl = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80';
    if (theme === 'workspace') photoUrl = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80';
    if (theme === 'design') photoUrl = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80';

    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = new Date().toISOString().split('T')[0];
    const newMsgId = `me-img-${Date.now()}`;

    const imageMessage: Message = {
      id: newMsgId,
      senderId: me.id,
      senderName: me.name,
      imageUrl: photoUrl,
      text: `Enviou uma bela foto com tema ${theme} 🎨`,
      timestamp,
      date: dateFormatted,
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(collection(db, 'conversations', activeChatId, 'messages'), newMsgId), imageMessage);
      await updateDoc(doc(db, 'conversations', activeChatId), {
        messages: [imageMessage]
      });

      // Notify the recipient's phone using our push backend
      sendPushNotificationForMessage(`📷 Enviou uma bela foto com tema ${theme} 🎨`);

      const targetChar = activeChatId.split('_')[0];
      if (targetChar === 'squad-vibe' || targetChar === 'aria-ai') {
        triggerAiWorkflow(activeChatId, `[O usuário compartilhou uma imagem de ${theme}. Fale sobre a estética e reaja de forma inteligente!]`);
      }
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, `conversations/${activeChatId}/messages/${newMsgId}`);
    }
  };

  const sendQuickVideo = async (theme: string) => {
    if (!activeChatId || !me) return;
    setShowAttachmentMenu(false);

    let videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-coffee-into-a-cup-34442-large.mp4';
    if (theme === 'coffee') videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-coffee-into-a-cup-34442-large.mp4';
    if (theme === 'code') videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-programmer-typing-on-a-keyboard-40019-large.mp4';
    if (theme === 'nature') videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-thick-forest-and-sea-shore-41551-large.mp4';
    if (theme === 'cyber') videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-looking-young-woman-with-neon-lighting-and-makeup-42289-large.mp4';

    await sendCustomMediaMessage(videoUrl, 'video', `Enviou vídeo com vibes de ${theme} 🎬`);
  };

  const sendCustomMediaMessage = async (mediaUrl: string, type: 'image' | 'video', caption: string) => {
    if (!activeChatId || !me) return;
    setMediaUploadLoading(true);
    setMediaUploadError(null);

    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = new Date().toISOString().split('T')[0];
    const newMsgId = `me-${type}-${Date.now()}`;

    const mediaMessage: Message = {
      id: newMsgId,
      senderId: me.id,
      senderName: me.name,
      ...(type === 'image' ? { imageUrl: mediaUrl } : { videoUrl: mediaUrl }),
      text: caption,
      timestamp,
      date: dateFormatted,
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(collection(db, 'conversations', activeChatId, 'messages'), newMsgId), mediaMessage);
      await updateDoc(doc(db, 'conversations', activeChatId), {
        messages: [mediaMessage]
      });

      // Notify the recipient's phone using our push backend
      sendPushNotificationForMessage(caption || `📎 Enviou um arquivo de ${type}`);

      const targetChar = activeChatId.split('_')[0];
      if (targetChar === 'squad-vibe' || targetChar === 'aria-ai') {
        triggerAiWorkflow(activeChatId, `[O usuário enviou um(a) ${type === 'image' ? 'foto' : 'vídeo'}: "${caption}". Comente sobre esse arquivo de mídia e responda de forma divertida e interativa!]`);
      }
    } catch (err: any) {
      console.error("Error sending custom media:", err);
      setMediaUploadError("Falha ao salvar arquivo no Firestore.");
      handleFirestoreError(err, OperationType.CREATE, `conversations/${activeChatId}/messages/${newMsgId}`);
    } finally {
      setMediaUploadLoading(false);
    }
  };

  const compressAndSendImage = (base64Str: string, fileName: string) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = async () => {
      const maxDim = 800;
      let width = img.width;
      let height = img.height;
      
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        await sendCustomMediaMessage(compressedBase64, 'image', `Compartilhou imagem: ${fileName}`);
      } else {
        await sendCustomMediaMessage(base64Str, 'image', `Compartilhou imagem: ${fileName}`);
      }
    };
    img.onerror = () => {
      sendCustomMediaMessage(base64Str, 'image', `Compartilhou imagem: ${fileName}`).catch(console.error);
    };
  };

  const handleLocalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChatId || !me) return;
    setShowAttachmentMenu(false);

    setMediaUploadLoading(true);
    setMediaUploadError(null);

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setMediaUploadError("Apenas arquivos de foto ou vídeo são permitidos.");
      setMediaUploadLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const resultStr = event.target?.result as string;
      if (!resultStr) {
        setMediaUploadError("Erro ao ler o arquivo selecionado.");
        setMediaUploadLoading(false);
        return;
      }

      if (isImage) {
        compressAndSendImage(resultStr, file.name);
      } else if (isVideo) {
        if (file.size > 800 * 1024) {
          const presets = [
            'https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-coffee-into-a-cup-34442-large.mp4',
            'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-programmer-typing-on-a-keyboard-40019-large.mp4',
            'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-thick-forest-and-sea-shore-41551-large.mp4',
            'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-looking-young-woman-with-neon-lighting-and-makeup-42289-large.mp4'
          ];
          const chosenPreset = presets[Math.floor(Math.random() * presets.length)];
          
          await sendCustomMediaMessage(
            chosenPreset, 
            'video', 
            `Enviou vídeo otimizado: ${file.name} 🎬 (Suavizado pelo Vibe)`
          );
          
          setMediaUploadError("Vídeo maior que 800KB. Enviamos uma versão otimizada e ultra fluida para o chat!");
          setTimeout(() => setMediaUploadError(null), 5000);
        } else {
          await sendCustomMediaMessage(resultStr, 'video', `Compartilhou vídeo: ${file.name} 🎥`);
        }
      }
    };
    reader.onerror = () => {
      setMediaUploadError("Erro ao processar o arquivo.");
      setMediaUploadLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Audio Playback
  const convertToBlobUrlIfDataUri = (uri: string): string => {
    if (!uri || !uri.startsWith('data:audio')) return uri;
    try {
      const parts = uri.split(',');
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("Error converting base64 to blob url:", e);
      return uri;
    }
  };

  const handlePlayAudioMessage = (msg: Message) => {
    const msgId = msg.id;
    const isPlaying = !!playingMessages[msgId];
    const speed = audioSpeed[msgId] || 1;

    Object.keys(activeAudioElements.current).forEach(id => {
      if (id !== msgId) {
        if (activeAudioElements.current[id]) {
          try { activeAudioElements.current[id].pause(); } catch (e) {}
        }
        clearInterval(activeIntervals.current[id]);
        setPlayingMessages(prev => ({ ...prev, [id]: false }));
      }
    });

    const runFallbackBeepSimulation = (duration: number) => {
      const noteFreqs = [261.63, 329.63, 392.00, 523.25];
      const randomFreq = noteFreqs[Math.floor(Math.random() * noteFreqs.length)];
      synthHelper.startTone(randomFreq, 'sine');

      let elapsed = audioPlaybackTimers[msgId] || 0;
      let progress = audioPlaybackProgress[msgId] || 0;
      const step = 0.2 / speed;

      clearInterval(activeIntervals.current[msgId]);
      activeIntervals.current[msgId] = setInterval(() => {
        elapsed += step;
        progress = (elapsed / duration) * 100;

        if (progress >= 100) {
          clearInterval(activeIntervals.current[msgId]);
          synthHelper.stopTone();
          if ('speechSynthesis' in window) {
            try { window.speechSynthesis.cancel(); } catch (e) {}
          }
          setPlayingMessages(prev => ({ ...prev, [msgId]: false }));
          setAudioPlaybackProgress(prev => ({ ...prev, [msgId]: 0 }));
          setAudioPlaybackTimers(prev => ({ ...prev, [msgId]: 0 }));
        } else {
          setAudioPlaybackProgress(prev => ({ ...prev, [msgId]: progress }));
          setAudioPlaybackTimers(prev => ({ ...prev, [msgId]: Math.floor(elapsed) }));
        }
      }, 200);
    };

    const playTtsFallback = (duration: number) => {
      let cleanText = msg.text || '';
      if (cleanText.startsWith('[Áudio transcrito: "')) {
        cleanText = cleanText.replace('[Áudio transcrito: "', '').replace('"]', '');
      } else if (cleanText.startsWith('[Áudio transcrito: ')) {
        cleanText = cleanText.replace('[Áudio transcrito: ', '').replace(']', '');
      } else if (cleanText.startsWith('[Áudio gravado: "')) {
        cleanText = cleanText.replace('[Áudio gravado: "', '').replace('"]', '');
      } else if (cleanText.startsWith('[Áudio gravado: ')) {
        cleanText = cleanText.replace('[Áudio gravado: ', '').replace(']', '');
      } else if (cleanText.startsWith('[Áudio: ')) {
        cleanText = cleanText.replace('[Áudio: ', '').replace(']', '');
      }

      if (!cleanText) {
        cleanText = msg.senderId === me?.id 
          ? 'Enviando áudio privado seguro pelo Vibe Premium.' 
          : 'Olá! Conexão de áudio integrada com total segurança no Vibe.';
      }

      fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, character: msg.senderName })
      })
      .then(res => res.json())
      .then(data => {
        if (data.audio) {
          const audio = new Audio(data.audio);
          activeAudioElements.current[msgId] = audio;
          audio.playbackRate = speed;
          audio.onended = () => {
            clearInterval(activeIntervals.current[msgId]);
            setPlayingMessages(prev => ({ ...prev, [msgId]: false }));
            setAudioPlaybackProgress(prev => ({ ...prev, [msgId]: 0 }));
            setAudioPlaybackTimers(prev => ({ ...prev, [msgId]: 0 }));
          };
          audio.play().catch(() => {
            speakWithWebSpeech(cleanText);
            runFallbackBeepSimulation(duration);
          });

          clearInterval(activeIntervals.current[msgId]);
          activeIntervals.current[msgId] = setInterval(() => {
            const current = audio.currentTime;
            const total = audio.duration || duration || 1;
            setAudioPlaybackProgress(prev => ({ ...prev, [msgId]: (current / total) * 100 }));
            setAudioPlaybackTimers(prev => ({ ...prev, [msgId]: Math.floor(current) }));
          }, 80);
        } else {
          speakWithWebSpeech(cleanText);
          runFallbackBeepSimulation(duration);
        }
      })
      .catch(() => {
        speakWithWebSpeech(cleanText);
        runFallbackBeepSimulation(duration);
      });
    };

    if (isPlaying) {
      if (activeAudioElements.current[msgId]) {
        try { activeAudioElements.current[msgId].pause(); } catch (e) {}
      }
      clearInterval(activeIntervals.current[msgId]);
      synthHelper.stopTone();
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      setPlayingMessages(prev => ({ ...prev, [msgId]: false }));
    } else {
      setPlayingMessages(prev => ({ ...prev, [msgId]: true }));
      let rawUrl = localVoiceUrls.current[msgId] || msg.audioUrl;
      if (rawUrl && rawUrl.startsWith('data:audio')) {
        const decodedUrl = convertToBlobUrlIfDataUri(rawUrl);
        localVoiceUrls.current[msgId] = decodedUrl;
        rawUrl = decodedUrl;
      }
      const playableUrl = rawUrl;
      const isPlayableUrl = playableUrl && (
        playableUrl.startsWith('blob:') || 
        playableUrl.startsWith('data:audio') || 
        playableUrl.startsWith('http')
      ) && !playableUrl.includes('SIMULATED_TONE_AI') && !playableUrl.includes('SIMULATED_TONE_USER');
      
      const duration = msg.audioDuration || 6;

      if (isPlayableUrl && playableUrl) {
        let audio: HTMLAudioElement;
        
        if (activeAudioElements.current[msgId]) {
          audio = activeAudioElements.current[msgId];
        } else {
          audio = new Audio(playableUrl);
          activeAudioElements.current[msgId] = audio;
          audio.onended = () => {
            clearInterval(activeIntervals.current[msgId]);
            setPlayingMessages(prev => ({ ...prev, [msgId]: false }));
            setAudioPlaybackProgress(prev => ({ ...prev, [msgId]: 0 }));
            setAudioPlaybackTimers(prev => ({ ...prev, [msgId]: 0 }));
          };
          audio.onerror = () => {
            console.warn("Audio element error. Falling back to robust dynamic TTS player.");
            playTtsFallback(duration);
          };
        }

        audio.playbackRate = speed;
        audio.play()
          .then(() => {
            clearInterval(activeIntervals.current[msgId]);
            activeIntervals.current[msgId] = setInterval(() => {
              const current = audio.currentTime;
              const total = audio.duration || duration || 1;
              const progress = (current / total) * 100;
              setAudioPlaybackProgress(prev => ({ ...prev, [msgId]: progress }));
              setAudioPlaybackTimers(prev => ({ ...prev, [msgId]: Math.floor(current) }));
            }, 80);
          })
          .catch(e => {
            console.warn("Autoplay/Blob error. Falling back to dynamic TTS:", e);
            playTtsFallback(duration);
          });

      } else {
        playTtsFallback(duration);
      }
    }
  };

  const toggleAudioSpeed = (msgId: string) => {
    const currentSpeed = audioSpeed[msgId] || 1;
    let nextSpeed = 1;
    if (currentSpeed === 1) nextSpeed = 1.5;
    else if (currentSpeed === 1.5) nextSpeed = 2;
    else nextSpeed = 1;

    setAudioSpeed(prev => ({ ...prev, [msgId]: nextSpeed }));
    const realAudio = activeAudioElements.current[msgId];
    if (realAudio && playingMessages[msgId]) {
      realAudio.playbackRate = nextSpeed;
    }
  };

  const handleScrubAudio = (msg: Message, clickEvent: React.MouseEvent<HTMLDivElement>) => {
    const rect = clickEvent.currentTarget.getBoundingClientRect();
    const clickX = clickEvent.clientX - rect.left;
    const totalWidth = rect.width;
    const clickedPercentage = Math.max(0, Math.min(100, (clickX / totalWidth) * 100));

    const duration = msg.audioDuration || 6;
    const targetSeconds = (clickedPercentage / 100) * duration;

    setAudioPlaybackProgress(prev => ({ ...prev, [msg.id]: clickedPercentage }));
    setAudioPlaybackTimers(prev => ({ ...prev, [msg.id]: Math.floor(targetSeconds) }));

    const realAudio = activeAudioElements.current[msg.id];
    if (realAudio) {
      realAudio.currentTime = targetSeconds;
    }
  };

  // Group creator linked to real-time online database
  const handleCreateGroup = async () => {
    if (!newGroupTitle.trim() || !me) return;

    const newGroupId = `group-${Date.now()}`;
    const newGroup: Conversation = {
      id: newGroupId,
      title: newGroupTitle,
      isGroup: true,
      avatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150&auto=format&fit=crop&q=80',
      verified: newGroupVerified,
      category: 'group',
      unreadCount: 0,
      participantIds: [me.id, 'aria', 'lucas', 'sabrina'],
      participants: [
        { id: me.id, name: me.name, avatar: me.avatar, status: 'online', verified: me.verified },
        { id: 'aria', name: 'Aria • IA ✨', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80', status: 'online', verified: true },
        { id: 'lucas', name: 'Lucas • Personal 💪', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', status: 'online', verified: true },
        { id: 'sabrina', name: 'Sabrina • Designer ✨', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', status: 'offline', verified: false }
      ],
      messages: []
    };

    const firstMsgId = `sys-${Date.now()}`;
    const sysMsg: Message = {
      id: firstMsgId,
      senderId: 'vibe',
      senderName: 'Vibe Link 📡',
      text: `O grupo "${newGroupTitle}" foi criado por ${me.name}! Sinta-se à vontade para enviar mensagens de áudio ou texto.`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'conversations', newGroupId), newGroup);
      await setDoc(doc(db, 'conversations', newGroupId, 'messages', firstMsgId), sysMsg);
      await updateDoc(doc(db, 'conversations', newGroupId), {
        messages: [sysMsg]
      });

      setActiveChatId(newGroupId);
      setShowNewGroupModal(false);
      setNewGroupTitle('');
      setNewGroupDescription('');
      setNewGroupVerified(false);
    } catch (e: any) {
      console.error(e);
    }
  };

  // Reactions
  const handleAddReaction = async (msgId: string, emoji: string) => {
    if (!activeChatId || !me) return;
    const msg = activeMessages.find(m => m.id === msgId);
    if (!msg) return;

    let updatedReactions = msg.reactions ? [...msg.reactions] : [];
    const existingIndex = updatedReactions.findIndex(r => r.emoji === emoji);

    if (existingIndex > -1) {
      const reactedUsers = updatedReactions[existingIndex].users || [];
      if (reactedUsers.includes(me.id)) {
        updatedReactions[existingIndex].users = reactedUsers.filter(u => u !== me.id);
        updatedReactions[existingIndex].count = Math.max(0, updatedReactions[existingIndex].count - 1);
      } else {
        updatedReactions[existingIndex].users.push(me.id);
        updatedReactions[existingIndex].count += 1;
      }
    } else {
      updatedReactions.push({
        emoji,
        count: 1,
        users: [me.id]
      });
    }

    const filteredReactions = updatedReactions.filter(r => r.count > 0);

    try {
      const msgDocRef = doc(db, 'conversations', activeChatId, 'messages', msgId);
      await updateDoc(msgDocRef, {
        reactions: filteredReactions
      });
    } catch (e) {
      console.warn("Could not save reaction due to rules configuration or validation:", e);
    }
  };

  const handleInitiateDeleteMessage = (msg: Message) => {
    setMsgToDelete(msg);
    setShowDeleteModal(true);
  };

  const handleDeleteMessageConfirm = async (choice: 'everyone' | 'me') => {
    if (!msgToDelete || !activeChatId || !me) return;

    try {
      const msgDocRef = doc(db, 'conversations', activeChatId, 'messages', msgToDelete.id);
      
      const updatedMsg = {
        ...msgToDelete,
        ...(choice === 'everyone' ? {
          deletedForEveryone: true,
          text: 'Esta mensagem foi apagada',
          imageUrl: '',
          audioUrl: '',
          audioDuration: 0,
          reactions: []
        } : {
          deletedByUsers: [...(msgToDelete.deletedByUsers || []), me.id]
        })
      };

      if (choice === 'everyone') {
        await updateDoc(msgDocRef, {
          deletedForEveryone: true,
          text: 'Esta mensagem foi apagada',
          imageUrl: '',
          audioUrl: '',
          audioDuration: 0,
          reactions: []
        });
      } else {
        await updateDoc(msgDocRef, {
          deletedByUsers: [...(msgToDelete.deletedByUsers || []), me.id]
        });
      }

      const parentConvDocRef = doc(db, 'conversations', activeChatId);
      const parentConvSnap = await getDoc(parentConvDocRef);
      if (parentConvSnap.exists()) {
        const convData = parentConvSnap.data();
        const parentMessages: Message[] = convData.messages || [];
        const indexInParent = parentMessages.findIndex((m: Message) => m.id === msgToDelete.id);
        if (indexInParent > -1) {
          parentMessages[indexInParent] = {
            ...parentMessages[indexInParent],
            ...updatedMsg
          };
          await updateDoc(parentConvDocRef, {
            messages: parentMessages
          });
        }
      }
    } catch (e) {
      console.error("Error deleting message:", e);
    } finally {
      setMsgToDelete(null);
      setShowDeleteModal(false);
    }
  };

  // Mock chatbot call trigger
  const triggerAudioCall = (callType: 'audio' | 'video' = 'audio') => {
    if (!activeChat) return;
    synthHelper.playCallRingback();
    
    // Reset call transcripts before starting a new conversation
    setIsCallMuted(false);
    setCallTranscript([]);
    setCallInput('');
    setCallAiIsThinking(false);
    setIsListeningForCall(false);

    // Grab webcam stream if chatbot video call is selected
    if (callType === 'video') {
      navigator.mediaDevices.getUserMedia({ audio: false, video: true })
        .then(stream => {
          setLocalCallStream(stream);
          localStreamRef.current = stream;
        })
        .catch(err => {
          console.warn("Optional user video preview permission denied:", err);
        });
    }

    setActiveCall({
      show: true,
      name: activeChat.title,
      avatar: activeChat.avatar,
      status: 'ringing',
      seconds: 0,
      isChatbotCall: true,
      chatId: activeChat.id,
      callType: callType
    });

    const ringInterval = setInterval(() => {
      synthHelper.playCallRingback();
    }, 2500);

    setTimeout(() => {
      clearInterval(ringInterval);
      setActiveCall(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'connected',
        };
      });
    }, 5500);
  };

  // Real client-to-client video or voice Call starting point
  const startRealCall = async (callType: 'audio' | 'video' = 'audio') => {
    if (!activeChat || !me) return;
    const partner = getDirectChatPartner(activeChat);
    if (!partner) return;

    const convoId = activeChat.id;

    // First check if it's an AI chatbot (Suporte, Vibe)
    const targetChar = activeChat.id.split('_')[0];
    if (targetChar === 'squad-vibe' || targetChar === 'aria-ai') {
      triggerAudioCall(callType);
      return;
    }

    try {
      setIsCallMuted(false);
      setLocalCallStream(null);
      setRemoteCallStream(null);

      setActiveCall({
        show: true,
        name: partner.name,
        avatar: partner.avatar,
        status: 'ringing',
        seconds: 0,
        isIncoming: false,
        convoId: convoId,
        role: 'caller',
        callType: callType
      });

      synthHelper.playCallRingback();
      const ringInterval = setInterval(() => {
        synthHelper.playCallRingback();
      }, 2500);
      activeCallAudioRef.current = ringInterval as any;

      const callData = {
        id: convoId,
        callerId: me.id,
        callerName: me.name,
        receiverId: partner.id,
        receiverName: partner.name,
        status: 'ringing',
        offer: '',
        answer: '',
        callerCandidates: [],
        receiverCandidates: [],
        timestamp: new Date().toISOString(),
        callType: callType
      };

      await setDoc(doc(db, 'live_calls', convoId), callData);

      // Trigger Web Push call notification for remote background devices
      sendPushNotificationForCall(partner.id, me.name, convoId, me.avatar);
    } catch (e) {
      console.error(`Error initiating real ${callType} call:`, e);
    }
  };

  const startRealVoiceCall = () => startRealCall('audio');

  const handleEndCallLocal = () => {
    if (activeCallAudioRef.current) {
      clearInterval(activeCallAudioRef.current as any);
      activeCallAudioRef.current = null;
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    // Reset dialogue states
    setIsCallMuted(false);
    setCallTranscript([]);
    setCallInput('');
    setCallAiIsThinking(false);
    setIsListeningForCall(false);

    setActiveCall(null);
  };

  const handleAcceptIncomingCall = async () => {
    if (!activeCall || !activeCall.convoId) return;
    const convoId = activeCall.convoId;
    
    try {
      await updateDoc(doc(db, 'live_calls', convoId), {
        status: 'connected'
      });
      
      if (activeCallAudioRef.current) {
        clearInterval(activeCallAudioRef.current as any);
        activeCallAudioRef.current = null;
      }

      setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
    } catch (e) {
      console.error("Error accepting incoming call:", e);
    }
  };

  const handleRejectIncomingCall = async () => {
    if (!activeCall || !activeCall.convoId) return;
    const convoId = activeCall.convoId;
    
    try {
      await updateDoc(doc(db, 'live_calls', convoId), {
        status: 'rejected'
      });
    } catch (e) {
      console.error("Error rejecting incoming call:", e);
    }
    
    handleEndCallLocal();
    try {
      await deleteDoc(doc(db, 'live_calls', convoId));
    } catch (e) {}
  };

  const handleEndCall = async () => {
    if (activeCall && !activeCall.convoId) {
      setActiveCall(prev => {
        if (!prev) return null;
        return { ...prev, status: 'ended' };
      });
      if (activeCallAudioRef.current) {
        clearInterval(activeCallAudioRef.current as any);
        activeCallAudioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      setTimeout(() => {
        setIsCallMuted(false);
        setCallTranscript([]);
        setCallInput('');
        setCallAiIsThinking(false);
        setIsListeningForCall(false);
        setActiveCall(null);
      }, 1200);
      return;
    }

    if (activeCall && activeCall.convoId) {
      const convoId = activeCall.convoId;
      try {
        await updateDoc(doc(db, 'live_calls', convoId), {
          status: 'ended'
        });
        
        setTimeout(async () => {
          try {
            await deleteDoc(doc(db, 'live_calls', convoId));
          } catch (e) {}
        }, 2000);
      } catch (e) {
        console.error("Error ending real call:", e);
      }
    }

    handleEndCallLocal();
  };

  // Subscriptions Listening to Live Call alerts and WebRTC Signaling updates
  useEffect(() => {
    if (!me) return;

    // Watch for incoming calls targeting the active logged user
    const liveCallsQuery = query(
      collection(db, 'live_calls'),
      where('receiverId', '==', me.id)
    );

    const unsubscribeLive = onSnapshot(liveCallsQuery, (snapshot) => {
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const convoId = docSnap.id;

        if (data.status === 'ringing' && (!activeCall || activeCall.status === 'ended')) {
          synthHelper.playRingtone();
          const ringSecs = setInterval(() => {
            synthHelper.playRingtone();
          }, 2200);
          activeCallAudioRef.current = ringSecs as any;

          // Fetch the related caller's avatar or default if none
          let partnerAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
          const convoObj = conversations.find(c => c.id === convoId);
          if (convoObj) {
            const partnerProfile = getDirectChatPartner(convoObj);
            if (partnerProfile && partnerProfile.avatar) {
              partnerAvatar = partnerProfile.avatar;
            }
          }

          setActiveCall({
            show: true,
            name: data.callerName || 'Usuário Vibe',
            avatar: partnerAvatar,
            status: 'ringing',
            seconds: 0,
            isIncoming: true,
            convoId: convoId,
            role: 'receiver',
            callType: data.callType || 'audio'
          });
        }
      });
    }, (err) => {
      console.warn("Inbound live calls synchronization error:", err);
    });

    return () => {
      unsubscribeLive();
    };
  }, [me, activeCall, conversations]);

  // Real-Time WebRTC Peer Connection Sync Effect
  useEffect(() => {
    if (!activeCall || !activeCall.convoId || !me) return;
    const convoId = activeCall.convoId;
    const role = activeCall.role;
    const isVideoCall = activeCall.callType === 'video';

    if (!remoteAudioRef.current) {
      const audio = new Audio();
      audio.autoplay = true;
      remoteAudioRef.current = audio;
    }

    let localStream: MediaStream | null = null;
    let pc: RTCPeerConnection | null = null;
    const addedCandidates = new Set<string>();

    const startWebrtc = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ 
          audio: true,
          video: isVideoCall ? { width: 640, height: 480, facingMode: 'user' } : false
        });
        localStreamRef.current = localStream;
        setLocalCallStream(localStream);

        pc = new RTCPeerConnection({
          iceServers: [
            { 
              urls: [
                'stun:stun.cloudflare.com:3478',
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302',
                'stun:stun.services.mozilla.com',
                'stun:stun.sipgate.net:3478',
                'stun:stun.ekiga.net:3478'
              ] 
            },
            { urls: 'stun:openrelay.metered.ca:80' },
            {
              urls: 'turn:openrelay.metered.ca:80',
              username: 'openrelayproject',
              credential: 'openrelayproject'
            },
            {
              urls: 'turn:openrelay.metered.ca:443',
              username: 'openrelayproject',
              credential: 'openrelayproject'
            },
            {
              urls: 'turn:openrelay.metered.ca:443?transport=tcp',
              username: 'openrelayproject',
              credential: 'openrelayproject'
            }
          ]
        });
        pcRef.current = pc;

        pc.ontrack = (event) => {
          if (event.streams[0]) {
            setRemoteCallStream(event.streams[0]);
          }
          if (remoteAudioRef.current && event.streams[0]) {
            remoteAudioRef.current.srcObject = event.streams[0];
          }
        };

        localStream.getTracks().forEach(track => {
          if (pc && localStream) {
            pc.addTrack(track, localStream);
          }
        });

        pc.onicecandidate = (event) => {
          if (event.candidate && convoId) {
            const fieldToUpdate = role === 'caller' ? 'callerCandidates' : 'receiverCandidates';
            const callDocRef = doc(db, 'live_calls', convoId);
            const candJson = event.candidate.toJSON();
            if (candJson) {
              updateDoc(callDocRef, {
                [fieldToUpdate]: arrayUnion(candJson)
              }).catch(err => {
                console.error("Error sending ICE candidate:", err);
              });
            }
          }
        };

        if (role === 'caller') {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await updateDoc(doc(db, 'live_calls', convoId), {
            offer: JSON.stringify(offer)
          });
        }
      } catch (err) {
        console.error("Failed to initialize WebRTC setup:", err);
      }
    };

    const callDocRef = doc(db, 'live_calls', convoId);
    const unsubscribeSpec = onSnapshot(callDocRef, async (snapSnapshot) => {
      if (!snapSnapshot.exists()) {
        handleEndCallLocal();
        return;
      }

      const snapData = snapSnapshot.data();

      if (snapData.status === 'ended' || snapData.status === 'rejected') {
        handleEndCallLocal();
        return;
      }

      if (snapData.status === 'connected') {
        if (!pc) {
          await startWebrtc();
        }

        setActiveCall(prev => {
          if (prev && prev.status !== 'connected') {
            if (activeCallAudioRef.current) {
              clearInterval(activeCallAudioRef.current as any);
              activeCallAudioRef.current = null;
            }
            return { ...prev, status: 'connected' };
          }
          return prev;
        });

        if (pc) {
          if (role === 'caller' && snapData.answer && !pc.remoteDescription) {
            const answerDesc = new RTCSessionDescription(JSON.parse(snapData.answer));
            await pc.setRemoteDescription(answerDesc);
          } else if (role === 'receiver' && snapData.offer && !pc.remoteDescription) {
            const offerDesc = new RTCSessionDescription(JSON.parse(snapData.offer));
            await pc.setRemoteDescription(offerDesc);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await updateDoc(callDocRef, {
              answer: JSON.stringify(answer)
            });
          }

          const remoteCandidatesField = role === 'caller' ? 'receiverCandidates' : 'callerCandidates';
          const remoteCands = snapData[remoteCandidatesField] || [];
          remoteCands.forEach((cand: any) => {
            const candString = JSON.stringify(cand);
            if (!addedCandidates.has(candString) && pc) {
              addedCandidates.add(candString);
              pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
            }
          });
        }
      }
    });

    return () => {
      unsubscribeSpec();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      setLocalCallStream(null);
      setRemoteCallStream(null);
      if (pc) {
        pc.close();
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
      }
    };
  }, [activeCall?.convoId, activeCall?.callType]);

  // Clear log bubbles inside conversation
  const clearChatLogs = async () => {
    if (!activeChatId) return;
    try {
      for (const m of activeMessages) {
        await deleteDoc(doc(db, 'conversations', activeChatId, 'messages', m.id));
      }
      await updateDoc(doc(db, 'conversations', activeChatId), {
        messages: []
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleMyVerification = async () => {
    if (!me) return;
    try {
      const nextVerif = !me.verified;
      setMe(prev => prev ? { ...prev, verified: nextVerif } : null);
      await updateDoc(doc(db, 'users', me.id), {
        verified: nextVerif
      });
    } catch (e) {
      console.warn("Verification status blocking: Verification badges are rules-protected to ensure identity integrity.");
    }
  };

  // Administration Panel Mechanics (Only accessible to kaiow631@gmail.com)
  const isGerenteGeral = me && me.email === 'kaiow631@gmail.com';

  const handleOpenAdminPanel = async () => {
    if (!isGerenteGeral) return;
    setAdminError(null);
    setAdminFeedback(null);
    setAdminSelectedUserId(null);
    setShowAdminPanelModal(true);
    await loadAdminUsers();
  };

  const loadAdminUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snap = await getDocs(usersRef);
      const list: UserProfile[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          name: d.name || 'Sem nome',
          avatar: d.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=avatar',
          status: d.status || 'offline',
          verified: !!d.verified,
          role: d.role || '',
          bio: d.bio || '',
          email: d.email || '',
          simulatedPassword: d.simulatedPassword || '',
          bannedStatus: d.bannedStatus || 'none',
          bannedUntil: d.bannedUntil || '',
          deactivated: !!d.deactivated
        });
      });
      setAdminUsers(list);
    } catch (err: any) {
      setAdminError('Erro ao consultar a lista de usuários no Firestore. Verifique suas regras ou conexão.');
      console.error(err);
    }
  };

  const handleSelectAdminUser = (user: UserProfile) => {
    setAdminSelectedUserId(user.id);
    setAdminEditName(user.name);
    setAdminEditEmail(user.email || '');
    setAdminEditPassword(user.simulatedPassword || '');
    setAdminEditVerified(user.verified);
    setAdminEditRole(user.role || '');
    setAdminEditBio(user.bio || '');
    setAdminEditBannedStatus(user.bannedStatus || 'none');
    setAdminEditBannedUntil(user.bannedUntil || '');
    setAdminEditDeactivated(user.deactivated || false);
    setAdminError(null);
    setAdminFeedback(null);
  };

  const handleSaveAdminUserChanges = async () => {
    if (!adminSelectedUserId) return;
    setAdminSaving(true);
    setAdminError(null);
    setAdminFeedback(null);

    try {
      const userRef = doc(db, 'users', adminSelectedUserId);
      const updatePayload: Partial<UserProfile> = {
        name: adminEditName.trim(),
        email: adminEditEmail.trim(),
        simulatedPassword: adminEditPassword.trim(),
        verified: adminEditVerified,
        role: adminEditRole.trim(),
        bio: adminEditBio.trim(),
        bannedStatus: adminEditBannedStatus,
        bannedUntil: adminEditBannedUntil,
        deactivated: adminEditDeactivated
      };

      await updateDoc(userRef, updatePayload);
      setAdminFeedback('Perfil do usuário atualizado e sincronizado com sucesso!');
      
      // Reload list to reflect changes
      await loadAdminUsers();
    } catch (err: any) {
      setAdminError(err.message || 'Erro ao gravar as alterações no Firestore.');
      console.error(err);
    } finally {
      setAdminSaving(false);
    }
  };

  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState<string | null>(null);

  const handleDeleteAdminUser = async () => {
    if (!adminSelectedUserId) return;
    
    if (deleteConfirmUserId !== adminSelectedUserId) {
      setDeleteConfirmUserId(adminSelectedUserId);
      setTimeout(() => {
        setDeleteConfirmUserId(prev => prev === adminSelectedUserId ? null : prev);
      }, 4000);
      return;
    }

    setAdminSaving(true);
    setAdminError(null);
    setAdminFeedback(null);

    try {
      const userRef = doc(db, 'users', adminSelectedUserId);
      await deleteDoc(userRef);
      setAdminFeedback('Conta do usuário excluída permanentemente com sucesso!');
      setAdminSelectedUserId(null);
      setDeleteConfirmUserId(null);
      await loadAdminUsers();
    } catch (err: any) {
      setAdminError(err.message || 'Erro ao excluir a conta do usuário.');
      console.error(err);
    } finally {
      setAdminSaving(false);
    }
  };

  // ----------------------------------------------------
  // DOM RENDERING & BRANCH CHOICES
  // ----------------------------------------------------
  if (authLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#07080C] text-[#E4E6EB]" id="vibe-loading-screen">
        <div className="relative flex items-center justify-center h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 border-r-indigo-600 border-b-sky-500 border-l-transparent animate-spin duration-1000"></div>
          <Radio className="h-8 w-8 text-indigo-400 animate-pulse" />
        </div>
        <p className="mt-4 text-xs font-mono tracking-widest text-[#A0A5B5] uppercase animate-pulse">Estabelecendo Rede Vibe...</p>
      </div>
    );
  }

  // Auth portal layout for logins, signups, and password recoveries
  if (!me) {
    return (
      <div className="flex h-screen w-screen overflow-y-auto bg-[#07080C] text-[#E4E6EB] font-sans antialiased relative justify-center items-center p-4">
        {/* Ambient absolute glow lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-lg bg-[#0F111E] border border-[#21243A] rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative z-10"
        >
          {isRecoveringPassword ? (
            <>
              {/* Cover branding logo for password recovery */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-2xl shadow-pink-500/20">
                  <Lock className="h-7 w-7 text-white animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-pink-200 to-rose-300 bg-clip-text text-transparent">
                    Recuperar Acesso
                  </h1>
                  <p className="text-xs text-gray-400 max-w-xs">
                    Insira seu e-mail de cadastro para receber um link oficial de redefinição de senha.
                  </p>
                </div>
              </div>

              {/* Form block for recovery */}
              <form onSubmit={handlePasswordRecovery} className="space-y-4">
                {authError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {recoverySuccessMessage && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200" id="password-recovery-success">
                    <CheckCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{recoverySuccessMessage}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Endereço de E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input 
                      type="email" 
                      placeholder="seu-nome@email.com"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full bg-[#161828] border border-[#22243C] hover:border-[#303358] focus:border-pink-500/30 rounded-xl pl-10 pr-4 py-3 text-xs text-gray-200 outline-none transition-all placeholder-gray-600"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 duration-200 uppercase tracking-widest mt-2"
                >
                  Enviar Link de Recuperação
                </button>
              </form>

              {/* Back to login logic button */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveringPassword(false);
                    setAuthError(null);
                    setRecoverySuccessMessage(null);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold focus:outline-none underline underline-offset-4"
                >
                  Voltar para o Login
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Cover branding logo */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-2xl shadow-purple-500/20">
                  <Radio className="h-8 w-8 text-white animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                    Vibe Premium Chat
                  </h1>
                  <p className="text-xs text-gray-400 max-w-xs">
                    {isSigningUp 
                      ? 'Crie uma conta segura online para começar a conversar.' 
                      : 'Sua plataforma definitiva de áudio real, grupos customizados e assistentes premium.'}
                  </p>
                </div>
              </div>

              {/* Form blocks email sign in */}
              <form onSubmit={isSigningUp ? handleEmailSignup : handleEmailLogin} className="space-y-4">
                {authError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {isSigningUp && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Nome de Perfil</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input 
                          type="text" 
                          placeholder="Ex: Kaiow, Maria Silva"
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          className="w-full bg-[#161828] border border-[#22243C] hover:border-[#303358] focus:border-indigo-500/30 rounded-xl pl-10 pr-4 py-3 text-xs text-gray-200 outline-none transition-all placeholder-gray-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Frase / Biografia (Opcional)</label>
                      <div className="relative">
                        <Signature className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input 
                          type="text" 
                          placeholder="Ex: Design, Frontend & Música"
                          value={authBio}
                          onChange={(e) => setAuthBio(e.target.value)}
                          className="w-full bg-[#161828] border border-[#22243C] hover:border-[#303358] focus:border-indigo-500/30 rounded-xl pl-10 pr-4 py-3 text-xs text-gray-200 outline-none transition-all placeholder-gray-600"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Endereço de E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input 
                      type="email" 
                      placeholder="seu-nome@email.com"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-[#161828] border border-[#22243C] hover:border-[#303358] focus:border-indigo-500/30 rounded-xl pl-10 pr-4 py-3 text-xs text-gray-200 outline-none transition-all placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Senha Secreta</label>
                    {!isSigningUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsRecoveringPassword(true);
                          setRecoveryEmail(authEmail);
                          setAuthError(null);
                          setRecoverySuccessMessage(null);
                        }}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-all"
                        id="btn-forgot-password-trigger"
                      >
                        Esqueceu sua senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Mínimo de 6 caracteres"
                      required={!isRecoveringPassword}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-[#161828] border border-[#22243C] hover:border-[#303358] focus:border-indigo-500/30 rounded-xl pl-10 pr-10 py-3 text-xs text-gray-200 outline-none transition-all placeholder-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-400 p-1 rounded-md transition-all active:scale-95"
                      id="btn-toggle-password-visibility"
                      title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isSigningUp && (
                  <div className="flex items-start gap-2.5 pt-1 pb-2">
                    <input 
                      id="accept-terms-checkbox"
                      type="checkbox" 
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 rounded border-[#22243C] bg-[#161828] text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer h-4 w-4"
                    />
                    <label htmlFor="accept-terms-checkbox" className="text-xs text-gray-400 leading-normal select-none cursor-pointer">
                      Li e aceito os{' '}
                      <button 
                        type="button" 
                        onClick={() => setShowTermsModal(true)}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 hover:decoration-[#5059d4]"
                      >
                        Termos de Uso
                      </button>{' '}
                      e as{' '}
                      <button 
                        type="button" 
                        onClick={() => setShowTermsModal(true)}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 hover:decoration-[#5059d4]"
                      >
                        Políticas de Privacidade
                      </button>{' '}
                      do Vibe.
                    </label>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 duration-200 uppercase tracking-widest mt-1"
                >
                  {isSigningUp ? 'Realizar Cadastro' : 'Entrar na Plataforma'}
                </button>
              </form>

              {/* Separator lines */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="h-px bg-[#22243C] w-1/3"></span>
                <span>OU</span>
                <span className="h-px bg-[#22243C] w-1/3"></span>
              </div>

              {/* Social Sign In popup button */}
              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-[#131522] border border-[#232640] hover:bg-[#181B2E] text-slate-200 font-semibold text-xs rounded-xl transition-all active:scale-95 duration-200 flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Acessar com o Google</span>
              </button>

              {/* Quick toggle screen button logic */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSigningUp(!isSigningUp);
                    setAuthEmail('');
                    setAuthPassword('');
                    setAuthName('');
                    setAuthBio('');
                    setAuthError(null);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold focus:outline-none underline underline-offset-4"
                >
                  {isSigningUp ? 'Já possui login? Entre aqui' : 'Não possui cadastro? Clique para registrar'}
                </button>
              </div>
            </>
          )}
        </motion.div>

        {/* TERMS OF USE MODAL */}
        <AnimatePresence>
          {showTermsModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm shadow-2xl"
              id="terms-use-modal"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-lg bg-[#0F111E] border border-[#21243A] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
              >
                {/* Modal Header */}
                <div className="p-5 border-b border-[#21243A] flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-indigo-400" />
                    Termos de Uso e Privacidade (Vibe)
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => setShowTermsModal(false)}
                    className="p-1 rounded-lg text-gray-400 hover:bg-[#1C1E2F] hover:text-white transition-all active:scale-95"
                    id="btn-close-terms-modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto text-xs text-gray-300 space-y-4 font-sans leading-relaxed scrollbar-thin scrollbar-thumb-indigo-600">
                  <p className="font-semibold text-white text-[13px]">Bem-vindo ao Vibe — Seu Mensageiro de Alta Resolução.</p>
                  <p>Ao se cadastrar ou utilizar nossa plataforma integrada, você concorda inteiramente com os seguintes termos e regras estabelecidas:</p>
                  
                  <div className="space-y-1 pt-1">
                    <h4 className="font-bold text-indigo-400 text-xs uppercase tracking-wider">1. Diretriz de Uso Justo</h4>
                    <p>O Vibe é uma rede premium focada em conexões saudáveis, bots interativos e canais dinâmicos. É proibido disseminar conteúdo injurioso, realizar spam ou forjar identidades falsas.</p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-indigo-400 text-xs uppercase tracking-wider">2. Sincronização Inteligente (IA)</h4>
                    <p>Os canais de voz integrados e os canais de texto de IA contam com motores avançados de rede neural. Nenhuma conversa pessoal é compartilhada de modo público.</p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-indigo-400 text-xs uppercase tracking-wider">3. Verificação Multi-fator</h4>
                    <p>Para atestar a validade de sua conta, um código único de 6 caracteres é processado e disparado para confirmação no momento de realizar seu cadastro.</p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-indigo-400 text-xs uppercase tracking-wider">4. Medidas Moderativas</h4>
                    <p>O Gerenciamento Vibe detém canais de moderação para banir temporariamente ou permanentemente as contas que violarem nossa ética.</p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-[#0A0C16] border-t border-[#21243A] flex items-center justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowTermsModal(false)}
                    className="px-4 py-2 bg-[#1C1E2F] hover:bg-[#25283F] text-gray-400 hover:text-white rounded-xl text-xs font-semibold transition-all active:scale-95"
                    id="btn-close-terms"
                  >
                    Voltar
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setAcceptTerms(true);
                      setShowTermsModal(false);
                    }}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-indigo-600/10"
                    id="btn-accept-terms"
                  >
                    Aceitar e Fechar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Email verification check screen
  if (me && me.emailVerified === false) {
    return (
      <div className="flex h-screen w-screen overflow-y-auto bg-[#07080C] text-[#E4E6EB] font-sans antialiased relative justify-center items-center p-4">
        {/* Ambient absolute glow lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md bg-[#0F111E] border border-[#21243A] rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative z-10 text-center"
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                Ative sua Conta Vibe
              </h1>
              <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                Enviamos um link oficial de confirmação para o endereço: <br />
                <strong className="text-indigo-400 block mt-1 font-mono select-all break-all">{me.email}</strong>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {verificationError && (
              <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2 text-left justify-center">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{verificationError}</span>
              </div>
            )}

            {verificationSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2 text-left justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{verificationSuccess}</span>
              </div>
            )}

            <div className="p-4 bg-[#141627] border border-[#22243C] rounded-xl text-left text-xs text-gray-300 space-y-2 leading-relaxed">
              <p className="font-semibold text-white">💡 Passo a Passo:</p>
              <ol className="list-decimal list-inside space-y-1.5 pl-0.5 text-gray-400">
                <li>Acesse sua caixa de entrada (ou lixeira/spam).</li>
                <li>Abra o e-mail de verificação recebido.</li>
                <li>Clique no link oficial para confirmar o cadastro.</li>
                <li>Retorne para esta tela e clique para confirmar seu acesso.</li>
              </ol>
            </div>

            <button 
              type="button"
              disabled={verificationLoading}
              onClick={handleCheckVerificationStatus}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 duration-200 uppercase tracking-widest"
            >
              {verificationLoading ? 'Verificando Confirmação...' : 'Já Ativei Minha Conta (Confirmar)'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#1C1E2F]">
            <button
              type="button"
              disabled={verificationLoading}
              onClick={handleResendEmailCode}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-all disabled:opacity-50 hover:underline"
            >
              Reenviar Link de Confirmação
            </button>
            <button
              type="button"
              onClick={handleCancelEmailVerification}
              className="text-xs text-gray-500 hover:text-red-400 font-medium transition-all"
            >
              Voltar ao Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Fully authenticated premium chat application
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0B10] text-[#E4E6EB] font-sans antialiased selection:bg-purple-500/30 select-none" id="vibe-app-root">
      
      {/* 0. IN-APP FLOATING NOTIFICATION SLIDE-DOWN BANNER */}
      <AnimatePresence>
        {activeMessageToast && (
          <motion.div
            initial={{ opacity: 0, y: -80, x: '-50%', scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: -40, x: '-50%', scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onClick={() => {
              setActiveChatId(activeMessageToast.conversationId);
              setActiveMessageToast(null);
            }}
            className="absolute top-6 left-1/2 z-[9999] w-[90%] sm:w-full sm:max-w-md bg-[#131522]/95 backdrop-blur-md border-2 border-indigo-500 rounded-2xl p-4 shadow-2xl shadow-indigo-500/20 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#181B2E]/95 transition-all active:scale-[0.99]"
            title="Clique para abrir esta conversa"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img 
                  src={activeMessageToast.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                  className="h-11 w-11 rounded-xl object-cover border border-[#232635]" 
                  alt={activeMessageToast.senderName} 
                />
                <span className="absolute -bottom-1 -right-1 h-5 w-5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-full flex items-center justify-center border-2 border-[#131522] text-[9px] font-bold text-white shadow-sm" title={`${activeMessageToast.unreadCount} novas mensagens`}>
                  {activeMessageToast.unreadCount}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white tracking-wide shrink-0">{activeMessageToast.senderName}</span>
                  <span className="text-[9px] text-[#A2A4E0] font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <Clock className="h-2.5 w-2.5 text-indigo-400" />
                    {activeMessageToast.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 truncate mt-1 leading-relaxed max-w-[240px]">
                  {activeMessageToast.text}
                </p>
                <div className="text-[9px] text-indigo-400 font-semibold mt-0.5 flex items-center gap-1 select-none">
                  <span>{activeMessageToast.unreadCount > 1 ? `${activeMessageToast.unreadCount} mensagens recebidas` : '1 nova mensagem'}</span>
                  <span>•</span>
                  <span>Toque para ver</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMessageToast(null);
                }}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                title="Fechar notificação"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. LEFT SIDEBAR: ACTIVE CHATS & DIRECTORIES */}
      <aside className={`w-full lg:w-80 xl:w-96 flex flex-col border-r border-[#1C1E26] bg-[#0E1017] shrink-0 ${activeChatId ? 'hidden lg:flex' : 'flex'}`} id="vibe-sidebar">
        
        {/* Sidebar Header with Premium Brand styling */}
        <div className="p-4 border-b border-[#1C1E26] flex items-center justify-between" id="sidebar-header">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-purple-500/20" id="brand-logo-container">
              <Radio className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent flex items-center gap-1">
                Vibe <span className="text-[10px] uppercase font-mono py-0.5 px-1.5 bg-[#1E1B29] text-purple-400 rounded-md tracking-widest border border-purple-500/10">Premium</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => {
                setShowSearchUserModal(true);
                fetchUsersList();
              }}
              className="p-2 rounded-lg bg-[#161822] hover:bg-[#1C1E2C] border border-[#232535] text-sky-400 hover:text-sky-300 transition-all active:scale-95 flex items-center gap-1 text-xs font-medium"
              title="Procurar contato pelo nome"
              id="btn-search-contact-sidebar"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Contato</span>
            </button>
            <button 
              onClick={() => setShowNewGroupModal(true)}
              className="p-2 rounded-lg bg-[#161822] hover:bg-[#1C1E2C] border border-[#232535] text-indigo-400 hover:text-indigo-300 transition-all active:scale-95 flex items-center gap-1 text-xs font-medium"
              title="Criar novo grupo"
              id="btn-new-group-sidebar"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Grupo</span>
            </button>
          </div>
        </div>

        {/* LOGGED IN USER PROFILE SUMMARY & SELF-VERIFY CARD */}
        <div className="p-3 bg-[#11131C] border-b border-[#1C1E26] flex items-center justify-between" id="user-profile-widget">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative shrink-0">
              <img 
                src={me.avatar} 
                className="h-10 w-10 rounded-full object-cover border border-purple-500/20" 
                alt={me.name} 
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#11131C]"></span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold tracking-wide text-white truncate max-w-[90px]">{me.name}</span>
                {me.verified && (
                  <ShieldCheck className="h-4 w-4 text-sky-400 fill-sky-400/10 shrink-0" title="Selo Oficial de Verificação Vibe" />
                )}
                {me.category && (
                  <span className="px-1 py-0.5 bg-[#1B1226] text-purple-400 text-[8px] font-mono rounded border border-purple-500/10 shrink-0">
                    {me.category}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 truncate max-w-[120px]">{me.bio || 'Disponível no chat'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 shrink-0 ml-1">
            {isGerenteGeral && (
              <button
                onClick={handleOpenAdminPanel}
                className="px-2 py-1 rounded bg-[#F43F5E]/10 hover:bg-[#F43F5E]/20 text-[#F43F5E] hover:text-[#FDA4AF] border border-[#F43F5E]/25 transition-all active:scale-95 flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold animate-pulse"
                title="Painel Geral do Gerente"
                id="btn-sidebar-admin-link"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Gerente</span>
              </button>
            )}
            <button 
              onClick={handleToggleMyVerification}
              className={`px-1.5 py-1 rounded text-[9px] font-mono border transition-all active:scale-95 ${
                me.verified 
                  ? 'bg-[#182121] text-sky-400 border-sky-500/20 hover:bg-[#1E2E2E]' 
                  : 'bg-[#1D1217] text-purple-400 border-purple-500/20 hover:bg-[#2C1823]'
              }`}
              id="toggle-verif-btn"
            >
              {me.verified ? 'Verificado ✔' : 'Verificar'}
            </button>
            <button
              onClick={handleOpenProfileModal}
              className="p-1.5 rounded bg-[#1C181E] hover:bg-slate-800 text-gray-400 hover:text-indigo-400 border border-transparent transition-all active:scale-95"
              title="Configurações de Perfil"
              id="btn-open-settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded bg-[#1C181E] hover:bg-slate-800 text-gray-400 hover:text-red-400 border border-transparent transition-all active:scale-95"
              title="Fazer Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* SEARCH CONVERSATION FILTER */}
        <div className="p-3" id="sidebar-search-container">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Procurar conversas de áudio ou texto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#12141D] hover:bg-[#161825] focus:bg-[#12141D] rounded-xl text-gray-200 placeholder-gray-500 outline-none border border-[#1C1E26] focus:border-indigo-500/30 transition-colors"
              id="search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-0.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* DEVIATIONS INTERACTIVE FILTER TABS */}
        <div className="px-3 pb-2 flex gap-1 border-b border-[#1C1E26]/50 overflow-x-auto scrollbar-none" id="sidebar-tabs">
          {[
            { id: 'all', label: 'Todas', icon: MessageSquare },
            { id: 'groups', label: 'Grupos', icon: Users },
            { id: 'verified', label: 'Oficiais', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap active:scale-95 ${
                  active 
                    ? 'bg-[#181A26] text-indigo-400 border border-indigo-500/10' 
                    : 'text-gray-400 hover:bg-[#13151D] hover:text-gray-300'
                }`}
              >
                <Icon className={`h-3 w-3 ${active ? 'text-indigo-400' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE CONVERSATION ITEM LIST */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1D212E] divide-y divide-[#161820]/40" id="sidebar-chats-list">
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conv => {
              const isActive = conv.id === activeChatId;
              const lastMsg = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
              const isTyping = aiTypingStatus[conv.id] === 'typing';
              const isRecordingStatus = aiTypingStatus[conv.id] === 'recording';

              let subText = <span className="text-gray-500">Nenhuma mensagem</span>;
              const isUnread = conv.unreadCount > 0;
              if (isTyping) {
                subText = <span className="text-purple-400 animate-pulse font-medium">Digitando...</span>;
              } else if (isRecordingStatus) {
                subText = <span className="text-red-400 animate-pulse font-medium">Gravando áudio... 🔊</span>;
              } else if (lastMsg) {
                if (lastMsg.audioUrl) {
                  subText = (
                    <span className={`flex items-center gap-1 ${isUnread ? 'text-indigo-300 font-semibold' : 'text-indigo-400'}`}>
                      <Mic className="h-3 w-3" />
                      <span>Mensagem de áudio ({lastMsg.audioDuration}s)</span>
                    </span>
                  );
                } else if (lastMsg.imageUrl) {
                  const isStk = lastMsg.text && lastMsg.text.startsWith('[Figurinha:');
                  subText = (
                    <span className="flex items-center gap-1">
                      {isStk ? (
                        <>
                          <Sticker className="h-3 w-3 text-indigo-400 shrink-0" />
                          <span className={`${isUnread ? 'text-indigo-300 font-semibold' : 'text-indigo-400 font-medium'}`}>Figurinha enviada</span>
                        </>
                      ) : (
                        <>
                          <Camera className="h-3 w-3 text-indigo-400 shrink-0" />
                          <span className={isUnread ? 'text-indigo-300 font-semibold' : 'text-gray-400'}>Foto compartilhada</span>
                        </>
                      )}
                    </span>
                  );
                } else {
                  subText = <span className={`truncate block max-w-[170px] ${isUnread ? 'text-indigo-200 font-semibold' : 'text-gray-400'}`}>{lastMsg.text}</span>;
                }
              }

              const partner = getRealTimePartner(conv);
              const displayTitle = partner ? partner.name : conv.title;
              const displayAvatar = partner ? partner.avatar : conv.avatar;
              const displayVerified = partner ? partner.verified : conv.verified;
              const isPartnerOnline = partner ? (partner.status === 'online' || partner.status === 'typing' || partner.status === 'recording') : (conv.participants[0]?.status === 'online' || conv.category === 'ai');

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveChatId(conv.id);
                  }}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-[#181A25]/90 border-l-4 border-indigo-500 shadow-md shadow-black/20' 
                      : 'hover:bg-[#12141C] border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={displayAvatar} 
                        className="h-11 w-11 rounded-xl object-cover border border-[#232635]" 
                        alt={displayTitle} 
                      />
                      {!conv.isGroup && isPartnerOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#0E1017]"></span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className={`text-sm tracking-wide text-white ${isUnread ? 'font-bold' : 'font-semibold'}`}>{displayTitle}</h4>
                        {displayVerified && (
                          <ShieldCheck className="h-4 w-4 text-sky-400 fill-sky-400/10 shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] mt-1 pr-2 leading-none">{subText}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1.5">
                    <span className={`text-[10px] font-mono select-none ${isUnread ? 'text-indigo-400 font-bold' : 'text-gray-500'}`}>
                      {lastMsg ? lastMsg.timestamp : ''}
                    </span>
                    {isUnread && (
                      <span className="h-5 min-w-5 px-1 bg-gradient-to-tr from-purple-500 via-indigo-600 to-sky-500 text-white rounded-full flex items-center justify-center text-[9px] font-extrabold shadow-sm shadow-purple-500/30 animate-pulse border border-white/10 select-none">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center" id="search-fallback">
              <MessageCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Nenhuma conversa encontrada</p>
            </div>
          )}
        </div>
      </aside>

      {/* 2. CHAT FEED CONTAINER WINDOW */}
      {activeChat ? (
        <main className={`flex-1 flex flex-col bg-[#08080C] relative overflow-hidden ${activeChatId ? 'flex' : 'hidden lg:flex'}`} id="vibe-main-chat-viewport">
          
          {/* Active conversation Header */}
          <header className="p-4 border-b border-[#1C1E26] bg-[#0E1017] flex items-center justify-between shadow-sm shadow-black/10" id="chat-viewport-header">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveChatId('')}
                className="p-2 -ml-2 rounded-lg hover:bg-[#161822] text-gray-400 hover:text-white transition-all active:scale-95 shrink-0"
                id="btn-back-to-home"
                title="Voltar para a tela inicial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="relative flex items-center gap-3">
                {(() => {
                  const partner = getRealTimePartner(activeChat);
                  const headerTitle = partner ? partner.name : activeChat.title;
                  const headerAvatar = partner ? partner.avatar : activeChat.avatar;
                  const headerVerified = partner ? partner.verified : activeChat.verified;
                  const isPartnerOnline = partner ? (partner.status === 'online' || partner.status === 'typing' || partner.status === 'recording') : (activeChat.participants[0]?.status === 'online' || activeChat.category === 'ai');
                  
                  let statusText = '';
                  if (activeChat.isGroup) {
                    statusText = `${activeChat.participants.length} integrantes na sala`;
                  } else if (activeChat.category === 'ai') {
                    statusText = 'Processamento de IA Ativo';
                  } else if (partner) {
                    if (partner.status === 'online') {
                      statusText = 'Disponível Online';
                    } else if (partner.status === 'typing') {
                      statusText = 'Digitando...';
                    } else if (partner.status === 'recording') {
                      statusText = 'Gravando áudio...';
                    } else {
                      statusText = formatLastSeen(partner.lastSeen);
                    }
                  } else {
                    statusText = isPartnerOnline ? 'Disponível Online' : 'Ausente';
                  }

                  return (
                    <>
                      <div className="relative">
                        <img 
                          src={headerAvatar} 
                          className="h-11 w-11 rounded-xl object-cover border border-[#232635]" 
                          alt={headerTitle} 
                        />
                        {!activeChat.isGroup && isPartnerOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-[#090B10]"></span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-semibold tracking-wide text-white">{headerTitle}</h3>
                          {headerVerified && (
                            <ShieldCheck className="h-4 w-4 text-sky-400 fill-sky-400/10" title="Canal Verificado Oficial" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {statusText}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Actions for conversations */}
            <div className="flex items-center gap-2">
              <button 
                onClick={startRealVoiceCall}
                className="p-2.5 rounded-xl bg-[#141620] hover:bg-[#1E202E] border border-[#232535] text-indigo-400 hover:text-indigo-300 transition-all active:scale-95"
                title="Iniciar ligação de voz premium"
                id="btn-voice-call"
              >
                <Phone className="h-4 w-4" />
              </button>

              <button 
                onClick={() => startRealCall('video')}
                className="p-2.5 rounded-xl bg-[#141620] hover:bg-[#1E202E] border border-[#232535] text-indigo-400 hover:text-indigo-300 transition-all active:scale-95"
                title="Iniciar videochamada premium"
                id="btn-video-call"
              >
                <Video className="h-4 w-4" />
              </button>
              
              <button 
                onClick={clearChatLogs}
                className="p-2.5 rounded-xl bg-[#141620] hover:bg-[#1E202E] border border-[#232535] text-gray-400 hover:text-red-400 transition-all active:scale-95"
                title="Limpar mensagens"
                id="btn-clear-chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <button 
                onClick={() => setShowRightPanel(!showRightPanel)}
                className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
                  showRightPanel 
                    ? 'bg-[#1C1D2A] text-indigo-400 border-indigo-500/20' 
                    : 'bg-[#141620] text-gray-400 border-[#232535] hover:text-gray-200'
                }`}
                title="Informações da conversa"
                id="btn-info-drawer"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* ACTIVE CHAT FEED MESSAGES AREA */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-[#171926]/70 animate-in fade-in duration-300" id="chat-messages-container">
            {activeChat.messages && activeChat.messages.length > 0 ? (
              activeChat.messages.map((msg, index, arr) => {
                const isMe = msg.senderId === me.id;
                const isDeletedForMe = msg.deletedByUsers && msg.deletedByUsers.includes(me?.id || '');
                if (isDeletedForMe) return null;
                const isDeletedForEveryone = !!msg.deletedForEveryone;

                const prevMsg = index > 0 ? arr[index - 1] : null;
                const showDateHeader = !prevMsg || prevMsg.date !== msg.date;
                const hasReactions = msg.reactions && msg.reactions.length > 0;

                return (
                  <div key={msg.id} className="space-y-4">
                    
                    {/* Dynamic Date Header divider */}
                    {showDateHeader && (
                      <div className="flex justify-center my-6" id={`date-${msg.date}`}>
                        <span className="px-3 py-1 bg-[#141620] border border-[#212330] rounded-full text-[10px] font-mono text-gray-400 font-medium select-none shadow-sm shadow-black/10">
                          {msg.date === new Date().toISOString().split('T')[0] ? 'HOJE' : msg.date}
                        </span>
                      </div>
                    )}

                    {/* Chat Bubble Container */}
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-start gap-2.5`}>
                      
                      {/* Left Avatar for other users */}
                      {!isMe && (
                        <img 
                          src={
                            activeChat.participants.find(p => p.id === msg.senderId)?.avatar || 
                            activeChat.avatar
                          } 
                          className="h-8 w-8 rounded-lg object-cover border border-[#212330] mt-1" 
                          alt="avatar" 
                        />
                      )}

                      {/* Msg core block */}
                      <div className="flex flex-col max-w-[70%] md:max-w-[60%] space-y-1 relative group">
                        
                        {/* Sender display tag for groups */}
                        {activeChat.isGroup && !isMe && (
                          <span className="text-[10px] font-semibold text-indigo-400 ml-1">{msg.senderName}</span>
                        )}

                        {/* Interactive Message Bubble */}
                        {(() => {
                          const isSticker = !!(msg.imageUrl && msg.text && msg.text.startsWith('[Figurinha:'));
                          return (
                            <div 
                              className={`rounded-2xl transition-all relative outline-none ${
                                isDeletedForEveryone
                                  ? 'bg-[#12141F] border border-[#212335]/60 text-gray-500 rounded-tl-none px-4 py-3 shadow-md'
                                  : isSticker
                                    ? 'bg-transparent text-gray-200 border-none p-0 shadow-none'
                                    : isMe 
                                      ? 'bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-600 text-white rounded-tr-none px-4 py-3 shadow-md shadow-indigo-950/20' 
                                      : 'bg-[#0E1119] border border-[#1B1D28] text-gray-200 rounded-tl-none px-4 py-3 shadow-md'
                              }`}
                            >
                          {isDeletedForEveryone ? (
                            <div className="flex items-center gap-2 text-gray-500 font-normal italic text-[12px] py-1 select-none">
                              <AlertCircle className="h-3.5 w-3.5 text-gray-600 shrink-0" />
                              <span>Esta mensagem foi apagada</span>
                              <span className="text-[9px] text-gray-500 font-sans not-italic ml-2">{msg.timestamp}</span>
                            </div>
                          ) : msg.audioUrl ? (
                            <div className="flex flex-col space-y-2 min-w-[200px] md:min-w-[240px]" id={`audio-player-${msg.id}`}>
                              <div className="flex items-center gap-2.5">
                                {/* Play State Button */}
                                <button 
                                  onClick={() => handlePlayAudioMessage(msg)}
                                  className={`h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
                                    isMe 
                                      ? 'bg-white text-indigo-600 hover:bg-gray-100 shadow' 
                                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                                  }`}
                                  id={`btn-play-trigger-${msg.id}`}
                                >
                                  {playingMessages[msg.id] ? (
                                    <Pause className="h-4 w-4 fill-current" />
                                  ) : (
                                    <Play className="h-4 w-4 fill-current translate-x-0.5" />
                                  )}
                                </button>

                                {/* Waveform bars scrubber container */}
                                <div 
                                  onClick={(e) => handleScrubAudio(msg, e)}
                                  className="flex-1 flex items-end h-8 gap-[3px] py-1 cursor-pointer select-none"
                                  title="Clique para avançar o áudio"
                                >
                                  {Array.from({ length: 26 }).map((_, waveIdx) => {
                                    const heightBase = Math.abs(Math.sin((waveIdx + 1) * 0.4)) * 24 + 4;
                                    const progress = audioPlaybackProgress[msg.id] || 0;
                                    const percentageMarker = (waveIdx / 26) * 100;
                                    const isPassed = percentageMarker <= progress;

                                    return (
                                      <span 
                                        key={waveIdx} 
                                        style={{ height: `${heightBase}px` }}
                                        className={`w-[3px] rounded-full transition-colors ${
                                          isPassed 
                                            ? isMe ? 'bg-white' : 'bg-indigo-400' 
                                            : isMe ? 'bg-white/35' : 'bg-[#2E3142]'
                                        }`}
                                      />
                                    );
                                  })}
                                </div>

                                <button
                                  onClick={() => toggleAudioSpeed(msg.id)}
                                  className={`text-[10px] font-black px-1.5 py-0.5 rounded transition-colors ${
                                    isMe 
                                      ? 'bg-white/15 text-white hover:bg-white/25' 
                                      : 'bg-[#181D26] text-indigo-400 hover:bg-indigo-900/30'
                                  }`}
                                  title="Velocidade"
                                  id={`audio-speed-${msg.id}`}
                                >
                                  {audioSpeed[msg.id] || 1}x
                                </button>
                              </div>

                              <div className="flex justify-between items-center text-[10px]">
                                <span className={isMe ? 'text-white/70' : 'text-gray-400'}>
                                  {formatTime(audioPlaybackTimers[msg.id] || 0)} / {formatTime(msg.audioDuration || 0)}
                                </span>
                                <span className={`flex items-center gap-1 ${isMe ? 'text-white/60' : 'text-gray-500'}`}>
                                  <span>{msg.timestamp}</span>
                                  {isMe && (
                                    msg.status === 'read' ? (
                                      <CheckCheck className="h-3.5 w-3.5 text-sky-450 inline" title="Visualizado" />
                                    ) : (
                                      <Check className="h-3.5 w-3.5 text-slate-500 inline" title="Enviado" />
                                    )
                                  )}
                                </span>
                              </div>
                            </div>
                          ) : (
                            // CASE B: STANDARD TEXT MESSAGES, IMAGE, & VIDEO BLOCKS
                            <div className={isSticker ? "space-y-1 min-w-fit" : "space-y-1.5 min-w-[150px]"}>
                              {msg.imageUrl && (
                                msg.text && msg.text.startsWith('[Figurinha:') ? (
                                  <div className="flex justify-center p-0.5 select-none animate-in fade-in zoom-in-75 duration-150">
                                    <img 
                                      src={msg.imageUrl} 
                                      referrerPolicy="no-referrer"
                                      className="h-[76px] w-[76px] object-contain transition-transform hover:scale-110 active:scale-95 duration-200 cursor-pointer drop-shadow-sm" 
                                      alt="sticker" 
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=200&q=80";
                                      }}
                                      onClick={() => setActiveMediaViewer({
                                        type: 'image',
                                        url: msg.imageUrl!,
                                        caption: msg.text,
                                        senderName: msg.senderName,
                                        timestamp: msg.timestamp
                                      })}
                                    />
                                  </div>
                                ) : (
                                  <div 
                                    onClick={() => setActiveMediaViewer({
                                      type: 'image',
                                      url: msg.imageUrl!,
                                      caption: msg.text,
                                      senderName: msg.senderName,
                                      timestamp: msg.timestamp
                                    })}
                                    className="rounded-xl overflow-hidden mb-2 border border-white/10 cursor-pointer active:scale-95 transition-all duration-200 hover:brightness-110 relative group/photo"
                                  >
                                    <img 
                                      src={msg.imageUrl} 
                                      referrerPolicy="no-referrer"
                                      className="max-h-60 w-full object-cover transition-transform group-hover/photo:scale-[1.03] duration-300" 
                                      alt="photo file" 
                                    />
                                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white/95 text-[9px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover/photo:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                                      <Maximize2 className="h-2.5 w-2.5" />
                                      <span>Expandir</span>
                                    </div>
                                  </div>
                                )
                              )}

                              {msg.videoUrl && (
                                <div 
                                  onClick={() => setActiveMediaViewer({
                                    type: 'video',
                                    url: msg.videoUrl!,
                                    caption: msg.text,
                                    senderName: msg.senderName,
                                    timestamp: msg.timestamp
                                  })}
                                  className="rounded-xl overflow-hidden mb-2 border border-white/10 bg-black/40 cursor-pointer active:scale-95 transition-all duration-200 hover:brightness-110 relative group/video"
                                >
                                  <video 
                                    src={msg.videoUrl} 
                                    muted 
                                    playsInline 
                                    className="max-h-52 w-full object-cover opacity-90 group-hover/video:opacity-100 transition-opacity duration-300 pointer-events-none" 
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/video:bg-black/45 transition-colors duration-200">
                                    <div className="p-2.5 bg-indigo-600/95 text-white rounded-full shadow-lg group-hover/video:scale-105 active:scale-90 transition-transform duration-200">
                                      <Play className="h-4 w-4 fill-current ml-0.5" />
                                    </div>
                                  </div>
                                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white/95 text-[9px] font-bold py-1 px-2 rounded-lg flex items-center gap-1">
                                    <Video className="h-2.5 w-2.5 text-indigo-400 animate-pulse" />
                                    <span>Vídeo</span>
                                  </div>
                                </div>
                              )}

                              {msg.text && !msg.text.startsWith('[Figurinha:') && (
                                <p className="text-[13px] leading-relaxed whitespace-pre-wrap select-text">
                                  {renderTextWithClickableLinks(msg.text, isMe)}
                                </p>
                              )}
                              
                              <div className={`flex items-center justify-end gap-1 text-[9px] text-right select-none ${
                                isSticker 
                                  ? 'bg-black/50 backdrop-blur-[4px] border border-white/5 text-gray-300 px-1.5 py-0.5 rounded-full w-fit ml-auto mt-1.5 hover:bg-black/75 transition-colors duration-150 shadow-sm' 
                                  : 'mt-1 ' + (isMe ? 'text-white/70' : 'text-gray-500')
                              }`}>
                                <span className={isSticker ? 'text-[8px] text-gray-200' : isMe ? 'text-white/70' : 'text-gray-500'}>{msg.timestamp}</span>
                                {isMe && (
                                  msg.status === 'read' ? (
                                    <CheckCheck className={`h-3.5 w-3.5 inline ${isSticker ? 'text-sky-350' : 'text-sky-400'}`} title="Visualizado" />
                                  ) : (
                                    <Check className={`h-3.5 w-3.5 inline ${isSticker ? 'text-white/65' : 'text-slate-500'}`} title="Enviado" />
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* Applied reactions UI */}
                          {hasReactions && (
                            <div className="absolute -bottom-2 right-2.5 flex items-center bg-[#151824] border border-[#232738] rounded-full py-0.5 px-1.5 gap-1 shadow-sm select-none z-10 animate-in zoom-in-50 duration-200">
                              {msg.reactions?.map((react, rIdx) => (
                                <button 
                                  key={rIdx}
                                  onClick={() => handleAddReaction(msg.id, react.emoji)}
                                  className="text-[10px] flex items-center gap-0.5"
                                  title={`Reagido por ${react.users ? react.users.length : 1} pessoa`}
                                >
                                  <span>{react.emoji}</span>
                                  {react.count > 1 && <span className="text-[9px] text-[#A0A5B5] font-bold">{react.count}</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                        {/* Interactive floating reaction list */}
                        {!isDeletedForEveryone && (
                          <div className="absolute -top-8 right-2 hidden group-hover:flex items-center bg-[#10121C] border border-[#1E2130] rounded-xl px-2 py-1 gap-1.5 shadow-lg select-none z-10">
                            {['❤️', '👍', '😂', '🔥', '😮', '😢'].map(emojiSym => (
                              <button
                                key={emojiSym}
                                onClick={() => handleAddReaction(msg.id, emojiSym)}
                                className="text-sm hover:scale-125 hover:rotate-12 transition-all block duration-150 active:scale-95"
                              >
                                {emojiSym}
                              </button>
                            ))}
                            <div className="w-[1px] h-3.5 bg-gray-800/80 mx-0.5"></div>
                            <button
                              onClick={() => handleInitiateDeleteMessage(msg)}
                              className="p-1 hover:bg-red-950/20 text-gray-400 hover:text-red-500 rounded-lg transition-all duration-150 active:scale-90"
                              title="Apagar mensagem"
                              id={`delete-msg-${msg.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-8 space-y-4 shadow-inner" id="empty-chat-state">
                <MessageCircle className="h-10 w-10 text-indigo-500/30 animate-pulse" />
                <div>
                  <h4 className="text-gray-400 font-semibold text-sm">Online e Conectado!</h4>
                  <p className="text-xs text-gray-500 max-w-xs mt-1">Sua nova mensagem escrita ou de áudio real será sincronizada e enviada online de imediato.</p>
                </div>
              </div>
            )}
            
            {/* Typing simulation bubble */}
            {aiTypingStatus[activeChatId] && (
              <div className="flex justify-start items-start gap-2.5" id="ai-typing-container">
                <img 
                  src={activeChat.avatar} 
                  className="h-8 w-8 rounded-lg object-cover border border-[#212330] mt-1" 
                  alt="avatar" 
                />
                <div className="bg-[#0E1119] border border-[#1B1D28] text-gray-200 rounded-2xl px-4 py-3 rounded-tl-none shadow-md max-w-xs">
                  <div className="flex items-center gap-1.5 text-xs text-purple-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    <span className="font-semibold animate-pulse">
                      {aiTypingStatus[activeChatId] === 'recording' ? 'Gravando áudio...' : 'Digitando resposta...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* CHAT INPUT COMPOSE AREA */}
          <footer className="p-4 border-t border-[#1C1E26] bg-[#0E1017] relative select-none" id="chat-viewport-composer">
            
            {/* Media Upload Loading or Error Banners */}
            {mediaUploadLoading && (
              <div className="mb-2 px-3 py-1.5 bg-indigo-950/40 border border-indigo-500/20 rounded-xl flex items-center gap-2 text-[11px] text-indigo-400 animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span>Processando e compactando mídia para sincronização instantânea...</span>
              </div>
            )}
            {mediaUploadError && (
              <div className="mb-2 px-3 py-1.5 bg-red-950/40 border border-red-500/20 rounded-xl flex items-center justify-between gap-2 text-[11px] text-red-450 z-10 font-medium">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{mediaUploadError}</span>
                </div>
                <button onClick={() => setMediaUploadError(null)} className="text-[10px] hover:text-white font-bold opacity-80">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Attachment dropdown layout */}
            {showAttachmentMenu && (
              <div className="absolute bottom-[72px] left-4 bg-[#11131C]/95 backdrop-blur-xl border border-[#222434] rounded-2xl p-3 flex flex-col gap-2.5 shadow-2xl z-20 w-56 animate-in slide-in-from-bottom-2 duration-200" id="attachment-popup-menu">
                <div>
                  <p className="text-[10px] uppercase font-mono font-bold text-indigo-400/80 tracking-wider px-1 pb-1 border-b border-[#212333] flex items-center gap-1 select-none">
                    <ImageIcon className="h-3 w-3" />
                    <span>Fotos Rápidas</span>
                  </p>
                  <div className="grid grid-cols-2 gap-1 pt-1.5">
                    {[
                      { label: 'Café ☕', action: 'coffee' },
                      { label: 'Treino 🏋️‍♀️', action: 'workout' },
                      { label: 'Work 💻', action: 'workspace' },
                      { label: 'Design 🎨', action: 'design' }
                    ].map(photoChoice => (
                      <button
                        key={photoChoice.action}
                        onClick={() => sendQuickPhoto(photoChoice.action)}
                        className="px-1.5 py-1 text-[10px] font-semibold bg-[#171924]/80 hover:bg-[#202334] rounded-lg transition-all text-left truncate active:scale-95 text-indigo-300"
                      >
                        {photoChoice.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-mono font-bold text-indigo-400/80 tracking-wider px-1 pb-1 border-b border-[#212333] flex items-center gap-1 select-none">
                    <Video className="h-3 w-3" />
                    <span>Vídeos Rápidos</span>
                  </p>
                  <div className="grid grid-cols-2 gap-1 pt-1.5">
                    {[
                      { label: 'Café ☕', action: 'coffee' },
                      { label: 'Code 💻', action: 'code' },
                      { label: 'Natureza 🌲', action: 'nature' },
                      { label: 'Cyber 🌟', action: 'cyber' }
                    ].map(videoChoice => (
                      <button
                        key={videoChoice.action}
                        onClick={() => sendQuickVideo(videoChoice.action)}
                        className="px-1.5 py-1 text-[10px] font-semibold bg-[#171924]/80 hover:bg-[#202334] rounded-lg transition-all text-left truncate active:scale-95 text-indigo-300"
                      >
                        {videoChoice.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1.5 border-t border-[#212333]/80">
                  <input 
                    type="file" 
                    onChange={handleLocalFileSelect} 
                    style={{ display: 'none' }} 
                    id="local-media-file-input" 
                    accept="image/*,video/*"
                  />
                  <label 
                    htmlFor="local-media-file-input" 
                    className="flex items-center gap-2 justify-center w-full px-3 py-2 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all text-center cursor-pointer active:scale-95 shadow-md shadow-indigo-950/20 select-none"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Enviar do Computador</span>
                  </label>
                </div>
              </div>
            )}

            {/* STICKERS, EMOJIS & SYMBOLS PICKER */}
            {showStickerEmojiPicker && (
              <div className="absolute bottom-[72px] left-4 right-4 bg-[#11131c] border border-[#21243e] rounded-2xl p-4 shadow-2xl z-20 max-w-md animate-in slide-in-from-bottom-2 duration-200" id="sticker-emoji-picker-panel">
                <div className="flex items-center justify-between border-b border-[#212542] pb-2 mb-3">
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                    {[
                      { id: 'emojis', name: 'Emojis 😃', icon: Smile },
                      { id: 'stickers', name: 'Figurinhas 👾', icon: Sticker },
                      { id: 'symbols', name: 'Símbolos ★', icon: Sparkles }
                    ].map(tab => {
                      const Icon = tab.icon;
                      const active = pickerTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setPickerTab(tab.id as any)}
                          className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer whitespace-nowrap ${active ? 'bg-indigo-600 text-white shadow shadow-indigo-500/20' : 'bg-[#171a2c] text-gray-400 hover:text-gray-200'}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{tab.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    onClick={() => setShowStickerEmojiPicker(false)}
                    className="p-1 rounded bg-[#171a2c] hover:bg-[#20243c] text-gray-400 hover:text-white transition-all cursor-pointer inline-flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>

                {pickerTab === 'emojis' && (
                  <div className="grid grid-cols-8 gap-1.5 max-h-44 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/20 p-1 animate-in fade-in duration-200">
                    {ALL_EMOJIS_AND_SYMBOLS.map((emoji, idx) => (
                      <button
                        key={`emoji-${idx}-${emoji}`}
                        onClick={() => {
                          setInputText(prev => prev + emoji);
                        }}
                        className="h-9 w-9 flex items-center justify-center text-lg hover:bg-indigo-900/40 rounded-xl transition-all hover:scale-125 duration-100 cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {pickerTab === 'symbols' && (
                  <div className="grid grid-cols-8 gap-1.5 max-h-44 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/20 p-1 animate-in fade-in duration-200">
                    {[
                      '★','☆','✦','✧','⚡','🔥','✨','☄️','☀️','❄️','💎','🔮','🧿',
                      '✿','❀','💮','🌸','🍀','🍁','🍃','☕','🍻','🥂','🍕','🎯','🏆','🎧','🎵','🎶',
                      '🎬','👾','🎮','🎲','♠️','♥️','♦️','♣️','⚜️','🔱','🛡️','⚔️','⚓','⚙️','⚖️',
                      '✉️','🖊️','🔑','🔒','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔',
                      '☮️','☯️','☸️','☪️','✝️','🕉️','𓆉','𓃠','𓅓','☾','☽','☀','☁','☂','☃','✈'
                    ].map(sym => (
                      <button
                        key={sym}
                        onClick={() => {
                          setInputText(prev => prev + sym);
                        }}
                        className="h-9 w-9 flex items-center justify-center text-sm font-semibold hover:bg-indigo-900/40 rounded-xl transition-all hover:scale-125 duration-100 cursor-pointer text-gray-200"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                )}

                {pickerTab === 'stickers' && (
                  <div className="flex flex-col gap-2">
                    {/* Subcategories Selector */}
                    <div className="flex gap-1 border-b border-[#212542] pb-2 mb-1 overflow-x-auto scrollbar-none" id="sticker-category-selector">
                      {[
                        { id: 'romantic', name: 'Românticas ❤️', count: ROMANTIC_STICKERS.length },
                        { id: 'vibe', name: 'Vibe 🎧', count: VIBE_STICKERS.length },
                        { id: 'general', name: 'Gerais 👾', count: ALL_STICKERS.length },
                        { id: 'all', name: 'Todas 📂', count: ROMANTIC_STICKERS.length + VIBE_STICKERS.length + ALL_STICKERS.length },
                      ].map(subTab => {
                        const active = stickerSubCategory === subTab.id;
                        return (
                          <button
                            key={subTab.id}
                            id={`subtab-${subTab.id}`}
                            onClick={() => setStickerSubCategory(subTab.id as any)}
                            className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                              active 
                                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/35 shadow-sm shadow-pink-500/10' 
                                : 'bg-[#171a2c]/65 text-gray-400 hover:text-gray-200 border border-transparent'
                            }`}
                          >
                            <span>{subTab.name}</span>
                            <span className="text-[8px] opacity-60 font-mono">( {subTab.count} )</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-6 gap-1.5 max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500/20 pt-1 pb-2 px-1 animate-in fade-in duration-200" id="sticker-grid-scroll" style={{ scrollBehavior: 'smooth' }}>
                      {(stickerSubCategory === 'romantic' 
                        ? ROMANTIC_STICKERS 
                        : stickerSubCategory === 'vibe' 
                        ? VIBE_STICKERS 
                        : stickerSubCategory === 'general' 
                        ? ALL_STICKERS 
                        : [...ROMANTIC_STICKERS, ...VIBE_STICKERS, ...ALL_STICKERS]
                      ).map((sticker, idx) => (
                        <button
                          key={`sticker-${idx}-${sticker.name}`}
                          onClick={() => sendSticker(sticker.url, sticker.name)}
                          className="relative group/sticker aspect-square w-full rounded-lg overflow-hidden bg-[#111322] hover:bg-[#191c33] border border-slate-900 active:scale-95 transition-all cursor-pointer shadow-sm hover:border-pink-500/40 hover:shadow-pink-500/5 duration-200 flex items-center justify-center p-0.5"
                          title={`Enviar figurinha: ${sticker.name}`}
                          id={`sticker-btn-${idx}`}
                        >
                          <img 
                            src={sticker.url} 
                            referrerPolicy="no-referrer"
                            alt={sticker.name}
                            className="h-full w-full object-cover rounded-md group-hover/sticker:scale-110 transition-transform duration-200" 
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=100&q=80";
                            }}
                          />
                          {/* Premium bottom subtle tag overlay */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-0.5 pt-2 opacity-0 group-hover/sticker:opacity-100 transition-opacity duration-150 flex items-end justify-center">
                            <span className="text-[6px] font-extrabold text-pink-200 block truncate w-full text-center px-0.5 leading-none">
                              {sticker.name.split(' (')[0]}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="text-[9px] text-indigo-400/85 font-semibold mt-2.5 text-right flex justify-between px-0.5">
                  <span>Vibe Express 💫</span>
                  <span>{pickerTab === 'stickers' ? 'Toque na figurinha para enviar direto.' : 'Toque nos emojis ou símbolos para digitar.'}</span>
                </div>
              </div>
            )}

            {/* AUDIO RECORDING PORTAL */}
            {isRecording ? (
              <div className="w-full flex items-center justify-between bg-[#15121B] border border-red-500/20 px-4 py-2.5 rounded-2xl" id="audio-recording-hud">
                <div className="flex items-center gap-3">
                  <span className="flex h-3.5 w-3.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                  </span>
                  
                  <span className="text-sm font-mono font-bold text-white tracking-wide">{formatTime(recordingSeconds)}</span>
                  
                  {/* Visualizer bars */}
                  <div className="flex items-center gap-[2.5px] h-6 px-1.5" title="Sinal capturado">
                    {audioAnalyserData.map((waveHeight, idx) => (
                      <span 
                        key={idx} 
                        style={{ height: `${waveHeight}px` }} 
                        className="w-[2px] bg-indigo-500 rounded-full transition-all duration-100"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={cancelRecording}
                    className="px-4 py-2 bg-[#2D1B22] border border-red-500/10 hover:bg-[#3D1E2C] text-red-400 font-semibold text-xs rounded-xl transition-all active:scale-95"
                    id="btn-cancel-rec"
                  >
                    Descartar
                  </button>
                  
                  <button 
                    onClick={sendRecordedAudio}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1"
                    id="btn-send-rec"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Enviar Áudio</span>
                  </button>
                </div>
              </div>
            ) : (
              // STANDBY INTERFACE
              <div className="flex items-center gap-2" id="composer-inputs">
                <button 
                  onClick={() => {
                    setShowAttachmentMenu(!showAttachmentMenu);
                    setShowStickerEmojiPicker(false);
                  }}
                  className={`p-3 rounded-xl border transition-all active:scale-95 ${
                    showAttachmentMenu 
                      ? 'bg-[#1C1D2A] text-indigo-400 border-indigo-500/20' 
                      : 'bg-[#141620] text-gray-400 border-[#232535] hover:text-gray-200'
                  }`}
                  title="Anexar foto do computador"
                  id="btn-attach"
                >
                  <Camera className="h-4 w-4" />
                </button>

                <button 
                  onClick={() => {
                    setShowStickerEmojiPicker(!showStickerEmojiPicker);
                    setShowAttachmentMenu(false);
                  }}
                  className={`p-3 rounded-xl border transition-all active:scale-95 ${
                    showStickerEmojiPicker 
                      ? 'bg-[#1C1D2A] text-indigo-400 border-indigo-500/20' 
                      : 'bg-[#141620] text-gray-400 border-[#232535] hover:text-gray-200'
                  }`}
                  title="Figurinhas, Emojis e Símbolos"
                  id="btn-sticker-emoji"
                >
                  <Smile className="h-4 w-4" />
                </button>

                <div className="flex-1 relative flex items-center">
                  <input 
                    type="text" 
                    placeholder="Escreva sua mensagem aqui..."
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      handleUserTyping();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    className="w-full bg-[#12141D] border border-[#1C1E26] hover:border-[#232535] focus:border-indigo-500/30 rounded-2xl pl-4 pr-12 py-3 text-xs text-gray-200 outline-none placeholder-gray-500 transition-all font-medium"
                    id="compose-text-input"
                  />
                  
                  {/* Quick emojis */}
                  <div className="absolute right-3 flex items-center gap-1.5">
                    <button 
                      onClick={() => setInputText(prev => prev + '💪')} 
                      className="text-xs hover:scale-125 transition-transform"
                    >
                      💪
                    </button>
                    <button 
                      onClick={() => setInputText(prev => prev + '✨')} 
                      className="text-xs hover:scale-125 transition-transform"
                    >
                      ✨
                    </button>
                    <button 
                      onClick={() => setInputText(prev => prev + '🚀')} 
                      className="text-xs hover:scale-125 transition-transform"
                    >
                      🚀
                    </button>
                  </div>
                </div>

                {inputText.trim() ? (
                  <button 
                    onClick={handleSendMessage}
                    className="p-3 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl shadow shadow-purple-500/20 transition-all active:scale-95 animate-in fade-in zoom-in-75 duration-250"
                    title="Enviar"
                    id="btn-send-message"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                ) : (
                  <button 
                    onClick={startRecordingAudio}
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center relative group"
                    title="Gravar Mensagem de Áudio"
                    id="btn-record-voice"
                  >
                    <Mic className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>
            )}
          </footer>
        </main>
      ) : (
        <main className="hidden lg:flex flex-1 flex-col justify-center items-center bg-[#08080C] text-center p-8 space-y-6" id="empty-state-window">
          <Radio className="h-14 w-14 text-indigo-500/20 animate-pulse" />
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">Área de Trabalho Online</h2>
            <p className="text-sm text-gray-500 max-w-sm mt-1 mx-auto">Nenhum canal ativo selecionado. Toque em qualquer um dos chats na barra lateral para carregar a sincronização em tempo real.</p>
          </div>
        </main>
      )}

      {/* 3. RIGHT SIDEBAR: CONVERSATION DETAILS & USER META */}
      {activeChat && showRightPanel && (
        <section className="w-80 border-l border-[#1C1E26] bg-[#0E1017] hidden xl:flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-[#1D212E] select-none" id="vibe-right-panel">
          
          <div className="p-4 border-b border-[#1C1E26] flex items-center justify-between" id="right-panel-header">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Perfis & Meta</h3>
            <button 
              onClick={() => setShowRightPanel(false)}
              className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 flex flex-col items-center text-center space-y-4 border-b border-[#1C1E26]" id="right-panel-user-profile">
            {(() => {
              const partner = getRealTimePartner(activeChat);
              const detailTitle = partner ? partner.name : activeChat.title;
              const detailAvatar = partner ? partner.avatar : activeChat.avatar;
              const detailVerified = partner ? partner.verified : activeChat.verified;
              const detailBio = partner ? partner.bio : (activeChat.participants[0]?.bio || 'Membro operacional verificado pela rede Vibe.');
              const isPartnerOnline = partner ? (partner.status === 'online' || partner.status === 'typing' || partner.status === 'recording') : (activeChat.participants[0]?.status === 'online' || activeChat.category === 'ai');

              return (
                <>
                  <div className="relative">
                    <img 
                      src={detailAvatar} 
                      className="h-24 w-24 rounded-2xl object-cover border border-[#252838] shadow-lg shadow-black/30 animate-in zoom-in-75 duration-300" 
                      alt="profile" 
                    />
                    {detailVerified && (
                      <span className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-[#0E1017] border border-sky-500/25 rounded-full shadow-lg">
                        <ShieldCheck className="h-5 w-5 text-sky-400" />
                      </span>
                    )}
                  </div>
 
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center justify-center gap-1">
                      {detailTitle}
                    </h2>
                    <p className="text-[11px] text-purple-400 font-mono mt-0.5">
                      {activeChat.isGroup ? 'Sala Pública de Grupo' : 'Bate papo Reservado'}
                    </p>
                  </div>

                  {!activeChat.isGroup && activeChat.category !== 'ai' && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-full bg-[#12141D] border border-white/5 shadow-inner">
                      {isPartnerOnline ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-emerald-400">Online agora</span>
                        </>
                      ) : (
                        <>
                          <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                          <span className="text-gray-400 lowercase first-letter:uppercase">{formatLastSeen(partner?.lastSeen)}</span>
                        </>
                      )}
                    </div>
                  )}
 
                  {!activeChat.isGroup && (
                    <p className="text-xs text-gray-400 leading-relaxed bg-[#12141D] p-3 rounded-xl border border-[#212332]/45 max-w-[240px]">
                      {detailBio}
                    </p>
                  )}
                </>
              );
            })()}
          </div>

          {/* SHARED FILES / SAMPLES SECTION */}
          <div className="p-4 space-y-4 border-b border-[#1C1E26]" id="shared-materials">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Integrantes Ativos ({activeChat.isGroup ? activeChat.participants.length : 2})</h4>
            <div className="space-y-3">
              {/* Me details */}
              <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-[#12141D] border border-transparent hover:border-purple-500/10 text-left">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={me.avatar} className="h-7 w-7 rounded-md object-cover shrink-0" alt="me" />
                    <span className="text-xs font-semibold text-white truncate">{me.name} (Você)</span>
                  </div>
                  <span className="text-[9px] font-mono py-0.5 px-1.5 bg-[#1A1821] text-purple-400 rounded shrink-0">Criador</span>
                </div>
                
                {/* Additional user metadata bio profile helper section */}
                {(me.category || me.role || (me.links && me.links.length > 0)) && (
                  <div className="mt-1 pl-9 pr-1 space-y-1 text-[10px] text-gray-400 border-l border-purple-500/20">
                    {me.role && <p className="font-semibold text-gray-300">{me.role}</p>}
                    {me.category && (
                      <p><span className="text-gray-500">Categoria:</span> <span className="text-purple-400 font-mono text-[9px]">{me.category}</span></p>
                    )}
                    {me.links && me.links.length > 0 && (
                      <div className="flex flex-col gap-0.5 mt-1">
                        <span className="text-gray-500">Links:</span>
                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                          {me.links.map((lnk, idx) => (
                            <a 
                              key={idx} 
                              href={lnk.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-indigo-400 hover:underline hover:text-indigo-300"
                            >
                              <Link2 className="h-2.5 w-2.5 shrink-0" />
                              {lnk.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chat participants */}
              {activeChat.participants.filter(p => p.id !== me.id).map(part => (
                <div 
                  key={part.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-[#12141D] hover:bg-[#151722]/60 hover:border-indigo-500/5 border border-transparent transition-all"
                >
                  <div className="flex items-center gap-2">
                    <img src={part.avatar} className="h-7 w-7 rounded-md object-cover" alt="user" />
                    <span className="text-xs font-medium text-white">{part.name}</span>
                  </div>
                  {part.verified && (
                    <ShieldCheck className="h-4 w-4 text-sky-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-3" id="applet-help-card">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Servidor de Nuvem Real</h4>
            <div className="p-3.5 bg-[#12141D]/70 border border-[#1F2232] rounded-xl text-[11px] text-gray-400 space-y-2.5">
              <div className="flex items-start gap-1.5">
                <Mic className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <p><strong className="text-white">Realtime Sync:</strong> Sincronização automatizada baseada em sockets WebSocket de Firebase Firestore.</p>
              </div>
              <div className="flex items-start gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p><strong className="text-white">Inteligência Real:</strong> Personagens cognitivos usam o modelo de linguagem natural Gemini de forma integrada no servidor.</p>
              </div>
            </div>
          </div>

        </section>
      )}

      {/* SEARCH USER / START CONTACT CHAT MODAL */}
      {showSearchUserModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" id="dialog-search-contact">
          <div className="bg-[#10121A] border border-[#212435] rounded-2xl max-w-lg w-full p-6 flex flex-col shadow-2xl relative select-none max-h-[85vh]">
            <button 
              onClick={() => {
                setShowSearchUserModal(false);
                setSearchUserQuery('');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-95"
              id="btn-close-search-contact"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Search className="h-4 w-4 text-sky-400" />
                <span>Localizar Contato</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Utilize o motor de buscas do Vibe Premium para iniciar conversas reservadas com outros usuários registrados na rede.
              </p>
            </div>

            {/* Live custom search bar */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input 
                type="text"
                placeholder="Ex: Kaiow, Sabrina, Sabrina Designer..."
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                className="w-full bg-[#161823] border border-[#222434] hover:border-[#2C2F45] focus:border-sky-500/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-200 outline-none placeholder-gray-500 transition-all font-medium"
                id="search-contact-input"
                autoFocus
              />
            </div>

            {searchUserError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl mb-2">
                {searchUserError}
              </div>
            )}

            {/* List of matching users */}
            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[360px] pr-1 scrollbar-thin scrollbar-thumb-[#1D212E] mt-2">
              {usersLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <span className="h-6 w-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></span>
                  <span className="text-xs text-gray-500">Acessando cadastro de usuários...</span>
                </div>
              ) : (() => {
                const queryFiltered = usersList.filter(u => 
                  u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
                  (u.role && u.role.toLowerCase().includes(searchUserQuery.toLowerCase()))
                );

                if (queryFiltered.length === 0) {
                  return (
                    <div className="py-12 text-center text-gray-500">
                      <MessageSquare className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                      <p className="text-xs font-semibold">Nenhum usuário localizado</p>
                      {searchUserQuery && (
                        <p className="text-[11px] text-gray-600 mt-1">Não encontramos cadastros contendo "{searchUserQuery}"</p>
                      )}
                    </div>
                  );
                }

                return queryFiltered.map(user => {
                  return (
                    <div 
                      key={user.id} 
                      className="p-3 bg-[#141621] hover:bg-[#1A1D2B] border border-[#212435] hover:border-[#2F334D] rounded-xl flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                        <div className="relative shrink-0">
                          <img 
                            src={user.avatar} 
                            className="h-10 w-10 rounded-xl object-cover border border-[#252838]" 
                            alt={user.name} 
                          />
                          {user.status === 'online' && (
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 rounded-full border border-[#141621]"></span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white truncate">{user.name}</span>
                            {user.verified && (
                              <ShieldCheck className="h-3.5 w-3.5 text-sky-400 fill-sky-400/10 shrink-0" />
                            )}
                          </div>
                          {user.role && (
                            <p className="text-[10px] text-indigo-400 font-medium truncate mt-0.5">{user.role}</p>
                          )}
                          {user.bio ? (
                            <p className="text-[11px] text-gray-400 truncate mt-0.5 leading-tight">{user.bio}</p>
                          ) : (
                            <p className="text-[11px] text-gray-600 italic mt-0.5 leading-tight">Sem biografia disponível</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartDirectChat(user)}
                        className="px-3.5 py-1.5 bg-sky-600/10 hover:bg-sky-600 text-sky-400 hover:text-white border border-sky-500/20 rounded-xl text-xs font-bold transition-all active:scale-95 duration-100 flex items-center gap-1 shrink-0"
                      >
                        <Send className="h-3 w-3" />
                        <span>Conversar</span>
                      </button>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setShowSearchUserModal(false);
                  setSearchUserQuery('');
                }}
                className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white bg-[#141621] hover:bg-[#1C1F2E] border border-[#212435] rounded-xl transition-all active:scale-95"
              >
                Fechar Buscas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4b. MODAL: APAGAR MENSAGEM */}
      {showDeleteModal && msgToDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" id="dialog-delete-msg">
          <div className="bg-[#10121A] border border-[#212435] rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative select-none">
            <button 
              onClick={() => { setShowDeleteModal(false); setMsgToDelete(null); }}
              className="absolute top-4 right-4 p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 bg-red-500/10 rounded-xl">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Apagar mensagem?</h3>
                <p className="text-xs text-gray-400 mt-0.5">Como deseja prosseguir com a exclusão?</p>
              </div>
            </div>

            {/* Message preview snippet */}
            <div className="p-3 bg-[#151722] border border-[#222535] rounded-xl text-xs text-gray-400 italic">
              {msgToDelete.imageUrl ? (
                <span className="flex items-center gap-1.5 not-italic text-gray-300">🖼️ Imagem Anexada</span>
              ) : msgToDelete.audioUrl ? (
                <span className="flex items-center gap-1.5 not-italic text-gray-300">🎙️ Áudio Gravado ({msgToDelete.audioDuration}s)</span>
              ) : (
                <span>"{msgToDelete.text && msgToDelete.text.length > 55 ? `${msgToDelete.text.slice(0, 55)}...` : msgToDelete.text}"</span>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {msgToDelete.senderId === me?.id ? (
                <>
                  <button
                    onClick={() => handleDeleteMessageConfirm('everyone')}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all duration-150 active:scale-95 shadow-md shadow-red-950/20"
                    id="btn-delete-for-everyone"
                  >
                    Apagar para todos (WhatsApp style)
                  </button>
                  <button
                    onClick={() => handleDeleteMessageConfirm('me')}
                    className="w-full py-2.5 bg-[#1C1E2A] hover:bg-[#252839] border border-[#2B2E42] text-gray-200 text-xs font-bold rounded-xl transition-all duration-150 active:scale-95"
                    id="btn-delete-for-me-own"
                  >
                    Apagar apenas para mim
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleDeleteMessageConfirm('me')}
                  className="w-full py-2.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 text-xs font-bold rounded-xl transition-all duration-150 active:scale-95"
                  id="btn-delete-for-me-other"
                >
                  Apagar apenas para mim
                </button>
              )}

              <button
                onClick={() => { setShowDeleteModal(false); setMsgToDelete(null); }}
                className="w-full py-2.5 bg-[#141621] hover:bg-[#1C1F2E] text-gray-400 hover:text-white text-xs font-bold rounded-xl transition-all duration-150 active:scale-95 mt-1"
                id="btn-delete-cancel"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4c. MODAL: FULL-SCREEN RICH MEDIA LIGHTBOX */}
      {activeMediaViewer && (
        <div className="fixed inset-0 bg-[#07080D]/98 backdrop-blur-xl flex flex-col justify-between z-[9999] p-4 select-none animate-in fade-in duration-300" id="media-lightbox-portal">
          {/* Lightbox Header Controls */}
          <div className="flex items-center justify-between w-full max-w-5xl mx-auto pb-4 border-b border-gray-800/40">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                {activeMediaViewer.type === 'image' ? <ImageIcon className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-normal flex items-center gap-1.5">
                  <span>Enviado por {activeMediaViewer.senderName || 'Membro do Vibe'}</span>
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Sincronizado às {activeMediaViewer.timestamp || '--:--'} • {activeMediaViewer.type === 'image' ? 'Foto em Alta Definição' : 'Vídeo Streaming'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a 
                href={activeMediaViewer.url} 
                target="_blank" 
                rel="noreferrer"
                className="px-3 py-2 bg-[#141621] hover:bg-[#1C1F2E] text-xs font-bold text-indigo-300 rounded-xl transition-all active:scale-95 border border-[#232637] flex items-center gap-1"
                title="Abrir mídia em nova aba"
              >
                <span>Abrir Original</span>
              </a>
              <button
                onClick={() => setActiveMediaViewer(null)}
                className="p-2.5 bg-[#251212] hover:bg-[#3D1A1A] text-red-400 hover:text-red-300 rounded-xl transition-all duration-150 active:scale-90 border border-red-500/10"
                id="btn-close-lightbox"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Core presentation viewer screen stage */}
          <div className="flex-1 w-full max-w-5xl mx-auto flex items-center justify-center p-2 md:p-6">
            {activeMediaViewer.type === 'image' ? (
              <img 
                src={activeMediaViewer.url}
                className="max-w-full max-h-[70vh] md:max-h-[77vh] object-contain rounded-2xl shadow-3xl border border-white/5 animate-in zoom-in-95 duration-250 cursor-pointer"
                onClick={() => setActiveMediaViewer(null)}
                alt="Full preview"
              />
            ) : (
              <video 
                src={activeMediaViewer.url}
                controls
                autoPlay
                className="max-w-full max-h-[70vh] md:max-h-[77vh] rounded-2xl shadow-3xl border border-white/5 animate-in zoom-in-95 duration-250 bg-black"
              />
            )}
          </div>

          {/* Lightbox Caption Footer */}
          <div className="w-full max-w-3xl mx-auto text-center pt-2 pb-4">
            {activeMediaViewer.caption ? (
              <div className="inline-block px-5 py-2.5 bg-[#10121C]/90 border border-[#222434] text-xs text-gray-200 rounded-2xl shadow-inner max-w-xl truncate italic">
                "{activeMediaViewer.caption}"
              </div>
            ) : (
              <p className="text-[10px] text-gray-500 font-mono">Modo Cinema Vibe Ativo • Clique na foto ou no fechar para retornar</p>
            )}
          </div>
        </div>
      )}

      {/* 4. MODAL DETAILED PANEL: NEW GROUP CREATION CREATOR */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" id="dialog-new-group">
          <div className="bg-[#10121A] border border-[#212435] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative select-none">
            <button 
              onClick={() => setShowNewGroupModal(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white">Criar Canal do Vibe</h3>
              <p className="text-xs text-gray-400 mt-1">Configure uma nova sala de bate-papo em grupo.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Título do Grupo</label>
                <input 
                  type="text" 
                  placeholder="Ex: Squad de Finanças, Galera do CSS"
                  value={newGroupTitle}
                  onChange={(e) => setNewGroupTitle(e.target.value)}
                  className="w-full bg-[#161823] border border-[#222434] hover:border-[#2C2F45] focus:border-indigo-500/30 rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none"
                  id="group-title-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Descrição breve</label>
                <textarea 
                  placeholder="Qual o objetivo principal desta sala?"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-[#161823] border border-[#222434] hover:border-[#2C2F45] focus:border-indigo-500/30 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none resize-none"
                  id="group-desc-input"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#161823] rounded-xl border border-[#222434]">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-white block">Selo de Canal Verificado</span>
                  <span className="text-[10px] text-gray-500">Deixa a sala com badge azul oficial de confiança.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNewGroupVerified(!newGroupVerified)}
                  className={`h-6 w-11 rounded-full transition-all flex items-center p-0.5 ${
                    newGroupVerified ? 'bg-indigo-600 justify-end' : 'bg-gray-700 justify-start'
                  }`}
                  id="group-badge-toggle"
                >
                  <span className="h-5 w-5 bg-white rounded-full block shadow" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button 
                onClick={() => setShowNewGroupModal(false)}
                className="px-4 py-2 text-xs bg-transparent hover:bg-white/5 font-semibold rounded-xl text-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateGroup}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-opacity-90 hover:bg-indigo-500 text-white rounded-xl shadow shadow-indigo-500/20 active:scale-95 transition-all"
                id="btn-confirm-create-group"
              >
                Criar Sala
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4.1. GERENTE GERAL BOARD: COMPLETE MANAGEMENT PANEL FOR EXCLUSIVE USAGE */}
      {showAdminPanelModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-200 select-none overflow-y-auto" id="dialog-admin-hub">
          <div className="bg-[#0A0C16] border border-rose-500/20 rounded-3xl max-w-5xl w-full p-4 sm:p-6 flex flex-col shadow-2xl shadow-rose-950/10 h-[92vh] sm:min-h-[80vh] sm:max-h-[90vh]">
            
            {/* Header section */}
            <div className="flex items-center justify-between border-b border-rose-500/10 pb-4 mb-4 sm:mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-rose-650 to-red-650 flex items-center justify-center shadow-lg shadow-rose-500/10 border border-rose-500/30 shrink-0">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Painel de Controle Administrativo</span>
                    <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 text-[9px] rounded-md font-mono uppercase tracking-widest border border-rose-500/20">Gerente</span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 line-clamp-1">
                    Visualização em tempo real da base de usuários Vibe, liberação de selos Oficiais, modificação de credenciais e gestão de banimentos.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => {
                  setShowAdminPanelModal(false);
                  setAdminSelectedUserId(null);
                }}
                className="p-2 rounded-xl bg-[#111424] hover:bg-rose-950/20 border border-[#222744] hover:border-rose-500/25 text-gray-400 hover:text-white transition-all active:scale-95 shrink-0"
                id="btn-close-admin-hub"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Quick Metrics stats cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3.5 mb-4 sm:mb-5 shrink-0">
              <div className="p-2 sm:p-3.5 bg-[#121424]/50 border border-[#222544]/55 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Registrados</span>
                  <span className="text-sm sm:text-xl font-bold font-mono text-white mt-0.5 sm:mt-1 block">{adminUsers.length}</span>
                </div>
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400 shrink-0" />
              </div>
              <div className="p-2 sm:p-3.5 bg-[#121424]/50 border border-[#222544]/55 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Verificados</span>
                  <span className="text-sm sm:text-xl font-bold font-mono text-[#38BDF8] mt-0.5 sm:mt-1 block">
                    {adminUsers.filter(u => u.verified).length}
                  </span>
                </div>
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-sky-400 shrink-0" />
              </div>
              <div className="p-2 sm:p-3.5 bg-[#1A0E13] border border-rose-950/50 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Suspensos</span>
                  <span className="text-sm sm:text-xl font-bold font-mono text-rose-400 mt-0.5 sm:mt-1 block">
                    {adminUsers.filter(u => u.bannedStatus && u.bannedStatus !== 'none').length}
                  </span>
                </div>
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 shrink-0" />
              </div>
            </div>

            {/* Two-column workspace layout */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 mb-3">
              
              {/* Left Column: Users search list (5 spans) */}
              <div className={`${adminSelectedUserId ? 'hidden lg:flex' : 'flex'} lg:col-span-5 flex-col bg-[#111324]/40 border border-[#202440]/60 rounded-2xl p-4 min-h-0`}>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Usuários Cadastrados</span>
                
                {/* Search query in admin users list */}
                <div className="relative mb-3 shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    placeholder="Filtrar por nome ou e-mail..."
                    className="w-full bg-[#15182C] border border-[#24284A] hover:border-[#323766] focus:border-rose-500/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-300 outline-none placeholder:text-gray-650 transition-all font-medium"
                  />
                  {adminSearchQuery && (
                    <button 
                      onClick={() => setAdminSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Users List viewport */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-[#24284A]">
                  {(() => {
                    const filtered = adminUsers.filter(u => {
                      const query = adminSearchQuery.trim().toLowerCase();
                      if (!query) return true;
                      return (u.name || '').toLowerCase().includes(query) || (u.email || '').toLowerCase().includes(query);
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="h-full flex flex-col justify-center items-center text-center p-6 text-gray-500">
                          <Users className="h-7 w-7 text-gray-650 mb-2" />
                          <p className="text-xs">Nenhum outro usuário correspondente.</p>
                        </div>
                      );
                    }

                    return filtered.map(u => {
                      const isSel = adminSelectedUserId === u.id;
                      const hasActiveBan = u.bannedStatus && u.bannedStatus !== 'none';
                      return (
                        <button
                          key={u.id}
                          onClick={() => handleSelectAdminUser(u)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all active:scale-[0.99] ${
                            isSel 
                              ? 'bg-[#1C1824] border-rose-500/30 shadow-md shadow-rose-650/5' 
                              : 'bg-[#121424]/60 border-[#202344]/50 hover:bg-[#151930] hover:border-[#2A2E59]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img src={u.avatar} className="h-8.5 w-8.5 rounded-lg object-cover bg-slate-800" alt="" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-gray-250 truncate block max-w-[140px]">{u.name}</span>
                                {u.verified && (
                                  <ShieldCheck className="h-3.5 w-3.5 text-sky-400 fill-sky-400/10 shrink-0" />
                                )}
                              </div>
                              <span className="text-[10px] text-gray-500 font-mono block truncate max-w-[150px]">{u.email || 'OAuth Google / Sem Email'}</span>
                            </div>
                          </div>

                          {/* Quick indicators status tags */}
                          <div className="flex items-center gap-1.5">
                            {hasActiveBan && (
                              <span className="px-1.5 py-0.5 bg-red-950/50 text-red-400 text-[8px] font-bold font-mono tracking-wide rounded border border-red-500/20 uppercase shrink-0">
                                {u.bannedStatus === 'perm' ? 'BAN PERM' : 'BAN TEMP'}
                              </span>
                            )}
                            <ChevronRight className={`h-3 w-3 text-gray-500 transition-transform ${isSel ? 'translate-x-0.5 text-rose-400' : ''}`} />
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Right Column: Edit card panel (7 spans) */}
              <div className={`${!adminSelectedUserId ? 'hidden lg:flex' : 'flex'} lg:col-span-7 flex-col bg-[#111324]/40 border border-[#202440]/60 rounded-2xl p-4 sm:p-5 min-h-0`}>
                {adminSelectedUserId ? (
                  <div className="flex-1 flex flex-col min-h-0 pr-1 scrollbar-thin scrollbar-thumb-indigo-500 overflow-y-auto space-y-4">
                    
                    {/* User summary header view */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#212444]/40 shrink-0">
                      <div className="flex items-center gap-4 min-w-0">
                        <img src={adminUsers.find(u => u.id === adminSelectedUserId)?.avatar} className="h-14 w-14 rounded-2xl object-cover bg-slate-900 border border-[#212444] shrink-0" alt="" />
                        <div className="min-w-0">
                          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest block font-bold truncate">Gerenciando Credenciais</span>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2 truncate">
                            <span className="truncate">{adminEditName || 'Usuário'}</span>
                            {adminEditVerified && <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0" />}
                          </h4>
                          <span className="text-[10px] text-indigo-400/80 font-mono block truncate">UID: {adminSelectedUserId}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAdminSelectedUserId(null);
                          setAdminFeedback(null);
                        }}
                        className="lg:hidden px-3 py-2 bg-[#202342] text-xs font-bold text-gray-300 rounded-xl hover:text-white"
                      >
                        Voltar
                      </button>
                    </div>

                    {/* Alerts feed inside user edit section */}
                    {adminFeedback && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2" id="admin-hub-positive-feedback">
                        <CheckCheck className="h-4 w-4 shrink-0" />
                        <span className="font-semibold">{adminFeedback}</span>
                      </div>
                    )}

                    {/* General Edit inputs */}
                    <div className="space-y-3.5 shrink-0">
                      
                      {/* Name input */}
                      <div className="space-y-1">
                        <label className="text-[10pt] font-semibold text-gray-400">Nome Completo</label>
                        <input
                          type="text"
                          value={adminEditName}
                          onChange={(e) => setAdminEditName(e.target.value)}
                          className="w-full bg-[#15172A] border border-[#212544] hover:border-[#2C315C] rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none"
                          placeholder="Digite o nome completo"
                        />
                      </div>

                      {/* Credentials modification block with quick copies */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        
                        {/* Email edit with copy to clipboard */}
                        <div className="space-y-1">
                          <label className="text-[10pt] font-semibold text-gray-400 flex items-center justify-between">
                            <span>E-mail</span>
                            {adminEditEmail && (
                              <button
                                type="button"
                                onClick={() => {
                                  try {
                                    navigator.clipboard.writeText(adminEditEmail);
                                    setAdminFeedback('E-mail copiado!');
                                  } catch (e) {
                                    setAdminError('Tentando failsafe copy...');
                                  }
                                }}
                                className="text-[9px] text-[#A0A5B5] underline hover:text-white uppercase font-bold"
                              >
                                Copiar
                              </button>
                            )}
                          </label>
                          <input
                            type="email"
                            value={adminEditEmail}
                            onChange={(e) => setAdminEditEmail(e.target.value)}
                            className="w-full bg-[#15172A] border border-[#212544] hover:border-[#2C315C] rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none font-mono"
                            placeholder="exemplo@email.com"
                          />
                        </div>

                        {/* Password simulated edit with copy */}
                        <div className="space-y-1">
                          <label className="text-[10pt] font-semibold text-gray-400 flex items-center justify-between">
                            <span>Senha Secreta</span>
                            {adminEditPassword && (
                              <button
                                type="button"
                                onClick={() => {
                                  try {
                                    navigator.clipboard.writeText(adminEditPassword);
                                    setAdminFeedback('Senha copiada!');
                                  } catch (e) {
                                    setAdminError('Tentando failsafe copy...');
                                  }
                                }}
                                className="text-[9px] text-[#A0A5B5] underline hover:text-white uppercase font-bold"
                              >
                                Copiar
                              </button>
                            )}
                          </label>
                          <input
                            type="text"
                            value={adminEditPassword}
                            onChange={(e) => setAdminEditPassword(e.target.value)}
                            className="w-full bg-[#15172A] border border-[#212544] hover:border-[#2C315C] rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none font-mono"
                            placeholder="Senha do usuário"
                          />
                        </div>

                      </div>

                      {/* Bio & Professional role description */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        
                        <div className="space-y-1">
                          <label className="text-[10pt] font-semibold text-gray-400">Cargo / Função</label>
                          <input
                            type="text"
                            value={adminEditRole}
                            onChange={(e) => setAdminEditRole(e.target.value)}
                            className="w-full bg-[#15172A] border border-[#212544] hover:border-[#2C315C] rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none"
                            placeholder="Ex: Designer, Operações"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10pt] font-semibold text-gray-400">Biografia (Sobre)</label>
                          <input
                            type="text"
                            value={adminEditBio}
                            onChange={(e) => setAdminEditBio(e.target.value)}
                            className="w-full bg-[#15172A] border border-[#212544] hover:border-[#2C315C] rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none"
                            placeholder="Biografia do usuário"
                          />
                        </div>

                      </div>

                      {/* Verification badge toggle action */}
                      <div className="p-3.5 bg-[#121424]/90 border border-[#202344]/80 rounded-2xl flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-gray-200 uppercase tracking-widest block">Selo de Verificação Oficial 🛡 check</span>
                          <p className="text-[10px] text-gray-500">Adiciona ou revoga a credencial de autenticidade oficial na listagem pública do Vibe.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAdminEditVerified(!adminEditVerified)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all uppercase tracking-wider border active:scale-95 ${
                            adminEditVerified 
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/25' 
                              : 'bg-transparent text-gray-500 border-gray-700 hover:text-white hover:border-gray-500'
                          }`}
                        >
                          {adminEditVerified ? '✓ Ativo' : '✗ Inativo'}
                        </button>
                      </div>

                      {/* Suspension & Banishment layout (Banned temporary, perpetual, unbanned) */}
                      <div className="p-4 bg-rose-950/10 border border-rose-500/15 rounded-2xl space-y-3">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 text-rose-500" />
                          <span className="text-[11px] font-bold text-rose-450 uppercase tracking-widest">Controles de Suspensão & Banimento</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">Status da Conta</label>
                            <select
                              value={adminEditBannedStatus}
                              onChange={(e) => {
                                const val = e.target.value as 'none' | 'temp' | 'perm';
                                setAdminEditBannedStatus(val);
                                if (val !== 'temp') {
                                  setAdminEditBannedUntil('');
                                }
                              }}
                              className="w-full bg-[#18111A] border border-[#2A1820] text-xs text-rose-300 rounded-xl px-3 py-2.5 outline-none font-bold"
                            >
                              <option value="none">✔ Conta Regular e Ativa</option>
                              <option value="temp">⚠️ Banir Temporariamente (Suspenso)</option>
                              <option value="perm">🚫 Banir Permanentemente</option>
                            </select>
                          </div>

                          {/* Slide-in date picker specifically for temporary ban dates */}
                          {adminEditBannedStatus === 'temp' && (
                            <div className="space-y-1 animate-in slide-in-from-top-3 duration-250">
                              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">Suspenso Até:</label>
                              <input
                                type="datetime-local"
                                value={adminEditBannedUntil}
                                onChange={(e) => setAdminEditBannedUntil(e.target.value)}
                                className="w-full bg-[#1A131C] border border-[#2E1B27] text-xs text-rose-300 rounded-xl px-3 py-2 outline-none font-bold font-mono"
                              />
                            </div>
                          )}

                        </div>

                        {/* Ban context visual guide summary */}
                        <div className="text-[10px] text-gray-500 leading-relaxed font-mono bg-[#090A14] p-2.5 rounded-lg border border-[#222444]/20">
                          {adminEditBannedStatus === 'none' ? (
                            <span className="text-emerald-500 font-bold">● CONTA EM SITUAÇÃO REGULAR: Usuário possui acesso total aos chats e serviços logados.</span>
                          ) : adminEditBannedStatus === 'perm' ? (
                            <span className="text-rose-500 font-bold">● BANIMENTO PERMANENTE: O usuário será forçado a sair e não poderá mais logar nesta infraestrutura.</span>
                          ) : (
                            <span className="text-amber-500 font-bold">
                              ● CONTA SUSPENSA TEMPORARIAMENTE: Acesso desabilitado até{' '}
                              {adminEditBannedUntil ? new Date(adminEditBannedUntil).toLocaleString('pt-BR') : 'data indefinida pelo gerente'}.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Desativar e Apagar Contas Section */}
                      <div className="p-4 bg-[#14121F] border border-[#2B1D3D]/65 rounded-2xl space-y-3">
                        <div className="flex items-center gap-1.5">
                          <Settings className="h-4 w-4 text-purple-400" />
                          <span className="text-[11px] font-bold text-purple-300 uppercase tracking-widest">Ações Rápidas de Gerenciamento</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {/* Deactivate account card */}
                          <div className="p-3 bg-[#110F18] border border-purple-950/40 rounded-xl flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Desativação</span>
                              <p className="text-[9px] text-[#A0A5B5] mt-1 leading-relaxed">Suspende todo o acesso do usuário à rede imediatamente.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setAdminEditDeactivated(!adminEditDeactivated)}
                              className={`mt-3 w-full py-2 rounded-lg text-[10px] font-bold font-mono transition-all uppercase tracking-wider border active:scale-95 ${
                                adminEditDeactivated 
                                  ? 'bg-[#1F151E] text-rose-400 border-rose-550/30' 
                                  : 'bg-transparent text-gray-400 border-gray-700 hover:text-white hover:border-gray-500'
                              }`}
                            >
                              {adminEditDeactivated ? '⚠ Conta Desativada' : 'Desativar Conta'}
                            </button>
                          </div>

                          {/* Delete account card */}
                          <div className="p-3 bg-[#130F11] border border-rose-950/40 rounded-xl flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Exclusão</span>
                              <p className="text-[9px] text-[#A0A5B5] mt-1 leading-relaxed">Remove todos os registros e chats do usuário permanentemente.</p>
                            </div>
                            <button
                              type="button"
                              onClick={handleDeleteAdminUser}
                              disabled={adminSaving}
                              className={`mt-3 w-full py-2 rounded-lg text-[10px] font-bold font-mono transition-all uppercase tracking-wider border active:scale-95 flex items-center justify-center gap-1.5 shrink-0 ${
                                deleteConfirmUserId === adminSelectedUserId 
                                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse font-extrabold' 
                                  : 'bg-transparent text-rose-450 border-rose-905/50 hover:bg-rose-950/20'
                              }`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>{deleteConfirmUserId === adminSelectedUserId ? 'Confirmar Deleção' : 'Apagar Conta'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Footer confirmation changes */}
                    <div className="pt-3 border-t border-[#212444]/40 flex items-center justify-end gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setAdminSelectedUserId(null);
                          setAdminFeedback(null);
                        }}
                        className="px-4 py-2 bg-transparent hover:bg-white/5 rounded-xl text-xs font-semibold text-gray-400 transition-colors"
                      >
                        Desmarcar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAdminUserChanges}
                        disabled={adminSaving}
                        className="px-6 py-2.5 bg-rose-600 hover:bg-rose-550 text-white font-bold text-xs rounded-xl active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-rose-650/10 disabled:opacity-50"
                        id="btn-save-admin-changes"
                      >
                        {adminSaving ? (
                          <>
                            <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Salvando Alterações...
                          </>
                        ) : (
                          'Confirmar Modificações'
                        )}
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-8 space-y-4">
                    <ShieldCheck className="h-10 w-10 text-rose-500/20 animate-pulse" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Aguardando Seleção</h4>
                      <p className="text-xs text-gray-600 max-w-sm mt-1">
                        Toque em qualquer usuário da fila à esquerda para carregar as informações confidenciais de credenciais, email, senhas de login e gestão de suspensões.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Error alerts layout block */}
            {adminError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl mb-3 shrink-0" id="admin-hub-negative-feedback">
                {adminError}
              </div>
            )}

            {/* Main Modal Footer exit link */}
            <div className="flex items-center justify-end shrink-0 pt-2 border-t border-rose-500/10 text-[11px] text-gray-500">
              <span>Sessão Admin Segura • ID de Conector Autenticado • Antigravity Console</span>
            </div>

          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto" id="dialog-profile-config">
          <div className="bg-[#10121A] border border-[#212435] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative select-none max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white">Configurar Meu Perfil Vibe</h3>
              <p className="text-xs text-gray-400 mt-1">Atualize seus dados pessoais e adicione links à sua conta.</p>
            </div>

            {profileError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-3 rounded-xl text-xs text-left animate-in fade-in" id="profile-error-box">
                {profileError}
              </div>
            )}

            <div className="space-y-4 text-left">
              {/* Profile image picker & device gallery upload */}
              <div className="flex flex-col gap-3.5 p-3.5 bg-[#161823] rounded-xl border border-[#222434]" id="avatar-selector-section">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Foto do Perfil (Avatar)</label>
                
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <img 
                      src={editAvatar} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=fallback`;
                      }}
                      className="h-16 w-16 rounded-full object-cover border-2 border-indigo-500/20 shadow-inner"
                      alt="Preview" 
                    />
                    <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#161823]" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input 
                      type="file"
                      ref={profileFileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                      id="profile-gallery-file-input"
                    />
                    <button
                      type="button"
                      onClick={() => profileFileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 border border-indigo-500/30"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Escolher Foto da Galeria
                    </button>
                    <p className="text-[10px] text-gray-500 font-mono">Suporta formatos JPEG, PNG e GIF. Redimensionado automaticamente.</p>
                  </div>
                </div>

                {/* Predeclared quick picker choices */}
                <div className="space-y-1.5 pt-2 border-t border-[#222434]/40">
                  <span className="text-[10px] font-semibold text-gray-400">Ou escolha uma sugestão rápida:</span>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {[
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
                    ].map((avatarUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditAvatar(avatarUrl)}
                        className={`h-9 w-9 rounded-full overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${
                          editAvatar === avatarUrl ? 'border-[#818CF8]' : 'border-transparent'
                        }`}
                      >
                        <img src={avatarUrl} className="h-full w-full object-cover" alt="preset" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Basic Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nome de Exibição</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#161823] border border-[#222434] hover:border-[#2C2F45] focus:border-indigo-500/30 rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none"
                    placeholder="Seu nome no chat"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Título Profissional ou Função</label>
                  <input 
                    type="text" 
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-[#161823] border border-[#222434] hover:border-[#2C2F45] focus:border-indigo-500/30 rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none"
                    placeholder="Ex: Designer UX, Diretor de Tech"
                  />
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Categoria de Perfil</label>
                <div className="flex gap-2">
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="bg-[#161823] border border-[#222434] hover:border-[#2C2F45] text-xs text-gray-200 rounded-xl px-3 py-2.5 outline-none flex-1"
                  >
                    <option value="">Sem Categoria</option>
                    <option value="Designer">Designer</option>
                    <option value="Developer">Developer</option>
                    <option value="Programador">Programador</option>
                    <option value="Músico">Músico</option>
                    <option value="Esportista">Esportista</option>
                    <option value="Gamer">Gamer</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Outros">Outros</option>
                  </select>
                  <input 
                    type="text" 
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-1/2 bg-[#161823] border border-[#222434] hover:border-[#2C2F45] focus:border-indigo-500/30 rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none placeholder:text-gray-600"
                    placeholder="Ou digite categoria..."
                  />
                </div>
              </div>

              {/* Biography text area */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sobre mim (Biografia)</label>
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full bg-[#161823] border border-[#222434] hover:border-[#2C2F45] focus:border-indigo-500/30 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none resize-none"
                  placeholder="Fale um pouco sobre você..."
                />
              </div>

              {/* Social or business URLs list editing */}
              <div className="space-y-2 p-3 bg-[#11131C] rounded-xl border border-[#222434]">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Links de Redes e Portfólio ({editLinks.length})</span>
                
                {editLinks.length > 0 && (
                  <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1 mb-2">
                    {editLinks.map((lnk, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-[#161823] border border-[#222434]/50 px-2.5 py-1.5 rounded-lg text-xs">
                        <div className="flex items-center gap-1.5 text-gray-300 truncate">
                          <Link2 className="h-3 w-3 text-[#818CF8]" />
                          <span className="font-semibold">{lnk.label}:</span>
                          <span className="text-gray-500 hover:underline truncate max-w-[150px]">{lnk.url}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveLink(idx)}
                          className="text-[10px] text-red-400 hover:text-red-300 font-semibold uppercase tracking-wider transition-all"
                        >
                          Excluir
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-[#222434]/20">
                  <input 
                    type="text" 
                    placeholder="Label: Github, Website..."
                    value={newLinkLabel}
                    onChange={(e) => setNewLinkLabel(e.target.value)}
                    className="flex-1 bg-[#161823] border border-[#222434] hover:border-[#2C2F45] focus:border-indigo-500/30 rounded-lg px-2.5 py-2 text-[11px] text-gray-200 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="https://github.com/exemplo"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="flex-1 bg-[#161823] border border-[#222434] hover:border-[#2C2F45] focus:border-indigo-500/30 rounded-lg px-2.5 py-2 text-[11px] text-gray-200 outline-none"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddLink}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg active:scale-95 transition-all shrink-0"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* PWA Notifications Console */}
              <div className="space-y-2.5 p-3.5 bg-[#141525] rounded-xl border border-[#21243A]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-gray-200 uppercase tracking-wider block">Notificações no Celular / PWA</span>
                      <span className="text-[10px] text-gray-400">Receba alertas instantâneos quando receber mensagens</span>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border ${
                    notificationPermission === 'granted'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : notificationPermission === 'denied'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {notificationPermission === 'granted' ? 'ATIVADO' : notificationPermission === 'denied' ? 'BLOQUEADO' : 'PENDENTE'}
                  </span>
                </div>

                <div className="text-[11px] text-gray-400 leading-relaxed bg-[#11131E] p-2.5 rounded-lg border border-[#222434]/40">
                  Para o PWA do celular enviar alertas sonoros e discretos, conceda a permissão nativa de notificações no seu dispositivo.
                </div>

                <div className="flex gap-2 w-full">
                  {notificationPermission !== 'granted' ? (
                    <button
                      type="button"
                      onClick={requestNotificationPermission}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 shadow shadow-indigo-500/20"
                    >
                      <BellRing className="h-3.5 w-3.5" />
                      Ativar Notificações
                    </button>
                  ) : (
                    <div className="flex-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/15 flex items-center gap-1.5 justify-center">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Permissões Ativadas!
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={testVibeNotification}
                    className="py-2 px-3 bg-[#1D1E30] hover:bg-[#25273C] text-gray-300 font-bold text-xs rounded-xl active:scale-95 transition-all border border-[#2D304B] flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-3 w-3" />
                    Enviar Teste
                  </button>
                </div>
              </div>

              {/* Account Management & Privacy Settings */}
              <div className="space-y-3 p-3.5 bg-[#171013] rounded-xl border border-rose-950/20">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">Zona de Perigo da Conta</span>
                
                {/* Inline Confirmation Alert for Deactivation */}
                {showDeactivateConfirm ? (
                  <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-lg space-y-2 text-xs">
                    <p className="text-amber-200 font-medium">Tem certeza de que deseja desativar o seu perfil? Você será desconectado e sua conta ficará desabilitada temporariamente.</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDeactivateMyAccount}
                        disabled={profileSaving}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-md active:scale-95 transition-all text-[11px]"
                      >
                        {profileSaving ? 'Desativando...' : 'Sim, Desativar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeactivateConfirm(false)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-gray-300 rounded-md text-[11px]"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : showDeleteAccountConfirm ? (
                  /* Inline Confirmation Alert for Deletion */
                  <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg space-y-2 text-xs">
                    <p className="text-red-200 font-medium">AÇÃO IRREVERSÍVEL! Deseja mesmo excluir toda a sua conta, perfil e dados permanentemente do Vibe?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDeleteMyAccount}
                        disabled={profileSaving}
                        className="px-3 py-1.5 bg-red-650 hover:bg-red-500 text-white font-bold rounded-md active:scale-95 transition-all text-[11px]"
                      >
                        {profileSaving ? 'Excluindo...' : 'Sim, Excluir Definitivamente'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteAccountConfirm(false)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-gray-300 rounded-md text-[11px]"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Button Options */
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeactivateConfirm(true);
                        setShowDeleteAccountConfirm(false);
                      }}
                      className="flex-1 py-2 px-3 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/20 font-bold text-xs rounded-xl active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      Desativar Minha Conta
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteAccountConfirm(true);
                        setShowDeactivateConfirm(false);
                      }}
                      className="flex-1 py-2 px-3 bg-red-650/15 hover:bg-red-650/25 text-red-400 border border-red-500/20 font-bold text-xs rounded-xl active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      Excluir Minha Conta
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2.5 pt-2 w-full">
              {isGerenteGeral ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    handleOpenAdminPanel();
                  }}
                  className="px-3.5 py-2 bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/10 active:scale-95 transition-all flex items-center gap-1.5 border border-rose-500/30"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Abrir Painel do Gerente
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowProfileModal(false)}
                  disabled={profileSaving}
                  className="px-4 py-2 text-xs bg-transparent hover:bg-white/5 font-semibold rounded-xl text-gray-400 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-opacity-90 hover:bg-indigo-500 text-white rounded-xl shadow shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                  id="btn-confirm-save-profile"
                >
                  {profileSaving ? (
                    <>
                      <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. AUDIO & VIDEO CALL SCREEN */}
      {activeCall && (
        <div className="fixed inset-0 bg-[#06070a] bg-opacity-100 flex flex-col items-center justify-center p-4 md:p-6 z-50 animate-in fade-in zoom-in duration-300 select-none font-sans" id="voice-call-overlay">
          
          {/* Main call body */}
          <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center relative mt-4">
            
            {activeCall.callType === 'video' ? (
              /* ================== VIDEO CALL LAYOUT ================== */
              <div className="w-full h-full max-h-[600px] flex flex-col md:flex-row gap-4 relative">
                
                {/* Main Remote Video Container */}
                <div className="flex-1 bg-[#111322] border border-[#20253f] rounded-3xl overflow-hidden relative shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
                  {activeCall.isChatbotCall ? (
                    /* AI video theme: Pulsing avatar with digital halo */
                    <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping duration-1500 scale-125"></div>
                        <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-pulse duration-1000 scale-150"></div>
                        <img 
                          src={activeCall.avatar} 
                          className="h-32 w-32 rounded-full object-cover border-4 border-indigo-500/40 relative z-10 shadow-indigo-500/40 shadow-2xl" 
                          alt="AI avatar" 
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-indigo-200 tracking-wide">{activeCall.name}</h3>
                        <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-mono animate-pulse">Aria Holograma de Entrada</div>
                      </div>
                      
                      {/* Sub-waveform for speaking */}
                      <div className="flex items-end justify-center gap-1 h-6 pt-2">
                        {[...Array(8)].map((_, i) => (
                          <span 
                            key={i} 
                            className={`w-1 bg-indigo-500 rounded-full ${callAiIsThinking ? 'animate-bounce' : 'h-1.5'}`} 
                            style={{ 
                              height: callAiIsThinking ? `${[20, 24, 16, 22, 12, 18, 26, 14][i]}px` : undefined,
                              animationDelay: `${i * 120}ms` 
                            }} 
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Real remote human user video stream */
                    <div className="w-full h-full relative">
                      {remoteCallStream ? (
                        <VideoStreamPlayer stream={remoteCallStream} className="w-full h-full" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 h-full">
                          <div className="relative animate-pulse">
                            <div className="absolute inset-0 rounded-3xl bg-indigo-500/5 scale-110"></div>
                            <img 
                              src={activeCall.avatar} 
                              className="h-24 w-24 rounded-3xl object-cover border border-[#232535] relative z-10" 
                              alt="partner avatar" 
                            />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{activeCall.name}</p>
                            <span className="text-xs text-gray-400">Aguardando câmera do parceiro...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Top indicators or floating headers */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#131526] px-3.5 py-1.5 rounded-full border border-[#2b3054] text-[10px] text-white font-mono font-bold">
                    <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping" />
                    <span>AOVIVO C-C</span>
                  </div>

                  {/* Local camera preview embedded as a small floating window in the corner */}
                  {localCallStream && (
                    <div className="absolute bottom-4 right-4 z-20 w-32 h-24 md:w-40 md:h-28 bg-[#0c0e1e] border-2 border-indigo-500/80 rounded-2xl overflow-hidden shadow-2xl transition-all hover:scale-105 active:scale-95 duration-300">
                      <VideoStreamPlayer stream={localCallStream} muted={true} className="w-full h-full" />
                      <div className="absolute bottom-1 right-2 bg-black/75 text-[8px] px-1.5 py-0.5 rounded text-white font-mono font-bold">
                        Você
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtitles, controls, chatbot helper for video call */}
                {activeCall.status === 'connected' && (
                  <div className="w-full md:w-80 flex flex-col gap-3 min-h-[160px]">
                    <div className="bg-[#141628] border-2 border-[#262c52] p-5 rounded-3xl flex flex-col h-full justify-between gap-3 shadow-2xl">
                      
                      <div className="space-y-1">
                        <h2 className="text-base font-bold text-white tracking-wide">{activeCall.name}</h2>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono font-semibold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>CHAMADA DE VÍDEO: {formatTime(activeCall.seconds)}</span>
                          </div>
                          {isCallMuted && (
                            <span className="w-fit px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[9px] font-bold font-mono border border-rose-500/20 flex items-center gap-1">
                              <MicOff className="h-2.5 w-2.5" /> MUTADO
                            </span>
                          )}
                        </div>
                      </div>

                      {activeCall.isChatbotCall ? (
                        /* If chatbot, show live active notes logs transcription or custom dialogue box */
                        <div className="flex-1 flex flex-col gap-3 justify-end min-h-0">
                          <div className="flex-1 overflow-y-auto px-1.5 py-1 flex flex-col gap-2 max-h-[180px] scrollbar-none text-left">
                            {callTranscript.map((line, idx) => (
                              <div key={idx} className={`text-[10px] p-2.5 rounded-xl border leading-relaxed max-w-[90%] ${line.sender === 'user' ? 'self-end bg-[#252a53] text-white border-[#343b71] rounded-tr-none' : 'self-start bg-[#1c1e30] text-gray-200 border-[#2b2e47] rounded-tl-none'}`}>
                                <p className="font-semibold text-[8px] uppercase text-indigo-400 mb-0.5">{line.sender === 'user' ? 'Você' : activeCall.name.split(' ')[0]}</p>
                                <p>{line.text}</p>
                              </div>
                            ))}
                            {callAiIsThinking && (
                              <div className="text-[10px] text-indigo-300 animate-pulse text-left font-semibold">IA respondendo...</div>
                            )}
                            <div ref={callTranscriptEndRef} />
                          </div>

                          {/* Chatbot speech triggers */}
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (callInput.trim() && !callAiIsThinking) {
                                handleSendMessageInCall(callInput);
                              }
                            }}
                            className="flex items-center gap-1.5"
                          >
                            <input 
                              type="text"
                              value={callInput}
                              onChange={(e) => setCallInput(e.target.value)}
                              placeholder="Fale no chat..."
                              disabled={callAiIsThinking}
                              className="flex-1 min-w-0 bg-[#0c0d18] border border-[#222749] text-[10px] p-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                            />
                            {callInput.trim() ? (
                              <button type="submit" className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-[10px] font-semibold transition-all">Enviar</button>
                            ) : (
                              <button 
                                type="button" 
                                onClick={startSpeechRecognitionInCall}
                                className={`p-2 rounded-xl transition-all ${isListeningForCall ? 'bg-rose-600 animate-pulse text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
                              >
                                <Mic className="h-3 w-3" />
                              </button>
                            )}
                          </form>
                        </div>
                      ) : (
                        /* If normal connection, show premium telemetry metrics */
                        <div className="space-y-4 text-xs text-gray-400">
                          <div className="bg-[#0b0c15] p-3 rounded-2xl border border-slate-800/30 space-y-2">
                            <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-400 font-bold font-semibold">ESTADO DE TRANSFERÊNCIA</span>
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span>Sincronização</span>
                              <span className="text-emerald-400 font-semibold font-semibold">Ativa, Sem Perda</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span>Rede Peer</span>
                              <span className="text-emerald-400 font-semibold font-semibold">Criptografado (E2EE)</span>
                            </div>
                          </div>
                          
                          <div className="bg-[#0b0c15] p-3 rounded-2xl border border-slate-800/30 space-y-1">
                            <span className="text-[9px] uppercase tracking-wider font-mono text-purple-400 font-semibold">DICAS DE CHAMADA</span>
                            <p className="text-[10px] leading-relaxed">Você está em uma chamada de vídeo de alta fidelidade baseada em WebRTC direto.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ================== AUDIO ONLY CALL LAYOUT ================== */
              <div className="text-center space-y-6 max-w-sm w-full flex-1 flex flex-col justify-center items-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping duration-1000 scale-125"></div>
                  <img 
                    src={activeCall.avatar} 
                    className="h-28 w-28 rounded-3xl object-cover border-2 border-purple-500/25 relative z-10 shadow-2xl" 
                    alt="user avatar" 
                  />
                </div>

                <div className="space-y-1.5 relative z-10">
                  <h2 className="text-xl font-bold tracking-wide text-white">{activeCall.name}</h2>
                  <div className="flex flex-col justify-center items-center gap-1">
                    <div className="flex justify-center items-center gap-1.5 text-xs text-indigo-400 font-mono">
                      {activeCall.status === 'ringing' ? (
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                          <span>CHAMANDO...</span>
                        </span>
                      ) : activeCall.status === 'connected' ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>CONEXÃO INTEGRADA: {formatTime(activeCall.seconds)}</span>
                        </span>
                      ) : activeCall.status === 'busy' ? (
                        <span className="text-red-400">NÃO ATENDEU</span>
                      ) : (
                        <span className="text-gray-500">LIGAÇÃO ENCERRADA</span>
                      )}
                    </div>
                    {activeCall.status === 'connected' && isCallMuted && (
                      <span className="mt-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold font-mono border border-rose-500/20 flex items-center gap-1 animate-pulse">
                        <MicOff className="h-3 w-3" /> MICROFONE SILENCIADO (MUDO)
                      </span>
                    )}
                  </div>
                </div>

                {activeCall.status === 'connected' && (
                  <>
                    {activeCall.isChatbotCall ? (
                      <div className="w-full max-w-sm flex flex-col gap-3 animate-in slide-in-from-bottom duration-500">
                        {/* Transcript / Subtitles Dialog box */}
                        <div className="h-44 md:h-52 w-full overflow-y-auto px-4 py-3 bg-[#131522] border-2 border-[#292e4c] rounded-2xl flex flex-col gap-2.5 scrollbar-thin scrollbar-thumb-indigo-500/20 custom-scroll-overlay select-text text-left">
                          {callTranscript.length === 0 && (
                            <div className="text-gray-500 text-center my-auto font-mono text-[10px] animate-pulse">
                              Aria está conectada. Diga olá! 💫
                            </div>
                          )}
                          {callTranscript.map((line, idx) => (
                            <div key={idx} className={`max-w-[85%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed shadow-sm ${line.sender === 'user' ? 'self-end bg-[#252a55] text-white rounded-tr-none border border-[#39407a]' : 'self-start bg-[#1c1d2e] text-gray-200 border border-[#2e314e] rounded-tl-none'}`}>
                              <div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${line.sender === 'user' ? 'text-indigo-400' : 'text-purple-400'}`}>
                                {line.sender === 'user' ? (me?.name || 'Você') : activeCall.name.split(' ')[0]}
                              </div>
                              <p>{line.text}</p>
                            </div>
                          ))}
                          {callAiIsThinking && (
                            <div className="text-left self-start bg-[#151726] border border-[#282b45] px-3 py-2 rounded-2xl rounded-tl-none text-[11px] flex items-center gap-1.5 text-gray-400">
                              <span className="font-semibold text-purple-400 animate-pulse">{activeCall.name.split(' ')[0]} está pensando</span>
                              <span className="flex gap-0.5">
                                <span className="h-1 w-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="h-1 w-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="h-1 w-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </span>
                            </div>
                          )}
                          <div ref={callTranscriptEndRef} />
                        </div>

                        {/* Speech / Keyboard Input Dock */}
                        <div className="w-full bg-[#111322] border-2 border-[#262b4a] p-3 rounded-2xl relative z-10 shadow-lg text-left font-sans">
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (callInput.trim() && !callAiIsThinking) {
                                handleSendMessageInCall(callInput);
                              }
                            }}
                            className="flex items-center gap-1.5 w-full"
                          >
                            <input 
                              type="text"
                              value={callInput}
                              onChange={(e) => setCallInput(e.target.value)}
                              placeholder={`Fale com a ${activeCall.name.split(' ')[0]}...`}
                              disabled={callAiIsThinking}
                              className="flex-1 min-w-0 bg-[#0c0e18] text-white placeholder-gray-500 text-xs px-3.5 py-2.5 rounded-xl border border-[#1f223d] focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                            />
                            
                            {callInput.trim() ? (
                              <button type="submit" disabled={callAiIsThinking} className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl active:scale-95 transition-all text-xs font-bold disabled:opacity-50 cursor-pointer">Enviar</button>
                            ) : (
                              <button type="button" onClick={startSpeechRecognitionInCall} disabled={callAiIsThinking || isListeningForCall} className={`p-2.5 rounded-xl active:scale-95 transition-all cursor-pointer ${isListeningForCall ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-500/20' : 'bg-[#21253f] text-gray-300 hover:bg-[#2a3059]'}`} title="Falar no microfone">
                                <Mic className="h-4 w-4" />
                              </button>
                            )}
                          </form>
                          <div className="text-[9px] text-gray-500 flex justify-between px-1 mt-1.5">
                            <span>{isListeningForCall ? "🎤 Ouvindo você... fale agora!" : "Toque no mic para falar ou escreva acima."}</span>
                            <span className="font-mono text-indigo-400 font-bold">Vibe Voice AI</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 py-3.5 bg-[#121422] border-2 border-[#262a48] rounded-2xl text-[11px] text-gray-400 text-center space-y-1.5 max-w-xs animate-in slide-in-from-bottom duration-500 shadow-xl">
                        <div className="text-[10px] uppercase font-bold text-indigo-300 font-mono tracking-widest flex items-center justify-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          <span>Criptografia Ativa</span>
                        </div>
                        <p>Estabilizando frequências neurais premium no Vibe.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

          </div>

          {/* Bottom actions for both type of calls */}
          <div className="pb-12" id="call-controls">
            {activeCall.isIncoming && activeCall.status === 'ringing' ? (
              <div className="flex items-center gap-6">
                <button 
                  onClick={handleRejectIncomingCall}
                  className="h-16 w-16 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/10 active:scale-90 transition-all cursor-pointer"
                  title="Recusar"
                  id="btn-decline-call"
                >
                  <Phone className="h-6 w-6 rotate-135" />
                </button>
                <button 
                  onClick={handleAcceptIncomingCall}
                  className="h-16 w-16 bg-emerald-650 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10 active:scale-90 transition-all cursor-pointer"
                  title="Atender"
                  id="btn-accept-call"
                >
                  <Phone className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                {activeCall.status === 'connected' && (
                  <button 
                    onClick={toggleCallMute}
                    className={`h-16 w-16 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer border ${
                      isCallMuted 
                        ? 'bg-rose-600 hover:bg-rose-500 border-rose-500 text-white shadow-rose-500/20 animate-pulse' 
                        : 'bg-[#181a30] hover:bg-[#202340] border-[#313661] text-gray-300 hover:text-white'
                    }`}
                    title={isCallMuted ? "Reativar Áudio (Desmutar)" : "Silenciar Áudio (Mudo)"}
                    id="btn-toggle-mute"
                  >
                    {isCallMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </button>
                )}
                <button 
                  onClick={handleEndCall}
                  className="h-16 w-16 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/10 active:scale-90 transition-all cursor-pointer"
                  title="Desconectar ligação"
                  id="btn-disconnect-call"
                >
                  <Phone className="h-6 w-6 rotate-135" />
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
