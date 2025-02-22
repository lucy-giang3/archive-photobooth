import React from "react";
import "./App.css";
import Camera from "./components/Camera.tsx";

const App: React.FC = () => {
  return (
    <div className="bg-[#1d1d1d] flex flex-col justify-between items-center min-h-screen">
      {/* Logo */}
      <div className="mt-6 pb-4">
        <img
          src="./assets/sitelogo.png"
          alt="Site Logo"
          className="h-[10%] sm:h-[15%] md:h-[20%] lg:h-[25%] max-w-[90%] w-auto"
        />
      </div>

      {/* Camera Component */}
      <div className="flex-grow flex flex-col justify-center items-center w-full mt-4 mb-4">
        <Camera />
      </div>

      {/* Author Text */}
      <div className="mt-4 mb-6 text-sm text-gray-400">github/lucy-giang3</div>
    </div>
  );
};

export default App;
