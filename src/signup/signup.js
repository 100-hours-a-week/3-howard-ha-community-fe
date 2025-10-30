import { uploadedImageId } from "../single-image-uploader.js";
import {showConfirmModal} from "../modal.js";
import {callApi} from "../api/api.js";

document.addEventListener('DOMContentLoaded', () => {

    const signupForm = document.getElementById('signup-form');
    const signupButton = document.getElementById('signup-button');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const nicknameInput = document.getElementById('nickname');

    // 최종 회원가입 폼 제출
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // API 호출 중 버튼을 비활성화하여 중복 클릭 방지
        signupButton.disabled = true;
        signupButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span role="status">처리 중...</span>
        `;

        try {
            // 1. 회원가입 요청에 필요한 데이터 구성
            const email = emailInput.value;
            const password = passwordInput.value;
            const nickname = nicknameInput.value;

            // 2. 회원가입 API 호출
            const signupResponse = await callApi(`/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    nickname: nickname,
                    profileImageId: uploadedImageId
                }),
                requireAuth: true
            })

            // 3. 회원가입 요청 결과에 따른 분기처리 수행
            if (signupResponse.status === 201) {
                await showConfirmModal('회원가입 완료', '회원가입을 완료했습니다. 로그인 페이지로 이동합니다.');
                window.location.replace('/index.html');
            } else {
                await showConfirmModal('회원가입 실패', '회원가입에 실패했습니다. 입력 정보를 확인해주세요.');
            }
        } catch (error) {
            await showConfirmModal('회원가입 실패', '잠시 후 다시 시도해주세요.');
        } finally {
            signupButton.disabled = false;
            signupButton.innerHTML = '회원가입';
        }
    });

});