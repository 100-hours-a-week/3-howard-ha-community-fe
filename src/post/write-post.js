import { initializeImageUploader } from '../multi-image-uploader.js';
import {showConfirmModal} from "../modal.js";
import {callApi} from "../api/api.js";

document.addEventListener('DOMContentLoaded', () => {

    // 이미지 업로더 컴포넌트 세팅
    const uploader = initializeImageUploader({
        inputId: 'imageInput',
        containerId: 'imagePreviewContainer',
        addButtonSelector: 'label[for="imageInput"]',
        maxFiles: 5
    }, []);

    // 게시글 작성에 필요한 주요 form 획득
    const writePostForm = document.getElementById('write-post-form');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const writePostButton = document.getElementById('write-post-button');
    const errorMessageDiv = document.getElementById('form-error-message');

    // '게시글 작성' 버튼 리스너 등록
    writePostForm.addEventListener('submit', async (event) => {
        // API 호출 중 버튼을 비활성화하여 중복 클릭 방지
        event.preventDefault();
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
                const imageMetadataList = fileList.map((item, index) => ({
                    fileName: item.file.name,
                    fileSize: item.file.size,
                    mimeType: item.file.type,
                    sequence: index + 1
                }));

                const requestBody = {
                    imageType: 'POST',
                    imageMetadataList: imageMetadataList
                };
                const presignedUrlResponse = await callApi(`/images/upload-urls`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });
                const uploadInfos = await presignedUrlResponse.json();

                if (!uploadInfos.isSuccess) {
                    throw new Error('게시글 이미지 업로드 실패');
                }

                // 1-2. 각 Presigned URL로 파일 병렬 업로드
                const uploadPromises = uploadInfos.payload.map(info => {
                    const fileToUpload = fileList.find((f, i) => i + 1 === info.sequence);
                    return fetch(info.url, {
                        method: info.httpMethod,
                        body: fileToUpload.file,
                        headers: { 'Content-Type': fileToUpload.file.type }
                    });
                });

                await Promise.all(uploadPromises);
                uploadedImageIds = uploadInfos.payload.map(info => ({
                    imageId: info.imageId,
                    sequence: info.sequence
                }));
            }

            // 2. 게시글 생성 API 호출
            const createPostResponse = await callApi(`/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: titleInput.value,
                    content: contentInput.value,
                    postImages: uploadedImageIds
                }),
                credentials: 'include'
            });

            if (createPostResponse.ok) {
                await showConfirmModal("게시글 등록완료", "게시글을 등록했습니다.");
                window.location.href = '/pages/posts.html'; // 3. 성공 시 페이지 이동
            } else {
                const errorText = await createPostResponse.text();
                await showConfirmModal("게시글 등록실패", errorText || '게시글 등록에 실패했습니다.');
            }
        } catch (error) {
            errorMessageDiv.textContent = error.message;
            errorMessageDiv.classList.remove('d-none');
        } finally {
            writePostButton.disabled = false;
            writePostButton.innerHTML = '게시글 등록';
        }
    });

});