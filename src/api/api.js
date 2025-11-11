const apiUrl = import.meta.env.VITE_API_URL;
const REFRESH_URL = '/auth/refresh';

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

    let response = await fetch(`${apiUrl}${endPoint}`, fetchOptions);

    if (response.status === 401) {
        try {
            if (!refreshingTokenPromise) {
                refreshingTokenPromise = refresh(); // refresh() 함수가 Promise를 반환
                refreshingTokenPromise.finally(() => {
                    refreshingTokenPromise = null;
                });
            }
            await refreshingTokenPromise;
            response = await fetch(`${apiUrl}${endPoint}`, fetchOptions);
        } catch (error) {
            throw new Error('인증 시간이 만료되었습니다. 다시 로그인하세요.');
        }
    }
    return response;
}

/**
 * 현재 진행 중인 토큰 갱신 요청을 저장하는 Promise 변수.
 * null 이면, 갱신 중인 요청이 없다는 의미입니다.
 */
let refreshingTokenPromise = null;

async function refresh() {
    try {
        const response = await fetch(`${apiUrl}${REFRESH_URL}`, {
            method: 'POST',
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            return data.accessToken;
        }
    } catch (error) {
        throw error;
    }
}