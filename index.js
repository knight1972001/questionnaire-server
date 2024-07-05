const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const stoppable = require("stoppable");

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

const dataFile = "data.json";
// Read data from file asynchronously
let data;

fs.readFile(dataFile, "utf8", (err, jsonData) => {
  try {
    data = JSON.parse(jsonData);
    if (err) {
      throw json({ error: err });
    }
  } catch (error) {
    throw json({ error: error });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

// Endpoint to get all questions without answers
app.get("/questions", (req, res) => {
  const questions = data.map((question) => {
    const { answer, ...questionWithoutAnswer } = question;
    return questionWithoutAnswer;
  });

  res.status(200).json(questions);
});

// Endpoint to submit answers and calculate points
// submit {id, [answers]}
app.post("/submit", (req, res) => {
  const answers = req.body;
  console.log("Checking answers");
  console.log(answers);
  if (!answers || !Array.isArray(answers)) {
    res.status(400).json({
      error: "Invalid submission format. Expected an array of answers.",
    });
    return;
  }

  const questions = data;
  let totalPoints = 0;

  answers.forEach((answer) => {
    const question = data.find((q) => q.id === answer.id);
    if (!question) return;

    const correctAnswer = question.answer;
    const submittedAnswer = answer.answer;

    if (Array.isArray(correctAnswer)) {
      // Compare arrays for checkbox type questions
      if (arraysEqual(correctAnswer.sort(), submittedAnswer.sort())) {
        totalPoints++;
      }
    } else if (typeof correctAnswer === "object") {
      // Compare objects for dropdown type questions
      const correctValues = Object.values(correctAnswer);
      const submittedValues = Object.values(submittedAnswer);
      if (arraysEqual(correctValues, submittedValues)) {
        totalPoints++;
      }
    } else {
      // Compare strings for text and radio button type questions
      if (correctAnswer.toLowerCase() === submittedAnswer.toLowerCase()) {
        totalPoints++;
      }
    }
  });

  res.json({ points: totalPoints });
});

// Endpoint to get a single question by id without answer
app.get("/questions/:id", (req, res) => {
  const questionId = parseInt(req.params.id);

  const question = data.find((q) => q.id === questionId);

  if (!question) {
    return res.status(404).json({ error: "Question not found" });
  }

  const { answer, ...questionWithoutAnswer } = question;
  res.json(questionWithoutAnswer);
});

app.use((req, res) => {
  res.sendStatus(404).json({ error: "Not Found" });
});

// Utility function to compare arrays
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

const PORT = 8000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// Export our server instance so other parts of our code can access it if necessary.
module.exports = server;
