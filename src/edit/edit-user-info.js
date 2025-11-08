// 사용자 정보를 수정하는 로직을 기술하는 곳
import { loadUserProfile } from "../getUserProfile.js";
import { uploadedImageId } from "../single-image-uploader.js";
import {showDangerChoiceModal, showConfirmModal} from "../modal.js";
import {callApi} from "../api/api.js";

let nicknameIsValid = false;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 현재 로그인한 사용자 프로필 정보를 로딩
    const userProfile = await loadUserProfile();

    // 2. 로딩한 사용자 프로필 정보를 컴포넌트에 주입
    const editUserInfoForm = document.getElementById('edit-user-info-form');
    const editUserInfoButton = document.getElementById('edit-user-info-button');
    const profileImagePreview = document.getElementById('profile-image-preview');
    const emailInput = document.getElementById('email');
    const nicknameInput = document.getElementById('nickname');
    const checkNicknameBtn = document.getElementById('checkNicknameBtn');
    const nicknameCheckMessage = document.getElementById('nickname-check-message');
    const profileImageDeleteBtb = document.getElementById('delete-profile-image-btn');
    const withdrawButton = document.getElementById('withdraw-button');

    new TypeIt("#header-text", {
        speed: 50,
        startDelay: 900,
    })
        .type('🙋‍♂️ 당신을 가장 잘 나타내는 모습으로 🙋‍♀️', { delay: 200 })
        .delete(30)
        .type("🧶이음이 🔒안전하게 💿반영할게요", { delay: 400 })
        .go();

    if (userProfile.payload.profileImageUrl) {
        profileImagePreview.src = userProfile.payload.profileImageUrl;
    }
    emailInput.value = userProfile.payload.email;
    nicknameInput.value = userProfile.payload.nickname;
    editUserInfoButton.disabled = true;
    checkNicknameBtn.disabled = true;

    nicknameInput.addEventListener('input', () => {
        checkNicknameBtn.disabled = editUserInfoButton.disabled = (nicknameInput.value === nickname);
        editUserInfoButton.disabled = (nicknameInput.value === nickname) || !nicknameIsValid;
    });

    let isImageDeleted = false;
    profileImageDeleteBtb.addEventListener('click', () => {
        profileImagePreview.src = 'https://placehold.co/150x150/EFEFEF/AAAAAA?text=Profile';
        isImageDeleted = true;
        editUserInfoButton.disabled = false;
    });

    // 3. 비교 연산을 위해 이전에 가지고 있던 값을 백업
    const curNickname = nicknameInput.value;

    // 회원정보 수정을 요청했을 때 다음 요청을 처리
    editUserInfoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // API 호출 중 버튼을 비활성화하여 중복 클릭 방지
        editUserInfoButton.disabled = true;
        editUserInfoButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span role="status">처리 중...</span>
        `;

        try {
            const requestBody = {};
            const newNickname = nicknameInput.value;
            if (curNickname !== newNickname) {
                requestBody.nickname = newNickname;
            }
            // 1순위: 사용자가 'X' 버튼을 눌렀다면 (isImageDeleted가 true)
            // (새 이미지를 업로드했다가 'X'를 눌렀어도 삭제가 우선)
            if (isImageDeleted) {
                requestBody.profileImageId = null;
                requestBody.deleteProfileImage = true; // 기존 이미지 삭제
            }
            // 2순위: 삭제 버튼을 안 눌렀고, *새로 업로드된 이미지*가 있다면
            // (imported 변수를 여기서 직접 참조)
            else if (uploadedImageId !== null) {
                requestBody.profileImageId = uploadedImageId;
                // 기존 이미지가 있었을 경우에만 '삭제' 플래그를 true로 (덮어쓰기)
                requestBody.deleteProfileImage = (userProfile.payload.imageId !== null);
            }
            // 3순위: (else) 삭제도 안 했고, 새로 업로드한 이미지도 없음
            // -> 아무것도 안 보냄 (이미지 변경 없음)
            const response = await callApi(`/members/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                credentials: 'include',
            });
            const data = await response.json();
            if (data.isSuccess) {
                await showConfirmModal('회원정보 수정 완료', '회원정보가 수정 되었습니다.');
                window.location.reload(); // 업데이트 된 정보 확인을 위해 페이지 새로고침
            } else {
                await showConfirmModal('회원정보 수정 실패', '회원정보 수정에 실패했습니다. 입력 정보를 확인해주세요.');
            }
        } catch (error) {
            console.error(error);
            await showConfirmModal('회원정보 수정 실패', '잠시 후 다시 시도해주세요.');
        } finally {
            editUserInfoButton.disabled = false;
            editUserInfoButton.innerHTML = '회원정보 수정';
        }
    });

    withdrawButton.addEventListener('click', async (event) => {
        if (!(await showDangerChoiceModal('회원탈퇴', '회원탈퇴는 되돌릴 수 없습니다. 정말 탈퇴하시겠습니까?\n그 동안 작성하신 게시글, 댓글은 탈퇴 후에도 익명으로 유지됩니다.'))) return;
        // API 호출 중 버튼을 비활성화하여 중복 클릭 방지
        event.preventDefault();
        withdrawButton.disabled = true;
        withdrawButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span role="status">탈퇴 중...</span>
        `;
        const withdrawResponse = await callApi(`/members/me`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const withdrawData = await withdrawResponse.json();
        if (withdrawData.isSuccess) {
            await showConfirmModal('회원탈퇴 완료', '지금까지 커뮤니티를 이용해주셔서 감사합니다.');
            window.location.replace(`/index.html`);
        } else {
            const errorText = await withdrawData.message;
            await showConfirmModal('회원탈퇴 실패', errorText || '잠시 후 다시 시도해주세요.');
        }
        editPostButton.disabled = false;
        editPostButton.innerHTML = '탈퇴하기';
    });

    // 2. '닉네임 확인' 버튼에 클릭 이벤트 리스너를 추가
    checkNicknameBtn.addEventListener('click', async () => {
        const newNickname = nicknameInput.value;
        // 3. 간단한 닉네임 형식 유효성 검사
        if (!newNickname || !/^\S{1,10}$/.test(newNickname)) {
            nicknameIsValid = false;
            editUserInfoButton.disabled = !nicknameIsValid;
            displayMessage('닉네임은 10자 이내로 작성되어야 하며 띄어쓰기를 가질 수 없습니다.', false);
            return;
        }
        // nickname valid 여부에 대한 변수를 도입해서 처리하는 것이 이 문제의 해결 측면에서는 유리할 것으로 보인다.
        try {
            // 4. API 호출
            const response = await callApi(`/members/nicknames/${newNickname}`);
            const data = await response.json();
            // 5. API 응답 결과에 따라 메시지를 표시
            if (data.isSuccess) { // 200 OK 응답 (사용 가능)
                nicknameIsValid = true;
                editUserInfoButton.disabled = !nicknameIsValid;
                displayMessage('사용 가능한 닉네임입니다.', true);
            } else if (response.status === 409) { // 409 Conflict 응답 (이미 사용 중)
                nicknameIsValid = false;
                editUserInfoButton.disabled = !nicknameIsValid;
                displayMessage('이미 사용 중인 닉네임입니다.', false);
            } else { // 그 외 서버 에러
                nicknameIsValid = false;
                editUserInfoButton.disabled = !nicknameIsValid;
                displayMessage('확인 중 오류가 발생했습니다.', false);
            }
        } catch (error) {
            // 네트워크 오류 등 fetch 자체가 실패한 경우
            nicknameIsValid = false;
            editUserInfoButton.disabled = !nicknameIsValid;
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

    document.addEventListener('profileImageUploaded', (e) => {
        isImageDeleted = false;
        editUserInfoButton.disabled = false;
    });

});