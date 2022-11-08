module.exports = class HttpError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }
};
