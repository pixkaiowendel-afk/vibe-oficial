import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

import webpush from 'web-push';

// VAPID keys creation and persistence for offline-first push continuity
const VAPID_FILE = path.join(process.cwd(), 'vapid-config.json');
let vapidKeys = { publicKey: '', privateKey: '' };

if (fs.existsSync(VAPID_FILE)) {
  try {
    vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf-8'));
  } catch (err) {
    console.error("Error reading stable VAPID config:", err);
  }
}

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  vapidKeys = webpush.generateVAPIDKeys();
  try {
    fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys, null, 2), 'utf-8');
    console.log("[Vibe SW] New stable VAPID keypair generated and saved.");
  } catch (err) {
    console.error("Error writing VAPID file, utilizing in-memory keys:", err);
  }
}

webpush.setVapidDetails(
  'mailto:kaiow631@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Persist user subscriptions locally to survive container restarts
const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'push-subscriptions.json');
let userSubscriptions: Record<string, any[]> = {};

if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
  try {
    userSubscriptions = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8'));
  } catch (err) {
    console.error("Error reading stable subscriptions file:", err);
  }
}

function saveSubscriptions() {
  try {
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(userSubscriptions, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error saving active subscriptions file:", err);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Expose public VAPID key for client handshake
app.get('/api/push/vapid-public-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// Subscribe device to user push stream
app.post('/api/push/subscribe', (req, res) => {
  const { userId, subscription } = req.body;
  if (!userId || !subscription) {
    return res.status(400).json({ error: 'Falta userId ou dados da inscrição.' });
  }

  if (!userSubscriptions[userId]) {
    userSubscriptions[userId] = [];
  }

  // Avoid duplicate subscriptions on same device endpoint
  const alreadySubscribed = userSubscriptions[userId].some(
    (sub) => sub.endpoint === subscription.endpoint
  );

  if (!alreadySubscribed) {
    userSubscriptions[userId].push(subscription);
    saveSubscriptions();
    console.log(`[Vibe Push] User logged / device configured: ${userId}. Active subs: ${userSubscriptions[userId].length}`);
  }

  res.json({ success: true });
});

// Notify receiver of new chat message (called from clients on transmission)
app.post('/api/push/notify', async (req, res) => {
  const { senderName, text, receiverId, convoId, avatarUrl } = req.body;
  if (!receiverId || !senderName) {
    return res.status(400).json({ error: 'Dados insuficientes.' });
  }

  const subs = userSubscriptions[receiverId] || [];
  if (subs.length === 0) {
    return res.json({ success: true, deliveredDevices: 0, reason: 'Nenhum dispositivo registrado.' });
  }

  const payload = JSON.stringify({
    title: senderName,
    body: text || '📎 Enviou uma mídia',
    icon: avatarUrl || '/icon-192.png',
    badge: '/icon-192.png',
    tag: `chat-${convoId || 'general'}`,
    renotify: true,
    url: convoId ? `/?chatId=${convoId}` : '/'
  });

  const sendPromises = subs.map(async (sub, idx) => {
    try {
      await webpush.sendNotification(sub, payload);
      return { idx, success: true };
    } catch (err: any) {
      console.warn(`[Vibe Push] Dispatch error for user ${receiverId}:`, err.message);
      if (err.statusCode === 410 || err.statusCode === 404) {
        return { idx, stale: true };
      }
      return { idx, success: false };
    }
  });

  const results = await Promise.all(sendPromises);
  const staleIndices = results.filter(r => r.stale).map(r => r.idx);

  if (staleIndices.length > 0) {
    userSubscriptions[receiverId] = subs.filter((_, idx) => !staleIndices.includes(idx));
    saveSubscriptions();
    console.log(`[Vibe Push] Auto-pruned ${staleIndices.length} expired subscriptions for user ${receiverId}`);
  }

  const successCount = results.filter(r => r.success).length;
  res.json({ success: true, deliveredDevices: successCount });
});

// Notify receiver of an incoming VoIP / Voice Call (high urgency vibration + tag)
app.post('/api/push/notify-call', async (req, res) => {
  const { callerName, receiverId, convoId, avatarUrl } = req.body;
  if (!receiverId || !callerName) {
    return res.status(400).json({ error: 'Dados insuficientes.' });
  }

  const subs = userSubscriptions[receiverId] || [];
  if (subs.length === 0) {
    return res.json({ success: true, deliveredDevices: 0, reason: 'Nenhum dispositivo registrado.' });
  }

  const payload = JSON.stringify({
    title: `📞 Chamada: ${callerName}`,
    body: `Está chamando no Vibe! Toque para ver ou retornar. ✨`,
    icon: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    badge: '/icon-192.png',
    tag: `call-${convoId || 'general'}`,
    renotify: true,
    vibrate: [500, 100, 500, 100, 500],
    url: convoId ? `/?chatId=${convoId}` : '/'
  });

  const sendPromises = subs.map(async (sub, idx) => {
    try {
      await webpush.sendNotification(sub, payload);
      return { idx, success: true };
    } catch (err: any) {
      console.warn(`[Vibe Call Alert] Dispatch error for user ${receiverId}:`, err.message);
      if (err.statusCode === 410 || err.statusCode === 404) {
        return { idx, stale: true };
      }
      return { idx, success: false };
    }
  });

  const results = await Promise.all(sendPromises);
  const staleIndices = results.filter(r => r.stale).map(r => r.idx);

  if (staleIndices.length > 0) {
    userSubscriptions[receiverId] = subs.filter((_, idx) => !staleIndices.includes(idx));
    saveSubscriptions();
  }

  const successCount = results.filter(r => r.success).length;
  res.json({ success: true, deliveredDevices: successCount });
});

const apiKey = process.env.GEMINI_API_KEY;

// Initialize Gemini AI Client
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Endpoint to chat with the premium AI contacts
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, character } = req.body;
    
    if (!apiKey) {
      console.warn("GEMINI_API_KEY index not configured.");
      return res.json({ 
        text: `Olá! Sou o ${character || 'Vibe AI'}. Estamos operando em modo de simulação porque a chave de API não está disponível no momento. Para me ativar com todo o poder da inteligência artificial, adicione a GEMINI_API_KEY em Settings > Secrets!` 
      });
    }

    // Set up custom system instructions based on character focusing on app features and help
    let systemInstruction = "Você é o assistente virtual do Vibe, uma gama premium de conexões e mensagens.";
    if (character && character.includes("Sabrina")) {
      systemInstruction = "Você é a Sabrina, uma designer de moda paulista super estilosa e refinada. Você usa gírias de São Paulo de forma polida (como 'meu', 'tipo', 'mto', 'super') e fala com paixão sobre estética, paletas de cores, ergonomia e design do app Vibe Premium. Explique sempre com carinho as funções estilizadas do app, como as transições de tela suaves baseadas na biblioteca Motion, as reações rápidas a mensagens com emojis e o layout bento-grid de luxo.";
    } else if (character && character.includes("Lucas")) {
      systemInstruction = "Você é o Lucas, um personal trainer e consultor de nutrição do Rio de Janeiro. Você é extremamente carismático, energético, usa gírias cariocas leves ('amigo', 'brother', 'firmeza') e foca em hábitos saudáveis, motivação e constância. Sempre fale com energia sobre como o Vibe é incrível: fale que ele pode usar o microfone integrado para gravar áudios reais com analisador de ondas sonoras ativo, realizar chamadas de áudio virtuais interativas e personalizar seu próprio perfil clicando em configurações fáceis.";
    } else if (character && character.includes("Aria")) {
      systemInstruction = "Você é a Aria, a Inteligência Artificial Oficial e assistente inteligente do aplicativo Vibe! Você utiliza uma linguagem amigável, acolhedora, clara e moderna, repleta de emojis cósmicos (✨, 🌟, 📱, 💬, 💫). Seu objetivo principal é responder perguntas de forma prestativa e guiar as pessoas sobre o app, explicando como usá-lo, o seu propósito, significado e funcionalidades:\n\n" +
        "1. O que é o Vibe: É um aplicativo de comunicação e mensagens premium, planejado para conversas fluidas com áudio real inteligente, sincronização em nuvem e design de alto luxo.\n" +
        "2. Como usar o app:\n" +
        "   - Gravar de áudio real: os usuários podem clicar no microfone para gravar áudio real. O player de áudio acompanha o ritmo da voz do emissor com um visualizador de frequência interativo. Também é possível alterar a velocidade da voz (1x, 1.5x, 2x).\n" +
        "   - Chamadas virtuais premium: clique em ligar (ícone do fone no menu superior) para iniciar uma chamada de voz e conversar com os contatos ou com a IA.\n" +
        "   - Compartilhamento de mídias: clique em anexo (+) para simular o compartilhamento de imagens de alta qualidade de café, academia ou trabalho.\n" +
        "   - Silenciar notificações: no menu de opções do chat, é possível desativar as notificações da sala ativa.\n" +
        "   - Fixar canais importantes: marque a conversa para deixá-la fixada no topo de sua lista.\n" +
        "   - Painel Administrativo de Gerente Geral: se logado com o email kaiow631@gmail.com, o usuário ganha acesso a ferramentas de gestão de base administrativa, podendo gerenciar credenciais, verificar contas e aplicar banimentos ou reverter suspensões temporárias ou definitivas de usuários.\n\n" +
        "3. Seu significado: Como Aria, você é a alma e o guia do Vibe. Seu significado é humanizar a conectividade premium, servindo como uma companheira que traz facilidades tecnológicas e ajuda imediata a quem usa o app.";
    } else if (character && character.includes("Suporte")) {
      systemInstruction = "Você é o canal de Suporte Oficial do Vibe. Seu tom é de extrema elegância, utilidade e clareza técnica. Explique de forma prestativa como o usuário pode interagir no app Vibe: 1. Usar o microfone para gravar áudio real se permitido. 2. Realizar chamadas telefônicas de áudio interativas clicando no fone no canto superior para conversar por voz. 3. Gerenciar usuários e banimentos se logado com o email kaiow631@gmail.com (Gerente Geral). 4. Enviar imagens simuladas na câmera. 5. Marcar conversas importantes como fixadas no topo.";
    }

    // Adapt schema for Gemini API call
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      // Keep only last 10 messages for token efficiency and speedy chat
      let recentHistory = history.slice(-10);
      
      // If the last message in history has the same text as current input, slice it off to avoid duplication
      if (recentHistory.length > 0 && recentHistory[recentHistory.length - 1] && recentHistory[recentHistory.length - 1].text === message) {
        recentHistory = recentHistory.slice(0, -1);
      }

      for (const msg of recentHistory) {
        const role = msg.senderId === 'me' ? 'user' : 'model';
        // Avoid consecutive identical roles by appending parts
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts.push({ text: msg.text || '' });
        } else {
          contents.push({
            role: role,
            parts: [{ text: msg.text || '' }]
          });
        }
      }
    }

    // Always ensure the new user message is appended at the very end of contents as 'user' role
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts.push({ text: message });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });
    }

    // Sanitize contents: Gemini API requires that the turn history starts with a 'user' role.
    // If the conversation began with a model welcome message, it starts with 'model' which throws a 400.
    while (contents.length > 0 && contents[0].role === 'model') {
      contents.shift();
    }

    // Safety fallback: if contents is somehow empty or cleared out, ensure we have at least the current user query.
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });
    }

    let responseText = "";
    const modelsToTry = [
      "gemini-3.5-flash",
      "gemini-2.5-flash",
      "gemini-flash-latest"
    ];

    let success = false;
    let fallbackError: any = null;

    for (const model of modelsToTry) {
      try {
        console.log(`[Vibe AI] Attempting generation using model: ${model}`);
        const response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: {
            systemInstruction,
            temperature: 0.85,
          }
        });

        if (response && response.text) {
          responseText = response.text;
          success = true;
          console.log(`[Vibe AI] Generation succeeded with model: ${model}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[Vibe AI] Generation failed with model ${model}:`, err.message || err);
        fallbackError = err;
      }
    }

    if (!success) {
      console.warn("[Vibe AI] All cascading models returned errors. Using customized conversation fallback responses.");
      let fallbackText = "Olá! No momento meus canais de processamento com os grandes servidores do Vibe estão ocupados ou com limite temporário superado. Vamos bater um papo assim que normalizar! Pode tentar digitar novamente em instantes?";
      
      if (character && character.includes("Sabrina")) {
        fallbackText = "Meu, tipo, as conexões de rede do Vibe estão mto instáveis agora! Super recomendo tentar de novo em um minutinho para vermos paletas incríveis juntas, tá?";
      } else if (character && character.includes("Lucas")) {
        fallbackText = "Firmeza, brother? Nossos canais de treino e processamento deram uma segurada devido à alta intensidade. Respira fundo, dá um gole na água e tenta de novo em breve!";
      } else if (character && character.includes("Aria")) {
        fallbackText = "Conexão Cósmica do Vibe instável ✨! Meus portais de inteligência estão terminando uma sincronização de rotina. Por favor, tente enviar sua mensagem novamente em breve!";
      } else if (character && character.includes("Suporte")) {
        fallbackText = "Identificamos uma oscilação temporária em nossos canais de IA do Suporte Vibe. Agradecemos sua paciência e sugerimos tentar o envio novamente em alguns segundos.";
      }
      return res.json({ text: fallbackText });
    }

    res.json({ text: responseText });
  } catch (error: any) {
    console.error("Gemini server integration error:", error);
    res.json({ 
      text: "Eu adoraria te responder agora, mas houve uma breve instabilidade temporária de rede em meus canais de processamento de dados. Podemos tentar de novo daqui a pouco?" 
    });
  }
});

