// An error that carries an HTTP status code. Services throw it; the global
// error middleware turns it into a { success: false, message } response.
class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = HttpError;
