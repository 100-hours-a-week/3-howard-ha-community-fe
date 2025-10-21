// 회원가입 Form 유효성 상태
export const validationStatus = {
    newPassword: false,
    newPasswordCompare: false,
}

// validationStatus 객체의 모든 값이 true인지 확인
export function updateEditPasswordButtonState() {
    const editPasswordButton = document.getElementById('edit-password-button');
    const isFormValid = Object.values(validationStatus).every(status => status === true);
    editPasswordButton.disabled = !isFormValid;
}

updateEditPasswordButtonState(); // 초기화