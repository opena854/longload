import { StrictMode } from 'react';
import { render } from 'react-dom';
import App from './app';
import { AppState } from './state';

const rootElement = document.getElementById('root')

const initialState = {
  usuario: { tratamiento: "Sr", nombre: "Omar", apellido: "Peña" },
  modales: [
    { tratamiento: "Sr", saludo: "Saludos, Sr. ", despedida: "Hasta luego" },
    { tratamiento: "Sra", saludo: "Buenos días, Sra. ", despedida: "Tenga buen día" },
  ],
};

render((
  <StrictMode>
    <AppState initialState={initialState}>
      <App />
    </AppState>
  </StrictMode>
), rootElement);
