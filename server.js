const express = require("express");

const cors = require("cors");

const bodyParser = require("body-parser");

const { Configuration, OpenAIApi } = require("openai");

const config = new Configuration({
  apiKey: "API-KEY",
});

const openai = new OpenAIApi(config);


// Setup server

const app = express();
app.use(bodyParser.json());
app.use(cors());

// endpoint for ChatGPT

app.post("/chat", async (req, res) => {
  console.log(req.body)
  const { prompt } = req.body;

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    max_tokens: 512,
    temperature: 0,
    prompt: prompt,
  });
  res.send(completion.data.choices[0].text);
});

app.post("/image", async (req, res) => {
  const { prompt } = req.body;

  const response = await openai.createImage({
    prompt: prompt,
    n: 1,
    size: "512x512",
    response_format:"b64_json",
  });
  res.send(response.data);
});

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

//run node server.js