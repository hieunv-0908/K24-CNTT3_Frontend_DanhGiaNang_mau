import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axiosClient.js';
import { useToast } from '../context/ToastContext.jsx';

const SKU_REGEX = /^[A-Z]{3}-\d{4}$/;

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Load categories
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

  // Load product if editing
  useEffect(() => {
    if (!isEdit) return;

    async function loadProduct() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await api.get(`/products/${id}`);
        const p = res.data;
        setForm({
          name: p.name || '',
          sku: p.sku || '',
          category: p.category || '',
          price: p.price !== undefined ? String(p.price) : '',
          stock: p.stock !== undefined ? String(p.stock) : '',
          status: p.status || 'active',
        });
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setErrors({ global: err.response?.data?.message || err.message });
        }
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id, isEdit]);

  const validate = () => {
    const newErrors = {};

    // name: Bắt buộc, 3 đến 100 ký tự sau khi bỏ khoảng trắng ở đầu và cuối
    const trimmedName = form.name.trim();
    if (!trimmedName || trimmedName.length < 3 || trimmedName.length > 100) {
      newErrors.name = 'Tên sản phẩm từ 3 đến 100 ký tự sau khi bỏ khoảng trắng';
    }

    // sku: Bắt buộc, đúng dạng ABC-1234: 3 chữ in hoa, dấu gạch ngang, 4 chữ số
    if (!form.sku || !SKU_REGEX.test(form.sku)) {
      newErrors.sku = 'SKU phải đúng dạng ABC-1234 (3 chữ hoa, gạch ngang, 4 chữ số)';
    }

    // category: Bắt buộc chọn
    if (!form.category) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }

    // price: Số lớn hơn 0
    const priceNum = Number(form.price);
    if (form.price === '' || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'Giá phải là số lớn hơn 0';
    }

    // stock: Số nguyên, không âm
    const stockNum = Number(form.stock);
    if (form.stock === '' || isNaN(stockNum) || !Number.isInteger(stockNum) || stockNum < 0) {
      newErrors.stock = 'Tồn kho phải là số nguyên không âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Xoá lỗi trường khi người dùng sửa
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        status: form.status,
      };

      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        showToast('Đã cập nhật sản phẩm');
      } else {
        await api.post('/products', payload);
        showToast('Đã thêm sản phẩm');
      }
      navigate('/products');
    } catch (err) {
      if (err.response?.status === 409) {
        // sku trùng: hiển thị message của server ở field-error-sku, giữ nguyên dữ liệu đã nhập
        setErrors((prev) => ({
          ...prev,
          sku: err.response.data?.message || 'SKU đã tồn tại',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          global: err.response?.data?.message || 'Có lỗi xảy ra khi lưu',
        }));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="form-container">
        <p data-testid="loading">Đang tải...</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="form-container">
        <div data-testid="error-message" className="error-message">
          <p>Không tìm thấy sản phẩm</p>
          <Link to="/products" className="btn-back">Quay lại danh sách</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="form-container">
      <div className="form-header">
        <h1>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
        <Link to="/products" className="btn-back">Quay lại</Link>
      </div>

      {errors.global && (
        <div data-testid="error-message" className="error-message">
          <p>{errors.global}</p>
        </div>
      )}

      <form data-testid="product-form" onSubmit={handleSubmit} className="product-form">
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name">Tên sản phẩm *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Nhập tên sản phẩm..."
          />
          {errors.name && (
            <p data-testid="field-error-name" className="field-error">
              {errors.name}
            </p>
          )}
        </div>

        {/* SKU */}
        <div className="form-group">
          <label htmlFor="sku">Mã SKU *</label>
          <input
            id="sku"
            name="sku"
            type="text"
            value={form.sku}
            onChange={handleChange}
            placeholder="Ví dụ: ABC-1234"
          />
          {errors.sku && (
            <p data-testid="field-error-sku" className="field-error">
              {errors.sku}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category">Danh mục *</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p data-testid="field-error-category" className="field-error">
              {errors.category}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="form-group">
          <label htmlFor="price">Giá (₫) *</label>
          <input
            id="price"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Nhập giá..."
          />
          {errors.price && (
            <p data-testid="field-error-price" className="field-error">
              {errors.price}
            </p>
          )}
        </div>

        {/* Stock */}
        <div className="form-group">
          <label htmlFor="stock">Tồn kho *</label>
          <input
            id="stock"
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            placeholder="Nhập số lượng tồn kho..."
          />
          {errors.stock && (
            <p data-testid="field-error-stock" className="field-error">
              {errors.stock}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="form-group">
          <label htmlFor="status">Trạng thái</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
          </select>
          {errors.status && (
            <p data-testid="field-error-status" className="field-error">
              {errors.status}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button
            type="submit"
            data-testid="submit-button"
            className="btn-submit"
            disabled={saving}
          >
            {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </button>
        </div>
      </form>
    </main>
  );
}
