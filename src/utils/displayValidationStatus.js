export function displayMessage(element, message, isSuccess) {
    element.textContent = message;
    element.classList.remove('text-success', 'text-danger');
    element.classList.add(isSuccess ? 'text-success' : 'text-danger');
}