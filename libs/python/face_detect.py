#!/usr/bin/env python3
import sys
import json
import base64
import io
from PIL import Image
import face_recognition
import numpy as np

def detect_faces_from_base64(base64_string):
    """
    Base64 인코딩된 이미지에서 얼굴을 감지합니다.
    
    Args:
        base64_string (str): Base64로 인코딩된 이미지 데이터
        
    Returns:
        dict: 얼굴 감지 결과
    """
    try:
        if base64_string.startswith('data:image'):
            base64_string = base64_string.split(',')[1]
        
        image_data = base64.b64decode(base64_string)
        
        image = Image.open(io.BytesIO(image_data))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        image_array = np.array(image)
        
        face_locations = face_recognition.face_locations(image_array)
        
        result = {
            "success": True,
            "faces_detected": len(face_locations),
            "face_locations": face_locations,
            "message": f"{len(face_locations)}개의 얼굴이 감지되었습니다." if len(face_locations) > 0 else "얼굴이 감지되지 않았습니다."
        }
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "faces_detected": 0,
            "face_locations": [],
            "error": str(e),
            "message": "얼굴 감지 중 오류가 발생했습니다."
        }

def main():
    """
    메인 함수: 명령행 인자로 받은 Base64 이미지를 처리합니다.
    """
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "error": "Base64 이미지 데이터가 필요합니다.",
            "message": "사용법: python face_detect.py <base64_image_data>"
        }))
        sys.exit(1)
    
    base64_image = sys.argv[1]
    result = detect_faces_from_base64(base64_image)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main() 