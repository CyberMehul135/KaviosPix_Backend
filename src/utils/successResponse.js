const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
};

module.exports = successResponse;
