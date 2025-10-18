import { initializeImageUploader } from '../multi-image-uploader.js';

document.addEventListener('DOMContentLoaded', () => {

    const uploader = initializeImageUploader({
        inputId: 'imageInput',
        containerId: 'imagePreviewContainer',
        addButtonSelector: 'label[for="imageInput"]',
        maxFiles: 5
    });

    const writePostForm = document.getElementById('write-post-form');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const writePostButton = document.getElementById('write-post-button');
    const errorMessageDiv = document.getElementById('form-error-message');

    // 최종 게시글 작성 폼 제출
    writePostForm.addEventListener('submit', async (event) => {

        event.preventDefault();
        // API 호출 중 버튼을 비활성화하여 중복 클릭 방지
        writePostButton.disabled = true;
        writePostButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span role="status">등록 중...</span>
        `;

        try {

            const fileList = uploader.getFileList();
            let uploadedImageIds = [];

            // 1. 이미지가 있으면, 먼저 이미지들을 업로드
            if (fileList.length > 0) {
                // 1-1. Presigned URL 목록 요청
                const imageMetadataList = fileList.map((file, index) => ({
                    fileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                    sequence: index + 1
                }));

                const requestBody = {
                    imageType: 'POST',
                    imageMetadataList: imageMetadataList
                };

                const presignedUrlResponse = await fetch('http://localhost:8080/images/upload-urls', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });

                if (!presignedUrlResponse.ok) throw new Error('게시글 이미지 업로드 실패');
                const uploadInfos = await presignedUrlResponse.json();

                // 1-2. 각 Presigned URL로 파일 병렬 업로드
                const uploadPromises = uploadInfos.map(info => {
                    const fileToUpload = fileList.find((f, i) => i + 1 === info.sequence);
                    return fetch(info.url, {
                        method: info.httpMethod,
                        body: fileToUpload,
                        headers: { 'Content-Type': fileToUpload.type }
                    });
                });

                await Promise.all(uploadPromises);
                uploadedImageIds = uploadInfos.map(info => ({
                    imageId: info.imageId,
                    sequence: info.sequence
                }));
            }

            // 2. 게시글 생성 API 호출
            const createPostResponse = await fetch('http://localhost:8080/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: titleInput.value,
                    content: contentInput.value,
                    postImages: uploadedImageIds
                }),
                credentials: 'include'
            });

            if (!createPostResponse.ok) {
                const errorText = await createPostResponse.text();
                throw new Error(errorText || '게시글 등록에 실패했습니다.');
            }

            // 3. 성공 시 페이지 이동
            alert('게시글이 성공적으로 등록되었습니다.');
            window.location.href = '/pages/posts.html';

        } catch (error) {
            errorMessageDiv.textContent = error.message;
            errorMessageDiv.classList.remove('d-none');
        } finally {
            writePostButton.disabled = false;
            writePostButton.innerHTML = '게시글 등록';
        }
    });

});