/**
 * Standardized success response
 */
const sendSuccess = (res, statusCode = 200, message = "Success", data = null, meta = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...meta,
  });
};

/**
 * Standardized error response
 */
const sendError = (res, statusCode = 500, message = "Something went wrong", errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = { sendSuccess, sendError };
