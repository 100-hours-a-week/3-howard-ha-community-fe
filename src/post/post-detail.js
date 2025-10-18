document.addEventListener('DOMContentLoaded', () => {

    // 2. URL에서 게시글 ID를 추출합니다.
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        alert('잘못된 접근입니다.');
        window.location.href = '/pages/posts.html'; // 게시글 목록 페이지로 리다이렉트
        return;
    }

    // --- 데이터 렌더링 함수 ---

    /** 게시글 데이터를 HTML에 채워넣는 함수 */
    function renderPost(post) {
        document.getElementById('post-title').textContent = post.title;
        document.getElementById('author-profile-image').src = post.writer.profileImageUrl || 'https://placehold.co/48x48/6c757d/white?text=A';
        document.getElementById('author-nickname').textContent = post.writer.nickname;
        document.getElementById('post-created-at').textContent = new Date(post.createdAt).toLocaleString();
        document.getElementById('post-content').innerHTML = post.content.replace(/\n/g, '<br>'); // 줄바꿈 처리

        // 좋아요, 조회수, 댓글 수 업데이트
        document.getElementById('like-count').textContent = post.likeCount;
        document.getElementById('view-count').textContent = post.viewCount;
        document.getElementById('comment-count').textContent = post.commentCount;

        // 게시글 이미지 렌더링
        const carouselInner = document.getElementById('carousel-inner-container');
        if (post.postImages && post.postImages.length > 0) {
            carouselInner.innerHTML = ''; // 플레이스홀더 제거
            post.postImages.forEach((image, index) => {
                const item = document.createElement('div');
                item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
                item.innerHTML = `<img src="${image.postImageUrl}" class="d-block w-100" alt="Post image ${index + 1}">`;
                carouselInner.appendChild(item);
            });
        } else {
            // 이미지가 없으면 캐러셀 숨기기
            document.getElementById('post-images-carousel').style.display = 'none';
        }

        // 현재 로그인한 사용자와 작성자가 같으면 수정/삭제 버튼 표시 (sessionStorage 활용)
        const email = sessionStorage.getItem('email');
        if (email) {
            if (email === post.writer.email) {
                const controls = document.getElementById('author-controls');
                controls.innerHTML = `
                    <a href="#" class="btn btn-outline-secondary btn-sm">수정</a>
                    <button id="delete-post-btn" class="btn btn-outline-danger btn-sm">삭제</button>
                `;
                // 삭제 버튼에 이벤트 리스너 추가
                document.getElementById('delete-post-btn').addEventListener('click', handleDeletePost);
            }
        }
    }

    /** 댓글 목록을 HTML에 채워넣는 함수 */
    function renderComments(comments) {
        const commentListContainer = document.getElementById('comment-list-container');
        commentListContainer.innerHTML = ''; // 기존 댓글 목록 초기화

        comments.forEach(comment => {
            const commentEl = document.createElement('div');
            commentEl.className = 'd-flex mb-4';
            commentEl.innerHTML = `
                <img src="${comment.author.profileImageUrl || 'https://placehold.co/40x40/adb5bd/white?text=C'}" class="comment-profile-img mt-1" alt="Commenter">
                <div class="ms-3 w-100">
                    <div class="d-flex align-items-center">
                        <span class="fw-bold">${comment.author.nickname}</span>
                        <span class="text-muted small ms-3">${new Date(comment.createdAt).toLocaleString()}</span>
                        <!-- TODO: 댓글 수정/삭제 버튼 로직 추가 -->
                    </div>
                    <p class="mt-1 mb-0">${comment.content}</p>
                </div>
            `;
            commentListContainer.appendChild(commentEl);
        });
    }

    // --- API 호출 함수 ---

    /** 게시글 상세 정보 가져오기 */
    async function fetchPostDetail() {
        try {
            const response = await fetch(`http://localhost:8080/posts/${postId}`, { credentials: 'include' });
            if (!response.ok) throw new Error('게시글을 불러오는 데 실패했습니다.');
            const post = await response.json();
            renderPost(post);
        } catch (error) {
            alert(error.message);
        }
    }

    /** 댓글 목록 가져오기 */
    async function fetchComments() {
        try {
            const response = await fetch(`/api/posts/${postId}/comments`);
            if (!response.ok) throw new Error('댓글을 불러오는 데 실패했습니다.');
            const comments = await response.json();
            renderComments(comments);
        } catch (error) {
            console.error(error);
        }
    }

    /** 게시글 삭제 처리 */
    async function handleDeletePost() {
        if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

        try {
            const response = await fetch(`http://localhost:8080/posts/${postId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                alert('게시글이 삭제되었습니다.');
                window.location.href = '/pages/posts.html';
            } else {
                throw new Error('게시글 삭제에 실패했습니다.');
            }
        } catch (error) {
            alert(error.message);
        }
    }

    /** 댓글 등록 처리 */
    const commentForm = document.getElementById('comment-form');
    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const commentTextarea = document.getElementById('comment-textarea');
        const content = commentTextarea.value.trim();

        if (!content) return;

        try {
            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content: content })
            });

            if (response.status === 201) {
                commentTextarea.value = ''; // 입력창 비우기
                await fetchComments(); // 댓글 목록 새로고침
            } else {
                throw new Error('댓글 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });

    fetchPostDetail();
    // fetchComments();
});
