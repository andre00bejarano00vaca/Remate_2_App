import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://testapp.digitaltelecom.net/api" // ⚠️ cambia a la IP de tu backend
});

export default apiClient;
