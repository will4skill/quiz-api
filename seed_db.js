const { User, UserQuiz, UserAnswer,
        Quiz, Category, Question, sequelize } = require('./sequelize');
const bcrypt = require('bcrypt');

(async () => {
  try {
    await sequelize.sync({force: true}); // Reset database

    const salt = await bcrypt.genSalt(10);
    const password_digest = await bcrypt.hash("123456", salt);

    await User.create({
      name: "Adam",
      email: "adam@example.com",
      password_digest
    });

    const category_1 = await Category.create({ name: "Music"});

    const quiz_1 = await Quiz.create({
      title: "Music Quiz",
      description: "Test your ability to read sheet music",
      difficulty: 5,
      category_id: category_1.id
    });

    let questions_1 = [];
    const notes = ["C", "D", "E", "F", "G", "A",
                   "B", "Cs", "Ds", "Fs", "Gs", "As"];
    for (note of notes) {
      questions_1.push({ quiz_id: quiz_1.id, question: note , answer: note });
    }

    await Question.bulkCreate(questions_1);

    console.log("Success!");
  } catch(err) {
    console.log("ERROR! Try Again!");
  }
})();
