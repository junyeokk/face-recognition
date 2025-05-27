const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 얼굴 인식 API 엔드포인트
app.post("/api/recognize-face", async (req, res) => {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({
        success: false,
        faces_detected: 0,
        face_locations: [],
        message: "이미지 데이터가 필요합니다.",
        error: "Image data is required",
      });
    }

    // Python 스크립트 실행
    const result = await runPythonScript(imageData);

    res.status(200).json(result);
  } catch (error) {
    console.error("Face recognition error:", error);
    res.status(500).json({
      success: false,
      faces_detected: 0,
      face_locations: [],
      message: "서버 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

function runPythonScript(imageData) {
  return new Promise((resolve, reject) => {
    // Python 스크립트 경로
    const scriptPath = path.join(__dirname, "libs", "python", "face_detect.py");

    // Python 프로세스 실행
    const pythonProcess = spawn("python3", [scriptPath, imageData]);

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (parseError) {
        reject(
          new Error(`Failed to parse Python script output: ${parseError}`)
        );
      }
    });

    pythonProcess.on("error", (error) => {
      reject(new Error(`Failed to start Python script: ${error.message}`));
    });
  });
}

app.listen(PORT, () => {
  console.log(`🚀 API 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

module.exports = app;
