import React from "react";
import { useNavigate } from "react-router-dom";
import { categoryNames } from "../data/sample";

export default function ProductRow({ product, onEdit, onDelete, categoriesMap }) {
  const navigate = useNavigate();
  const isActive = product.status === "active";

  const categoryLabel =
    categoriesMap?.[product.category] ||
    categoryNames[product.category] ||
    product.category;

  const formattedPrice =
    typeof product.price === "number"
      ? new Intl.NumberFormat("vi-VN").format(product.price) + " ₫"
      : product.price;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(product);
    } else {
      navigate(`/products/${product.id}/edit`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(product);
    }
  };

  return (
    <tr data-testid="product-row" className="product-row">
      <td data-label="Tên" className="col-name">{product.name}</td>
      <td data-label="SKU" className="col-sku">{product.sku}</td>
      <td data-label="Danh mục" className="col-category">{categoryLabel}</td>
      <td data-label="Giá" className="col-price">{formattedPrice}</td>
      <td
        data-label="Tồn kho"
        className={`col-stock ${product.stock === 0 ? "out_of_stock text-danger" : "in_of_stock"}`}
      >
        {product.stock === 0 ? "Hết hàng" : product.stock}
      </td>
      <td data-label="Trạng thái" className="col-status">
        <span
          data-testid="product-status"
          className={`status-badge ${isActive ? "productStatus_true status-active" : "productStatus_false status-inactive"}`}
        >
          {isActive ? "Đang bán" : "Ngừng bán"}
        </span>
      </td>
      <td data-label="Thao tác" className="col-actions">
        <button
          type="button"
          data-testid="edit-button"
          className="edit_product_button btn-edit"
          onClick={handleEdit}
        >
          Sửa
        </button>
        <button
          type="button"
          data-testid="delete-button"
          className="delete_product_button btn-delete"
          onClick={handleDelete}
        >
          Xoá
        </button>
      </td>
    </tr>
  );
}
