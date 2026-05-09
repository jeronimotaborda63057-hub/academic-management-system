import { lazy, Suspense, useEffect, useState } from 'react'
import './App.css'
import { Loader } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import CardPrueba from './components/CardPrueba'
import routes from './routes';
import SignIn from './pages/Authentication/SignIn'


const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));


function App() {

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerClassName="overflow-auto"
      />
      <Routes>
        <Route path="/auth/signin" element={<SignIn />} />
        //Route signup
        
        //ProtectedRoute es para verificar que se ingrese a la plataforma cuando esté con una sesión
        {/* <Route element={<ProtectedRoute />}> */}
          <Route path="/" element={<DefaultLayout />}>
            <Route index element={<CardPrueba />} />
            {routes.map((route, index) => {
              const { path, component: Component } = route;
              return (
                <Route
                  key={index}
                  path={path}
                  element={
                    <Suspense fallback={<Loader />}>
                      <Component />
                    </Suspense>
                  }
                />
              );
            })}
          </Route>
        {/* </Route> */}
      </Routes>
    </>
  );
}

export default App