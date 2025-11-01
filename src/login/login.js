import {callApi} from "../api/api.js";

// 1. DOM이 모두 로드된 후에 스크립트가 실행되도록 구성
document.addEventListener('DOMContentLoaded', function() {

    // 2. 필요한 HTML 요소들을 선택
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const errorMessageDiv = document.getElementById('errorMessage');

    // 3. 폼(form)에서 'submit' 이벤트가 발생했을 때 실행될 함수를 연결
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        errorMessageDiv.classList.add('d-none');
        errorMessageDiv.textContent = '';

        const email = emailInput.value;
        const password = passwordInput.value;

        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span role="status">로그인 중...</span>
        `;

        const response = await callApi('/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            }),
            credentials: 'include'
        });

        const data = await response.json();
        if (data.isSuccess) {
            window.location.replace('/pages/posts.html');
        } else {
            errorMessageDiv.textContent = data.message;
            errorMessageDiv.classList.remove('d-none');
        }
        submitButton.disabled = false;
        submitButton.innerHTML = '로그인';
    });
});