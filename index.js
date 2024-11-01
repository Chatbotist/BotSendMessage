const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint для отправки сообщений
app.post('/send', async (req, res) => {
    const { telegram_ids, text, bot_token } = req.body;

    if (!telegram_ids || !text || !bot_token) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        for (const id of telegram_ids) {
            await axios.post(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
                chat_id: id,
                text: text,
            });
        }
        res.json({ status: 'success', message: 'Messages sent!' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send messages' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
