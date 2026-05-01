import { setError, setLoading, setUser } from "../states/auth.slice"
import { register, login, getMe, socialLogin } from "../service/auth.api"
import { useDispatch } from "react-redux"



export const useAuth = () => {

    const dispatch = useDispatch()

    async function handleRegister({ email, contact, password, fullname }) {
        const data = await register({ email, password, fullname })

        dispatch(setUser(data.user))

        return data.user
    }

    async function handleLogin({ email, password }) {

        const data = await login({ email, password })
        dispatch(setUser(data.user))
        return data.user
    }
    
    async function handleSocialLogin({ email, username, avatar, googleId }) {
        const data = await socialLogin({ email, username, avatar, googleId })
        dispatch(setUser(data.user))
        return data.user
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            const data = await getMe()
            dispatch(setUser(data.user))
        } catch (err) {
            console.log(err)
        } finally {
            dispatch(setLoading(false))
        }
    }

    return { handleRegister, handleLogin, handleSocialLogin, handleGetMe }

}