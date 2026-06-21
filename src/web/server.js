const express = require('express');
‎const { createServer } = require('http');
‎const { Server } = require('socket.io');
‎const path = require('path');
‎
‎class WebServer {
‎    constructor() {
‎        this.app = express();
‎        this.http = createServer(this.app);
‎        this.io = new Server(this.http, { 
‎            cors: { origin: "*" },
‎            pingTimeout: 60000,
‎            pingInterval: 25000
‎        });
‎        
‎        this.setupRoutes();
‎    }
‎
‎    setupRoutes() {
‎        this.app.use(express.static('public'));
‎
‎        this.app.get('/', (req, res) => {
‎            res.sendFile(path.join(__dirname, '../../public', 'index.html'));
‎        });
‎
‎        this.app.get('/health', (req, res) => res.send('OK'));
‎    }
‎
‎    start() {
‎        return new Promise((resolve) => {
‎            const port = process.env.PORT || 3000;
‎            this.http.listen(port, () => {
‎                console.log(`🌐 Serveur web sur port ${port}`);
‎                resolve();
‎            });
‎        });
‎    }
‎
‎    stop() {
‎        return new Promise((resolve) => {
‎            this.http.close(() => resolve());
‎        });
‎    }
‎}
‎
‎module.exports = WebServer;
