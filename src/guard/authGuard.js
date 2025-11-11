import {loadUserProfile} from "../getUserProfile.js";
import {showConfirmModal} from "../modal.js";

/* 로그인 정보가 없는 경우, 로그인 페이지로 이동처리 */
(async function checkAuthOnPageLoad() {
    try {
        const userProfile = await loadUserProfile();
        if (!userProfile) {
            await showConfirmModal("잘못된 접근", "인증정보가 존재하지 않거나 만료되었습니다. 로그인 해주세요.");
            window.location.replace("/index.html");
        }
    } catch (error) {
        // 아무것도 하지 않음
    }
})();