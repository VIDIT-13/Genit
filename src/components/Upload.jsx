import { useState } from "react";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const CLOUD_NAME = "doahhnkqm";     // Your Cloudinary cloud name
const UPLOAD_PRESET = "Memories";    // Your unsigned upload preset

export default function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    // 🔒 Max 100MB for both images and videos
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

      // Save metadata to Firestore
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
    <div className="flex justify-center mt-6">
      <div className="bg-white p-4 rounded-xl shadow flex gap-3">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`px-4 py-2 rounded text-white ${
            uploading
              ? "bg-gray-400"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
