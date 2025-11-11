import {loadUserProfile} from "../getUserProfile.js";

/* 로그인 정보가 남아있는 경우 로그인 절차없이 메인 페이지로 이동처리 */
(async function checkGuestOnPageLoad() {
    try {
        const userProfile = await loadUserProfile();
        if (userProfile) {
            window.location.replace("/pages/posts.html");
        }
    } catch (error) {
        // 아무것도 하지 않음
    }
})();