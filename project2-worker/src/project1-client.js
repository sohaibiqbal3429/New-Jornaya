import axios from 'axios';
import { config } from './config.js';

/** Axios instance for calling Project 1 (Next app) APIs with optional API key. */
export function createProject1Axios() {
  const instance = axios.create({
    baseURL: config.project1BaseUrl,
    timeout: 30_000,
  });
  if (config.project1ApiKey) {
    instance.defaults.headers.common['x-api-key'] = config.project1ApiKey;
  }
  return instance;
}
