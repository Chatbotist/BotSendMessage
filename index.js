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
    if (!bot_token || !telegram_ids || !Array.isArray(telegram_ids)) {
        return res.status(400).json({ error: 'Бот токен и список telegram_ids обязательны.' });
    }

    let successCount = 0;
    let failureCount = 0;

    try {
        for (const id of telegram_ids) {
            try {
                if (text) {
                    // Отправить текстовое сообщение
                    await axios.post(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
                        chat_id: id,
                        text: text,
                    });
                    successCount++;
                } else if (photo_url) {
                    if (caption) {
                        // Отправить фото с подписью
                        await axios.post(`https://api.telegram.org/bot${bot_token}/sendPhoto`, {
                            chat_id: id,
                            photo: photo_url,
                            caption: caption,
                        });
                        successCount++;
                    } else {
                        // Отправить только фото
                        await axios.post(`https://api.telegram.org/bot${bot_token}/sendPhoto`, {
                            chat_id: id,
                            photo: photo_url,
                        });
                        successCount++;
                    }
                }
            } catch (error) {
                console.error(`Ошибка при отправке сообщения пользователю ${id}:`, error);
                failureCount++;
            }
        }

        const totalCount = telegram_ids.length;
        res.json({ 
            status: 'success', 
            message: `${successCount} отправлено, ${failureCount} не отправлено, всего ${totalCount} попыток.` 
        });
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).json({ error: 'Не удалось отправить сообщение.' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
