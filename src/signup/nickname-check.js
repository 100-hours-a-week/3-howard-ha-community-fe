import { validationStatus, updateSignupButtonState } from "./validation-status.js";
import {callApi} from "../api/api.js";

document.addEventListener('DOMContentLoaded', () => {

    // 1. 필요한 HTML 요소들을 선택
    const nicknameInput = document.getElementById('nickname');
    const checkNicknameBtn = document.getElementById('checkNicknameBtn');
    const nicknameCheckMessage = document.getElementById('nickname-check-message');

    // 2. '닉네임 확인' 버튼에 클릭 이벤트 리스너를 추가
    checkNicknameBtn.addEventListener('click', async () => {
        const nickname = nicknameInput.value;

        // 3. 간단한 닉네임 형식 유효성 검사
        if (!nickname || !/^\S{1,10}$/.test(nickname)) {
            validationStatus.nickname = false;
            updateSignupButtonState();
            displayMessage('닉네임은 10자 이내로 작성되어야 하며 띄어쓰기를 가질 수 없습니다.', false);
            return;
        }

        try {
            // 4. API 호출
            const response = await callApi(`${apiUrl}/members/nicknames/${nickname}`);
            const data = await response.json();
            // 5. API 응답 결과에 따라 메시지를 표시
            if (data.isSuccess) { // 200 OK 응답 (사용 가능)
                validationStatus.nickname = true;
                updateSignupButtonState();
                displayMessage('사용 가능한 닉네임입니다.', true);
            } else if (response.status === 409) { // 409 Conflict 응답 (이미 사용 중)
                validationStatus.nickname = false;
                updateSignupButtonState();
                displayMessage('이미 사용 중인 닉네임입니다.', false);
            } else { // 그 외 서버 에러
                validationStatus.nickname = false;
                updateSignupButtonState();
                displayMessage('확인 중 오류가 발생했습니다.', false);
            }

        } catch (error) {
            // 네트워크 오류 등 fetch 자체가 실패한 경우
            validationStatus.nickname = false;
            updateSignupButtonState();
            displayMessage('오류가 발생했습니다. 다시 시도해주세요.', false);
        }
    });

    // 6. 결과를 텍스트로 표시하고, 성공/실패에 따라 색상을 변경하는 함수
    function displayMessage(message, isSuccess) {
        // 메시지 텍스트 설정
        nicknameCheckMessage.textContent = message;
        // Bootstrap의 색상 클래스를 제어
        nicknameCheckMessage.classList.remove('text-success', 'text-danger');
        nicknameCheckMessage.classList.add(isSuccess ? 'text-success' : 'text-danger');
    }
});