import React from 'react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div data-testid="confirm-dialog" className="modal-content confirm-dialog">
        <h3>{title || 'Xác nhận xoá'}</h3>
        <p>{message || 'Bạn có chắc chắn muốn xoá sản phẩm này?'}</p>
        <div className="modal-actions">
          <button
            type="button"
            data-testid="confirm-no"
            className="btn-cancel"
            onClick={onCancel}
          >
            Huỷ
          </button>
          <button
            type="button"
            data-testid="confirm-yes"
            className="btn-danger"
            onClick={onConfirm}
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}
