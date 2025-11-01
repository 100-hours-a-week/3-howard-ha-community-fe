import { validationStatus, updateSignupButtonState } from "./validation-status.js";
const apiUrl = import.meta.env.VITE_API_URL;

document.addEventListener('DOMContentLoaded', () => {

    // 1. 필요한 HTML 요소들을 선택
    const emailInput = document.getElementById('email');
    const checkEmailBtn = document.getElementById('checkEmailBtn');
    const emailCheckMessage = document.getElementById('email-check-message');

    // 2. '이메일 확인' 버튼에 클릭 이벤트 리스너를 추가
    checkEmailBtn.addEventListener('click', async () => {
        const email = emailInput.value;

        // 3. 간단한 이메일 형식 유효성 검사
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            validationStatus.email = false;
            updateSignupButtonState();
            displayMessage('올바른 이메일 형식을 입력해주세요.', false);
            return;
        }

        try {
            // 4. API 호출
            const response = await fetch(`${apiUrl}/members/emails/${email}`);
            const data = await response.json();
            // 5. API 응답 결과에 따라 메시지를 표시
            if (data.isSuccess) { // 200 OK 응답 (사용 가능)
                validationStatus.email = true;
                updateSignupButtonState();
                displayMessage('사용 가능한 이메일입니다.', true);
            } else if (response.status === 409) { // 409 Conflict 응답 (이미 사용 중)
                validationStatus.email = false;
                updateSignupButtonState();
                displayMessage('이미 사용 중인 이메일입니다.', false);
            } else { // 그 외 서버 에러
                validationStatus.email = false;
                updateSignupButtonState();
                displayMessage('확인 중 오류가 발생했습니다.', false);
            }

        } catch (error) {
            // 네트워크 오류 등 fetch 자체가 실패한 경우
            validationStatus.email = false;
            updateSignupButtonState();
            console.error('Email check error:', error);
            displayMessage('오류가 발생했습니다. 다시 시도해주세요.', false);
        }
    });

    // 6. 결과를 텍스트로 표시하고, 성공/실패에 따라 색상을 변경하는 함수
    function displayMessage(message, isSuccess) {
        // 메시지 텍스트 설정
        emailCheckMessage.textContent = message;
        // Bootstrap의 색상 클래스를 제어
        emailCheckMessage.classList.remove('text-success', 'text-danger');
        emailCheckMessage.classList.add(isSuccess ? 'text-success' : 'text-danger');
    }
});