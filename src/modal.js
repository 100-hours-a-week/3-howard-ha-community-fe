// js/common/modal.js

const modalHtmlTemplate = `
<div class="modal fade" id="globalModal" tabindex="-1" aria-labelledby="globalModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="globalModalLabel"></h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body" id="globalModalBody">
        </div>
      <div class="modal-footer" id="globalModalFooter">
        </div>
    </div>
  </div>
</div>
`;

if (!document.getElementById('globalModal')) {
    document.body.insertAdjacentHTML('beforeend', modalHtmlTemplate);
}

const modalElement = document.getElementById('globalModal');
const globalModal = new bootstrap.Modal(modalElement);

const modalTitle = document.getElementById('globalModalLabel');
const modalBody = document.getElementById('globalModalBody');
const modalFooter = document.getElementById('globalModalFooter');

export function showConfirmModal(title, message) {
    const opener = document.activeElement;
    return new Promise((resolve) => {
        modalTitle.textContent = title;
        modalBody.innerHTML = message;
        modalFooter.innerHTML = '';

        const okButton = document.createElement('button');
        okButton.type = 'button';
        okButton.className = 'btn btn-primary';
        okButton.textContent = '확인';

        modalFooter.appendChild(okButton);

        const onOkClick = (e) => {
            if (e && e.currentTarget) {
                e.currentTarget.blur();
            }
            globalModal.hide();
        }

        const onHide = () => {
            resolve();
            okButton.removeEventListener('click', onOkClick);
            modalElement.removeEventListener('hidden.bs.modal', onHide);
            if (opener && typeof opener.focus === 'function') {
                opener.focus();
            }
        };

        okButton.addEventListener('click', onOkClick);
        modalElement.addEventListener('hidden.bs.modal', onHide);

        globalModal.show();
    });
}

export function showChoiceModal(title, message, confirmText = '확인', cancelText = '취소') {
    const opener = document.activeElement;
    return new Promise((resolve) => {
        modalTitle.textContent = title;
        modalBody.innerHTML = message;
        modalFooter.innerHTML = '';

        let result = false;

        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'btn btn-secondary';
        cancelButton.textContent = cancelText;

        const confirmButton = document.createElement('button');
        confirmButton.type = 'button';
        confirmButton.className = 'btn btn-primary';
        confirmButton.textContent = confirmText;

        modalFooter.appendChild(cancelButton);
        modalFooter.appendChild(confirmButton);

        const onConfirmClick = (e) => {
            result = true;
            if (e && e.currentTarget) {
                e.currentTarget.blur();
            }
            globalModal.hide();
        };

        const onCancelClick = (e) => {
            result = false;
            if (e && e.currentTarget) {
                e.currentTarget.blur();
            }
            globalModal.hide();
        };

        const onHide = () => {
            resolve(result);
            confirmButton.removeEventListener('click', onConfirmClick);
            cancelButton.removeEventListener('click', onCancelClick);
            modalElement.removeEventListener('hidden.bs.modal', onHide);
            if (opener && typeof opener.focus === 'function') {
                opener.focus();
            }
        };

        confirmButton.addEventListener('click', onConfirmClick);
        cancelButton.addEventListener('click', onCancelClick);
        modalElement.addEventListener('hidden.bs.modal', onHide);

        globalModal.show();
    });
}

export function showDangerChoiceModal(title, message, confirmText = '네, 확인했습니다.', cancelText = '취소') {
    const opener = document.activeElement;
    return new Promise((resolve) => {
        modalTitle.textContent = title;
        modalBody.innerHTML = message;
        modalFooter.innerHTML = '';

        let result = false;

        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'btn btn-secondary';
        cancelButton.textContent = cancelText;

        const confirmButton = document.createElement('button');
        confirmButton.type = 'button';
        confirmButton.className = 'btn btn-danger';
        confirmButton.textContent = confirmText;

        modalFooter.appendChild(cancelButton);
        modalFooter.appendChild(confirmButton);

        const onConfirmClick = (e) => {
            result = true;
            if (e && e.currentTarget) {
                e.currentTarget.blur();
            }
            globalModal.hide();
        };

        const onCancelClick = (e) => {
            result = false;
            if (e && e.currentTarget) {
                e.currentTarget.blur();
            }
            globalModal.hide();
        };

        const onHide = () => {
            resolve(result);
            confirmButton.removeEventListener('click', onConfirmClick);
            cancelButton.removeEventListener('click', onCancelClick);
            modalElement.removeEventListener('hidden.bs.modal', onHide);
            if (opener && typeof opener.focus === 'function') {
                opener.focus();
            }
        };

        confirmButton.addEventListener('click', onConfirmClick);
        cancelButton.addEventListener('click', onCancelClick);
        modalElement.addEventListener('hidden.bs.modal', onHide);

        globalModal.show();
    });
}