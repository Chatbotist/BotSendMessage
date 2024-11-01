const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint для отправки сообщений
app.post('/send', async (req, res) => {
    const { bot_token, text, caption, photo_url } = req.body;

    // Проверяем допустимые сочетания параметров
    if (!bot_token) {
        return res.status(400).json({ error: 'Бот токен обязателен.' });
    }

    try {
        if (text) {
            // Отправить текст
            await axios.post(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
                chat_id: '@your_channel_or_chat_id', // замените на фактический ID чата
                text: text,
            });
        } else if (photo_url) {
            if (caption) {
                // Отправить фото с подписью
                await axios.post(`https://api.telegram.org/bot${bot_token}/sendPhoto`, {
                    chat_id: '@your_channel_or_chat_id', // замените на фактический ID чата
                    photo: photo_url,
                    caption: caption,
                });
            } else {
                // Отправить только фото
                await axios.post(`https://api.telegram.org/bot${bot_token}/sendPhoto`, {
                    chat_id: '@your_channel_or_chat_id', // замените на фактический ID чата
                    photo: photo_url,
                });
            }
        } else {
            return res.status(400).json({ error: 'Одно из полей text, caption или photo_url должно быть указано.' });
        }

        res.json({ status: 'success', message: 'Сообщение отправлено!' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Не удалось отправить сообщение.' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
