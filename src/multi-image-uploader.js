import Sortable from 'sortablejs';

export function initializeImageUploader(config, existingImages = []) {
    const { inputId, containerId, addButtonSelector, maxFiles } = config;

    const imageInput = document.getElementById(inputId);
    const previewContainer = document.getElementById(containerId);
    const addImageButton = document.querySelector(addButtonSelector);

    let fileList = [];

    let deletedExistingImages = [];

    new Sortable(previewContainer, {
        animation: 150,
        onEnd: (event) => {
            const movedItem = fileList.splice(event.oldIndex, 1)[0];
            fileList.splice(event.newIndex, 0, movedItem);
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

            const newItem = {
                type: 'NEW',
                file: file
            };

            fileList.push(newItem);

            const { col, img } = createPreviewCardDOM(newItem);

            previewContainer.appendChild(col);

            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(newItem.file);
        }
    }

    function createPreviewCardDOM(item) {
        const col = document.createElement('div');
        col.className = 'col';

        const card = document.createElement('div');
        card.className = 'image-card';

        const img = document.createElement('img');
        img.className = 'preview-img';

        if (item.type === 'EXIST') {
            img.src = item.image.postImageUrl;
        } else {
            img.src = "https://placehold.co/150x150/e9ecef/6c757d?text=...";
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';

        deleteBtn.addEventListener('click', () => {
            const indexToRemove = fileList.findIndex(f => f === item);

            if (indexToRemove > -1) {
                if (item.type === 'EXIST') {
                    deletedExistingImages.push(item.image);
                }
                fileList.splice(indexToRemove, 1);
            }

            col.remove();
        });

        card.appendChild(img);
        card.appendChild(deleteBtn);
        col.appendChild(card);

        return { col, img };
    }

    function loadExistingImages() {
        for (const postImage of existingImages) {
            const item = {
                type: 'EXIST',
                image: postImage
            };

            fileList.push(item);
            const { col } = createPreviewCardDOM(item);
            previewContainer.appendChild(col);
        }
    }

    loadExistingImages();

    return {
        getFileList: () => fileList,
        getDeletedImages: () => deletedExistingImages
    };
}