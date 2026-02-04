import api from "./axios";

export const getAllProducts = () => {
  return api.get("/products");
};
