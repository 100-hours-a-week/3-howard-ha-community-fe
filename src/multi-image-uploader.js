document.addEventListener('DOMContentLoaded', () => {
    // --- 폼 요소 선택 ---
    const writePostForm = document.getElementById('write-post-form');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const submitButton = document.getElementById('write-post-button');
    const errorMessageDiv = document.getElementById('form-error-message');

    // --- 이미지 업로더 요소 선택 ---
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const addImageButton = document.querySelector('label[for="imageInput"]');

    const MAX_IMAGES = 5; // 최대 이미지 수 제한
    let fileList = []; // 선택된 파일 객체와 순서를 관리하는 배열

    // --- 이미지 업로더 로직 ---

    // SortableJS를 미리보기 컨테이너에 적용
    new Sortable(previewContainer, {
        animation: 150,
        onEnd: (event) => {
            const movedItem = fileList.splice(event.oldIndex, 1)[0];
            fileList.splice(event.newIndex, 0, movedItem);
            updateBadges();
        }
    });

    imageInput.addEventListener('change', (event) => {
        handleFiles(event.target.files);
        imageInput.value = ''; // 같은 파일 재선택 가능하도록 초기화
    });

    function updateAddImageButtonVisibility() {
        if (fileList.length >= MAX_IMAGES) {
            addImageButton.style.display = 'none';
        } else {
            addImageButton.style.display = 'inline-block';
        }
    }

    function handleFiles(files) {
        const spaceLeft = MAX_IMAGES - fileList.length;
        if (files.length > spaceLeft) {
            alert(`이미지는 최대 ${MAX_IMAGES}장까지만 추가할 수 있습니다. 초과된 파일은 제외됩니다.`);
        }

        const filesToAdd = Array.from(files).slice(0, spaceLeft);

        for (const file of filesToAdd) {
            fileList.push(file);
            const reader = new FileReader();
            reader.onload = (e) => createPreviewCard(file, e.target.result);
            reader.readAsDataURL(file);
        }

        if (filesToAdd.length > 0) {
            setTimeout(() => {
                updateBadges();
                updateAddImageButtonVisibility();
            }, 0);
        }
    }

    function createPreviewCard(file, src) {
        const col = document.createElement('div');
        col.className = 'col';

        const card = document.createElement('div');
        card.className = 'image-card';

        const img = document.createElement('img');
        img.className = 'preview-img';
        img.src = src;

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button'; // form 제출 방지
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', () => {
            const indexToRemove = fileList.findIndex(f => f === file);
            if (indexToRemove > -1) fileList.splice(indexToRemove, 1);
            col.remove();
            updateBadges();
            updateAddImageButtonVisibility(); // 이미지 삭제 후 버튼 상태 업데이트
        });

        card.appendChild(img);
        card.appendChild(deleteBtn);
        col.appendChild(card);
        previewContainer.appendChild(col);
    }

    function updateBadges() {
        previewContainer.querySelectorAll('.main-image-badge').forEach(b => b.remove());
        const firstCard = previewContainer.querySelector('.image-card:first-child');
        if (firstCard) {
            const badge = document.createElement('span');
            badge.className = 'badge bg-primary main-image-badge';
            badge.textContent = '대표';
            firstCard.appendChild(badge);
        }
    }

    // --- 최종 폼 제출 로직 ---
    writePostForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> 등록 중...`;
        errorMessageDiv.classList.add('d-none');

        try {
            let uploadedImageIds = [];

            // 1. 이미지가 있으면, 먼저 이미지들을 업로드합니다.
            if (fileList.length > 0) {
                // 1-1. Presigned URL 목록 요청
                const imageMetadataList = fileList.map((file, index) => ({
                    fileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                    sequence: index + 1
                }));

                const presignedUrlResponse = await fetch('/api/images/multi-upload-urls', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageMetadataList })
                });

                if (!presignedUrlResponse.ok) throw new Error('Presigned URL 요청 실패');
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
                uploadedImageIds = uploadInfos.map(info => info.imageId);
            }

            // 2. 게시글 생성 API 호출
            const createPostResponse = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: titleInput.value,
                    content: contentInput.value,
                    imageIds: uploadedImageIds // 업로드된 이미지 ID 목록
                })
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
            submitButton.disabled = false;
            submitButton.innerHTML = '게시글 등록';
        }
    });
});