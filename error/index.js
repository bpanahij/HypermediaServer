var getError = function (req, res, next) {
  res.json({
    error: 'Endpoint does not exist',
    message: 'Endpoint does not exist'
  });
};

module.exports = {
  get: getError,
  post: getError,
  put: getError,
  delete: getError,
  head: getError,
  options: getError
};