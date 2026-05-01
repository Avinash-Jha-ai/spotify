import { createBrowserRouter } from "react-router-dom";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Protected from "../features/auth/components/Protected";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: (
            <Protected>
                <Dashboard />
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
    },
]);
