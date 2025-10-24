import {showConfirmModal} from "../modal.js";
const apiUrl = import.meta.env.VITE_API_URL;

document.addEventListener('DOMContentLoaded', () => {

    const editPasswordForm = document.getElementById('edit-password-form');
    const editPasswordButton = document.getElementById('edit-password-button');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');

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
            const response = await fetch(`${apiUrl}/members/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                }),
                credentials: 'include'
            })

            // 3. 비밀번호 수정 요청 결과에 따른 분기처리 수행
            if (response.status === 200) {
                const response = await fetch(`${apiUrl}/auth`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                // 비밀번호 수정 건의 경우 로그아웃 처리
                if (response.ok) {
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