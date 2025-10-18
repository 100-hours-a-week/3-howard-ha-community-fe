// 회원가입 Form 유효성 상태
export const validationStatus = {
    email: false,
    password: false,
    passwordCompare: false,
    nickname: false
}

// validationStatus 객체의 모든 값이 true인지 확인
export function updateSignupButtonState() {
    const signupButton = document.getElementById('signup-button');
    const isFormValid = Object.values(validationStatus).every(status => status === true);
    signupButton.disabled = !isFormValid;
}

updateSignupButtonState(); // 초기화