document.addEventListener('DOMContentLoaded', () => {

    const logoutButton = document.getElementById('logout-button');

    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault();

            try {
                const response = await fetch('http://localhost:8080/auth', {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    sessionStorage.removeItem('email');
                    sessionStorage.removeItem('nickname');
                    sessionStorage.removeItem('profileImageUrl');
                    alert('로그아웃 되었습니다.');
                    window.location.replace('/index.html');
                } else {
                    alert('로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.');
                }
            } catch (error) {
                alert('로그아웃 중 오류가 발생했습니다. 서버 연결을 확인해주세요.');
            }
        });
    }
});