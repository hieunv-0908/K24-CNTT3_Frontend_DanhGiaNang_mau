# BÀI LÀM – ĐÁNH GIÁ NĂNG LỰC FRONTEND (K24)

- **Mã đề:** 01
- **Họ tên:** Nguyễn Văn Hiếu
- **Lớp:** K24-CNTT3
- **Link repository:** https://github.com/hieunv-0908/K24-CNTT3_Frontend_DanhGiaNangLuc
- **Hệ điều hành (Windows/macOS):** window
- **Mã commit P2 đã nộp trước phút 90 (gõ `git log --oneline -1`):**
- **Phiên bản Node.js (gõ `node -v`):** v22.18.0

## 4.1. Giao diện danh sách sản phẩm

> Pha 1 – mức AI-0 (không dùng AI).

> Chấm trực tiếp trên mã nguồn thư mục officemart_admin. Đánh dấu `[x]` vào các mục đã làm để tự kiểm tra.

- [x] 4.1.1. Bố cục trang
- [x] 4.1.2. Bảng sản phẩm
- [x] 4.1.3. Định dạng dữ liệu
- [x] 4.1.4. Hiển thị trên điện thoại

## 4.2. Thêm, sửa, xoá sản phẩm qua API

> Pha 1 – mức AI-0 (không dùng AI).

> Chấm trực tiếp trên mã nguồn thư mục officemart_admin.

- [x] 4.2.1. Tải danh sách
- [x] 4.2.2. Form thêm sản phẩm
- [x] 4.2.3. Gửi form
- [x] 4.2.4. Sửa sản phẩm
- [x] 4.2.5. Xoá sản phẩm

## 4.3. Tìm kiếm, lọc và phân trang

> Pha 2 – mức AI-2 (được dùng AI, ghi nhật ký ở Mục 4.3.5).

> Mục 4.3.1 đến 4.3.3 và ý c của Mục 4.3.4 chấm trực tiếp trên mã nguồn.

- [x] 4.3.1. Tìm kiếm và lọc
- [x] 4.3.2. Phân trang
- [x] 4.3.3. Đồng bộ URL

### 4.3.4. Phản biện mã do AI sinh

#### a) Thao tác làm danh sách hiển thị sai

Các bước thao tác:

```text
1. Khởi động API ở chế độ chậm: npm run api:cham
2. Mở ứng dụng tại trang /products trên trình duyệt (http://localhost:5173/products).
3. Tại ô tìm kiếm (data-testid="search-input"), gõ từ khoá "ban" (ở chế độ này API có độ trễ 2,5 giây).
4. Ngay lập tức khi request "ban" đang được gửi và chưa phản hồi, người dùng xoá và gõ sang từ khoá "chuot" (request này độ trễ chỉ 0,1 giây).
```

Kết quả hiển thị:

```text
Danh sách ban đầu hiển thị sản phẩm của từ khoá "chuot" (vì phản hồi sau 0,1s), nhưng 2,5s sau khi request "ban" phản hồi xong, danh sách bị ghi đè lại bằng các sản phẩm của từ khoá "ban" (bàn phím, bàn làm việc...), mặc dù ô tìm kiếm hiện tại vẫn đang là "chuot".
```

Kết quả đúng:

```text
Danh sách sản phẩm luôn phải hiển thị đúng kết quả tìm kiếm của từ khoá mới nhất là "chuot". Khi từ khoá thay đổi từ "ban" sang "chuot", request cũ ("ban") đang chờ phải bị huỷ bỏ (abort) và không được phép ghi đè lên kết quả của request mới nhất.
```

#### b) Vì sao hook hiển thị sai

Xảy ra lỗi bất đồng bộ cạnh tranh (Race Condition): Request cũ có tham số "ban" trễ 2,5 giây, trong khi request mới có tham số "chuot" trễ chỉ 0,1 giây. Do hook của AI không sử dụng AbortController trong hàm dọn dẹp (cleanup function) của useEffect để huỷ request đang bay khi dependencies thay đổi, nên response của request "ban" về sau cùng và hàm `setData` thực thi sau, đè bẹp kết quả mới hơn. Ngoài ra, hook AI không phân biệt lỗi do request bị huỷ (CanceledError) dẫn đến có thể hiển thị thông báo lỗi sai và không có cơ chế debounce.

