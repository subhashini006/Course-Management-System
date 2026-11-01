import apiClient from "./apiClient";

// Every HTTP call about accounts lives here, so the form components only
// deal with state and layout.

// Task 9 — POST /auth/register
export async function registerStudent(studentData) {
    const response = await apiClient.post("/auth/register", studentData);
    return response.data;
}

// Task 9 + 10 — POST /auth/login  ->  { message, token, tokenType, expiresIn, student }
export async function loginStudent(credentials) {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
}

// POST /auth/admin-login  ->  { message, token, tokenType, expiresIn, role }
export async function loginAdmin(credentials) {
    const response = await apiClient.post("/auth/admin-login", credentials);
    return response.data;
}

// GET /auth/me  ->  { data: { role, student } }   (needs the token)
export async function fetchCurrentUser() {
    const response = await apiClient.get("/auth/me");
    return response.data.data;
}

export async function forgotPassword(email) {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
}

export async function resetPassword(token, password) {
    const response = await apiClient.post("/auth/reset-password", { token, password });
    return response.data;
}
