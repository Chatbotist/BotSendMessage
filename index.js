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
    const { bot_token, telegram_ids, text, caption, photo_url, message_type } = req.body;

    // Проверка обязательных параметров
    if (!bot_token || !telegram_ids || !Array.isArray(telegram_ids)) {
        return res.status(400).json({ error: 'Бот токен и список telegram_ids обязательны.' });
    }

    let successCount = 0; // Счетчик успешно отправленных сообщений
    let failureCount = 0; // Счетчик неудачных попыток

    try {
        for (const id of telegram_ids) {
            try {
                let response;
                if (message_type === 'text' && text) {
                    // Отправка текстового сообщения
                    response = await axios.post(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
                        chat_id: id,
                        text: text,
                    });
                } else if (message_type === 'photo' && photo_url) {
                    // Отправка фото с подписью, если она есть
                    response = await axios.post(`https://api.telegram.org/bot${bot_token}/sendPhoto`, {
                        chat_id: id,
                        photo: photo_url,
                        caption: caption || undefined,
                    });
                }

                // Проверка статуса ответа
                if (response && response.data.ok) {
                    successCount++;
                } else {
                    console.error(`Ошибка при отправке сообщения пользователю ${id}: ${response.data.description || 'Неизвестная ошибка'}`);
                    failureCount++;
                }
            } catch (error) {
                // Обработка ошибок при отправке сообщения
                console.error(`Ошибка при отправке сообщения пользователю ${id}:`, error.message);
                failureCount++;
            }
        }

        const totalCount = telegram_ids.length; // Общее количество пользователей
        res.json({ 
            users: totalCount,
            success: successCount, 
            errors: failureCount,
        });
    } catch (error) {
        // Обработка ошибок при выполнении запроса
        console.error('Ошибка при обработке запроса:', error.message);
        res.status(500).json({ error: 'Не удалось отправить сообщение.' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
