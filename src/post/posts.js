import {callApi} from "../api/api.js";

document.addEventListener('DOMContentLoaded', () => {

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const formattedDate = `${year}년 ${month}월 ${day}일`;
    new TypeIt("#header-text", {
        speed: 50,
        startDelay: 900,
    })
        .type(formattedDate)
        .type(' 오늘의 🧶 이음', { delay: 200 })
        .go();

    const postListContainer = document.getElementById('post-list-container');
    const observerTarget = document.getElementById('observer-target');
    let isLoading = false; // 현재 데이터를 불러오는 중인지 확인하는 플래그
    let nextCursor = null; // 다음 페이지를 요청할 때 사용할 커서
    const pageSize = 10; // 한 번에 불러올 게시글 수

    /**
     * 게시글 목록을 서버에서 가져와 화면에 렌더링하는 함수
     * @param {number|null} cursor - 다음 페이지를 요청하기 위한 커서 ID
     */
    async function fetchPosts(cursor) {
        if (isLoading) return; // 이미 로딩 중이면 중복 요청 방지
        isLoading = true;
        observerTarget.querySelector('.spinner-border').style.display = 'block'; // 스피너 표시

        try {
            // 1. API URL 구성
            let url = `/posts?size=${pageSize}&cursor=${cursor !== null ? cursor : 0}`;

            // 2. API 호출
            const response = await callApi(url, {
                credentials: 'include',
            });
            const data = await response.json();
            if (!data.isSuccess) {
                throw new Error('게시글을 불러오는 데 실패했습니다.');
            }
            const posts = data.payload;

            // 3. 받아온 데이터로 HTML 요소 생성 및 추가
            posts.forEach(post => {
                const postElement = createPostElement(post);
                postListContainer.appendChild(postElement);
            });

            // 4. 다음 요청을 위한 커서 업데이트
            if (posts.length > 0) {
                // 마지막 게시글의 ID를 다음 커서로 사용
                nextCursor = posts[posts.length - 1].postId;
            }

            // 5. 더 이상 불러올 게시글이 없는 경우 처리
            if (posts.length < pageSize) {
                observer.unobserve(observerTarget); // 관찰 중지
                observerTarget.innerHTML = '<p class="text-muted">더 이상 게시글이 없습니다.</p>';
            }

        } catch (error) {
            observerTarget.innerHTML = `<p class="text-danger">${error.message}</p>`;
        } finally {
            isLoading = false; // 로딩 상태 해제
            const spinner = observerTarget.querySelector('.spinner-border');
            if (spinner) spinner.style.display = 'none'; // 스피너 숨기기
        }
    }

    /**
     * 게시글 데이터 객체를 받아 HTML 요소를 생성하는 함수
     * @param {object} post - 게시글 데이터
     * @returns {HTMLAnchorElement} - 생성된 <a> 태그 요소
     */
    function createPostElement(post) {
        const postLink = document.createElement('a');
        postLink.href = `/pages/post-detail.html?id=${post.postId}`;
        postLink.className = 'post-item text-decoration-none text-dark';

        postLink.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h5 class="mb-1">${post.title}</h5>
                    <div class="small text-muted">
                        <span>좋아요 ${post.likeCount}</span> ∙ 
                        <span>댓글 ${post.commentCount}</span> ∙ 
                        <span>조회수 ${post.viewCount}</span>
                    </div>
                </div>
                <small class="text-muted">${new Date(post.createdAt).toLocaleDateString()}</small>
            </div>
            <div class="d-flex align-items-center mt-3">
                <img src="${post.writer.profileImageUrl || 'https://placehold.co/32x32/6c757d/white?text=UN'}" alt="author" class="author-profile-img">
                <span class="ms-2 small">${post.writer.nickname}</span>
            </div>
        `;
        return postLink;
    }

    // --- Intersection Observer 설정 ---

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            // 타겟 요소가 화면에 보이고, 로딩 중이 아닐 때 다음 페이지 로드
            if (entry.isIntersecting && !isLoading) {
                fetchPosts(nextCursor);
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, {
        root: null, // 뷰포트를 기준으로
        rootMargin: '0px',
        threshold: 0.1 // 타겟이 10% 보이면 실행
    });

    // --- 초기화 실행 ---
    observer.observe(observerTarget); // 타겟 요소 관찰 시작
});
