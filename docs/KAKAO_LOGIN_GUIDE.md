# 카카오 로그인 구현 매뉴얼 (Expo Web + Convex)

## 목차
1. [개요](#1-개요)
2. [Kakao Developers 설정](#2-kakao-developers-설정)
3. [프로젝트 환경변수 설정](#3-프로젝트-환경변수-설정)
4. [코드 구조](#4-코드-구조)
5. [트러블슈팅](#5-트러블슈팅)

---

## 1. 개요

### 기술 스택
- **Frontend**: React Native (Expo Web)
- **Backend**: Convex
- **인증 방식**: Kakao OAuth 2.0 (Authorization Code Flow)

### 인증 흐름
```
1. 사용자가 "카카오로 로그인" 버튼 클릭
2. Kakao SDK가 카카오 로그인 페이지로 리다이렉트
3. 사용자가 카카오에서 로그인 및 권한 동의
4. 카카오가 ?code=xxx 파라미터와 함께 앱으로 리다이렉트
5. 앱이 code를 Convex Action으로 전송
6. Convex가 code → access_token 교환
7. Convex가 access_token으로 사용자 정보 조회
8. Convex가 users 테이블에 사용자 저장
9. 프론트엔드가 로그인 상태 업데이트
```

---

## 2. Kakao Developers 설정

### 2.1. 앱 생성
1. [Kakao Developers](https://developers.kakao.com) 접속
2. 로그인 → **내 애플리케이션** → **애플리케이션 추가하기**
3. 앱 이름 입력 후 저장

### 2.2. 플랫폼 등록
1. 앱 선택 → **앱 설정** → **플랫폼**
2. **Web 플랫폼 등록** 클릭
3. **사이트 도메인** 추가:
   ```
   http://localhost:8081
   https://your-production-domain.com
   ```

### 2.3. 카카오 로그인 활성화
1. **제품 설정** → **카카오 로그인**
2. **활성화 설정**: **ON**
3. **Redirect URI** 추가:
   ```
   http://localhost:8081
   https://your-production-domain.com
   ```
   > ⚠️ **중요**: 끝에 슬래시(/) 없이 등록!

### 2.4. 동의항목 설정
1. **제품 설정** → **카카오 로그인** → **동의항목**
2. 필수 항목 설정:
   - **닉네임**: 필수 동의
   - **프로필 사진**: 선택 동의 (권장)
   - **카카오계정(이메일)**: 선택 동의 (필요시)

### 2.5. 앱 키 확인
1. **앱 설정** → **앱 키** 또는 **플랫폼 키**
2. 필요한 키:

| 키 종류 | 용도 | 저장 위치 |
|--------|------|----------|
| **REST API 키** | 서버에서 토큰 교환 | Convex 환경변수 |
| **JavaScript 키** | 프론트엔드 SDK 초기화 | `.env.local` |

### 2.6. 클라이언트 시크릿 설정 ⚠️ 중요
1. **플랫폼 키** → REST API 키 → **클라이언트 시크릿** 클릭
2. **⚠️ 반드시 비활성화(OFF) 상태 유지**
   - 활성화 시 `KOE010 (invalid_client)` 에러 발생
   - 비활성화하면 client_id만으로 동작

---

## 3. 프로젝트 환경변수 설정

### 3.1. 로컬 환경변수 (.env.local)
```bash
# Convex
EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Kakao (JavaScript 키)
EXPO_PUBLIC_KAKAO_JS_KEY=your_javascript_key_here
```

### 3.2. Convex 환경변수
1. [Convex Dashboard](https://dashboard.convex.dev) 접속
2. 프로젝트 선택 → **Settings** → **Environment Variables**
3. 추가:

| Name | Value |
|------|-------|
| `KAKAO_REST_API_KEY` | `REST API 키 값` |

> **주의**: 설정 후 **Save** 버튼 클릭 필수!

---

## 4. 코드 구조

### 파일 구조
```
project/
├── convex/
│   ├── schema.ts      # users 테이블 정의
│   ├── auth.ts        # kakaoLogin action, getUser query
│   └── users.ts       # saveUser mutation
├── src/
│   ├── components/
│   │   └── auth/
│   │       └── KakaoRedirectHandler.tsx  # OAuth 콜백 처리
│   ├── screens/
│   │   └── LoginScreen.tsx    # 로그인 화면
│   ├── store/
│   │   └── useAuthStore.ts    # 인증 상태 관리
│   └── utils/
│       └── kakaoSdk.ts        # Kakao SDK 유틸리티
└── App.tsx                    # 앱 진입점 (인증 분기)
```

---

## 5. 트러블슈팅

### 에러: `KOE010 (invalid_client)`
**해결**: Kakao Developers → 플랫폼 키 → REST API 키 → **클라이언트 시크릿 비활성화**

### 에러: `KAKAO_REST_API_KEY is not configured`
**해결**: Convex Dashboard → Settings → Environment Variables → `KAKAO_REST_API_KEY` 추가 후 **Save**

### 에러: `redirect_uri_mismatch`
**해결**: Kakao Developers에 정확히 `http://localhost:8081` 등록 (끝에 / 없음)

---

## 배포 체크리스트

- [ ] Kakao Developers에 프로덕션 도메인 등록
- [ ] Redirect URI에 프로덕션 URL 추가
- [ ] JavaScript SDK 도메인에 프로덕션 URL 추가
- [ ] Convex Production 환경변수 설정
- [ ] 클라이언트 시크릿 비활성화 상태 확인
