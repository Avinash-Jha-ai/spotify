import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { routes } from './app.route.jsx';
import { useAuth } from '../features/auth/hooks/useAuth';

const App = () => {
  const { handleGetMe } = useAuth();

  useEffect(() => {
    handleGetMe();
  }, []);

  return (
    <>
      <RouterProvider router={routes} />
    </>
  )
}

export default App;
