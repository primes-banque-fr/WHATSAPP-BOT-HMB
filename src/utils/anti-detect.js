class AntiDetect {
‎    constructor() {
‎        this.lastOnlineChange = Date.now();
‎        this.isSleeping = false;
‎        this.dailyMessageCount = 0;
‎        this.lastReset = new Date().toDateString();
‎    }
‎
‎    async humanDelay(min = 2000, max = 8000) {
‎        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
‎        return new Promise(r => setTimeout(r, delay));
‎    }
‎
‎    async simulateRealTyping(sock, jid, text) {
‎        const wpm = 30 + Math.random() * 40;
‎        const words = text.split(' ').length;
‎        const typingTime = (words / wpm) * 60 * 1000;
‎        
‎        await this.humanDelay(500, 3000);
‎        await sock.sendPresenceUpdate('composing', jid);
‎        
‎        const segments = Math.ceil(typingTime / 3000);
‎        for (let i = 0; i < segments; i++) {
‎            await this.humanDelay(2000, 4000);
‎        }
‎        
‎        await sock.sendPresenceUpdate('paused', jid);
‎        await this.humanDelay(300, 1000);
‎        
‎        const result = await sock.sendMessage(jid, { text });
‎        await sock.sendPresenceUpdate('available');
‎        
‎        return result;
‎    }
‎
‎    shouldSleep() {
‎        const hour = new Date().getHours();
‎        if (hour >= 2 && hour <= 6) {
‎            return Math.random() > 0.3;
‎        }
‎        return false;
‎    }
‎
‎    getRandomPresence() {
‎        const presences = ['available', 'unavailable'];
‎        const weights = [0.7, 0.3];
‎        const random = Math.random();
‎        let sum = 0;
‎        for (let i = 0; i < presences.length; i++) {
‎            sum += weights[i];
‎            if (random < sum) return presences[i];
‎        }
‎        return 'available';
‎    }
‎
‎    canPerformAction() {
‎        if (new Date().toDateString() !== this.lastReset) {
‎            this.dailyMessageCount = 0;
‎            this.lastReset = new Date().toDateString();
‎        }
‎        if (this.dailyMessageCount > 100) return false;
‎        this.dailyMessageCount++;
‎        return true;
‎    }
‎
‎    async beforeReply() {
‎        const hour = new Date().getHours();
‎        let min = 3000, max = 15000;
‎        if (hour < 8 || hour > 22) {
‎            min = 10000; max = 30000;
‎        }
‎        await this.humanDelay(min, max);
‎    }
‎
‎    async viewStatusWithDelay(index) {
‎        const delay = index * 5000 + Math.random() * 3000;
‎        await this.humanDelay(delay, delay + 5000);
‎    }
‎}
‎
‎module.exports = new AntiDetect();
