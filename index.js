const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Убедитесь, что используется оператор || для определения порта

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint для отправки сообщений
app.post('/send', async (req, res) => {
    console.log('Received data:', req.body); // Логируйте входящие данные
    const { bot_token, telegram_ids, text, caption, photo_url } = req.body;

    // Проверяем обязательные параметры
    if (!bot_token || !telegram_ids || !Array.isArray(telegram_ids)) {
        return res.status(400).json({ error: 'Бот токен и список telegram_ids обязательны.' });
    }

    let successCount = 0;
    let failureCount = 0;
    const errors = []; // Для хранения ошибок

    try {
        for (const id of telegram_ids) {
            try {
                console.log(`Sending message to user ${id}`); // Логируем попытку отправки сообщения
                if (text) {
                    // Отправить текстовое сообщение
                    const response = await axios.post(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
                        chat_id: id,
                        text: text,
                    });
                    if (response.data.ok) {
                        successCount++;
                    } else {
                        console.error(`Ошибка при отправке сообщения пользователю ${id}: ${response.data.description}`);
                        failureCount++;
                        errors.push({ id, error: response.data.description });
                    }
                } else if (photo_url) {
                    // Отправить фото
                    const response = await axios.post(`https://api.telegram.org/bot${bot_token}/sendPhoto`, {
                        chat_id: id,
                        photo: photo_url,
                        caption: caption || undefined,
                    });
                    if (response.data.ok) {
                        successCount++;
                    } else {
                        console.error(`Ошибка при отправке фото пользователю ${id}: ${response.data.description}`);
                        failureCount++;
                        errors.push({ id, error: response.data.description });
                    }
                } else {
                    console.error(`Ошибка: Не задано ни текстовое сообщение, ни фото для пользователя ${id}`);
                    failureCount++;
                    errors.push({ id, error: 'Необходимо указать текст или фотографию.' });
                }
            } catch (error) {
                console.error(`Ошибка при отправке сообщения пользователю ${id}:`, error.message);
                failureCount++;
                errors.push({ id, error: error.message });
            }
        }

        const totalCount = telegram_ids.length; // Общее количество пользователей
        res.json({
            users: totalCount,
            success: successCount,
            errors: failureCount,
            errorDetails: errors, // Добавили информацию об ошибках в ответ
        });
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error.message);
        res.status(500).json({ error: 'Не удалось отправить сообщение.' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
