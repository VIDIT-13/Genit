import { useEffect, useRef, useState, useMemo } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";

import Masonry from "@mui/lab/Masonry";
import Box from "@mui/material/Box";

import gsap from "gsap";

export default function Gallery() {
  const [uploads, setUploads] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const itemRefs = useRef([]);
  const videoRef = useRef(null);

  // prevent repeated measuring
  const measuringImageRef = useRef(new Set());
  const measuringVideoRef = useRef(new Set());

  useEffect(() => {
    const q = query(collection(db, "uploads"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          ratio: data.ratio ?? null,
          poster: data.poster ?? data.posterUrl ?? null,
        };
      });
      setUploads(items);
    });

    return () => unsubscribe();
  }, []);

  // Preload images to compute aspect ratios and reserve space to avoid layout shifts
  useEffect(() => {
    const imageItems = uploads.filter(
      (it) =>
        it.type?.startsWith("image") &&
        !it.ratio &&
        !measuringImageRef.current.has(it.id)
    );

    imageItems.forEach((item) => {
      measuringImageRef.current.add(item.id);
      const img = new Image();
      img.src = item.url;
      img.decoding = "async";
      img.onload = () => {
        const ratio =
          img.naturalWidth && img.naturalHeight
            ? img.naturalWidth / img.naturalHeight
            : null;
        if (ratio) {
          setUploads((prev) =>
            prev.map((p) => (p.id === item.id ? { ...p, ratio } : p))
          );
        }
        measuringImageRef.current.delete(item.id);
      };
      img.onerror = () => {
        measuringImageRef.current.delete(item.id);
      };
    });
  }, [uploads]);

  // Generate poster thumbnails for videos (client-side) and measure ratio
  useEffect(() => {
    const videoItems = uploads.filter(
      (it) =>
        it.type?.startsWith("video") &&
        !it.poster &&
        !measuringVideoRef.current.has(it.id)
    );

    videoItems.forEach((item) => {
      measuringVideoRef.current.add(item.id);
      const v = document.createElement("video");
      v.src = item.url;
      v.preload = "metadata";
      v.muted = true;
      v.crossOrigin = "anonymous";

      const cleanup = () => {
        try {
          v.pause();
          v.src = "";
          v.removeAttribute("src");
        } catch {}
        measuringVideoRef.current.delete(item.id);
      };

      const onError = () => {
        cleanup();
      };

      const captureFrame = () => {
        try {
          const width = v.videoWidth || 640;
          const height = v.videoHeight || 360;
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(v, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          const ratio = width && height ? width / height : null;

          setUploads((prev) =>
            prev.map((p) =>
              p.id === item.id
                ? { ...p, poster: dataUrl, ratio: p.ratio ?? ratio }
                : p
            )
          );
        } catch {}
        cleanup();
      };

      const onLoadedMetadata = () => {
        // choose a small time to seek to (some videos require >0)
        const seekTime = Math.min(
          0.5,
          Math.max(0.1, (v.duration && Math.min(0.5, v.duration / 10)) || 0.1)
        );
        const safeSeek = () => {
          try {
            v.currentTime = seekTime;
          } catch {
            // if seeking fails, try capturing immediately
            captureFrame();
          }
        };

        // if duration is 0 or NaN, capture immediately
        if (!v.duration || v.duration === Infinity) {
          safeSeek();
        } else {
          safeSeek();
        }
      };

      const onSeeked = () => {
        captureFrame();
      };

      v.addEventListener("loadedmetadata", onLoadedMetadata);
      v.addEventListener("seeked", onSeeked);
      v.addEventListener("error", onError);
      // start loading metadata
      try {
        v.load();
      } catch {
        cleanup();
      }
      // safety: if nothing happens after 5s, bail
      const timer = setTimeout(() => {
        if (measuringVideoRef.current.has(item.id)) {
          measuringVideoRef.current.delete(item.id);
        }
        try {
          v.pause();
          v.src = "";
        } catch {}
      }, 5000);

      // cleanup timer when setUploads updates or unmount
      const clear = () => clearTimeout(timer);
      // attach clear to one-time state update via setTimeout; simpler: cleanup executed above
      // no explicit return here, it's per-item cleanup
    });
  }, [uploads]);

  // GSAP animation (use force3D + will-change hint on items)
  useEffect(() => {
    if (!itemRefs.current.length) return;

    gsap.fromTo(
      itemRefs.current,
      { opacity: 0, y: 20, force3D: true },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out",
        overwrite: true,
        force3D: true,
      }
    );
  }, [uploads]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      await deleteDoc(doc(db, "uploads", id));
    }
  };

  const closePreview = () => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
    }

    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    setSelectedItem(null);
  };

  // Memoize rendered items to avoid unnecessary re-renders
  const renderedItems = useMemo(
    () =>
      uploads.map((item, index) => {
        const isImage = item.type?.startsWith("image");
        const isVideo = item.type?.startsWith("video");
        const ratioValue = item.ratio ?? (isVideo ? 16 / 9 : 4 / 3);

        return (
          <Box
            key={item.id}
            ref={(el) => (itemRefs.current[index] = el)}
            className="relative rounded-2xl overflow-hidden cursor-pointer bg-black"
            style={{
              willChange: "transform, opacity",
              transform: "translateZ(0)",
            }}
            onClick={() => setSelectedItem(item)}
          >
            {isImage ? (
              // Reserve space using aspect-ratio / padding-bottom so layout won't jump
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: `${100 / ratioValue}%`,
                  backgroundColor: "#000",
                }}
              >
                <img
                  src={item.url}
                  alt="upload"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            ) : isVideo ? (
              // Show poster image for videos (avoid loading video in grid)
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: `${100 / ratioValue}%`,
                  backgroundColor: "#000",
                }}
              >
                {item.poster ? (
                  <img
                    src={item.poster}
                    alt="video poster"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    {/* simple placeholder */}
                    <div style={{ opacity: 0.6 }}>Video</div>
                  </div>
                )}

                {/* subtle play icon center */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    opacity: 0.9,
                  }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="12"
                      fill="rgba(0,0,0,0.4)"
                    ></circle>
                    <path d="M10 8v8l6-4-6-4z" fill="#fff"></path>
                  </svg>
                </div>
              </div>
            ) : null}

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item.id);
              }}
              className="absolute top-2 right-2 bg-red-500/20 backdrop-blur-sm
                         text-white text-xs px-2 py-1 rounded-full
                         hover:bg-red-500 transition z-10"
            >
              Delete
            </button>
          </Box>
        );
      }),
    [uploads]
  );

  return (
    <>
      {/* Gallery */}
      <Box className="p-4">
        <Masonry columns={{ xs: 2, sm: 3, md: 4 }} spacing={2}>
          {renderedItems}
        </Masonry>
      </Box>

      {/* Fullscreen Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={closePreview}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closePreview();
            }}
            className="absolute top-6 right-6 text-white text-3xl font-bold z-50"
          >
            ✕
          </button>

          <div
            className="max-w-5xl max-h-[90vh] w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.type?.startsWith("image") ? (
              <img
                src={selectedItem.url}
                alt="fullscreen"
                className="w-full max-h-[90vh] object-contain rounded-xl"
              />
            ) : (
              <video
                ref={videoRef}
                src={selectedItem.url}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[90vh] rounded-xl"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
