// 1. Importaciones base de React — siempre van primero
import React from 'react';
import ReactDOM from 'react-dom/client';
// 2. BrowserRouter: habilita la navegación por rutas en toda la app
//    Sin esto, useNavigate, Link, Route, etc. no funcionan
import { BrowserRouter as Router } from 'react-router-dom';
// 3. Provider: es el "contenedor" de Redux
//    Hace que el store sea accesible desde CUALQUIER componente
//    Sin esto, useSelector y useDispatch no encuentran el store y explotan
import { Provider } from 'react-redux';
// 4. El store de Redux — aquí vive el estado global (el usuario logueado, etc.)
import { store } from './store/store';
// 5. El componente raíz — contiene todas las rutas y layouts
import App from './App';
// 6. Estilos globales
import './index.css';

// 7. ReactDOM.createRoot — punto de entrada de React
//    Busca el <div id="root"> en index.html y monta la app ahí
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    // 8. StrictMode: modo desarrollo que detecta errores y malas prácticas
    //    Solo activo en desarrollo, en producción no hace nada
    <React.StrictMode>
        {/* 9. Provider envuelve TODO — así Redux llega a cada componente
               store={store} le dice qué store usar (solo hay uno en la app) */}
        <Provider store={store}>

            {/* 10. Router envuelve App para que react-router funcione en toda la app
                    Si pones Router DENTRO de App en vez de aquí, puede fallar */}
            <Router>
                <App />
            </Router>

        </Provider>

    </React.StrictMode>
);