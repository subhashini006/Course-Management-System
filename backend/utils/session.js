const fs = require("fs");
const crypto = require("crypto");
const config = require("../config");
const { safeEqual } = require("./helpers");

let secret = null;

function getSecret() {
    if (secret) return secret;
    if (config.SESSION_SECRET) {
        secret = config.SESSION_SECRET;
        return secret;
    }
    try {
        secret = fs.readFileSync(config.SECRET_PATH, "utf-8").trim();
    } catch (e) {
        secret = "";
    }
    if (!secret) {
        secret = crypto.randomBytes(32).toString("hex");
        fs.mkdirSync(config.DATA_DIR, { recursive: true });
        fs.writeFileSync(config.SECRET_PATH, secret);
    }
    return secret;
}

// A session is a signed token kept in an HttpOnly cookie, so the browser's
// JavaScript (and therefore localStorage) never touches it.
function sign(payload) {
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const sig = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
    return `${body}.${sig}`;
}

function verify(token) {
    if (!token) return null;
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const expected = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
    if (!safeEqual(sig, expected)) return null;
    try {
        const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
        return payload.exp > Date.now() ? payload : null;
    } catch (e) {
        return null;
    }
}

function parseCookies(header) {
    const out = {};
    String(header || "")
        .split(";")
        .forEach((part) => {
            const i = part.indexOf("=");
            if (i < 0) return;
            out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
        });
    return out;
}

function readSession(req) {
    return verify(parseCookies(req.headers.cookie)[config.COOKIE_NAME]);
}

function setSessionCookie(res, payload) {
    const token = sign({ ...payload, exp: Date.now() + config.SESSION_MS });
    res.setHeader(
        "Set-Cookie",
        `${config.COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${config.SESSION_MS / 1000}`
    );
}

function clearSessionCookie(res) {
    res.setHeader("Set-Cookie", `${config.COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

module.exports = { readSession, setSessionCookie, clearSessionCookie };
