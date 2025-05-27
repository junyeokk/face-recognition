## 프로젝트 구조

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

## 설치 및 실행

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
