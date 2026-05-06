const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const API_URL = 'https://api.kinaracloud.online/v1/start';
const TOKEN = process.env.TOKEN;

function formatPhone(phone) {
    phone = phone.trim();
    if (phone.startsWith('0')) {
        return '254' + phone.substring(1);
    }
    return phone;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

app.post('/send', async (req, res) => {
    const { numbers, amount, description } = req.body;

    if (!numbers || !amount) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    const phoneList = numbers.split(',');
    let results = [];

    for (const num of phoneList) {
        const phone = formatPhone(num);

        try {
            const response = await axios.post(API_URL, {
                phone,
                amount,
                description,
                webhook_url: 'https://yourdomain.com/callback'
            }, {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            results.push({ phone, status: 'success', data: response.data });
        } catch (error) {
            results.push({
                phone,
                status: 'failed',
                error: error.response ? error.response.data : error.message
            });
        }

        await delay(1500);
    }

    res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
