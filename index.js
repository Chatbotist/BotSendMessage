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
    const { bot_token, telegram_ids, text, caption, photo_url } = req.body;

    // Проверяем обязательные параметры
    if (!bot_token || !telegram_ids) {
        return res.status(400).json({ error: 'Бот токен и список telegram_ids обязательны.' });
    }

    try {
        for (const id of telegram_ids) {
            if (text) {
                // Отправить текстовое сообщение
                await axios.post(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
                    chat_id: id,
                    text: text,
                });
            } else if (photo_url) {
                if (caption) {
                    // Отправить фото с подписью
                    await axios.post(`https://api.telegram.org/bot${bot_token}/sendPhoto`, {
                        chat_id: id,
                        photo: photo_url,
                        caption: caption,
                    });
                } else {
                    // Отправить только фото
                    await axios.post(`https://api.telegram.org/bot${bot_token}/sendPhoto`, {
                        chat_id: id,
                        photo: photo_url,
                    });
                }
            } else {
                return res.status(400).json({ error: 'Необходимо указать text, caption или photo_url.' });
            }
        }
        
        res.json({ status: 'success', message: 'Сообщения отправлены!' });
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        res.status(500).json({ error: 'Не удалось отправить сообщение.' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
