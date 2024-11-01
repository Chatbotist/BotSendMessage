const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/send', async (req, res) => {
    const { telegram_ids, text, caption, photo, bot_token } = req.body;

    if (!Array.isArray(telegram_ids) || telegram_ids.length === 0) {
        return res.status(400).json({ error: 'telegram_ids must be a non-empty array' });
    }

    const results = [];
    const messagesPerRequest = 30; // Telegram API limits
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < telegram_ids.length; i += messagesPerRequest) {
        const batchIds = telegram_ids.slice(i, i + messagesPerRequest);
        
        await Promise.all(batchIds.map(async (telegram_id) => {
            let response;
            try {
                if (photo) {
                    if (text) {
                        response = await sendPhoto(bot_token, telegram_id, photo, caption);
                    } else {
                        response = await sendPhoto(bot_token, telegram_id, photo);
                    }
                } else {
                    response = await sendMessage(bot_token, telegram_id, text);
                }

                if (response.ok) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                console.error(`Error sending message to ${telegram_id}:`, error);
                errorCount++;
            }
            results.push(response);
        }));

        // Introduce a delay to avoid hitting the rate limits
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }

    res.status(200).json({
        total: telegram_ids.length,
        successCount,
        errorCount,
        results,
    });
});

async function sendMessage(bot_token, telegram_id, text) {
    const url = `https://api.telegram.org/bot${bot_token}/sendMessage`;
    return await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ chat_id: telegram_id, text }),
        headers: { 'Content-Type': 'application/json' },
    });
}

async function sendPhoto(bot_token, telegram_id, photo, caption = null) {
    const url = `https://api.telegram.org/bot${bot_token}/sendPhoto`;
    const body = {
        chat_id: telegram_id,
        photo,
    };
    if (caption) {
        body.caption = caption;
    }
    return await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
