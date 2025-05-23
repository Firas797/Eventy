module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(err => {
      console.error('Async error caught:', {
        error: err,
        route: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      });
      next(err);
    });
  };
};