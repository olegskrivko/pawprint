class ExpressError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;

// class CustomError extends Error {
//   constructor(message, statusCode) {
//     super();
//     this.message = message;
//     this.statusCode = statusCode;
//   }
// }

// class AnotherError extends Error {
//   constructor(message, statusCode) {
//     super();
//     this.message = message;
//     this.statusCode = statusCode;
//   }
// }
