import React, { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import Main from "./Containers/Main";
import PublicMainContainer from "./Containers/PublicMainContainer";
import 'react-toastify/dist/ReactToastify.css';
import { decryptString } from "./app.utils";

function App() {
  const isAuthenticated = decryptString(localStorage.getItem('isAuthenticated'));
  const isVerified = decryptString(localStorage.getItem('isVerified'));

  return (
    <div className='min-h-screen min-w-full overflow-hidden'>
      {isAuthenticated && isVerified == 'true' ? <Main /> : <PublicMainContainer />}
      <ToastContainer autoClose={10000} /> {/* AutoClose after 10 seconds*/}
    </div>
  );
}

export default App;