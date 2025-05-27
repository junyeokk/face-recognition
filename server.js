const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 정적 파일 서빙 (React 앱)
app.use(express.static(path.join(__dirname, "apps/web/dist")));

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

    console.log("Face recognition request received");
    const result = await runPythonScript(imageData);
    console.log("Python script result:", result);

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

// React 앱 라우팅 (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/web/dist/index.html"));
});

function runPythonScript(imageData) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "libs", "python", "face_detect.py");

    // 스크립트 파일 존재 확인
    if (!fs.existsSync(scriptPath)) {
      console.error("Python script not found at:", scriptPath);
      reject(new Error(`Python script not found: ${scriptPath}`));
      return;
    }

    console.log("Running Python script at:", scriptPath);

    // Python 실행 파일 경로들을 시도
    const pythonCommands = [
      "python3",
      "python",
      "/usr/bin/python3",
      "/usr/local/bin/python3",
    ];

    function tryPythonCommand(commandIndex) {
      if (commandIndex >= pythonCommands.length) {
        reject(new Error("No Python interpreter found"));
        return;
      }

      const pythonCmd = pythonCommands[commandIndex];
      console.log(`Trying Python command: ${pythonCmd}`);

      // Python 프로세스 실행
      const pythonProcess = spawn(pythonCmd, [scriptPath, imageData]);

      let stdout = "";
      let stderr = "";

      pythonProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        stderr += data.toString();
        console.error("Python stderr:", data.toString());
      });

      pythonProcess.on("close", (code) => {
        console.log("Python process closed with code:", code);
        console.log("Python stdout:", stdout);
        console.log("Python stderr:", stderr);

        if (code !== 0) {
          reject(
            new Error(`Python script failed with code ${code}: ${stderr}`)
          );
          return;
        }

        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (parseError) {
          console.error("Failed to parse Python output:", stdout);
          reject(
            new Error(`Failed to parse Python script output: ${parseError}`)
          );
        }
      });

      pythonProcess.on("error", (error) => {
        console.error(
          `Failed to start Python process with ${pythonCmd}:`,
          error
        );
        // 다음 Python 명령어 시도
        tryPythonCommand(commandIndex + 1);
      });
    }

    // 첫 번째 Python 명령어부터 시도
    tryPythonCommand(0);
  });
}

app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);

  // 환경 정보 로깅
  console.log("Working directory:", __dirname);
  console.log(
    "Python script path:",
    path.join(__dirname, "libs", "python", "face_detect.py")
  );

  // Python 스크립트 존재 확인
  const scriptPath = path.join(__dirname, "libs", "python", "face_detect.py");
  if (fs.existsSync(scriptPath)) {
    console.log("✅ Python script found");
  } else {
    console.log("❌ Python script NOT found");
  }

  // Python 설치 확인
  const pythonCommands = [
    "python3",
    "python",
    "/usr/bin/python3",
    "/usr/local/bin/python3",
  ];

  function checkPython(commandIndex) {
    if (commandIndex >= pythonCommands.length) {
      console.log("❌ No Python interpreter found");
      return;
    }

    const pythonCmd = pythonCommands[commandIndex];
    const pythonCheck = spawn(pythonCmd, ["--version"]);

    pythonCheck.stdout.on("data", (data) => {
      console.log(`✅ Found Python: ${pythonCmd} - ${data.toString().trim()}`);
    });

    pythonCheck.stderr.on("data", (data) => {
      console.log(`✅ Found Python: ${pythonCmd} - ${data.toString().trim()}`);
    });

    pythonCheck.on("error", (error) => {
      console.log(`❌ ${pythonCmd} not found, trying next...`);
      checkPython(commandIndex + 1);
    });
  }

  checkPython(0);
});

module.exports = app;
