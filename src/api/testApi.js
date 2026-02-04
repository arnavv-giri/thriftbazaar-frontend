import api from "../utils/axios";

export const testBackend = async () => {
  const response = await api.get("/health");
  return response.data;
};
