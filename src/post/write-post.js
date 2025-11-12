import { initializeImageUploader } from '../multi-image-uploader.js';
import { showConfirmModal } from "../modal.js";
import { callApi } from "../api/api.js";

document.addEventListener('DOMContentLoaded', () => {

    const writePostForm = document.getElementById('write-post-form');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const writePostButton = document.getElementById('write-post-button');
    const errorMessageDiv = document.getElementById('form-error-message');

    const previewContainer = document.getElementById('imagePreviewContainer');

    const uploader = initializeImageUploader({
        inputId: 'imageInput',
        containerId: 'imagePreviewContainer',
        addButtonSelector: 'label[for="imageInput"]',
        maxFiles: 5,
    }, []); // 새 글 작성이므로 existingImages는 빈 배열


    const updateMainImageBadge = () => {
        const existingBadges = previewContainer.querySelectorAll('.main-image-badge');
        existingBadges.forEach(badge => badge.remove());
        const firstImageCard = previewContainer.querySelector('.image-card:first-child');
        if (firstImageCard) {
            const badge = document.createElement('span');
            badge.className = 'badge bg-primary main-image-badge';
            badge.textContent = '대표';
            firstImageCard.prepend(badge);
        }
    };

    const observer = new MutationObserver((mutations) => {
        updateMainImageBadge();
    });

    observer.observe(previewContainer, {
        childList: true
    });

    updateMainImageBadge();

    // 3. '게시글 작성' 버튼 리스너 등록
    writePostForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const fileList = uploader.getFileList(); // (edit.js의 finalImageList와 동일)

        if (fileList.length === 0) {
            await showConfirmModal('이미지 필수', '이미지를 1장 이상 추가해주세요.');
            return;
        }

        writePostButton.disabled = true;
        writePostButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span role="status">등록 중...</span>
        `;

        try {
            // 1. 업로드할 이미지 메타데이터 준비 (edit.js와 동일한 로직)
            const imageMetadataList = fileList.map((item, index) => ({
                fileName: item.file.name,
                fileSize: item.file.size,
                mimeType: item.file.type,
                sequence: fileList.indexOf(item) + 1 // edit.js와 동일한 sequence 계산
            }));

            // 2. Presigned URL 요청
            const presignedUrlResponse = await callApi(`/images/upload-urls`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageType: 'POST',
                    imageMetadataList: imageMetadataList
                })
            });
            const uploadInfos = await presignedUrlResponse.json();
            if (!uploadInfos.isSuccess) throw new Error('이미지 업로드 URL 요청 실패');

            // 3. S3로 실제 파일 업로드 (병렬)
            const uploadPromises = uploadInfos.payload.map(info => {
                const itemToUpload = fileList[info.sequence - 1];
                return fetch(info.url, {
                    method: info.httpMethod,
                    body: itemToUpload.file,
                    headers: { 'Content-Type': itemToUpload.file.type }
                });
            });

            await Promise.all(uploadPromises);

            // 4. 업로드된 이미지 ID와 순서 정리
            const finalPostImages = uploadInfos.payload.map(info => ({
                imageId: info.imageId,
                sequence: info.sequence
            }));

            // 5. 게시글 생성 API 호출 (이하 동일)
            const createPostResponse = await callApi(`/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: titleInput.value,
                    content: contentInput.value,
                    postImages: finalPostImages
                }),
                credentials: 'include'
            });

            const data = await createPostResponse.json();

            if (data.isSuccess) {
                await showConfirmModal('게시글 작성완료', '게시글이 성공적으로 등록되었습니다.');
                window.location.replace(`/pages/post-detail.html?id=${data.payload.postId}`);
            } else {
                const errorText = data.errorMessage || '게시글 등록에 실패했습니다.';
                await showConfirmModal('게시글 작성실패', errorText);
            }

        } catch (error) {
            errorMessageDiv.textContent = error.message;
            errorMessageDiv.classList.remove('d-none');
        } finally {
            writePostButton.disabled = false;
            writePostButton.innerHTML = '나의 이야기, 이음🧶';
        }
    });
});