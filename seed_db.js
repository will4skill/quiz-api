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
    const category_2 = await Category.create({ name: "Muscles"});
    const category_3 = await Category.create({ name: "Math"});

    const quiz_1 = await Quiz.create({
      title: "Music Quiz",
      description: "Test your ability to read sheet music",
      difficulty: 5,
      category_id: category_1.id
    });
    const quiz_2 = await Quiz.create({
      title: "Muscle Quiz",
      description: "Test your muscle anatomy knowledge",
      difficulty: 7,
      category_id: category_2.id
    });
    const quiz_3 = await Quiz.create({
      title: "Math Quiz",
      description: "Test your basic arithmetic knowledge",
      difficulty: 1,
      category_id: category_3.id
    });

    let questions_1 = [];
    const notes = ["C", "D", "E", "F", "G", "A",
                   "B", "Cs", "Ds", "Fs", "Gs", "As"];
    for (note of notes) {
      questions_1.push({ quiz_id: quiz_1.id, question: note , answer: note });
    }
    await Question.bulkCreate(questions_1);

    let questions_2 = [];
    const muscles = ["front-neck", "deltoids", "biceps", "pectorals",
                     "obliques", "abdominals", "quadriceps", "hip adductors",
                     "tibialis anterior", "upper trapezius", "lower trapezius",
                     "posterior deltoids", "infraspinatus", "triceps",
                     "latissimus dorsi", "lower back", "glutes", "hamstrings",
                     "calves", "front-forearms", "back-forearms"];
    for (muscle of muscles) {
      questions_2.push({ quiz_id: quiz_2.id, question: muscle, answer: muscle });
    }
    await Question.bulkCreate(questions_2);

    let questions_3 = [
      { quiz_id: quiz_3.id, question: "1 + 1 = " , answer: "2" },
      { quiz_id: quiz_3.id, question: "2 + 2 = " , answer: "4" },
      { quiz_id: quiz_3.id, question: "3 + 3 = " , answer: "6" }
    ];
    await Question.bulkCreate(questions_3);

    console.log("Success!");
  } catch(err) {
    console.log("ERROR! Try Again!");
  }

  await sequelize.close();
})();
