import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

const songApiInstance = axios.create({
    baseURL: "/api/song",
    withCredentials: true,
})

export const getHomeSongs = async () => {
    const response = await songApiInstance.get("/");
    return response.data;
}

export const getSongById = async (id) => {
    const response = await songApiInstance.get(`/${id}`);
    return response.data;
}

export const likeSong = async (songId) => {
    const response = await api.post(`/like/${songId}`);
    return response.data;
}

export const getSongsByArtist = async (artistName) => {
    const response = await songApiInstance.get(`/artist/${artistName}`);
    return response.data;
}

export const getLikedSongs = async () => {
    const response = await api.get("/liked/songs");
    return response.data;
}
export const searchSongs = async (query) => {
    const response = await songApiInstance.get(`/search?query=${query}`);
    return response.data;
}
