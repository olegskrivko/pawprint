module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};

// const asyncWrapper = require('./asyncWrapper');

// // Example route using the error handling middleware
// app.get('/example', asyncWrapper(async (req, res, next) => {
//   // Your asynchronous code here
//   // If an error occurs, it will be caught and passed to the next middleware
// }));
