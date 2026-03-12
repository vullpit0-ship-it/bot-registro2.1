const http = require("http");
const { Client, GatewayIntentBits, Events } = require("discord.js");

// =======================
// DADOS FIXOS NO CÓDIGO
// =======================
// COLE AQUI TEMPORARIAMENTE OS VALORES REAIS
const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1481383472965881956";
const GUILD_ID = "1477774289414656213";

// pode manter a porta do Render dinâmica
const PORT = process.env.PORT || 10000;

// =======================
// LOGS INICIAIS
// =======================
console.log("🚀 Iniciando teste mínimo...");
console.log(`- TOKEN: ${TOKEN ? "OK" : "FALTANDO"}`);
console.log(`- CLIENT_ID: ${CLIENT_ID ? "OK" : "FALTANDO"} (${CLIENT_ID || "vazio"})`);
console.log(`- GUILD_ID: ${GUILD_ID ? "OK" : "FALTANDO"} (${GUILD_ID || "vazio"})`);

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("❌ Faltam dados obrigatórios1.2.");
  process.exit(1);
}

// =======================
// WEB SERVER PARA RENDER
// =======================
http
  .createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("ok");
    }

    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Teste mínimo do bot online.");
  })
  .listen(PORT, "0.0.0.0", () => {
    console.log(`🌐 Web server online na porta ${PORT}`);
  });

// =======================
// CLIENT DISCORD
// =======================
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.on("debug", (msg) => {
  if (
    msg.includes("Heartbeat") ||
    msg.includes("Session") ||
    msg.includes("Connecting") ||
    msg.includes("Ready")
  ) {
    console.log("🐞 DEBUG:", msg);
  }
});

client.on("error", (error) => {
  console.error("❌ Erro no client do Discord:", error);
});

client.on("warn", (info) => {
  console.warn("⚠️ Aviso do Discord:", info);
});

client.on("ready", () => {
  console.log("🟢 Evento ready disparou.");
});

client.on("shardReady", (id) => {
  console.log(`🟢 Shard ${id} pronta.`);
});

client.on("shardConnecting", (id) => {
  console.log(`🟡 Shard ${id} conectando...`);
});

client.on("shardReconnecting", (id) => {
  console.log(`🟠 Shard ${id} reconectando...`);
});

client.on("shardResume", (id, replayedEvents) => {
  console.log(`🔵 Shard ${id} retomou. Eventos replayed: ${replayedEvents}`);
});

client.on("shardDisconnect", (event, id) => {
  console.log(`🔌 Shard ${id} desconectada. Código: ${event.code}`);
});

client.on("shardError", (error, id) => {
  console.error(`❌ Erro na shard ${id}:`, error);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
});

client.once(Events.ClientReady, async () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
  console.log(`🆔 ID do bot: ${client.user.id}`);
  console.log(`🏠 Guild alvo configurada: ${GUILD_ID}`);

  const guild = client.guilds.cache.get(GUILD_ID);
  if (guild) {
    console.log(`✅ Bot detectou a guild: ${guild.name} (${guild.id})`);
  } else {
    console.log("⚠️ Bot online, mas não encontrou a guild configurada no cache.");
  }
});

// =======================
// INICIAR
// =======================
(async () => {
  try {
    console.log("🔐 Tentando login no Discord Gateway...");
    console.log("🧪 Intents ativas:", client.options.intents);

    const loginPromise = client.login(TOKEN);

    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      console.log(`⏳ Aguardando login do Discord... ${tick * 5}s`);
    }, 5000);

    const timeout = setTimeout(() => {
      console.error("❌ Login no Discord travou por 30s. Encerrando processo...");
      clearInterval(interval);
      process.exit(1);
    }, 30000);

    loginPromise
      .then((result) => {
        clearTimeout(timeout);
        clearInterval(interval);
        console.log("✅ client.login resolveu com sucesso.");
        console.log("✅ Login no Discord enviado.");
        return result;
      })
      .catch((err) => {
        clearTimeout(timeout);
        clearInterval(interval);
        console.error("❌ Erro no login do Discord:", err);
        process.exit(1);
      });
  } catch (err) {
    console.error("❌ Erro ao iniciar o bot:", err);
    process.exit(1);
  }
})();