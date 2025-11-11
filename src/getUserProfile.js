import {callApi} from "./api/api.js";

export async function loadUserProfile() {
    try {
        const response = await callApi('/members/me', {
            method: 'GET',
            credentials: 'include',
        })
        const data = await response.json();
        if (data.isSuccess) {
            return data;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}