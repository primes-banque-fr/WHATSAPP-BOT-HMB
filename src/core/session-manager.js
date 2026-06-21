const fs = require('fs');
‎
‎class SessionManager {
‎    constructor(authPath) {
‎        this.authDir = authPath || './auth';
‎        if (!fs.existsSync(this.authDir)) {
‎            fs.mkdirSync(this.authDir, { recursive: true });
‎        }
‎    }
‎
‎    exists() {
‎        return fs.existsSync(this.authDir) && fs.readdirSync(this.authDir).length > 0;
‎    }
‎
‎    clear() {
‎        if (fs.existsSync(this.authDir)) {
‎            fs.rmSync(this.authDir, { recursive: true, force: true });
‎            fs.mkdirSync(this.authDir, { recursive: true });
‎        }
‎    }
‎}
‎
‎module.exports = SessionManager;
