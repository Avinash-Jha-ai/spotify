import axios from "axios";

const authApiInstance = axios.create({
    baseURL: "/api/auth",
    withCredentials: true,
})

export async function artistRegister({ email, password, username, avatar }) {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("username", username);
    if (avatar) formData.append("avatar", avatar);
    
    const response = await authApiInstance.post("/register/artist", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
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
