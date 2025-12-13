import { useEffect, useState } from "react";
import { auth } from "./firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

import Login from "./components/Login";
import Upload from "./components/Upload";
import Gallery from "./components/Gallery";

import SplashCursor from "./ReactBits/SplashCursor";


export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  // 🔒 Full-screen black background + Login
  if (!user) {
    return (
      <div className="relative w-full h-screen">
        {/* Background div */}
        <div className="absolute top-0 left-0 w-full h-full bg-black"></div>

        {/* Splash Cursor */}
        <SplashCursor />

        {/* Login form on top */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <Login />
        </div>
      </div>
    );
  }

  // ✅ Logged-in app with full-screen black background
  return (
    <div className="relative min-h-screen">
      {/* Background div */}
      <div className="absolute top-0 left-0 w-full h-full bg-black"></div>

      {/* Splash Cursor */}
      <SplashCursor />

      {/* Main app content */}
      <div className="relative z-10 min-h-screen bg-gray-100">
        <div className="flex justify-between items-center p-4 bg-white shadow">
          <h1 className="font-bold text-lg">Media Gallery</h1>
          <button
            onClick={() => signOut(auth)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <Upload />
        <Gallery />
      </div>
    </div>
  );
}
