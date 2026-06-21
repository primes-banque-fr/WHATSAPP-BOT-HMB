const axios = require('axios');
‎const FormData = require('form-data');
‎const Logger = require('./logger');
‎
‎const logger = new Logger('Telegram');
‎
‎class TelegramForwarder {
‎    constructor() {
‎        this.botToken = process.env.TELEGRAM_BOT_TOKEN;
‎        this.chatId = process.env.TELEGRAM_CHAT_ID;
‎        this.apiUrl = this.botToken ? `https://api.telegram.org/bot${this.botToken}` : null;
‎    }
‎
‎    isConfigured() {
‎        return this.botToken && this.chatId;
‎    }
‎
‎    async sendMessage(text) {
‎        if (!this.isConfigured()) return;
‎        
‎        try {
‎            await axios.post(`${this.apiUrl}/sendMessage`, {
‎                chat_id: this.chatId,
‎                text: text,
‎                parse_mode: 'HTML'
‎            });
‎        } catch (error) {
‎            logger.error(`Erreur envoi message: ${error.message}`);
‎        }
‎    }
‎
‎    async sendMedia(buffer, type, caption = '') {
‎        if (!this.isConfigured()) return;
‎        
‎        try {
‎            const form = new FormData();
‎            form.append('chat_id', this.chatId);
‎            
‎            const filename = {
‎                'photo': 'image.jpg',
‎                'video': 'video.mp4',
‎                'audio': 'audio.ogg',
‎                'voice': 'voice.ogg',
‎                'sticker': 'sticker.webp',
‎                'document': 'file'
‎            }[type] || 'file';
‎
‎            if (type === 'photo') {
‎                form.append('photo', buffer, { filename });
‎            } else if (type === 'video') {
‎                form.append('video', buffer, { filename });
‎            } else if (type === 'audio' || type === 'voice') {
‎                form.append('audio', buffer, { filename: 'audio.ogg' });
‎            } else if (type === 'sticker') {
‎                form.append('sticker', buffer, { filename });
‎            } else {
‎                form.append('document', buffer, { filename });
‎            }
‎            
‎            if (caption) {
‎                form.append('caption', caption.substring(0, 1024));
‎            }
‎
‎            const endpoint = {
‎                'photo': 'sendPhoto',
‎                'video': 'sendVideo',
‎                'audio': 'sendAudio',
‎                'voice': 'sendVoice',
‎                'sticker': 'sendSticker',
‎                'document': 'sendDocument'
‎            }[type] || 'sendDocument';
‎
‎            await axios.post(`${this.apiUrl}/${endpoint}`, form, {
‎                headers: form.getHeaders()
‎            });
‎        } catch (error) {
‎            logger.error(`Erreur envoi média: ${error.message}`);
‎        }
‎    }
‎
‎    async notifyMessage(number, content, type, isViewOnce = false) {
‎        const header = `📩 <b>Nouveau message reçu</b>\n<b>Numéro:</b> +${number}`;
‎        const viewOnceTag = isViewOnce ? '\n\n⚠️ <b>MESSAGE VUE UNIQUE INTERCEPTÉ</b>' : '';
‎        
‎        if (type === 'text') {
‎            await this.sendMessage(`${header}\n\n${content}${viewOnceTag}`);
‎        } else {
‎            const typeLabel = {
‎                'image': '📷 Image',
‎                'video': '🎥 Vidéo',
‎                'audio': '🎵 Audio',
‎                'voice': '🎙️ Message vocal',
‎                'sticker': '😀 Sticker',
‎                'document': '📎 Document'
‎            }[type] || '📎 Fichier';
‎            
‎            await this.sendMessage(`${header}\n<b>Type:</b> ${typeLabel}${viewOnceTag}`);
‎        }
‎    }
‎
‎    async notifyStatus(number, type) {
‎        const header = `📱 <b>Nouveau statut posté</b>\n<b>Numéro:</b> +${number}`;
‎        const typeLabel = {
‎            'image': '📷 Photo',
‎            'video': '🎥 Vidéo',
‎            'text': '📝 Texte'
‎        }[type] || '📎 Média';
‎        
‎        await this.sendMessage(`${header}\n<b>Type:</b> ${typeLabel}`);
‎    }
‎
‎    async notifyDeleted(number, content) {
‎        await this.sendMessage(
‎            `🗑 <b>Message supprimé détecté</b>\n` +
‎            `<b>Numéro:</b> +${number}\n\n` +
‎            `<i>Contenu avant suppression:</i>\n${content || '[Média]'}`
‎        );
‎    }
‎
‎    async notifyConnected() {
‎        await this.sendMessage('✅ <b>WhatsApp Connecté</b>\n\nProfil en ligne 24/7 activé.');
‎    }
‎
‎    async notifyDisconnected() {
‎        await this.sendMessage('⚠️ <b>WhatsApp Déconnecté</b>\n\nTentative de reconnexion...');
‎    }
‎
‎    async notifyQR() {
‎        await this.sendMessage('📱 <b>Nouveau QR Code</b>\n\nScan requis. Connectez-vous au dashboard.');
‎    }
‎}
‎
‎module.exports = new TelegramForwarder();
