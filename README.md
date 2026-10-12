# tien-plugin

Plugin Claude Code cá nhân: skill, rule, agent, command. Repo này đồng thời là một marketplace nên cài trực tiếp từ GitHub được.

## Cài đặt

```
/plugin marketplace add hvantien/tien-plugin
/plugin install tien-plugin@tien-plugin
```

Cập nhật sau khi có thay đổi mới:

```
/plugin marketplace update tien-plugin
```

## Skills hiện có

| Skill | Dùng khi |
|---|---|
| `headless-agent-jobs` | App web cá nhân chạy `claude -p` trên server để xử lý nội dung user vừa gửi (chấm bài, trả lời comment...), kèm queue panel, monitor và trang lịch sử chạy |

## Cấu trúc

```
tien-plugin/
├── .claude-plugin/
│   ├── plugin.json         # thông tin plugin (tên, version)
│   └── marketplace.json    # để cài từ GitHub
├── skills/                 # mỗi skill một thư mục có SKILL.md
├── agents/                 # subagent: <ten>.md
├── commands/               # slash command: <ten>.md
├── rules/                  # rule luôn áp dụng, nạp vào đầu session
├── hooks/hooks.json        # hook SessionStart nạp rules/
├── scripts/load-rules.sh
└── templates/skill/        # mẫu SKILL.md để copy
```

## Thêm skill

1. Tạo thư mục `skills/<ten-skill>/` (copy từ `templates/skill/SKILL.md`, hoặc chép nguyên thư mục skill có sẵn vào).
2. Trong `SKILL.md`, phần frontmatter cần `name` và `description`. `description` quyết định lúc nào Claude gọi skill nên ghi rõ tình huống kích hoạt.
3. File phụ (scripts, tài liệu tham khảo) để cùng thư mục skill và dẫn link từ `SKILL.md`.
4. Commit, push, rồi chạy `/plugin marketplace update tien-plugin`.

Skill gọi bằng `/tien-plugin:<ten-skill>` hoặc Claude tự gọi theo `description`.

## Thêm rule

Tạo file `rules/<chu-de>.md`. Nội dung được nạp vào ngữ cảnh ở đầu mỗi session. Xem [rules/README.md](rules/README.md).

## Thêm agent / command

- Agent: `agents/<ten>.md` (frontmatter `name`, `description`, tuỳ chọn `tools`, `model`).
- Command: `commands/<ten>.md`, gọi bằng `/tien-plugin:<ten>`.

## Phát hành phiên bản

Tăng `version` trong `.claude-plugin/plugin.json` mỗi khi muốn người dùng nhận bản cập nhật.
