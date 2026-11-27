import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductTable from '../components/ProductTable';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../api/axiosClient';
import useProductSearch from '../hooks/useProductSearch';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  // Đọc params từ URL
  const urlQ = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlStatus = searchParams.get('status') || '';
  const urlPageRaw = parseInt(searchParams.get('page') || '1', 10);
  const page = isNaN(urlPageRaw) || urlPageRaw < 1 ? 1 : urlPageRaw;

  // Local state cho ô tìm kiếm để debounce 400ms
  const [searchTerm, setSearchTerm] = useState(urlQ);
  const [categories, setCategories] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Sync searchTerm khi URL thay đổi từ bên ngoài (Back / Forward)
  useEffect(() => {
    setSearchTerm(urlQ);
  }, [urlQ]);

  // Tải danh mục cho bộ lọc
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Không thể tải danh mục:', err);
      }
    }
    loadCategories();
  }, []);

  // Map category id sang category name
  const categoriesMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  // Debounce cập nhật URL param "q" sau 400ms
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const nextParams = {};
      const trimmed = searchTerm.trim();
      if (trimmed) nextParams.q = trimmed;
      if (urlCategory) nextParams.category = urlCategory;
      if (urlStatus) nextParams.status = urlStatus;
      // Đổi từ khoá thì quay về trang 1
      nextParams.page = 1;
      setSearchParams(nextParams);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Xử lý đổi danh mục
  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    const nextParams = {};
    if (urlQ) nextParams.q = urlQ;
    if (cat) nextParams.category = cat;
    if (urlStatus) nextParams.status = urlStatus;
    nextParams.page = 1;
    setSearchParams(nextParams);
  };

  // Xử lý đổi trạng thái
  const handleStatusChange = (e) => {
    const stat = e.target.value;
    const nextParams = {};
    if (urlQ) nextParams.q = urlQ;
    if (urlCategory) nextParams.category = urlCategory;
    if (stat) nextParams.status = stat;
    nextParams.page = 1;
    setSearchParams(nextParams);
  };

  // Gọi API thông qua custom hook useProductSearch (Mục 4.3.4)
  const searchParamsObj = useMemo(() => ({
    q: urlQ,
    category: urlCategory,
    status: urlStatus,
    page,
    limit: 10,
  }), [urlQ, urlCategory, urlStatus, page]);

  const { data: products, total, loading, error, refetch } = useProductSearch(searchParamsObj);

  // Tính tổng số trang (10 sản phẩm mỗi trang)
  const totalPages = Math.max(1, Math.ceil(total / 10));

  // Chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const nextParams = {};
    if (urlQ) nextParams.q = urlQ;
    if (urlCategory) nextParams.category = urlCategory;
    if (urlStatus) nextParams.status = urlStatus;
    nextParams.page = newPage;
    setSearchParams(nextParams);
  };

  // Xử lý xoá sản phẩm
  const handleDeleteClick = (product) => {
    setDeleteTarget(product);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/api/products/${deleteTarget.id}`);
      showToast('Đã xoá sản phẩm');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      console.error('Lỗi khi xoá sản phẩm:', err);
      // fallback delete call directly without /api prefix if baseURL already has /api
      try {
        await api.delete(`/products/${deleteTarget.id}`);
        showToast('Đã xoá sản phẩm');
        setDeleteTarget(null);
        refetch();
      } catch (e) {
        alert(e.response?.data?.message || 'Có lỗi khi xoá sản phẩm');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="dashboard-container">
      {/* Tiêu đề & Nút Thêm */}
      <div className="dashboard-header">
        <h1>Sản phẩm</h1>
        <button
          type="button"
          data-testid="add-button"
          className="btn-add"
          onClick={() => navigate('/products/new')}
        >
          Thêm sản phẩm
        </button>
      </div>

      {/* Bộ lọc và Tìm kiếm (Mục 4.3.1) */}
      <div className="filters-container">
        {/* Search Input */}
        <div className="filter-item search-box">
          <label htmlFor="search-input" className="sr-only">Tìm kiếm</label>
          <input
            id="search-input"
            type="text"
            data-testid="search-input"
            className="filter-input"
            placeholder="Tìm theo tên hoặc SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="filter-item">
          <label htmlFor="category-filter" className="sr-only">Danh mục</label>
          <select
            id="category-filter"
            data-testid="category-filter"
            className="filter-select"
            value={urlCategory}
            onChange={handleCategoryChange}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="filter-item">
          <label htmlFor="status-filter" className="sr-only">Trạng thái</label>
          <select
            id="status-filter"
            data-testid="status-filter"
            className="filter-select"
            value={urlStatus}
            onChange={handleStatusChange}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
          </select>
        </div>
      </div>

      {/* Trạng thái Loading */}
      {loading && (
        <div className="state-container">
          <p data-testid="loading" className="loading-text">Đang tải...</p>
        </div>
      )}

      {/* Trạng thái Lỗi */}
      {!loading && error && (
        <div data-testid="error-message" className="error-message">
          <p>{error}</p>
          <button
            type="button"
            data-testid="retry-button"
            className="btn-retry"
            onClick={refetch}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Trạng thái Rỗng */}
      {!loading && !error && products && products.length === 0 && (
        <div data-testid="empty-state" className="empty-state">
          <p>Không có sản phẩm nào</p>
        </div>
      )}

      {/* Bảng sản phẩm */}
      {!loading && !error && products && products.length > 0 && (
        <>
          <div className="table-responsive">
            <ProductTable
              products={products}
              categoriesMap={categoriesMap}
              onDelete={handleDeleteClick}
            />
          </div>

          {/* Phân trang (Mục 4.3.2) */}
          <div data-testid="pagination" className="pagination">
            <button
              type="button"
              data-testid="page-prev"
              className="btn-page"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Trước
            </button>
            <span data-testid="page-current" className="page-current">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              data-testid="page-next"
              className="btn-page"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Sau
            </button>
          </div>
        </>
      )}

      {/* Hộp thoại xác nhận xoá (Mục 4.2.5) */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xác nhận xoá sản phẩm"
        message={deleteTarget ? `Bạn có chắc chắn muốn xoá "${deleteTarget.name}" (${deleteTarget.sku})?` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </main>
  );
}
