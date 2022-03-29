import { Typography } from '@mui/material';
import { useCallback, useEffect } from 'react';
import ChildOne from './components/child1';
import { useAppStateQuery, useAppStateTransformer } from './state';

const App = () => {
  const saludo = useAppStateQuery("$.usuario@$u.modales@$m[$u.tratamiento = $m.tratamiento].($m.saludo & $u.nombre & ' ' & $u.apellido)")
  const transform = useAppStateTransformer()
  
  console.log("rendering app")

  const onClick = useCallback(() => {
    transform("usuario", "{ 'nombre': nombre = 'Omar' ? 'Alejandro' : 'Omar' }, 'apellido' ")
  }, [transform])

  useEffect( () => console.log("rendered app"), [transform, onClick])

  return (
    <div>
      <Typography variant='h1' onClick={onClick} >{saludo}</Typography>
      <ChildOne />
    </div>
    
  )
}

export default App
