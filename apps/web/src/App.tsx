import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import "./App.css";

interface FaceDetectionResult {
  success: boolean;
  faces_detected: number;
  face_locations: number[][];
  message: string;
  error?: string;
}

function App() {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FaceDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [hasWebcamPermission, setHasWebcamPermission] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    const checkWebcamPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: "user",
          },
        });

        stream.getTracks().forEach((track) => track.stop());
        setHasWebcamPermission(true);
        setWebcamError(null);
      } catch (err) {
        console.error("웹캠 접근 오류:", err);
        setHasWebcamPermission(false);

        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            setWebcamError(
              "웹캠 접근 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요."
            );
          } else if (err.name === "NotFoundError") {
            setWebcamError(
              "웹캠을 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요."
            );
          } else if (err.name === "NotSupportedError") {
            setWebcamError("이 브라우저에서는 웹캠을 지원하지 않습니다.");
          } else {
            setWebcamError(`웹캠 오류: ${err.message}`);
          }
        } else {
          setWebcamError("알 수 없는 웹캠 오류가 발생했습니다.");
        }
      }
    };

    checkWebcamPermission();
  }, []);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setResult(null);
      setError(null);
    } else {
      setError(
        "이미지 캡처에 실패했습니다. 웹캠이 제대로 작동하는지 확인해주세요."
      );
    }
  }, [webcamRef]);

  const recognizeFace = async () => {
    if (!capturedImage) {
      setError("먼저 이미지를 캡처해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/recognize-face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: capturedImage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FaceDetectionResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
  };

  const retryWebcam = () => {
    setWebcamError(null);
    setHasWebcamPermission(null);
    window.location.reload();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Face Recognition</h1>
        <p>AI-powered facial detection system</p>
      </header>

      <main className="app-main">
        <div className="camera-section">
          <h2>Camera Capture</h2>

          {hasWebcamPermission === null && (
            <div className="webcam-loading">
              <p>Checking camera permissions...</p>
            </div>
          )}

          {webcamError && (
            <div className="webcam-error">
              <h3>Camera Error</h3>
              <p>{webcamError}</p>
              <div className="webcam-help">
                <h4>Solutions:</h4>
                <ul>
                  <li>
                    Click the camera icon in your browser's address bar to allow
                    permissions
                  </li>
                  <li>
                    HTTPS connection may be required (localhost is exempt)
                  </li>
                  <li>Make sure no other apps are using your camera</li>
                  <li>Try refreshing the browser or restarting it</li>
                </ul>
                <button onClick={retryWebcam} className="retry-btn">
                  Retry
                </button>
              </div>
            </div>
          )}

          {hasWebcamPermission && !capturedImage && (
            <div className="webcam-container">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                width={640}
                height={480}
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: "user",
                }}
                className="webcam"
                onUserMediaError={(error) => {
                  console.error("Webcam error:", error);
                  setWebcamError("웹캠 스트림 오류가 발생했습니다.");
                }}
              />
              <button onClick={capture} className="capture-btn">
                Capture Photo
              </button>
            </div>
          )}

          {capturedImage && (
            <div className="captured-container">
              <img
                src={capturedImage}
                alt="Captured"
                className="captured-image"
              />
              <div className="action-buttons">
                <button
                  onClick={recognizeFace}
                  disabled={isLoading}
                  className="analyze-btn"
                >
                  {isLoading ? "Analyzing..." : "Analyze Face"}
                </button>
                <button onClick={reset} className="reset-btn">
                  Retake Photo
                </button>
              </div>
            </div>
          )}
        </div>

        {result && (
          <div className="result-section">
            <h2>Analysis Result</h2>
            <div
              className={`result-card ${result.success ? "success" : "error"}`}
            >
              <div className="result-status">
                {result.success
                  ? result.faces_detected > 0
                    ? "Face Detected"
                    : "No Face Detected"
                  : "Analysis Failed"}
              </div>
              <div className="result-details">
                <p>
                  <strong>Faces detected:</strong> {result.faces_detected}
                </p>
                <p>
                  <strong>Message:</strong> {result.message}
                </p>
                {result.error && (
                  <p className="error-text">
                    <strong>Error:</strong> {result.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-section">
            <div className="error-card">
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by React + Vercel + Python AI</p>
      </footer>
    </div>
  );
}

export default App;
