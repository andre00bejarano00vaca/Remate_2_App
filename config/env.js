import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};

export const apiBaseUrl = extra.apiBaseUrl || "https://testapp.digitaltelecom.net";
export const wsBaseUrl = extra.wsBaseUrl || "wss://testapp.digitaltelecom.net";
