import { uploadedImageId, clearUploadedImageId } from "../single-image-uploader.js";
import {showConfirmModal} from "../modal.js";
import {callApi} from "../api/api.js";

document.addEventListener('DOMContentLoaded', () => {

    const signupForm = document.getElementById('signup-form');
    const signupButton = document.getElementById('signup-button');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const nicknameInput = document.getElementById('nickname');
    const profileImageDeleteBtb = document.getElementById('delete-profile-image-btn');
    const profileImagePreview = document.getElementById('profile-image-preview');

    new TypeIt("#header-text", {
        speed: 50,
        startDelay: 900,
    })
        .type("처음은 언제나 설레니까 🧶", { delay: 400 })
        .delete(21, { delay: 400 })
        .type("🧶이음이 🔒안전하게 💿보관할게요", { delay: 400 })
        .go();

    // 프로필 이미지 제거 버튼 이벤트
    profileImageDeleteBtb.addEventListener('click', (e) => {
        profileImagePreview.src = 'https://placehold.co/150x150/EFEFEF/AAAAAA?text=Profile';
        clearUploadedImageId();
    });

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
            const response = await callApi(`/members`, {
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
            });
            const data = await response.json();
            // 3. 회원가입 요청 결과에 따른 분기처리 수행
            if (data.isSuccess) {
                await showConfirmModal('회원가입 완료', '회원가입을 완료했습니다. 로그인 페이지로 이동합니다.');
                window.location.replace('/index.html');
            } else {
                await showConfirmModal('회원가입 실패', '회원가입에 실패했습니다. 입력 정보를 확인해주세요.');
            }
        } catch (error) {
            console.log(error);
            await showConfirmModal('회원가입 실패', '잠시 후 다시 시도해주세요.');
        } finally {
            signupButton.disabled = false;
            signupButton.innerHTML = '회원가입';
        }
    });

});