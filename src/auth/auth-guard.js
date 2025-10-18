// 이 스크립트는 다른 JS나 CSS보다 먼저 실행되어야 합니다.
(async function() {
    try {
        // HttpOnly 쿠키가 있다면 브라우저가 자동으로 포함해서 요청
        const response = await fetch('http://localhost:8080/members/me', {credentials: 'include'}); // '내 정보' 확인 API
        if (!response.ok) {
            // 401 Unauthorized 등 세션이 유효하지 않은 경우
            throw new Error('Not authenticated');
        }
    } catch (error) {
        // API 호출에 실패하면 (세션 없음) 로그인 페이지로 강제 이동
        console.error('인증 실패. 로그인 페이지로 이동합니다.');
        // 뒤로가기를 막기 위해 replace 사용
        window.location.replace('/index.html');
    }
})();