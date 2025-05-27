import { VercelRequest, VercelResponse } from "@vercel/node";
import { spawn } from "child_process";
import path from "path";

interface FaceDetectionResult {
  success: boolean;
  faces_detected: number;
  face_locations: number[][];
  message: string;
  error?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      faces_detected: 0,
      face_locations: [],
      message: "Method not allowed",
      error: "Only POST method is allowed",
    });
  }

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

    const result = await runPythonScript(imageData);

    res.status(200).json(result);
  } catch (error) {
    console.error("Face recognition error:", error);
    res.status(500).json({
      success: false,
      faces_detected: 0,
      face_locations: [],
      message: "서버 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

function runPythonScript(imageData: string): Promise<FaceDetectionResult> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      process.cwd(),
      "libs",
      "python",
      "face_detect.py"
    );

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
