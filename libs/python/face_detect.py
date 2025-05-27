#!/usr/bin/env python3
import sys
import json
import base64
import os
import numpy as np
from PIL import Image
import io

# OpenCV 로드 시도
try:
    os.environ['OPENCV_HEADLESS'] = '1'
    import cv2
    print("OpenCV successfully imported:", cv2.__version__)
except ImportError as e:
    print("Error importing OpenCV:", str(e))
    print("Python path:", sys.path)
    print("Current directory:", os.getcwd())
    raise

def detect_faces(image_data):
    try:
        # Base64 데이터에서 이미지 디코딩
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # PIL 이미지를 OpenCV 형식으로 변환
        opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Haar Cascade 파일 경로 찾기
        cascade_file = 'haarcascade_frontalface_default.xml'
        cascade_paths = [
            os.path.join(cv2.data.haarcascades, cascade_file),
            os.path.join(os.path.dirname(__file__), cascade_file),
            os.path.join('/usr/local/share/opencv4/haarcascades', cascade_file),
            os.path.join('/usr/share/opencv4/haarcascades', cascade_file),
        ]
        
        cascade_path = None
        for path in cascade_paths:
            if os.path.exists(path):
                cascade_path = path
                print(f"Found cascade file at: {path}")
                break
                
        if cascade_path is None:
            raise FileNotFoundError(f"Cascade file not found in any of: {cascade_paths}")
            
        face_cascade = cv2.CascadeClassifier(cascade_path)
        if face_cascade.empty():
            raise ValueError("Failed to load cascade classifier")
        
        # 그레이스케일로 변환
        gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
        
        # 얼굴 검출
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        # 결과 포맷팅
        face_locations = []
        for (x, y, w, h) in faces:
            face_locations.append([y, x + w, y + h, x])
        
        result = {
            "success": True,
            "faces_detected": len(faces),
            "face_locations": face_locations,
            "message": f"{len(faces)}개의 얼굴이 감지되었습니다." if len(faces) > 0 else "얼굴이 감지되지 않았습니다."
        }
        
        return result
        
    except Exception as e:
        print("Error in detect_faces:", str(e))
        print("Python path:", sys.path)
        print("Current directory:", os.getcwd())
        return {
            "success": False,
            "faces_detected": 0,
            "face_locations": [],
            "message": "얼굴 인식 중 오류가 발생했습니다.",
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "faces_detected": 0,
            "face_locations": [],
            "message": "이미지 데이터가 필요합니다.",
            "error": "Image data argument required"
        }))
        sys.exit(1)
    
    image_data = sys.argv[1]
    result = detect_faces(image_data)
    print(json.dumps(result)) 