import { displayMessage } from "../utils/displayValidationStatus.js";

export async function uploadProfileImage(file, element) {
    displayMessage(element, "프로필 이미지 업로드 중...", true);

    // 1. Presigned URL 발급 요청
    const presignedUrlResponse = await fetch(`http://localhost:8080/images/upload-urls`, {
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

    if (!presignedUrlResponse.ok) {
        // 서버가 보낸 실제 에러 메시지를 읽어서 반환
        const errorText = await presignedUrlResponse.text();
        throw new Error(errorText || 'Presigned URL 요청에 실패했습니다.');
    }

    // 2. Presigned URL로 이미지 업로드
    const { url, imageId, httpMethod } = (await presignedUrlResponse.json())[0];
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

    displayMessage(element, "프로필 이미지 업로드 완료", true);
    return imageId;
}