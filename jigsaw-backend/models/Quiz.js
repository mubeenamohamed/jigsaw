const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [
        {
            text: { type: String, required: true },
            correct: { type: Boolean, required: true },
        },
    ],
});

module.exports = mongoose.model('Quiz', quizSchema);
