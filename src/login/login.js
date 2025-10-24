const apiUrl = import.meta.env.VITE_API_URL;

// 1. DOM이 모두 로드된 후에 스크립트가 실행되도록 구성
document.addEventListener('DOMContentLoaded', function() {

    // 2. 필요한 HTML 요소들을 선택
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const errorMessageDiv = document.getElementById('errorMessage');

    // 3. 폼(form)에서 'submit' 이벤트가 발생했을 때 실행될 함수를 연결
    loginForm.addEventListener('submit', function(event) {

        // 4. 폼의 기본 제출(새로고침) 동작을 막음
        event.preventDefault();

        // 5. 이전 에러 메시지가 있다면 숨김
        errorMessageDiv.classList.add('d-none');
        errorMessageDiv.textContent = '';

        // 6. 입력된 이메일과 비밀번호 값을 가져옴
        const email = emailInput.value;
        const password = passwordInput.value;

        // 7. API 호출 중임을 사용자에게 알리기 위해 버튼을 비활성화
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span role="status">로그인 중...</span>
        `;

        // 8. fetch API를 사용해 외부 API를 호출
        fetch(`${apiUrl}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            }),
            credentials: 'include'
        })
            .then(response => {
                // 9. 서버 응답(response)을 처리
                if (!response.ok) {
                    // 서버가 401(인증 실패) 등 에러를 반환한 경우
                    return response.text().then(message => {
                        throw new Error(message);
                    });
                }
                return response.json();
            })
            .then(data => {
                // 10. 게시글 목록이 나오는 메인 페이지로 이동
                window.location.replace('/pages/posts.html');

            })
            .catch(error => {
                // 11. 사용자에게 에러 메시지 표시
                errorMessageDiv.textContent = error.message;
                errorMessageDiv.classList.remove('d-none');
            })
            .finally(() => {
                // 12. API 호출이 성공하든 실패하든, 버튼을 다시 활성화
                submitButton.disabled = false;
                submitButton.innerHTML = '로그인';
            });
    });
});