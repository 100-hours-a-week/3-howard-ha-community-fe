import {showConfirmModal} from "../modal.js";
import {callApi} from "../api/api.js";
import {loadUserProfile} from "../getUserProfile.js";

document.addEventListener('DOMContentLoaded', () => {

    const editPasswordForm = document.getElementById('edit-password-form');
    const editPasswordButton = document.getElementById('edit-password-button');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');

    new TypeIt("#header-text", {
        speed: 50,
        startDelay: 900,
    })
        .type('당신과의 🧶이음을 더 🔒견고하게', { delay: 200 })
        .go();

    // 비밀번호 수정 폼 제출
    editPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // API 호출 중 버튼을 비활성화하여 중복 클릭 방지
        editPasswordButton.disabled = true;
        editPasswordButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span role="status">처리 중...</span>
        `;

        try {
            // 1. 비밀번호 수정에 필요한 데이터 구성
            const currentPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;

            // 2. 비밀번호 수정 API 호출
            const response = await callApi(`/members/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                }),
                credentials: 'include'
            });
            const data = await response.json();

            // 3. 비밀번호 수정 요청 결과에 따른 분기처리 수행
            if (data.isSuccess) {
                const logoutResponse = await callApi(`/auth`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                const logoutData = await logoutResponse.json();
                // 비밀번호 수정 건의 경우 로그아웃 처리
                if (logoutData.isSuccess) {
                    await showConfirmModal('비밀번호 수정완료', '비밀번호가 수정되었습니다. 다시 로그인해주세요.');
                    window.location.replace('/index.html');
                }
            } else {
                await showConfirmModal('비밀번호 수정실패', '비밀번호 수정에 실패했습니다. 입력 정보를 확인해주세요.');
            }
        } catch (error) {
            await showConfirmModal('비밀번호 수정실패', '잠시 후 다시 시도해주세요.');
        } finally {
            editPasswordButton.disabled = false;
            editPasswordButton.innerHTML = '비밀번호 수정하기';
        }
    });

});

/* 로그인 정보가 존재하지 않는 경우 로그인 페이지로 이동처리 */
(async function checkAuthOnPageLoad() {
    try {
        const userProfile = await loadUserProfile();
        if (userProfile) window.location.replace("/pages/posts.html");
    } catch (error) {
        // 아무것도 하지 않음
    }
})();