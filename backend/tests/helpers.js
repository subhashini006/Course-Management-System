// Test helpers: start the REAL server (server.js) as a child process against a
// throw-away MongoDB database, and talk to it over HTTP / WebSocket.
const { spawn, spawnSync } = require("child_process");
const crypto = require("crypto");
const path = require("path");
const net = require("net");
const mongoose = require("mongoose");

const ROOT = path.join(__dirname, "..");
const MONGO_BASE = (process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017").replace(/\/+$/, "");
const JWT_SECRET = crypto.randomBytes(32).toString("hex");
const ADMIN = { email: "admin@test.local", password: "Admin#Strong2026!" };

const freePort = () =>
    new Promise((resolve, reject) => {
        const srv = net.createServer();
        srv.listen(0, "127.0.0.1", () => {
            const { port } = srv.address();
            srv.close(() => resolve(port));
        });
        srv.on("error", reject);
    });

function envFor(dbName, extra = {}) {
    return { ...process.env, MONGO_URI: `${MONGO_BASE}/${dbName}`, JWT_SECRET, JWT_EXPIRES_IN: "1h", CLIENT_URL: "http://localhost:5173", NODE_ENV: "test", ...extra };
}

// Seeds courses and creates the admin by running the project's own scripts
function prepareDatabase(dbName) {
    const env = envFor(dbName, { ADMIN_EMAIL: ADMIN.email, ADMIN_PASSWORD: ADMIN.password });
    for (const script of ["scripts/seed.js", "scripts/createAdmin.js"]) {
        const result = spawnSync(process.execPath, [script], { cwd: ROOT, env, encoding: "utf-8" });
        if (result.status !== 0) throw new Error(`${script} failed: ${result.stdout}${result.stderr}`);
    }
}

async function startServer(dbName, extraEnv = {}) {
    const port = await freePort();
    const child = spawn(process.execPath, ["server.js"], { cwd: ROOT, env: envFor(dbName, { PORT: String(port), ...extraEnv }), stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));

    const base = `http://127.0.0.1:${port}`;
    for (let i = 0; i < 100; i++) {
        try {
            const res = await fetch(`${base}/api/health`);
            if (res.ok) break;
        } catch {
            /* not up yet */
        }
        if (child.exitCode !== null) throw new Error(`Server exited early:\n${output}`);
        await new Promise((r) => setTimeout(r, 100));
    }
    return {
        base,
        api: `${base}/api/v1`,
        port,
        output: () => output,
        stop: () => new Promise((resolve) => { child.once("exit", resolve); child.kill("SIGTERM"); }),
    };
}

// Small fetch wrapper: returns { status, body }
async function request(url, { method = "GET", token, body, headers = {} } = {}) {
    const res = await fetch(url, {
        method,
        headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = text; }
    return { status: res.status, body: json, headers: res.headers };
}

async function dropDatabase(dbName) {
    const conn = await mongoose.createConnection(`${MONGO_BASE}/${dbName}`).asPromise();
    await conn.dropDatabase();
    await conn.close();
}

module.exports = { ADMIN, JWT_SECRET, MONGO_BASE, prepareDatabase, startServer, request, dropDatabase };
