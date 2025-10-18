(async () => {
    try {
        // 1. /members/me API를 호출하여 세션 유효성 검사
        const response = await fetch('http://localhost:8080/members/me', {
            credentials: 'include' // [필수] 쿠키를 요청에 포함시킴
        });

        // 2. [로직 반전]
        //    응답이 200 OK이면 (로그인 된 상태)
        if (response.ok) {
            // 메인 페이지로 튕겨낸다.
            window.location.replace('/pages/posts.html');
        }
    } catch (error) {
        // 4. (예상된 실패)
        // 아무것도 하지 않는다.
    }
})();