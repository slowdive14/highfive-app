declare global {
    interface Window {
        Kakao: any;
    }
}

const KAKAO_SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";

export const initializeKakaoSdk = () => {
    if (typeof window === 'undefined') return;

    if (window.Kakao && window.Kakao.isInitialized()) {
        return;
    }

    const script = document.createElement("script");
    script.src = KAKAO_SDK_URL;
    script.async = true;

    script.onload = () => {
        const key = process.env.EXPO_PUBLIC_KAKAO_JS_KEY;
        if (key && window.Kakao) {
            if (!window.Kakao.isInitialized()) {
                window.Kakao.init(key);
                console.log("Kakao SDK Initialized");
            }
        } else {
            console.error("Kakao JS Key is missing in env variables");
        }
    };

    document.body.appendChild(script);
};

export const loginWithKakao = () => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
        console.error("Kakao SDK not initialized");
        alert("Kakao login is not ready. Please try again in a moment.");
        return;
    }

    const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}` : '';

    window.Kakao.Auth.authorize({
        redirectUri: redirectUri,
        scope: 'profile_nickname,profile_image',
    });
};
