import Sortable from 'sortablejs';
import { showConfirmModal } from "./modal.js";
const lambdaUrl = import.meta.env.VITE_LAMBDA_API_URL;

export function initializeImageUploader(config, existingImages = []) {
    const {
        inputId,
        containerId,
        addButtonSelector,
        maxFiles,
        onUploadStatusChange
    } = config;

    const imageInput = document.getElementById(inputId);
    const previewContainer = document.getElementById(containerId);

    let fileList = [];
    let deletedExistingImages = [];
    let activeUploadCount = 0;

    function updateMainImageBadge() {
        // 컨테이너 내의 모든 이미지 카드를 순서대로 가져옴
        const cards = previewContainer.querySelectorAll('.col'); // .col 단위로 순회

        cards.forEach((col, index) => {
            const card = col.querySelector('.image-card');
            if (!card) return;

            // 기존 배지 모두 제거 (초기화)
            const existingBadge = card.querySelector('.main-image-badge');
            if (existingBadge) {
                existingBadge.remove();
            }

            // 첫 번째 항목(index === 0)에만 배지 추가
            if (index === 0) {
                const badge = document.createElement('span');
                badge.className = 'badge bg-primary main-image-badge';
                badge.textContent = '대표';

                // 스타일: 카드 좌측 상단에 고정
                badge.style.position = 'absolute';
                badge.style.top = '10px';
                badge.style.left = '10px';
                badge.style.zIndex = '10'; // 이미지보다 위에

                card.prepend(badge);
            }
        });
    }

    new Sortable(previewContainer, {
        animation: 150,
        ghostClass: 'sortable-ghost', // 드래그 중인 아이템의 스타일 클래스 (CSS 필요)
        onEnd: (event) => {
            // 데이터 배열 순서 변경
            const movedItem = fileList.splice(event.oldIndex, 1)[0];
            fileList.splice(event.newIndex, 0, movedItem);
            updateMainImageBadge();
        }
    });

    imageInput.addEventListener('change', (event) => {
        handleFiles(event.target.files);
        imageInput.value = '';
    });

    function updateUploadStatus(isUploading) {
        if (onUploadStatusChange) {
            onUploadStatusChange(isUploading);
        }
    }

    // 3. 파일 처리 메인 로직
    async function handleFiles(files) {
        const spaceLeft = maxFiles - fileList.length;

        if (files.length > spaceLeft) {
            showConfirmModal('이미지 한도초과', `이미지는 최대 ${maxFiles}장까지만 추가할 수 있습니다. 초과된 파일은 제외됩니다.`);
        }

        const filesToAdd = Array.from(files).slice(0, spaceLeft);
        if (filesToAdd.length === 0) return;

        // 3-1. UI 요소 생성
        const newItems = filesToAdd.map(file => {
            const item = {
                type: 'NEW',
                file: file,
                imageId: null,
                uploading: true
            };

            const { col, img, progressBar, progressText } = createPreviewCardDOM(item);

            const reader = new FileReader();
            reader.onload = (e) => { img.src = e.target.result; };
            reader.readAsDataURL(file);

            previewContainer.appendChild(col);

            item.domElements = { progressBar, progressText, col };
            return item;
        });

        fileList.push(...newItems);

        // 새 이미지가 추가되었으므로 배지 업데이트 (첫 이미지가 없었다면 새로 추가된게 대표가 됨)
        updateMainImageBadge();

        // 3-2. 업로드 시작
        activeUploadCount += newItems.length;
        updateUploadStatus(true);

        const uploadPromises = newItems.map((item, index) => {
            // 현재 리스트 기준 시퀀스 계산
            const currentSequence = fileList.indexOf(item) + 1;
            return uploadToLambda(item, currentSequence);
        });

        try {
            await Promise.all(uploadPromises);
        } catch (error) {
            console.error("Some uploads failed:", error);
        }
    }

    // 4. Lambda로 이미지 전송
    function uploadToLambda(item, sequence) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const targetUrl = `${lambdaUrl}/lambda/images`;
            xhr.open('POST', targetUrl);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    item.domElements.progressBar.style.width = percentComplete + '%';
                    item.domElements.progressText.textContent = percentComplete + '%';
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.isSuccess) {
                            item.imageId = response.payload.imageId;
                            item.uploading = false;

                            item.domElements.progressBar.className = 'progress-bar bg-success';
                            item.domElements.progressText.textContent = '완료';

                            setTimeout(() => {
                                if(item.domElements.progressBar.parentElement) {
                                    item.domElements.progressBar.parentElement.style.opacity = '0';
                                }
                            }, 1000);

                            activeUploadCount--;
                            if (activeUploadCount === 0) updateUploadStatus(false);
                            resolve();
                        } else {
                            throw new Error(response.message || '업로드 실패');
                        }
                    } catch (e) {
                        handleUploadError(item);
                        reject(e);
                    }
                } else {
                    handleUploadError(item);
                    reject(new Error(`HTTP Error: ${xhr.status}`));
                }
            };

            xhr.onerror = () => {
                handleUploadError(item);
                reject(new Error('Network Error'));
            };

            const formData = new FormData();
            formData.append('file', item.file);
            formData.append('type', 'POST');
            formData.append('sequence', sequence);

            xhr.send(formData);
        });
    }

    function handleUploadError(item) {
        item.domElements.progressBar.className = 'progress-bar bg-danger';
        item.domElements.progressText.textContent = '실패';
        activeUploadCount--;
        if (activeUploadCount === 0) updateUploadStatus(false);
    }

    // 5. DOM 생성 함수
    function createPreviewCardDOM(item) {
        const col = document.createElement('div');
        col.className = 'col position-relative';

        const card = document.createElement('div');
        card.className = 'image-card';
        card.style.position = 'relative';
        card.style.overflow = 'hidden';

        const img = document.createElement('img');
        img.className = 'preview-img';
        img.style.width = '100%';
        img.style.height = '150px';
        img.style.objectFit = 'cover';

        if (item.type === 'EXIST') {
            img.src = item.image.postImageUrl;
        } else {
            img.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22150%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20150%20150%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AVar%2C%20sans-serif%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22150%22%20height%3D%22150%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2233%22%20y%3D%2280%22%3ELoading...%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E";
        }

        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress position-absolute bottom-0 start-0 w-100';
        progressContainer.style.height = '20px';
        progressContainer.style.borderRadius = '0';
        progressContainer.style.opacity = '0.9';
        progressContainer.style.transition = 'opacity 0.5s ease';

        if (item.type === 'EXIST') progressContainer.style.display = 'none';

        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated';
        progressBar.role = 'progressbar';
        progressBar.style.width = '0%';

        const progressText = document.createElement('small');
        progressText.className = 'position-absolute w-100 text-center text-white fw-bold';
        progressText.style.fontSize = '12px';
        progressText.style.lineHeight = '20px';
        progressText.textContent = '0%';

        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';

        // 버튼 스타일 (필요시 CSS 파일로 이동)
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '5px';
        deleteBtn.style.right = '5px';
        deleteBtn.style.background = 'rgba(255, 0, 0, 0.7)';
        deleteBtn.style.color = 'white';
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = '50%';
        deleteBtn.style.width = '24px';
        deleteBtn.style.height = '24px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.zIndex = '20'; // 배지보다 위에

        deleteBtn.addEventListener('click', () => {
            const indexToRemove = fileList.findIndex(f => f === item);

            if (indexToRemove > -1) {
                if (item.type === 'EXIST') {
                    deletedExistingImages.push(item.image);
                }
                if (item.uploading) {
                    activeUploadCount--;
                    if (activeUploadCount === 0) updateUploadStatus(false);
                }
                fileList.splice(indexToRemove, 1);
            }
            col.remove();

            // [중요] 삭제 후에도 배지 위치 업데이트 (첫번째가 지워지면 두번째가 대표가 되어야 함)
            updateMainImageBadge();
        });

        card.appendChild(img);
        card.appendChild(deleteBtn);
        card.appendChild(progressContainer);
        col.appendChild(card);

        return { col, img, progressBar, progressText };
    }

    // 6. 기존 이미지 로드
    function loadExistingImages() {
        if (!existingImages || existingImages.length === 0) return;

        for (const postImage of existingImages) {
            const item = {
                type: 'EXIST',
                image: postImage,
                imageId: postImage.postImageId,
                uploading: false
            };
            fileList.push(item);
            const { col } = createPreviewCardDOM(item);
            previewContainer.appendChild(col);
        }
        // 초기 로드 완료 후 배지 업데이트
        updateMainImageBadge();
    }

    loadExistingImages();

    return {
        getFinalImageList: () => {
            return fileList.map((item, index) => ({
                imageId: item.imageId,
                sequence: index + 1,
                uploading: item.uploading
            }));
        },
        getDeletedImages: () => deletedExistingImages,
        isUploading: () => activeUploadCount > 0
    };
}