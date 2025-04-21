// src/utils/constants.js
export const API_URL = "http://localhost:8080/api";

export const USER_ROLES = {
  ADMIN: 1,
  MANAGER: 2,
  TENANT: 3,
};

export const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const DEFAULT_PAGINATION = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
};

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
};

export const DEBOUNCE_DELAY = 300;
