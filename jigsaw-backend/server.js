const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/quizDB', { useNewUrlParser: true, useUnifiedTopology: true });

const quizSchema = new mongoose.Schema({
  level: Number,
  question: String,
  options: [String],
  answer: String,
});

const resultSchema = new mongoose.Schema({
  user: String,
  timeTaken: Number, // Time in seconds
  date: { type: Date, default: Date.now },
});

const Quiz = mongoose.model('Quiz', quizSchema);
const Result = mongoose.model('Result', resultSchema);

// Fetch quiz question by level
app.get('/quiz/:level', async (req, res) => {
  try {
    const level = req.params.level;
    const question = await Quiz.findOne({ level });
    if (question) {
      res.json(question);
    } else {
      res.status(404).send('Question not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Save user's time taken
app.post('/save-time', async (req, res) => {
  try {
    const { user, timeTaken } = req.body;
    const result = new Result({ user, timeTaken });
    await result.save();
    res.status(200).send('Time saved successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
