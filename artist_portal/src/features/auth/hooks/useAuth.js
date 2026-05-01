import { setError, setLoading, setUser, logoutUser } from "../states/auth.slice"
import { artistRegister, login, getMe, logout } from "../service/auth.api"
import { useDispatch } from "react-redux"

export const useAuth = () => {
    const dispatch = useDispatch()

    async function handleArtistRegister({ email, password, username, avatar }) {
        try {
            dispatch(setLoading(true))
            const data = await artistRegister({ email, password, username, avatar })
            dispatch(setUser(data.user))
            return data.user
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || "Registration failed"))
            throw err
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true))
            const data = await login({ email, password })
            dispatch(setUser(data.user))
            return data.user
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || "Login failed"))
            throw err
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            const data = await getMe()
            dispatch(setUser(data.user))
        } catch (err) {
            console.log(err)
            dispatch(setUser(null))
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogout() {
        try {
            await logout()
            dispatch(logoutUser())
        } catch (err) {
            console.log(err)
        }
    }

    return { handleArtistRegister, handleLogin, handleGetMe, handleLogout }
}
