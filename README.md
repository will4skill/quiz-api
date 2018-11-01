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
7. ``` $ NODE_ENV=test node sequelize.js ``` # Create test database
8. ``` $ npm test ``` # Run tests
9. ``` $ npm start ``` # start server
10. ``` $ node seed_db ``` # seed the database with quizzes
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


## Entity Relationship Diagram
<p align="center">
  <img alt="Image of ERD" src="https://raw.github.com/jtimwill/quiz_api/master/images/quiz-api-erd.png" />
</p>
