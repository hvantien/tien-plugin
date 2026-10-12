# Rules

Mỗi file `.md` trong thư mục này (trừ `README.md`) được nạp vào ngữ cảnh của Claude ở đầu mỗi session, thông qua hook `SessionStart` (`hooks/hooks.json` → `scripts/load-rules.sh`).

Mỗi file nên là một chủ đề, viết ngắn gọn dạng mệnh lệnh. Ví dụ `rules/commit-style.md`:

```markdown
# Commit style
- Viết commit message theo Conventional Commits.
- Subject tối đa 72 ký tự.
```

Rule nào nạp vào session đều tốn context, nên chỉ để ở đây những gì cần áp dụng mọi lúc. Hướng dẫn chỉ dùng trong tình huống cụ thể thì nên viết thành skill.
