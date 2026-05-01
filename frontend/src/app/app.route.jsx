import { createBrowserRouter } from "react-router";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Home from "../features/home/pages/Home";
import LikedSongs from "../features/home/pages/LikedSongs";
import Protected from "../features/auth/components/Protected";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: (
            <Protected>
                <Home />
            </Protected>
        ),
    },
    {
        path: "/liked",
        element: (
            <Protected>
                <LikedSongs />
            </Protected>
        ),
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />,
    }
])