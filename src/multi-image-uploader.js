import Sortable from 'sortablejs';

/**
 * ⭐️ 1. config 외에 '기존 이미지' 배열을 인자로 받도록 변경
 */
export function initializeImageUploader(config, existingImages = []) {
    const { inputId, containerId, addButtonSelector, maxFiles } = config;

    const imageInput = document.getElementById(inputId);
    const previewContainer = document.getElementById(containerId);
    const addImageButton = document.querySelector(addButtonSelector);

    /**
     * ⭐️ 2. fileList를 [File]이 아닌 [Item] 객체 배열로 변경
     * - 신규: { type: 'NEW', file: FileObject }
     * - 기존: { type: 'EXIST', image: { postImageUrl: '...' } }
     */
    let fileList = [];

    // ⭐️ 3. '수정' 모드에서 삭제된 'EXIST' 이미지의 ID/URL을 추적
    let deletedExistingImages = [];

    new Sortable(previewContainer, {
        animation: 150,
        onEnd: (event) => {
            // (변경 없음) 객체 자체를 이동시키므로 타입과 관계없이 동작
            const movedItem = fileList.splice(event.oldIndex, 1)[0];
            fileList.splice(event.newIndex, 0, movedItem);
            updateBadges();
        }
    });

    imageInput.addEventListener('change', (event) => {
        handleFiles(event.target.files);
        imageInput.value = '';
    });

    function handleFiles(files) {
        const spaceLeft = maxFiles - fileList.length;
        if (files.length > spaceLeft) {
            alert(`이미지는 최대 ${maxFiles}장까지만 추가할 수 있습니다. 초과된 파일은 제외됩니다.`);
        }

        const filesToAdd = Array.from(files).slice(0, spaceLeft);

        for (const file of filesToAdd) {

            // ⭐️ 4. 'File'이 아닌 'Item 객체'를 생성
            const newItem = {
                type: 'NEW', // 사용자가 정의한 'NEW' 타입
                file: file   // 'image' 대신 'file' 속성에 File 객체 저장
            };

            // 1. fileList에 Item 객체를 추가
            fileList.push(newItem);

            // 2. DOM 생성 (이제 file 대신 newItem 객체를 전달)
            const { col, img } = createPreviewCardDOM(newItem);

            // 3. 화면에 추가
            previewContainer.appendChild(col);

            // 4. FileReader로 미리보기 생성 (File 객체는 newItem.file에서 꺼내 씀)
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(newItem.file); // ⭐️
        }

        if (filesToAdd.length > 0) {
            updateUIAsync();
        }
    }

    /**
     * ⭐️ 5. createPreviewCardDOM이 File 대신 'Item 객체'를 받도록 수정
     */
    function createPreviewCardDOM(item) {
        const col = document.createElement('div');
        col.className = 'col';

        const card = document.createElement('div');
        card.className = 'image-card';

        const img = document.createElement('img');
        img.className = 'preview-img';

        // ⭐️ 6. (핵심) Item 타입에 따라 이미지 소스를 분기
        if (item.type === 'EXIST') {
            // '기존' 이미지는 API 응답의 URL을 바로 사용
            // edit-post.js에서 item.image.postImageUrl로 저장했음
            img.src = item.image.postImageUrl;
        } else {
            // '신규' 이미지는 플레이스홀더 (handleFiles의 FileReader가 덮어씀)
            img.src = "https://placehold.co/150x150/e9ecef/6c757d?text=...";
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';

        // ⭐️ 7. 삭제 로직 수정
        deleteBtn.addEventListener('click', () => {
            // 'file' 참조 비교(f === file) 대신, 'item' 객체 참조 비교로 변경
            const indexToRemove = fileList.findIndex(f => f === item);

            if (indexToRemove > -1) {
                // ⭐️ 만약 삭제하는 것이 '기존' 이미지라면, 추적
                if (item.type === 'EXIST') {
                    deletedExistingImages.push(item.image); // image 객체 전체를 저장
                }
                fileList.splice(indexToRemove, 1);
            }

            col.remove();
            updateBadges();
            updateAddImageButtonVisibility();
        });

        card.appendChild(img);
        card.appendChild(deleteBtn);
        col.appendChild(card);

        return { col, img };
    }

    // (UI 업데이트 함수들은 변경 없음)
    function updateAddImageButtonVisibility() { /* ... */ }
    function updateBadges() { /* ... */ }
    function updateUIAsync() {
        setTimeout(() => {
            updateBadges();
            updateAddImageButtonVisibility();
        }, 0);
    }

    /**
     * ⭐️ 8. '기존 이미지'를 로드하는 새 함수
     */
    function loadExistingImages() {
        for (const postImage of existingImages) {
            // edit-post.js에서 넘겨줄 { type, image } 객체를 만듦
            const item = {
                type: 'EXIST',
                image: postImage // postImage = { id, postImageUrl, ... }
            };

            fileList.push(item);
            const { col } = createPreviewCardDOM(item);
            previewContainer.appendChild(col);
        }
    }

    // --- 초기화 실행 ---
    loadExistingImages();
    updateUIAsync();

    // ⭐️ 9. 반환 API 변경
    return {
        // fileList는 이제 [ {type:'EXIST'}, {type:'NEW'} ] 혼합 배열
        getFileList: () => fileList,
        // 삭제된 '기존' 이미지 목록 반환
        getDeletedImages: () => deletedExistingImages
    };
}