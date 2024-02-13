const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/openai', async (req, res) => {
  const apiKey = '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';
  const { model, messages, max_tokens, temperature } = req.body;

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens,
      temperature,
    }),
  };

  try {
    const response = await fetch('https://api.openai.com/v1/engines/gpt-3.5-turbo/completions', requestOptions);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});