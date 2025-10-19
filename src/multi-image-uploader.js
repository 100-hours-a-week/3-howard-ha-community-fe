import Sortable from 'sortablejs';

export function initializeImageUploader(config) {
    const { inputId, containerId, addButtonSelector, maxFiles } = config;

    const imageInput = document.getElementById(inputId);
    const previewContainer = document.getElementById(containerId);
    const addImageButton = document.querySelector(addButtonSelector);

    let fileList = [];

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
        imageInput.value = '';
    });

    function handleFiles(files) {
        const spaceLeft = maxFiles - fileList.length;
        if (files.length > spaceLeft) {
            alert(`이미지는 최대 ${maxFiles}장까지만 추가할 수 있습니다. 초과된 파일은 제외됩니다.`);
        }

        const filesToAdd = Array.from(files).slice(0, spaceLeft);

        for (const file of filesToAdd) {
            // 1. fileList에 파일을 먼저 추가
            fileList.push(file);

            // 2. 미리보기 카드의 DOM 구조를 먼저 만듦
            const { col, img } = createPreviewCardDOM(file);

            // 3. 만들어진 카드를 화면에 즉시 추가 (순서 보장)
            previewContainer.appendChild(col);

            // 4. 이미 생성된 img 태그를 참조하여 src만 변경
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        if (filesToAdd.length > 0) {
            setTimeout(() => {
                updateBadges();
                updateAddImageButtonVisibility();
            }, 0);
        }
    }

    function createPreviewCardDOM(file) {
        const col = document.createElement('div');
        col.className = 'col';

        const card = document.createElement('div');
        card.className = 'image-card';

        const img = document.createElement('img');
        img.className = 'preview-img';
        img.src = "https://placehold.co/150x150/e9ecef/6c757d?text=...";

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', () => {
            const indexToRemove = fileList.findIndex(f => f === file);
            if (indexToRemove > -1) fileList.splice(indexToRemove, 1);
            col.remove();
            updateBadges();
            updateAddImageButtonVisibility();
        });

        card.appendChild(img);
        card.appendChild(deleteBtn);
        col.appendChild(card);

        return { col, img };
    }

    function updateAddImageButtonVisibility() {
        if (fileList.length >= maxFiles) {
            addImageButton.style.display = 'none';
        } else {
            addImageButton.style.display = 'inline-block';
        }
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

    return {
        getFileList: () => fileList
    };
}