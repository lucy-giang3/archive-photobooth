import React, { useState, useRef, useEffect } from "react";

const Camera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number>(0);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [capturedCount, setCapturedCount] = useState<number>(0);
  const [showCameraFeed, setShowCameraFeed] = useState<boolean>(true);
  const [flash, setFlash] = useState<boolean>(false);
  const frameImage = "./assets/frame.png";

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
          alert("Please allow camera access.");
        });
    } else {
      alert("Your browser does not support camera access.");
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isCapturing && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0 && isCapturing) {
      capturePhoto();
      if (capturedCount < 3) {
        setCountdown(5);
        setCapturedCount((prev) => prev + 1);
      } else {
        setIsCapturing(false);
        setShowCameraFeed(false);
        stopCamera();
      }
    }
  }, [isCapturing, countdown, capturedCount]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const photoUrl = canvas.toDataURL("image/png");
        setPhotos((prevPhotos) => [...prevPhotos, photoUrl]);

        setFlash(true);
        setTimeout(() => {
          setFlash(false);
        }, 100);
      }
    }
  };

  const startCountdown = () => {
    setIsCapturing(true);
    setCapturedCount(0);
    setPhotos([]);
    setCountdown(5);
    setShowCameraFeed(true);
  };

  const saveImageWithFrame = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        const frame = new Image();
        frame.src = frameImage;

        frame.onload = () => {
          canvas.width = frame.width;
          canvas.height = frame.height;

          context.drawImage(frame, 0, 0);

          const photoWidth = 577;
          const photoHeight = 408;
          const gap = 57;
          const startY = 57;

          photos.forEach((photo, index) => {
            const x = (frame.width - photoWidth) / 2;
            const y = startY + index * (photoHeight + gap);

            const img = new Image();
            img.src = photo;

            img.onload = () => {
              context.drawImage(img, x, y, photoWidth, photoHeight);

              if (index === photos.length - 1) {
                const date = new Date().toLocaleDateString();
                context.font = "bold 32px Arial";
                context.fillStyle = "white";
                context.textAlign = "center";

                const dateY = frame.height - 50;
                context.fillText(date, frame.width / 2, dateY);

                const finalImage = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.href = finalImage;
                link.download = "archive_photo.png";
                link.click();
              }
            };
          });
        };
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#1d1d1d]">
      <div className="flex flex-col items-center">
        {showCameraFeed && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            width="[40%]"
            height="[40%]"
            style={{
              border: "6px solid #dde1dd",
              borderRadius: "1px",
              transform: "scaleX(-1)",
            }}
            className="shadow-md"
          />
        )}

        {flash && (
          <div
            className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-50"
            style={{ pointerEvents: "none", zIndex: 10 }}
          />
        )}

        {isCapturing && (
          <div className="flex space-x-30 mt-4">
            <div className="mt-4 text-2xl font-bold text-green-500">
              {countdown} sec
            </div>
            <div className="mt-4 text-2xl font-bold">
              {capturedCount + 1} / 4
            </div>
          </div>
        )}

        {!isCapturing && photos.length < 4 && (
          <button
            onClick={startCountdown}
            className="mt-4 p-2 bg-blue-500 text-white rounded"
          >
            Take Photo
          </button>
        )}
      </div>

      {photos.length === 4 && (
        <div className="flex justify-center items-center w-full mt-4 flex-col">
          <div className="grid grid-cols-2 gap-4 justify-items-center w-full max-w-[95%] sm:max-w-[700px]">
            {photos.map((photo, index) => (
              <div key={index} className="w-full h-full flex justify-center">
                <img
                  src={photo}
                  alt={`Captured ${index}`}
                  className="w-full h-full object-cover border-6 border-[#dde1dd] rounded-[1px]"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center w-full mt-4 space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white rounded w-full sm:w-[200px] h-[50px]"
            >
              Take Again
            </button>
            <button
              onClick={saveImageWithFrame}
              className="bg-green-500 text-white text-base sm:text-lg md:text-xl text-ellipsis truncate rounded-lg px-4 py-2 w-full sm:w-[200px] h-[50px] hover:bg-green-600"
            >
              Download
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default Camera;
