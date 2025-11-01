import {loadUserProfile} from "../getUserProfile.js";
import {showConfirmModal} from "../modal.js";
import {callApi} from "../api/api.js";

document.addEventListener('DOMContentLoaded', async () => {
    const placeholders = document.querySelectorAll('[data-include]');
    const loadPromises = Array.from(placeholders).map(async (placeholder) => {
        const file = placeholder.getAttribute('data-include');
        try {
            const response = await fetch(file);
            if (!response.ok) {
                throw new Error(`Could not load ${file}: ${response.statusText}`);
            }
            const html = await response.text();
            placeholder.innerHTML = html;
        } catch (error) {
            console.error(error);
            placeholder.innerHTML = `<p style="color:red;">Error loading content.</p>`;
        }
    });
    await Promise.all(loadPromises); // 모든 fetch가 완료될 때까지 대
    const userProfile = await loadUserProfile();
    const userProfileImg = document.getElementById('user-profile-image');
    if (userProfile.profileImageUrl) {
        userProfileImg.src = userProfile.profileImageUrl;
    }
    setupLogoutEvent(); // 7. 로그아웃 이벤트 등록
});

// 로그아웃 이벤트 등록
function setupLogoutEvent() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault();

            try {
                const response = await callApi(`/auth`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                const data = await response.json();
                console.log(data);
                if (data.isSuccess) {
                    await showConfirmModal('로그아웃', '로그아웃 되었습니다.');
                    window.location.replace('/index.html');
                } else {
                    await showConfirmModal('로그아웃', '로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.');
                }
            } catch (error) {
                await showConfirmModal('로그아웃', '로그아웃 중 오류가 발생했습니다. 서버 연결을 확인해주세요.');
            }
        });
    }
}