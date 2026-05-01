import axios from "axios";

const authApiInstance = axios.create({
    baseURL: "/api/auth",
    withCredentials: true,
})


export async function register({ email, password, fullname }) {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("username", fullname);
    formData.append("role", "user");
    // Optionally append avatar if provided in the future
    
    const response = await authApiInstance.post("/register", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
}

export async function socialLogin({ email, username, avatar, googleId }) {
    const response = await authApiInstance.post("/google", {
        email, username, avatar, googleId
    });
    return response.data;
}

export async function login({ email, password }) {
    const response = await authApiInstance.post("/login", {
        email, password
    })

    return response.data
}

export async function getMe() {
    const response = await authApiInstance.get("/me")

    return response.data
}

export async function logout() {
    const response = await authApiInstance.get("/logout")
    return response.data
}