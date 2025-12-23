/**
 * MeshCentral Render.com Starter
 * Diskマウント対応 + リバースプロキシ対応
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 環境変数
const PORT = process.env.PORT || 10000;
const DOMAIN = process.env.RENDER_EXTERNAL_HOSTNAME || 'meshcentral-uz6d.onrender.com';
const SESSION_KEY = process.env.SESSION_KEY || 'net8meshcentral2024prod' + Date.now();

console.log('='.repeat(50));
console.log('[MeshCentral Starter] Initializing...');
console.log(`[MeshCentral Starter] PORT: ${PORT}`);
console.log(`[MeshCentral Starter] DOMAIN: ${DOMAIN}`);
console.log('='.repeat(50));

// パス設定
const dataDir = path.join(__dirname, 'meshcentral-data');
const configPath = path.join(dataDir, 'config.json');
const templatePath = path.join(__dirname, 'config.template.json');

// データディレクトリ作成
if (!fs.existsSync(dataDir)) {
    console.log('[MeshCentral Starter] Creating data directory...');
    fs.mkdirSync(dataDir, { recursive: true });
}

// 設定読み込みまたは作成
let config;

if (fs.existsSync(configPath)) {
    console.log('[MeshCentral Starter] Loading existing config...');
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
        console.log('[MeshCentral Starter] Config parse error, recreating...');
        config = null;
    }
}

if (!config) {
    console.log('[MeshCentral Starter] Creating new config from template...');
    try {
        config = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    } catch (e) {
        console.log('[MeshCentral Starter] Template not found, using defaults...');
        config = {
            settings: {},
            domains: { "": {} }
        };
    }
}

// 必須設定を強制適用（毎回）
config.settings = config.settings || {};
config.settings.port = parseInt(PORT);
config.settings.aliasPort = 443;
config.settings.redirPort = 0;
config.settings.agentPort = 0;  // メインポートと同じ
config.settings.agentAliasPort = 443;
config.settings.cert = DOMAIN;
config.settings.tlsOffload = true;
config.settings.trustedProxy = "0.0.0.0/0";
config.settings.WANonly = true;
config.settings.allowLoginToken = true;
config.settings.allowFraming = true;
config.settings.exactPorts = true;
config.settings.newAccounts = true;
config.settings.cookieIpCheck = false;
config.settings.cookieEncoding = "hex";
config.settings.webRTC = false;
config.settings.compression = false;    // 互換性向上のため無効
config.settings.wsCompression = false;  // 互換性向上のため無効
config.settings.AmtScanner = false;
config.settings.AmtManager = false;
config.settings.noUsers = false;
config.settings.allowHighQualityDesktop = true;
config.settings.agentPing = 60;
config.settings.agentPong = 60;
config.settings.browserPing = 60;
config.settings.browserPong = 60;
config.settings.agentIdleTimeout = 150;

// セッションキー（既存があれば維持、なければ新規）
if (!config.settings.sessionKey || config.settings.sessionKey.includes('PLACEHOLDER')) {
    config.settings.sessionKey = SESSION_KEY;
}

// ドメイン設定
config.domains = config.domains || {};
config.domains[""] = config.domains[""] || {};
config.domains[""].title = "NET8 Remote Management";
config.domains[""].title2 = "41 Windows PC Manager";
config.domains[""].newAccounts = true;
config.domains[""].minify = true;
config.domains[""].novnc = true;
config.domains[""].mstsc = true;
config.domains[""].ssh = true;

// API有効化
config.settings.allowLoginToken = true;
config.settings.allowHighQualityDesktop = true;
config.settings.maxInvalidLogin = { time: 10, count: 100 };
config.settings.userAllowedIP = "0.0.0.0/0";  // API接続を全IPから許可

// ドメイン別API設定
config.domains[""].userQuota = 1048576;
config.domains[""].meshQuota = 1048576;

// 設定保存
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('[MeshCentral Starter] Config saved.');
console.log('[MeshCentral Starter] Key settings:');
console.log(`  - port: ${config.settings.port}`);
console.log(`  - cert: ${config.settings.cert}`);
console.log(`  - tlsOffload: ${config.settings.tlsOffload}`);
console.log(`  - trustedProxy: ${config.settings.trustedProxy}`);
console.log(`  - WANonly: ${config.settings.WANonly}`);
console.log(`  - cookieIpCheck: ${config.settings.cookieIpCheck}`);

// MeshCentral起動
console.log('='.repeat(50));
console.log('[MeshCentral Starter] Starting MeshCentral...');
console.log('='.repeat(50));

const meshcentral = spawn('node', ['node_modules/meshcentral'], {
    stdio: 'inherit',
    cwd: __dirname,
    env: {
        ...process.env,
        NODE_ENV: 'production'
    }
});

meshcentral.on('error', (err) => {
    console.error('[MeshCentral Starter] Failed to start:', err);
    process.exit(1);
});

meshcentral.on('exit', (code) => {
    console.log(`[MeshCentral Starter] Exited with code: ${code}`);
    process.exit(code || 0);
});

// シグナルハンドリング
process.on('SIGTERM', () => {
    console.log('[MeshCentral Starter] SIGTERM received, shutting down...');
    meshcentral.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('[MeshCentral Starter] SIGINT received, shutting down...');
    meshcentral.kill('SIGINT');
});
