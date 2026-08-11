import "dotenv/config";

export default ({ config }) => ({
  ...config,

  extra: {
    ...config.extra,

    apiBaseUrl:
      process.env.API_BASE_URL || "https://testapp.digitaltelecom.net",

    wsBaseUrl:
      process.env.WS_BASE_URL || "wss://testapp.digitaltelecom.net",
  },
});