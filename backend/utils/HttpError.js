// An error that carries an HTTP status code. Services throw it; the central
// error handler turns it into a { success: false, message } response.
class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.statusCode = status;
    }
}

module.exports = HttpError;
