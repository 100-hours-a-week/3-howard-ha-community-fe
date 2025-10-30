const apiUrl = import.meta.env.VITE_API_URL;
const REFRESH_URL = '/auth/refresh';

/**
 * refresh 요청을 보내 access token 재발급을 요청
 * -> 요청에 대한 재발급은 Cookie로 전달됨
 */
async function refresh() {
    try {
        const response = await fetch(`${apiUrl}${REFRESH_URL}`, {
            method: 'POST',
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            return data.accessToken;
        } else {
            throw new Error('Refresh token failed');
        }
    } catch (error) {
        throw new Error('인증 시간이 만료되었습니다. 다시 로그인하세요.');
    }
}

/**
 * API를 호출하고, 그 결과를 반환함
 */
export async function callApi(endPoint, options = {}) {

    const {
        method = 'GET',
        headers,
        body,
        ...otherOptions
    } = options;

    const newHeaders = new Headers(headers || {});
    const fetchOptions = {
        method: method,
        headers: newHeaders,
        body: body,
        ...otherOptions,
        credentials: 'include'
    };

    if (method === 'GET' || method === 'HEAD') {
        delete fetchOptions.body;
    }

    // 1. API 1차 호출 시도
    let response = await fetch(`${apiUrl}${endPoint}`, fetchOptions);
    // 2. access token 이 만료되어 권한이 없는 경우
    if (response.status === 401) {
        try {
            // 2-1. refresh 를 호출하여 access token 재발급 요청
            await refresh();
            // 2-2. API  2차 호출시도
            response = await fetch(`${apiUrl}${endPoint}`, fetchOptions);
        } catch (error) {
            throw error;
        }
    }
    return response;
}