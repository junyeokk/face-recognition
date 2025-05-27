# 🎯 AI 얼굴 인식 웹 서비스

웹캠을 통해 실시간으로 얼굴을 촬영하고, 백엔드에서 AI 모델을 활용하여 얼굴 인식 여부를 판별하는 풀스택 웹 서비스입니다.

## 🚀 주요 기능

- **실시간 웹캠 캡처**: 브라우저에서 직접 웹캠을 통해 이미지 촬영
- **AI 얼굴 인식**: Python face_recognition 라이브러리를 활용한 정확한 얼굴 감지
- **즉시 결과 확인**: 촬영 후 바로 얼굴 인식 결과를 시각적으로 확인
- **반응형 디자인**: 모바일과 데스크탑 모든 환경에서 최적화된 UI
- **개인정보 보호**: 이미지를 서버에 저장하지 않고 즉시 처리 후 폐기

## 🏗️ 기술 스택

### 프론트엔드

- **React 19** + **TypeScript**: 모던 웹 개발
- **Vite**: 빠른 개발 환경
- **react-webcam**: 웹캠 캡처 기능
- **CSS3**: 모던 UI/UX 디자인

### 백엔드

- **Vercel Serverless Functions**: 서버리스 API
- **Node.js**: JavaScript 런타임
- **Python**: AI 모델 실행

### AI/ML

- **face_recognition**: 얼굴 인식 라이브러리
- **OpenCV**: 이미지 처리
- **NumPy**: 수치 연산

## 📁 프로젝트 구조

```
/face-recognition-app
├── /apps
│   ├── /web                  # React 프론트엔드
│   │   ├── /src
│   │   │   ├── App.tsx      # 메인 컴포넌트
│   │   │   ├── App.css      # 스타일링
│   │   │   └── main.tsx     # 엔트리 포인트
│   │   └── package.json
│   └── /api
│       ├── recognize-face.ts # Vercel API 엔드포인트
│       └── package.json
├── /libs
│   └── /python
│       ├── face_detect.py   # 얼굴 인식 Python 스크립트
│       └── requirements.txt # Python 의존성
├── vercel.json              # Vercel 배포 설정
└── README.md
```

## 🛠️ 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd face-recognition-app
```

### 2. 프론트엔드 의존성 설치

```bash
cd apps/web
npm install
```

### 3. API 의존성 설치

```bash
cd ../api
npm install
```

### 4. Python 의존성 설치

```bash
cd ../../libs/python
pip install -r requirements.txt
```

### 5. 개발 서버 실행

```bash
cd ../../apps/web
npm run dev
```

## 🌐 배포

### Vercel 배포

1. Vercel 계정에 로그인
2. 프로젝트를 GitHub에 푸시
3. Vercel에서 프로젝트 import
4. 자동으로 빌드 및 배포 완료

### 환경 변수 설정

필요한 경우 Vercel 대시보드에서 환경 변수를 설정할 수 있습니다.

## 🎮 사용 방법

1. **웹사이트 접속**: 배포된 URL 또는 로컬 개발 서버에 접속
2. **웹캠 권한 허용**: 브라우저에서 웹캠 사용 권한 허용
3. **사진 촬영**: "📸 사진 촬영" 버튼을 클릭하여 이미지 캡처
4. **얼굴 인식**: "🤖 얼굴 인식 시작" 버튼을 클릭하여 AI 분석 실행
5. **결과 확인**: 감지된 얼굴 수와 분석 결과 확인

## 🔧 API 엔드포인트

### POST `/api/recognize-face`

얼굴 인식을 수행하는 API 엔드포인트입니다.

**요청 본문:**

```json
{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**응답:**

```json
{
  "success": true,
  "faces_detected": 1,
  "face_locations": [[top, right, bottom, left]],
  "message": "1개의 얼굴이 감지되었습니다."
}
```

## 🔒 보안 및 개인정보

- **이미지 저장 안함**: 업로드된 이미지는 처리 후 즉시 삭제
- **CORS 설정**: 안전한 크로스 오리진 요청 처리
- **클라이언트 사이드 처리**: 가능한 한 클라이언트에서 처리하여 서버 부하 최소화

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 언제든지 연락주세요!

---

**🚀 React + Vercel + Python AI로 구현된 얼굴 인식 서비스**
