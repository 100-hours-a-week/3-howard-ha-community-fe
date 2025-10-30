import {callApi} from "./api/api.js";

export async function loadUserProfile() {
    try {
        const response = await callApi('/members/me', { method: 'GET' })
        if (response.ok) {
            return await response.json();
        } else {
            return null;
        }
    } catch (error) {
        console.error('Failed to load user profile:', error);
        return null;
    }
}