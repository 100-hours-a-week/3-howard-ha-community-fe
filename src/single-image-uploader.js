let selectedProfileImageFile = null;
let originalImageSrc = '';
const apiUrl = import.meta.env.VITE_API_URL;

export let uploadedImageId = null;

const profileImageInput = document.getElementById('profile-image-input');
const profileImagePreview = document.getElementById('profile-image-preview');
const profileImageMessage = document.getElementById('profile-image-message');

document.addEventListener('DOMContentLoaded', () => {

    // 페이지 로드 시, 초기 이미지 주소를 저장
    originalImageSrc = profileImagePreview.src;

    profileImageInput.addEventListener('change', async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            return;
        }
        const file = files[0];

        // 업로드 시도 전에 현재 이미지 주소를 백업
        originalImageSrc = profileImagePreview.src;

        const reader = new FileReader();
        reader.onload = (e) => {
            // 먼저 사용자에게 선택한 이미지로 보여줌
            profileImagePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);

        selectedProfileImageFile = file;

        try {
            await uploadProfileImage(selectedProfileImageFile);
        } catch (error) {
            // 업로드 실패 시, 백업해둔 원본 이미지로 복구
            profileImagePreview.src = originalImageSrc;
            // uploadProfileImage 함수에서 전달된 에러 메시지를 사용자에게 표시
            displayMessage(profileImageMessage, error.message, false);
        }
    });

    async function uploadProfileImage(file) {
        displayMessage(profileImageMessage, "프로필 이미지 업로드 중...", true);

        // 1. Presigned URL 발급 요청
        const presignedUrlResponse = await fetch(`${apiUrl}/images/upload-urls`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageType: 'PROFILE',
                imageMetadataList: [{
                    fileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                    sequence: 1
                }]
            })
        });
        const uploadInfos = await presignedUrlResponse.json();

        if (!uploadInfos.isSuccess) {
            // 서버가 보낸 실제 에러 메시지를 읽어서 반환
            const errorText = uploadInfos.message;
            throw new Error(errorText || 'Presigned URL 요청에 실패했습니다.');
        }

        // 2. Presigned URL로 이미지 업로드
        const { url, imageId, httpMethod } = uploadInfos.payload[0];
        const uploadResponse = await fetch(url, {
            method: httpMethod,
            body: file,
            headers: { 'Content-Type': file.type }
        });

        if (!uploadResponse.ok) {
            // 서버가 보낸 실제 에러 메시지를 읽어서 반환
            const errorText = await uploadResponse.text();
            throw new Error(errorText || 'S3 업로드에 실패했습니다.');
        }

        uploadedImageId = imageId;
        displayMessage(profileImageMessage, "프로필 이미지 업로드 완료", true);
        // 프로필 이미지 변경 이벤트 발행
        const event = new CustomEvent('profileImageUploaded', {
            detail: { newImageId: imageId }
        });
        document.dispatchEvent(event);
    }

    function displayMessage(element, message, isSuccess) {
        element.textContent = message;
        element.classList.remove('text-success', 'text-danger');
        element.classList.add(isSuccess ? 'text-success' : 'text-danger');
    }
});

export function clearUploadedImageId() {
    uploadedImageId = null;
    profileImageInput.value = null;
    profileImageMessage.classList.remove('text-success', 'text-danger');
    profileImageMessage.textContent = '이미지를 클릭하여 프로필 사진을 업로드하세요.';
}