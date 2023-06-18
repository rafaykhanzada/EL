import { Backdrop, CircularProgress } from "@mui/material";
import React from "react";

const Loader = ({ text = 'Loading...', isLoading = false }) => {
  return (
    <Backdrop
      className="bg-gray-300 z-40"
      open={isLoading}
    >
      <div className="text-center">
        <CircularProgress color="primary" size={64} thickness={4} />
        {text && <p className="text-black mt-2">{text}</p>}
      </div>
    </Backdrop>
  );
};

export default Loader;
