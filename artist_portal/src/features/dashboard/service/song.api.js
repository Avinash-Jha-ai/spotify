import axios from "axios";

const songApiInstance = axios.create({
    baseURL: "/api/song",
    withCredentials: true,
})

export const uploadSong = async (formData) => {
    const response = await songApiInstance.post("/upload", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
}

export const deleteSong = async (songId) => {
    const response = await songApiInstance.get(`/delete/${songId}`);
    return response.data;
}

export const getMySongs = async () => {
    const response = await songApiInstance.get("/my-songs");
    return response.data;
}
