import { Typography } from "@mui/material";
import ChildTwo from "./child2";

const ChildOne = () => {
  console.log('rendering child one')
  return (
    <div>
      <Typography>This is child one</Typography>

      <ChildTwo />
    </div>
  );
}; 

export default ChildOne