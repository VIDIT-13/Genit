import { useState } from "react";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const CLOUD_NAME = "doahhnkqm";
const UPLOAD_PRESET = "Memories";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    if (file.size > 100 * 1024 * 1024) {
      return alert("File too large (max 100MB)");
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      await addDoc(collection(db, "uploads"), {
        url: data.secure_url,
        type: file.type,
        user: auth.currentUser.email,
        uid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      setFile(null);
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-start pt-12 px-4">
      <div
        className="w-full max-w-md bg-black text-white rounded-3xl p-6
                   border border-gray-700 shadow-lg
                   transition-all duration-500
                   hover:scale-[1.03] hover:border-purple-500 hover:shadow-purple-500/20"
      >
        {/* Title */}
        <h2 className="text-2xl font-semibold mb-6 text-center tracking-wide">
          Upload Moments
        </h2>

        {/* File picker */}
        <label
          className="flex flex-col items-center justify-center w-full h-40
                     border-2 border-dashed border-gray-600 rounded-2xl
                     cursor-pointer
                     transition-all duration-500
                     hover:border-purple-500 hover:bg-purple-500/10"
        >
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />

          {!file ? (
            <div className="text-gray-300 text-center transition-all duration-300">
              <p className="text-lg">Click to upload</p>
              <p className="text-sm mt-1 opacity-80">
                Just GenZ and Allen
              </p>
            </div>
          ) : (
            <div className="text-center text-purple-300">
              <p className="font-medium">Selected file:</p>
              <p className="text-sm mt-1 break-all">{file.name}</p>
            </div>
          )}
        </label>

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`mt-6 w-full py-3 rounded-xl text-lg font-medium
            transition-all duration-500
            ${
              uploading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-white text-black hover:bg-purple-600 hover:text-white hover:scale-[1.05]"
            }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
