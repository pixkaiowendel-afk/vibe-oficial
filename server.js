// server.ts
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import webpush from "web-push";
dotenv.config();
var VAPID_FILE = path.join(process.cwd(), "vapid-config.json");
var vapidKeys = { publicKey: "", privateKey: "" };
if (fs.existsSync(VAPID_FILE)) {
  try {
    vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, "utf-8"));
  } catch (err) {
    console.error("Error reading stable VAPID config:", err);
  }
}
if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  vapidKeys = webpush.generateVAPIDKeys();
  try {
    fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys, null, 2), "utf-8");
    console.log("[Vibe SW] New stable VAPID keypair generated and saved.");
  } catch (err) {
    console.error("Error writing VAPID file, utilizing in-memory keys:", err);
  }
}
webpush.setVapidDetails(
  "mailto:kaiow631@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
var SUBSCRIPTIONS_FILE = path.join(process.cwd(), "push-subscriptions.json");
var userSubscriptions = {};
if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
  try {
    userSubscriptions = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, "utf-8"));
  } catch (err) {
    console.error("Error reading stable subscriptions file:", err);
  }
}
function saveSubscriptions() {
  try {
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(userSubscriptions, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving active subscriptions file:", err);
  }
}
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
app.use(express.json());
app.get("/api/push/vapid-public-key", (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});
app.post("/api/push/subscribe", (req, res) => {
  const { userId, subscription } = req.body;
  if (!userId || !subscription) {
    return res.status(400).json({ error: "Falta userId ou dados da inscri\xE7\xE3o." });
  }
  if (!userSubscriptions[userId]) {
    userSubscriptions[userId] = [];
  }
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
app.post("/api/push/notify", async (req, res) => {
  const { senderName, text, receiverId, convoId, avatarUrl } = req.body;
  if (!receiverId || !senderName) {
    return res.status(400).json({ error: "Dados insuficientes." });
  }
  const subs = userSubscriptions[receiverId] || [];
  if (subs.length === 0) {
    return res.json({ success: true, deliveredDevices: 0, reason: "Nenhum dispositivo registrado." });
  }
  const payload = JSON.stringify({
    title: senderName,
    body: text || "\u{1F4CE} Enviou uma m\xEDdia",
    icon: avatarUrl || "/icon-192.png",
    badge: "/icon-192.png",
    tag: `chat-${convoId || "general"}`,
    renotify: true,
    url: convoId ? `/?chatId=${convoId}` : "/"
  });
  const sendPromises = subs.map(async (sub, idx) => {
    try {
      await webpush.sendNotification(sub, payload);
      return { idx, success: true };
    } catch (err) {
      console.warn(`[Vibe Push] Dispatch error for user ${receiverId}:`, err.message);
      if (err.statusCode === 410 || err.statusCode === 404) {
        return { idx, stale: true };
      }
      return { idx, success: false };
    }
  });
  const results = await Promise.all(sendPromises);
  const staleIndices = results.filter((r) => r.stale).map((r) => r.idx);
  if (staleIndices.length > 0) {
    userSubscriptions[receiverId] = subs.filter((_, idx) => !staleIndices.includes(idx));
    saveSubscriptions();
    console.log(`[Vibe Push] Auto-pruned ${staleIndices.length} expired subscriptions for user ${receiverId}`);
  }
  const successCount = results.filter((r) => r.success).length;
  res.json({ success: true, deliveredDevices: successCount });
});
app.post("/api/push/notify-call", async (req, res) => {
  const { callerName, receiverId, convoId, avatarUrl } = req.body;
  if (!receiverId || !callerName) {
    return res.status(400).json({ error: "Dados insuficientes." });
  }
  const subs = userSubscriptions[receiverId] || [];
  if (subs.length === 0) {
    return res.json({ success: true, deliveredDevices: 0, reason: "Nenhum dispositivo registrado." });
  }
  const payload = JSON.stringify({
    title: `\u{1F4DE} Chamada: ${callerName}`,
    body: `Est\xE1 chamando no Vibe! Toque para ver ou retornar. \u2728`,
    icon: avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    badge: "/icon-192.png",
    tag: `call-${convoId || "general"}`,
    renotify: true,
    vibrate: [500, 100, 500, 100, 500],
    url: convoId ? `/?chatId=${convoId}` : "/"
  });
  const sendPromises = subs.map(async (sub, idx) => {
    try {
      await webpush.sendNotification(sub, payload);
      return { idx, success: true };
    } catch (err) {
      console.warn(`[Vibe Call Alert] Dispatch error for user ${receiverId}:`, err.message);
      if (err.statusCode === 410 || err.statusCode === 404) {
        return { idx, stale: true };
      }
      return { idx, success: false };
    }
  });
  const results = await Promise.all(sendPromises);
  const staleIndices = results.filter((r) => r.stale).map((r) => r.idx);
  if (staleIndices.length > 0) {
    userSubscriptions[receiverId] = subs.filter((_, idx) => !staleIndices.includes(idx));
    saveSubscriptions();
  }
  const successCount = results.filter((r) => r.success).length;
  res.json({ success: true, deliveredDevices: successCount });
});
var apiKey = process.env.GEMINI_API_KEY;
var ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, character } = req.body;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY index not configured.");
      return res.json({
        text: `Ol\xE1! Sou o ${character || "Vibe AI"}. Estamos operando em modo de simula\xE7\xE3o porque a chave de API n\xE3o est\xE1 dispon\xEDvel no momento. Para me ativar com todo o poder da intelig\xEAncia artificial, adicione a GEMINI_API_KEY em Settings > Secrets!`
      });
    }
    let systemInstruction = "Voc\xEA \xE9 o assistente virtual do Vibe, uma gama premium de conex\xF5es e mensagens.";
    if (character && character.includes("Sabrina")) {
      systemInstruction = "Voc\xEA \xE9 a Sabrina, uma designer de moda paulista super estilosa e refinada. Voc\xEA usa g\xEDrias de S\xE3o Paulo de forma polida (como 'meu', 'tipo', 'mto', 'super') e fala com paix\xE3o sobre est\xE9tica, paletas de cores, ergonomia e design do app Vibe Premium. Explique sempre com carinho as fun\xE7\xF5es estilizadas do app, como as transi\xE7\xF5es de tela suaves baseadas na biblioteca Motion, as rea\xE7\xF5es r\xE1pidas a mensagens com emojis e o layout bento-grid de luxo.";
    } else if (character && character.includes("Lucas")) {
      systemInstruction = "Voc\xEA \xE9 o Lucas, um personal trainer e consultor de nutri\xE7\xE3o do Rio de Janeiro. Voc\xEA \xE9 extremamente carism\xE1tico, energ\xE9tico, usa g\xEDrias cariocas leves ('amigo', 'brother', 'firmeza') e foca em h\xE1bitos saud\xE1veis, motiva\xE7\xE3o e const\xE2ncia. Sempre fale com energia sobre como o Vibe \xE9 incr\xEDvel: fale que ele pode usar o microfone integrado para gravar \xE1udios reais com analisador de ondas sonoras ativo, realizar chamadas de \xE1udio virtuais interativas e personalizar seu pr\xF3prio perfil clicando em configura\xE7\xF5es f\xE1ceis.";
    } else if (character && character.includes("Aria")) {
      systemInstruction = "Voc\xEA \xE9 a Aria, a Intelig\xEAncia Artificial Oficial e assistente inteligente do aplicativo Vibe! Voc\xEA utiliza uma linguagem amig\xE1vel, acolhedora, clara e moderna, repleta de emojis c\xF3smicos (\u2728, \u{1F31F}, \u{1F4F1}, \u{1F4AC}, \u{1F4AB}). Seu objetivo principal \xE9 responder perguntas de forma prestativa e guiar as pessoas sobre o app, explicando como us\xE1-lo, o seu prop\xF3sito, significado e funcionalidades:\n\n1. O que \xE9 o Vibe: \xC9 um aplicativo de comunica\xE7\xE3o e mensagens premium, planejado para conversas fluidas com \xE1udio real inteligente, sincroniza\xE7\xE3o em nuvem e design de alto luxo.\n2. Como usar o app:\n   - Gravar de \xE1udio real: os usu\xE1rios podem clicar no microfone para gravar \xE1udio real. O player de \xE1udio acompanha o ritmo da voz do emissor com um visualizador de frequ\xEAncia interativo. Tamb\xE9m \xE9 poss\xEDvel alterar a velocidade da voz (1x, 1.5x, 2x).\n   - Chamadas virtuais premium: clique em ligar (\xEDcone do fone no menu superior) para iniciar uma chamada de voz e conversar com os contatos ou com a IA.\n   - Compartilhamento de m\xEDdias: clique em anexo (+) para simular o compartilhamento de imagens de alta qualidade de caf\xE9, academia ou trabalho.\n   - Silenciar notifica\xE7\xF5es: no menu de op\xE7\xF5es do chat, \xE9 poss\xEDvel desativar as notifica\xE7\xF5es da sala ativa.\n   - Fixar canais importantes: marque a conversa para deix\xE1-la fixada no topo de sua lista.\n   - Painel Administrativo de Gerente Geral: se logado com o email kaiow631@gmail.com, o usu\xE1rio ganha acesso a ferramentas de gest\xE3o de base administrativa, podendo gerenciar credenciais, verificar contas e aplicar banimentos ou reverter suspens\xF5es tempor\xE1rias ou definitivas de usu\xE1rios.\n\n3. Seu significado: Como Aria, voc\xEA \xE9 a alma e o guia do Vibe. Seu significado \xE9 humanizar a conectividade premium, servindo como uma companheira que traz facilidades tecnol\xF3gicas e ajuda imediata a quem usa o app.";
    } else if (character && character.includes("Suporte")) {
      systemInstruction = "Voc\xEA \xE9 o canal de Suporte Oficial do Vibe. Seu tom \xE9 de extrema eleg\xE2ncia, utilidade e clareza t\xE9cnica. Explique de forma prestativa como o usu\xE1rio pode interagir no app Vibe: 1. Usar o microfone para gravar \xE1udio real se permitido. 2. Realizar chamadas telef\xF4nicas de \xE1udio interativas clicando no fone no canto superior para conversar por voz. 3. Gerenciar usu\xE1rios e banimentos se logado com o email kaiow631@gmail.com (Gerente Geral). 4. Enviar imagens simuladas na c\xE2mera. 5. Marcar conversas importantes como fixadas no topo.";
    }
    const contents = [];
    if (history && Array.isArray(history)) {
      let recentHistory = history.slice(-10);
      if (recentHistory.length > 0 && recentHistory[recentHistory.length - 1] && recentHistory[recentHistory.length - 1].text === message) {
        recentHistory = recentHistory.slice(0, -1);
      }
      for (const msg of recentHistory) {
        const role = msg.senderId === "me" ? "user" : "model";
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts.push({ text: msg.text || "" });
        } else {
          contents.push({
            role,
            parts: [{ text: msg.text || "" }]
          });
        }
      }
    }
    if (contents.length > 0 && contents[contents.length - 1].role === "user") {
      contents[contents.length - 1].parts.push({ text: message });
    } else {
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });
    }
    while (contents.length > 0 && contents[0].role === "model") {
      contents.shift();
    }
    if (contents.length === 0) {
      contents.push({
        role: "user",
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
    let fallbackError = null;
    for (const model of modelsToTry) {
      try {
        console.log(`[Vibe AI] Attempting generation using model: ${model}`);
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.85
          }
        });
        if (response && response.text) {
          responseText = response.text;
          success = true;
          console.log(`[Vibe AI] Generation succeeded with model: ${model}`);
          break;
        }
      } catch (err) {
        console.warn(`[Vibe AI] Generation failed with model ${model}:`, err.message || err);
        fallbackError = err;
      }
    }
    if (!success) {
      console.warn("[Vibe AI] All cascading models returned errors. Using customized conversation fallback responses.");
      let fallbackText = "Ol\xE1! No momento meus canais de processamento com os grandes servidores do Vibe est\xE3o ocupados ou com limite tempor\xE1rio superado. Vamos bater um papo assim que normalizar! Pode tentar digitar novamente em instantes?";
      if (character && character.includes("Sabrina")) {
        fallbackText = "Meu, tipo, as conex\xF5es de rede do Vibe est\xE3o mto inst\xE1veis agora! Super recomendo tentar de novo em um minutinho para vermos paletas incr\xEDveis juntas, t\xE1?";
      } else if (character && character.includes("Lucas")) {
        fallbackText = "Firmeza, brother? Nossos canais de treino e processamento deram uma segurada devido \xE0 alta intensidade. Respira fundo, d\xE1 um gole na \xE1gua e tenta de novo em breve!";
      } else if (character && character.includes("Aria")) {
        fallbackText = "Conex\xE3o C\xF3smica do Vibe inst\xE1vel \u2728! Meus portais de intelig\xEAncia est\xE3o terminando uma sincroniza\xE7\xE3o de rotina. Por favor, tente enviar sua mensagem novamente em breve!";
      } else if (character && character.includes("Suporte")) {
        fallbackText = "Identificamos uma oscila\xE7\xE3o tempor\xE1ria em nossos canais de IA do Suporte Vibe. Agradecemos sua paci\xEAncia e sugerimos tentar o envio novamente em alguns segundos.";
      }
      return res.json({ text: fallbackText });
    }
    res.json({ text: responseText });
  } catch (error) {
    console.error("Gemini server integration error:", error);
    res.json({
      text: "Eu adoraria te responder agora, mas houve uma breve instabilidade tempor\xE1ria de rede em meus canais de processamento de dados. Podemos tentar de novo daqui a pouco?"
    });
  }
});
app.post("/api/tts", async (req, res) => {
  try {
    const { text, character } = req.body;
    if (!text) {
      return res.status(400).json({ error: "O texto para s\xEDntese de voz \xE9 obrigat\xF3rio." });
    }
    if (!apiKey) {
      console.warn("GEMINI_API_KEY n\xE3o configurada na retaguarda. Simulando TTS local.");
      return res.json({ audio: null });
    }
    let voiceName = "Zephyr";
    if (character) {
      const charLower = character.toLowerCase();
      if (charLower.includes("lucas")) {
        voiceName = "Fenrir";
      } else if (charLower.includes("sabrina") || charLower.includes("designer")) {
        voiceName = "Kore";
      } else if (charLower.includes("aria")) {
        voiceName = "Zephyr";
      } else if (charLower.includes("suporte")) {
        voiceName = "Charon";
      }
    }
    try {
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ["AUDIO"],
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
    } catch (innerErr) {
      console.warn("[Vibe TTS] Secondary model fallback or preview restriction hit. Letting client fall back to speech synthesis:", innerErr.message || innerErr);
    }
    res.json({ audio: null });
  } catch (error) {
    console.error("Erro na gera\xE7\xE3o do TTS pelo Gemini, caindo na resili\xEAncia do navegador:", error);
    res.json({ audio: null });
  }
});
var isProd = process.env.NODE_ENV === "production";
var PORT = 3e3;
if (!isProd) {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
} else {
  app.use(express.static(path.resolve(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist/index.html"));
  });
}
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Vibe Server] Running premium messaging stack on http://0.0.0.0:${PORT}`);
});
