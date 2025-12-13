import { useEffect, useState } from "react";
import { auth } from "./firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

import Login from "./components/Login";
import Upload from "./components/Upload";
import Gallery from "./components/Gallery";


export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  // 🔒 If not logged in → show only Login
  if (!user) {
    return <div className="w-full h-full bg-black"><Login /></div>;
  }

  // ✅ If logged in → show app
  return (
    <div className="min-h-screen bg-gray-100">
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
  );
}
