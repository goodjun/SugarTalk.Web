const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api", {
      target: "https://testtalk.yamimeal.io",
      pathRewrite: {
        "^/api": "",
      },
      changeOrigin: true,
      secure: false,
      ws: true,
    })
  );
};
