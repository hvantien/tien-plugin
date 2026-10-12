# tien-plugin: quy ước của project

Repo này vừa là plugin vừa là marketplace của Claude Code (`hvantien/tien-plugin`). Cài bằng `tien-plugin@tien-plugin`, skill gọi bằng `/tien-plugin:<ten-skill>`.

## Format một skill

- Mỗi skill là một thư mục: `skills/<ten-skill>/SKILL.md`. File phụ (script, tài liệu tham khảo) để cùng thư mục.
- `<ten-skill>` viết thường, nối bằng dấu gạch ngang, và **phải trùng** với `name` trong frontmatter.
- Frontmatter chỉ cần hai trường, đặt ở đầu file:

  ```markdown
  ---
  name: ten-skill
  description: Skill làm gì và KHI NÀO dùng (nêu cụm từ / tình huống kích hoạt).
  ---
  ```

- `description` tối đa 1024 ký tự, viết trên một dòng. Claude dựa vào đó để quyết định có gọi skill hay không.
- Mẫu để copy: `templates/skill/SKILL.md`.

## Các thành phần khác

- Rule: `rules/<chu-de>.md`, tự nạp vào đầu session qua hook SessionStart. `rules/README.md` bị bỏ qua.
- Agent: `agents/<ten>.md`. Command: `commands/<ten>.md`.
- Không đặt secret, token, đường dẫn riêng tư vào repo, vì repo có thể public.

## Quy trình mỗi lần import skill

1. Copy skill vào `skills/<ten-skill>/`, giữ nguyên nội dung gốc (không viết lại nếu không được yêu cầu).
2. Kiểm tra `name` khớp tên thư mục và `description` ≤ 1024 ký tự.
3. Thêm một dòng vào bảng "Skills hiện có" trong `README.md`.
4. Tăng `version` trong `.claude-plugin/plugin.json` (thêm skill → tăng minor, sửa nhỏ → tăng patch). Không tăng thì máy khác không nhận bản mới.
5. Chạy `claude plugin validate .` và phải pass.
6. Commit rồi push lên `main`.

## Cập nhật trên máy

```bash
claude plugin marketplace update tien-plugin
claude plugin update tien-plugin@tien-plugin
```

Sau đó mở session Claude Code mới.
