import { categoryNames } from "../data/sample";

export default function ProductRow({ product }) {
    const isActive = product.status === 'active'

    return (
        <tr data-testid="product-row">
            <td data-label="Tên">{product.name}</td>
            <td data-label="Sku">{product.sku}</td>
            <td data-label="Danh mục">{categoryNames[product.category]}</td>
            <td data-label="Giá">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</td>
            <td className={product.stock > 0 ? 'in_of_stock' : 'out_of_stock'} data-label="Tồn kho">{product.stock > 0 ? product.stock : 'Hết hàng'}</td>
            <td data-label="Trạng thái">
                <span data-testid="product-status" className={isActive ? "productStatus_true" : "productStatus_false"}>{isActive ? 'Đang bán' : 'Ngừng bán'}</span>
            </td>
            <td data-label="Thao tác">
                <button type="button" data-testid="edit-button" className="edit_product_button">Sửa</button>
                <button type="button" data-testid="delete-button" className="delete_product_button">Xoá</button>
            </td>
        </tr>
    )
}
