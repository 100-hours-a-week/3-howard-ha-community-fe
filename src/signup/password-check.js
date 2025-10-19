import { validationStatus, updateSignupButtonState } from "./validation-status.js";

document.addEventListener('DOMContentLoaded', () => {

    // 1. 필요한 HTML 요소들을 선택
    const passwordInput = document.getElementById('password');
    const passwordCheckInput = document.getElementById('passwordCheck');
    const passwordCheckMessage = document.getElementById('password-check-message');
    const passwordCompareMessage = document.getElementById('password-compare-message');

    // 3. 간단한 비밀번호 형식 유효성 검사
    passwordInput.addEventListener('input', async () => {
        const password = passwordInput.value;
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,20}$/.test(password)) {
            validationStatus.password = false;
            updateSignupButtonState();
            displayMessage(passwordCheckMessage, '비밀번호는 8~20자의 영문 대/소문자, 숫자, 특수문자(!@#$%^&*())를 사용해야 합니다.', false);
        } else {
            validationStatus.password = true;
            updateSignupButtonState();
            displayMessage(passwordCheckMessage, '유효한 비밀번호 입니다.', true);
        }
    });

    // 4. 비밀번호 확인 절차
    passwordCheckInput.addEventListener('input', async () => {
        const password = passwordInput.value;
        const passwordCheck = passwordCheckInput.value;
        if (password !== passwordCheck) {
            validationStatus.passwordCompare = false;
            updateSignupButtonState();
            displayMessage(passwordCompareMessage, '비밀번호가 일치하지 않습니다.', false);
        } else {
            validationStatus.passwordCompare = true;
            updateSignupButtonState();
            displayMessage(passwordCompareMessage, '비밀번호가 일치합니다.', true);
        }
    });

    // 5. 결과를 텍스트로 표시하고, 성공/실패에 따라 색상을 변경하는 함수
    function displayMessage(element, message, isSuccess) {
        // 메시지 텍스트 설정
        element.textContent = message;
        // Bootstrap의 색상 클래스를 제어
        element.classList.remove('text-success', 'text-danger');
        element.classList.add(isSuccess ? 'text-success' : 'text-danger');
    }
});