/**
 * MeshCentral Render.com Starter
 * 環境変数からポートを取得し、config.jsonを動的に更新して起動
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Render環境変数からポート取得
const PORT = process.env.PORT || 10000;
const RENDER_EXTERNAL_HOSTNAME = process.env.RENDER_EXTERNAL_HOSTNAME || 'meshcentral-uz6d.onrender.com';

console.log(`[MeshCentral Starter] PORT: ${PORT}`);
console.log(`[MeshCentral Starter] DOMAIN: ${RENDER_EXTERNAL_HOSTNAME}`);

// config.jsonのパス
const configPath = path.join(__dirname, 'meshcentral-data', 'config.json');

// デフォルト設定
const defaultConfig = {
    "$schema": "https://raw.githubusercontent.com/Ylianst/MeshCentral/master/meshcentral-config-schema.json",
    "settings": {
        "cert": RENDER_EXTERNAL_HOSTNAME,
        "port": parseInt(PORT),
        "aliasPort": 443,
        "redirPort": 0,
        "agentPort": parseInt(PORT),
        "agentAliasPort": 443,
        "tlsOffload": "0.0.0.0/0",
        "allowLoginToken": true,
        "allowFraming": true,
        "webRTC": true,
        "compression": true,
        "wsCompression": true,
        "agentCoreDump": false,
        "exactPorts": false,
        "newAccounts": true,
        "newAccountsUserGroups": [],
        "userNameIsEmail": false,
        "sessionKey": process.env.SESSION_KEY || "net8meshcentral2024secretkey32chars",
        "sessionSameSite": "none"
    },
    "domains": {
        "": {
            "title": "NET8 Remote Management",
            "title2": "41 Windows PC Manager",
            "newAccounts": true,
            "userNameIsEmail": false,
            "certUrl": `https://${RENDER_EXTERNAL_HOSTNAME}/`,
            "geoLocation": true,
            "novnc": true,
            "mstsc": true,
            "ssh": true,
            "agentInviteCodes": true,
            "deviceMeshRouterLinks": {
                "rdp": true,
                "ssh": true,
                "scp": true
            },
            "footer": "NET8 Remote Management System",
            "myServer": {
                "Backup": true,
                "Restore": true,
                "Upgrade": true,
                "ErrorLog": true,
                "Console": true,
                "Trace": true
            }
        }
    }
};

// 設定ファイル読み込みまたは作成
let config;
try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('[MeshCentral Starter] Existing config loaded');

    // 重要な設定を更新
    config.settings.port = parseInt(PORT);
    config.settings.cert = RENDER_EXTERNAL_HOSTNAME;
    config.settings.tlsOffload = "0.0.0.0/0";
    config.settings.sessionSameSite = "none";
    config.domains[""].certUrl = `https://${RENDER_EXTERNAL_HOSTNAME}/`;

} catch (e) {
    console.log('[MeshCentral Starter] Creating default config...');
    config = defaultConfig;
}

// 設定保存
fs.mkdirSync(path.dirname(configPath), { recursive: true });
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('[MeshCentral Starter] Config saved:', configPath);
console.log('[MeshCentral Starter] Settings:', JSON.stringify(config.settings, null, 2));

// MeshCentral起動
console.log('[MeshCentral Starter] Starting MeshCentral...');
const meshcentral = spawn('node', ['node_modules/meshcentral'], {
    stdio: 'inherit',
    cwd: __dirname
});

meshcentral.on('error', (err) => {
    console.error('[MeshCentral Starter] Error:', err);
    process.exit(1);
});

meshcentral.on('exit', (code) => {
    console.log(`[MeshCentral Starter] Exited with code: ${code}`);
    process.exit(code);
});
