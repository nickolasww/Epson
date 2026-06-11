import axios from "axios";
import { axiosConfig, requestInterceptor, responseInterceptor } from "./config";

export const api = axios.create(axiosConfig);

// Add interceptors
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor.onFulfilled, responseInterceptor.onRejected);
