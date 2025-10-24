const apiUrl = import.meta.env.VITE_API_URL;

export async function loadUserProfile() {
    try {
        const response = await fetch(`${apiUrl}/members/me?`,
            {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
            }
        );
        if (response.status === 401) {
            window.location.replace('/index.html');
        } else {
            return await response.json();
        }
    } catch (error) {
        console.error('Failed to load user profile:', error);
        return null;
    }
}