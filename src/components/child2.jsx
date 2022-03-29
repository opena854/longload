import { Typography } from "@mui/material";
import { useEffect } from "react";

const ChildTwo = () => {
  console.log('rendering child two')
  
  
  useEffect( () => console.log("rendered child two"))

  
  return (
    <Typography>This is child two</Typography>
    
  );
}

export default ChildTwo