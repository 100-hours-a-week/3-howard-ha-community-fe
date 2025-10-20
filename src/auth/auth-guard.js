(async function() {
    const profileImageUrl = sessionStorage.getItem('profileImageUrl');
    if (profileImageUrl) {
        return;
    }
    try {
        const response = await fetch('http://localhost:8080/members/me', {credentials: 'include'});
        if (!response.ok) {
            return new Error('Not authenticated');
        }
        const { email, nickname, profileImageUrl } = await response.json();
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('nickname', nickname);
        sessionStorage.setItem('profileImageUrl', profileImageUrl);
    } catch (error) {
        window.location.replace('/index.html');
    }
})();