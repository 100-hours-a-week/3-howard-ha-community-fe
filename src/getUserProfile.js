export async function loadUserProfile() {
    try {
        const response = await fetch('http://localhost:8080/members/me?',
            {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
            }
        );
        if (!response.ok) {
            return new Error('Not authenticated');
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to load user profile:', error);
        return null;
    }
}