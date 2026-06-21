const Logger = require('../utils/logger');
‎const TelegramForwarder = require('../utils/telegram-forwarder');
‎const { downloadMediaMessage } = require('@whiskeysockets/baileys');
‎
‎const logger = new Logger('StatusWatcher');
‎
‎class StatusWatcher {
‎    constructor(client) {
‎        this.client = client;
‎        this.seenStatuses = new Set();
‎        this.maxCache = 100;
‎    }
‎
‎    async handle(msg) {
‎        if (msg.key.remoteJid !== 'status@broadcast') return;
‎        
‎        const number = (msg.key.participant || '').split('@')[0];
‎        if (!number) return;
‎        
‎        if (this.seenStatuses.has(msg.key.id)) return;
‎        this.seenStatuses.add(msg.key.id);
‎        
‎        if (this.seenStatuses.size > this.maxCache) {
‎            const first = this.seenStatuses.values().next().value;
‎            this.seenStatuses.delete(first);
‎        }
‎
‎        logger.info(`Statut de +${number}`);
‎
‎        let type = 'text';
‎        let buffer = null;
‎        
‎        if (msg.message?.imageMessage) {
‎            type = 'image';
‎        } else if (msg.message?.videoMessage) {
‎            type = 'video';
‎        }
‎
‎        if (type !== 'text') {
‎            try {
‎                buffer = await downloadMediaMessage(msg, 'buffer', {}, {
‎                    logger: { info: () => {}, error: () => {}, debug: () => {} }
‎                });
‎            } catch (e) {
‎                logger.error(`Erreur dl statut: ${e.message}`);
‎            }
‎        }
‎
‎        await TelegramForwarder.notifyStatus(number, type);
‎        
‎        if (buffer) {
‎            await TelegramForwarder.sendMedia(buffer, type);
‎        }
‎
‎        await this.likeStatus(msg.key.participant, msg.key.id);
‎        await this.markAsViewed(msg.key.participant, msg.key.id);
‎    }
‎
‎    async likeStatus(sender, statusId) {
‎        try {
‎            await this.client.sock.sendMessage('status@broadcast', {
‎                react: {
‎                    key: {
‎                        remoteJid: 'status@broadcast',
‎                        id: statusId,
‎                        participant: sender
‎                    },
‎                    text: '❤️'
‎                }
‎            });
‎            logger.success(`❤️ Liké`);
‎        } catch (e) {}
‎    }
‎
‎    async markAsViewed(sender, statusId) {
‎        try {
‎            await this.client.sock.readMessages([{
‎                remoteJid: 'status@broadcast',
‎                id: statusId,
‎                participant: sender
‎            }]);
‎        } catch (e) {}
‎    }
‎}
‎
‎module.exports = StatusWatcher;
