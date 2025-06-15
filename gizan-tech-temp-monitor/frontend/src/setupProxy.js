const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Only proxy API requests and WebSocket connections
  app.use(
    ['/api', '/socket.io'],
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      ws: true,
      logLevel: 'debug',
      pathRewrite: function(path, req) {
        // Only rewrite /api paths, leave /socket.io as is
        return path.startsWith('/api') ? path.replace('/api', '') : path;
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Proxy error', details: err.message });
        }
      },
    })
  );
};
