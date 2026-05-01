import axios from "axios";

const api = axios.create({
    baseURL: "/api/playlist",
    withCredentials: true,
});

export const createPlaylist = async (data) => {
    const response = await api.post("/create", data);
    return response.data;
};

export const getUserPlaylists = async () => {
    const response = await api.get("/my-playlists");
    return response.data;
};

export const getPlaylistById = async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
};

export const addSongToPlaylist = async (playlistId, songId) => {
    const response = await api.post(`/${playlistId}/song/${songId}`);
    return response.data;
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
    const response = await api.delete(`/${playlistId}/song/${songId}`);
    return response.data;
};

export const deletePlaylist = async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
};
