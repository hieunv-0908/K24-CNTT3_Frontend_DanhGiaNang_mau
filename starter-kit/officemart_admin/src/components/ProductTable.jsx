import ProductRow from "./ProductRow"
export default function ProductTable({ products }) {

    return (
        <table data-testid="product-table">
            <thead>
                <td>Tên</td>
                <td>Sku</td>
                <td>Danh mục</td>
                <td>Giá</td>
                <td>Tồn kho</td>
                <td>Trạng thái</td>
                <td>Hành động</td>
            </thead>
            <tbody>
                {
                    products.map((product) => (
                        <ProductRow key={product.id} product={product}></ProductRow>
                    ))
                }
            </tbody>
        </table>
    )
}
