# Quiz API

## Project Description
This is a simple API that can be used to track a user's quiz scores. The structure of this project is based on what I learned in the following course: https://codewithmosh.com/p/the-complete-node-js-course

The basic technology stack is:
* Sequelize + PostgreSQL/SQLite (database)
* Express (web server)
* Jest (testing framework)
* Node.js (run-time environment)

## Project Setup
1. Install Node.js: https://nodejs.org/
2. Download project files
3. ``` $ cd quiz-api ``` # navigate to project's root directory
4. ``` $ npm i ``` # install the packages listed in package.json
5. From the command line, set the value of the jwt_private_key environment variable (this private key is used to create the JSON Web tokens that allow users to securely log in to the application.)
    * Example (Mac): ``` $ export quiz_api_jwt_private_key=your_private_key ```
6. ``` $ node sequelize.js ``` # Create development database
7. ``` $ node seed_db ``` # seed the database with quizzes
8. ``` $ NODE_ENV=test node sequelize.js ``` # Create test database
9. ``` $ npm test ``` # Run tests
10. ``` $ npm start ``` # start server
11. Done. You can now use a command line tool like ``` $ curl ```, or an application like Postman to test the API endpoints.

Additional resources that helped me:
* Sequelize Setup:
  * http://docs.sequelizejs.com
  * https://www.codementor.io/mirko0/how-to-use-sequelize-with-node-and-express-i24l67cuz
  * https://arjunphp.com/restful-api-using-async-await-node-express-sequelize/
  * https://www.youtube.com/watch?v=6NKNfXtKk0c
  * https://stackoverflow.com/questions/23929098/is-multiple-delete-available-in-sequelize
* Sequelize Transactions:
  * https://stackoverflow.com/questions/31095674/create-sequelize-transaction-inside-express-router
  * http://docs.sequelizejs.com/manual/tutorial/transactions.html
  * https://stackoverflow.com/questions/45690000/sequelize-transaction-error?rq=1
* Sequelize Deployement to Heroku:
  * http://docs.sequelizejs.com/manual/installation/usage.html
  * https://sequelize.readthedocs.io/en/1.7.0/articles/heroku/
* Jest Options:
  * https://stackoverflow.com/questions/50171932/run-jest-test-suites-in-groups
* Node Environment Variables:
  * https://stackoverflow.com/questions/9198310/how-to-set-node-env-to-production-development-in-os-x

## App Structure
<p align="center">
  <img alt="Image of App Structure" src="https://raw.github.com/jtimwill/quiz_api/master/images/Quiz-API-diagram.png" />
</p>

## Entity Relationship Diagram
<p align="center">
  <img alt="Image of ERD" src="https://raw.github.com/jtimwill/quiz_api/master/images/quiz-api-erd.png" />
</p>

## Routes and Resources
### Users Resource
|URL|HTTP verb|Result|Admin only?|
|---|---|---|---|
/api/users|POST|create a new user|No|
/api/users|GET|return all users|Yes|
/api/users/me|GET|return current user|No|
/api/users/me|PUT|update current user|No|
/api/users/:id|DELETE|delete a user|Yes|

### Login Resource
|URL|HTTP verb|Result|Admin only?|
|---|---|---|---|
/api/login|POST|return a new JSON web token that can be used to identify the current user|No|

### Category Resource
|URL|HTTP verb|Result|Admin only?|
|---|---|---|---|
/api/categories|POST|create a new category|Yes|
/api/categories|GET|return all categories|No|
/api/categories/:id|PUT|update a specific category|Yes|
/api/categories/:id|DELETE|delete a specific category|Yes|

### Quiz Resource
|URL|HTTP verb|Result|Admin only?|
|---|---|---|---|
/api/quizzes|POST|create a new quiz|Yes|
/api/quizzes|GET|return all quizzes|No|
/api/quizzes/:id|GET|return a specific quiz|Yes|
/api/quizzes/:id|PUT|update a specific quiz|Yes|
/api/quizzes/:id|DELETE|delete a specific quiz|Yes|

### Questions Resource
|URL|HTTP verb|Result|Admin only?|
|---|---|---|---|
/api/questions|POST|create a new question|Yes|
/api/questions|GET|return all questions|Yes|
/api/questions/:id|GET|return a specific question|Yes|
/api/questions/:id|PUT|update a specific question|Yes|
/api/questions/:id|DELETE|delete a specific question|Yes|

### UserQuizzes Resource
|URL|HTTP verb|Result|Admin only?|
|---|---|---|---|
/api/user-quizzes|POST|Create a new user-quiz and associated user-answers|No|
/api/user-quizzes|GET|return all user-quizzes for current user|No|
/api/user-quizzes/:id|GET|return a specific user-quiz for current user|No|
/api/user-quizzes/:id|PUT|update a specific user-quiz for current user|Yes|
/api/user-quizzes/:id|DELETE|delete a specific user-quiz for current user|Yes|

### UserAnswers Resource
|URL|HTTP verb|Result|Admin only?|
|---|---|---|---|
/api/user-quizzes/:userQuizId/user-answers/:id|PUT|update a specific user-answer|Yes|
/api/user-quizzes/:userQuizId/user-answers/:id|DELETE|delete a specific user-answer|Yes|