#### c) Hook đã sửa

> Chấm trực tiếp trên file src/hooks/useProductSearch.js và trang danh sách.

### 4.3.5. Nhật ký dùng AI (giữ – sửa – loại bỏ)

> Ghi ít nhất 2 lần dùng AI có ảnh hưởng đến mã nộp. Không dùng AI trong Pha 2 thì xoá bảng và ghi "Không sử dụng AI trong Pha 2".

| Lần | Câu lệnh chính gửi cho AI | Đoạn mã hoặc ý AI đưa ra (file) | Quyết định (giữ/sửa/loại bỏ) | Lý do | Bằng chứng kiểm chứng (chạy thử gì, kết quả) |
| --- | ------------------------- | ------------------------------- | ---------------------------- | ----- | -------------------------------------------- |
| 1   | Gợi ý viết custom hook useProductSearch hỗ trợ AbortController để huỷ request cũ khi params thay đổi | Mã hook dùng `AbortController`, truyền `signal` vào `api.get` và gọi `controller.abort()` trong cleanup của `useEffect` (`src/hooks/useProductSearch.js`). | Sửa | Đoạn mã ban đầu của AI thiếu cơ chế bắt lỗi `axios.isCancel(err)` khiến khi huỷ request thì hook lại gán state `error`, đồng thời thiếu hàm `refetch` khi người dùng thêm/xoá sản phẩm. Đã sửa thêm `axios.isCancel(err)` để bỏ qua lỗi huỷ và thêm `reloadTrigger/refetch`. | Khởi động `npm run api:cham`, test tìm kiếm gõ nhanh "ban" rồi đổi thành "chuot": request "ban" bị huỷ trên tab Network (status canceled), danh sách giữ nguyên kết quả của "chuot", không bị ghi đè. Gọi `refetch` sau khi xoá sản phẩm danh sách tự động cập nhật ngay. |
| 2   | Hướng dẫn đồng bộ bộ lọc và phân trang lên URL với useSearchParams trong React Router 6 | Gợi ý dùng `const [searchParams, setSearchParams] = useSearchParams()`, cập nhật URL trực tiếp khi đổi giá trị ô input (`src/pages/AdminDashboard.jsx`). | Sửa | Cập nhật trực tiếp mỗi khi gõ làm URL đổi liên tục và gửi request không ngừng. Đã sửa lại: dùng local state `searchTerm` riêng, debounce bằng `setTimeout` 400ms mới cập nhật param `q` lên URL; đồng thời xử lý reset `page = 1` mỗi khi từ khoá hoặc category/status thay đổi. | Gõ liền từ "ban" trên ô tìm kiếm, kiểm tra thấy chỉ có 1 request gửi đi sau 400ms. Thử paste URL `http://localhost:5173/products?category=mouse&page=2` mở trực tiếp trên trình duyệt, các ô chọn và danh sách hiển thị chuẩn xác; ấn nút Back/Forward của trình duyệt dữ liệu đồng bộ tức thì. |

## Ghi chú (không tính điểm)

- Xử lý trường hợp biên từ khoá tìm kiếm chỉ có khoảng trắng: Thực hiện `.trim()` trước khi đẩy lên URL và query API. Nếu rỗng sau khi trim thì bỏ tham số `q` để lấy toàn bộ danh sách.
- Xử lý số trang không hợp lệ trên URL: Nếu `page < 1` hoặc `NaN` thì tự động ép về 1; nếu `page > totalPages` thì cập nhật về `totalPages`.
- Chống spam submit: Nút lưu (submit-button) bị disable ngay khi bắt đầu gửi request và form không nhận thêm thao tác bấm chuột cho đến khi request hoàn thành.
- Hộp thoại xác nhận xoá tự làm: Tạo component ConfirmDialog tuân thủ đúng yêu cầu đề bài, không dùng `window.confirm` hay `alert`.
