document.addEventListener('DOMContentLoaded', () => {
    const profileImageUrl = sessionStorage.getItem('profileImageUrl');
    if (profileImageUrl) {
        try {
            const profileImageElement = document.getElementById('user-profile-image');
            if (profileImageElement) {
                profileImageElement.src = profileImageUrl;
            }
        } catch (error) {
            console.error('sessionStorage의 사용자 정보를 파싱하는 데 실패했습니다:', error);
        }
    } else {
        console.log('sessionStorage에 사용자 정보가 없습니다.');
    }
});