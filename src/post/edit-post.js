import { initializeImageUploader } from '../multi-image-uploader.js';
import {showConfirmModal} from "../modal.js";
const apiUrl = import.meta.env.VITE_API_URL;

document.addEventListener('DOMContentLoaded', async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const editPostForm = document.getElementById('edit-post-form');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const editPostButton = document.getElementById('edit-post-button');
    const errorMessageDiv = document.getElementById('form-error-message');

    // 1. 기존 게시글 정보들을 form에 주입
    const postDetail = await getPostDetail(postId);
    const beforeTitle = postDetail.title;
    const beforeContent = postDetail.content;
    titleInput.value = beforeTitle;
    contentInput.value = beforeContent;

    // 2. uploader 초기화 시 'postDetail.postImages' 배열을 주입
    const uploader = initializeImageUploader({
        inputId: 'imageInput',
        containerId: 'imagePreviewContainer',
        addButtonSelector: 'label[for="imageInput"]',
        maxFiles: 5,
    }, postDetail.postImages);

    const previewContainer = document.getElementById('imagePreviewContainer');

    const updateMainImageBadge = () => {
        // 1. 모든 기존 '대표' 배지를 찾아서 제거 (중복 방지)
        const existingBadges = previewContainer.querySelectorAll('.main-image-badge');
        existingBadges.forEach(badge => badge.remove());

        // 2. 미리보기 컨테이너의 첫 번째 이미지 카드(.image-card) 탐색
        const firstImageCard = previewContainer.querySelector('.image-card:first-child');

        // 3. 첫 번째 이미지 카드가 존재하면 '대표' 배지를 생성하여 추가
        if (firstImageCard) {
            const badge = document.createElement('span');
            // Bootstrap 배지 클래스와 사용자 정의 위치 클래스를 함께 적용
            badge.className = 'badge bg-primary main-image-badge';
            badge.textContent = '대표';
            // .image-card 요소의 맨 앞에 배지를 추가합니다.
            firstImageCard.prepend(badge);
        }
    };

    updateMainImageBadge();
    const observer = new MutationObserver((mutations) => {
        updateMainImageBadge();
    });

    observer.observe(previewContainer, {
        childList: true
    });

    // '게시글 수정' 버튼 리스너 등록
    editPostForm.addEventListener('submit', async (event) => {
        // API 호출 중 버튼을 비활성화하여 중복 클릭 방지
        event.preventDefault();
        editPostButton.disabled = true;
        editPostButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span role="status">수정 중...</span>
        `;
        try {
            const finalImageList = uploader.getFileList();
            const newFilesToUpload = finalImageList
                .filter(item => item.type === 'NEW');
            const existingImages = finalImageList
                .filter(item => item.type === 'EXIST');
            let uploadedNewImageIds = []; // 업로드된 "신규" 이미지 ID 목록
            // 업로드할 "신규" 이미지가 있을 때만 S3 로직 실행
            if (newFilesToUpload.length > 0) {
                const imageMetadataList = newFilesToUpload.map((item, index) => ({
                    fileName: item.file.name,
                    fileSize: item.file.size,
                    mimeType: item.file.type,
                    sequence: finalImageList.indexOf(item) + 1
                }));

                const presignedUrlResponse = await fetch(`${apiUrl}/images/upload-urls`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageType: 'POST',
                        imageMetadataList: imageMetadataList
                    })
                });

                if (!presignedUrlResponse.ok) throw new Error('게시글 이미지 업로드 실패');
                const uploadInfos = await presignedUrlResponse.json();

                const uploadPromises = uploadInfos.map(info => {
                    const itemToUpload = finalImageList[info.sequence - 1];
                    return fetch(info.url, {
                        method: info.httpMethod,
                        body: itemToUpload.file,
                        headers: { 'Content-Type': itemToUpload.file.type }
                    });
                });

                await Promise.all(uploadPromises);
                uploadedNewImageIds = uploadInfos.map(info => ({
                    imageId: info.imageId,
                    sequence: info.sequence
                }));
            }

            const existingImageIds = existingImages.map(item => ({
                imageId: item.image.postImageId,
                sequence: finalImageList.indexOf(item) + 1
            }));

            const finalPostImages = [...existingImageIds, ...uploadedNewImageIds];

            const editPostResponse = await fetch(`${apiUrl}/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: titleInput.value !== beforeTitle ? titleInput.value : null,
                    content: contentInput.value !== beforeContent ? contentInput.value : null,
                    images: finalPostImages
                }),
                credentials: 'include'
            });

            if (editPostResponse.ok) {
                await showConfirmModal('게시글 수정완료', '게시글이 성공적으로 수정되었습니다.');
                window.location.replace(`/pages/post-detail.html?id=${postId}`);
            } else {
                const errorText = await editPostResponse.text();
                await showConfirmModal('게시글 수정실패', errorText || '게시글 수정에 실패했습니다.');
            }
        } catch (error) {
            errorMessageDiv.textContent = error.message;
            errorMessageDiv.classList.remove('d-none');
        } finally {
            editPostButton.disabled = false;
            editPostButton.innerHTML = '게시글 수정';
        }
    });

});

async function getPostDetail(postId) {
    try {
        const response = await fetch(`${apiUrl}/posts/${postId}`, { credentials: 'include' });
        if (response.ok) {
            return await response.json();
        } else {
            const errorText = await error.message;
            await showConfirmModal('게시글 정보로딩 실패', errorText || '잠시 후 다시 시도해주세요.');
        }
    } catch (error) {
        const errorText = await error.message;
        await showConfirmModal('게시글 정보로딩 실패', errorText || '잠시 후 다시 시도해주세요.');
        window.location.href = '/pages/posts.html';
    }
}