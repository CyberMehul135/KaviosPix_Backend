const isProd = process.env.NODE_ENV === "production";

const config = {
  FRONTEND_URL: isProd
    ? process.env.FRONTEND_URL
    : process.env.LOCAL_FRONTEND_URL,

  BACKEND_URL: isProd ? process.env.BACKEND_URL : process.env.LOCAL_BACKEND_URL,
};

module.exports = config;