// Endpoint to synthesize speech using modern @google/genai SDK
app.post('/api/tts', async (req, res) => {
  try {
    const { text, character } = req.body;
    if (!text) {
      return res.status(400).json({ error: "O texto para síntese de voz é obrigatório." });
    }

    if (!apiKey) {
      console.warn("GEMINI_API_KEY não configurada na retaguarda. Simulando TTS local.");
      return res.json({ audio: null });
    }

    // Map characters to high quality prebuilt Gemini voices: Puck, Charon, Kore, Fenrir, Zephyr
    let voiceName = 'Zephyr'; // default gentle
    if (character) {
      const charLower = character.toLowerCase();
      if (charLower.includes('lucas')) {
        voiceName = 'Fenrir'; // Energetic male
      } else if (charLower.includes('sabrina') || charLower.includes('designer')) {
        voiceName = 'Kore'; // Refined female
      } else if (charLower.includes('aria')) {
        voiceName = 'Zephyr'; // Calm female
      } else if (charLower.includes('suporte')) {
        voiceName = 'Charon'; // Stable professional male/female tone
      }
    }

    try {
      // Use gemini-3.1-flash-tts-preview model to create audio
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });

      const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({ audio: `data:audio/wav;base64,${base64Audio}` });
      }
    } catch (innerErr: any) {
      console.warn("[Vibe TTS] Secondary model fallback or preview restriction hit. Letting client fall back to speech synthesis:", innerErr.message || innerErr);
    }
    
    // Fall back to returning null audio so client-side speech synthesis covers the audio output perfectly
    res.json({ audio: null });
  } catch (error: any) {
    console.error("Erro na geração do TTS pelo Gemini, caindo na resiliência do navegador:", error);
    res.json({ audio: null });
  }
});

const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

if (!isProd) {
  // Use Vite development middleware
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });
  app.use(vite.middlewares);
  
  // Render index.html via Vite transform
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  // Production static server
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Vibe Server] Running premium messaging stack on http://0.0.0.0:${PORT}`);
});
