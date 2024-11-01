app.post('/send', async (req, res) => {
    console.log('Received data:', req.body); // Логируем входящие данные
    const { bot_token, telegram_ids, text, caption, photo_url, message_type } = req.body;

    // Проверка обязательных параметров
    if (!bot_token || !telegram_ids || !Array.isArray(telegram_ids)) {
        return res.status(400).json({ error: 'Бот токен и список telegram_ids обязательны.' });
    }

    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    try {
        for (const id of telegram_ids) {
            try {
                let response;
                console.log(`Sending message to user ${id}`); // Логируем попытку отправки сообщения
                if (message_type === 'text' && text) {
                    response = await axios.post(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
                        chat_id: id,
                        text: text,
                    });
                } else if (message_type === 'photo' && photo_url) {
                    response = await axios.post(`https://api.telegram.org/bot${bot_token}/sendPhoto`, {
                        chat_id: id,
                        photo: photo_url,
                        caption: caption || undefined,
                    });
                }

                if (response && response.data.ok) {
                    successCount++;
                } else {
                    console.error(`Ошибка при отправке сообщения пользователю ${id}: ${response.data.description || 'Неизвестная ошибка'}`);
                    errors.push({ id, error: response.data.description || 'Неизвестная ошибка' });
                    failureCount++;
                }
            } catch (error) {
                console.error(`Ошибка при отправлении сообщения пользователю ${id}:`, error.message);
                errors.push({ id, error: error.message });
                failureCount++;
            }
        }

        const totalCount = telegram_ids.length;
        res.json({
            users: totalCount,
            success: successCount,
            errors: failureCount,
            errorDetails: errors,
        });
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error.message);
        res.status(500).json({ error: 'Не удалось отправить сообщение.' });
    }
});
