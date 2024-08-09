const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { YoutubeTranscript } = require("youtube-transcript");
const TranscriptAPI = require("youtube-transcript-api");
require("dotenv").config(); // For loading environment variables from a .env file

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize the Google Generative AI with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY);

// Configure multer for handling form-data (including file uploads)
const upload = multer();

// Converts file information to a GoogleGenerativeAI.Part object
function fileToGenerativePart(file) {
  return {
    inlineData: {
      data: file.buffer.toString("base64"),
      mimeType: file.mimetype,
    },
  };
}

// POST endpoint to generate content
app.post("/generate-content", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    res.json({ generatedText: text });
  } catch (error) {
    console.error("Error generating content:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating content" });
  }
});

// POST endpoint to read a file (image or PDF)
app.post("/read-file", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    let prompt;
    const { type } = req.body;
    if (type == "que") {
      prompt = "Give me top 10 most important question from this file.";
    } else {
      prompt = "whats in this file, explain in 10 point.";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const filePart = fileToGenerativePart(file);
    const result = await model.generateContent([prompt, filePart]);

    const response = await result.response;
    const text = await response.text();

    res.json({ generatedText: text });
  } catch (error) {
    console.error("Error generating content:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating content" });
  }
});

app.post("/generate-transcript", async (req, res) => {
  try {
    const { videoUrl } = req.body;
    console.log(1);
    if (!videoUrl) {
      return res.status(400).json({ error: "Video URL is required" });
    }

    const transcript = await TranscriptAPI.getTranscript(videoUrl);

    // Extract and join the text from each object
    const transcriptText = transcript.map((entry) => entry.text).join(" ");

    const prompt =
      "You are a YouTube video summarizer. You will be taking the transcript text and summarizing the entire video and providing the details in 25 points. Please provide the detailed notes from the transcript: ";

    // Send the concatenated string in the response
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt + transcriptText);

    const response = await result.response;
    const text = await response.text();

    return res.json({ transcript: text });
  } catch (error) {
    console.error("Error fetching transcript:", error);
    return res.status(500).json({ error: error });
  }
});

app.post("/read-file", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    let prompt;
    const { type } = req.body;
    if (type == "que") {
      prompt = "Give me top 10 most important question from this file.";
    } else {
      prompt = "whats in this file, explain in 10 point.";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const filePart = fileToGenerativePart(file);
    const result = await model.generateContent([prompt, filePart]);

    const response = await result.response;
    const text = await response.text();

    res.json({ generatedText: text });
  } catch (error) {
    console.error("Error generating content:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating content" });
  }
});

app.post("/read-file-to-quiz", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    let prompt;
    const { type } = req.body;
    // if (type == "que") {
    //   prompt = "Give me top 10 most important question from this file.";
    // } else {
    //   prompt = "whats in this file, explain in 10 point.";
    // }
    prompt =
      "Give me top 10 most important question from this file with answers.";
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const filePart = fileToGenerativePart(file);
    const result = await model.generateContent([prompt, filePart]);

    const response = await result.response;
    const text = await response.text();

    res.json({ generatedText: text });
  } catch (error) {
    console.error("Error generating content:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating content" });
  }
});

app.post("/ask-question", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    res.json({ generatedText: text });
  } catch (error) {
    console.error("Error generating content:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating content" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
