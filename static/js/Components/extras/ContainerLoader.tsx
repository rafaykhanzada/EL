import { CircularProgress } from "@mui/material";
import React from "react";

const ContainerLoader = ({ text = 'Loading...', isLoading = false }) => {
  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-300 opacity-80 flex justify-center items-center z-40 rounded-xl">
          <div className="text-center">
            <CircularProgress color="primary" size={64} thickness={4} />
            {text && <p className="text-black mt-2 font-semibold">{text}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default ContainerLoader;