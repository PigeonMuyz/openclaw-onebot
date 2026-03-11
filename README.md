<div align="center">

# openclaw-onebot

[OpenClaw](https://openclaw.ai) 的 **OneBot v11 协议**（QQ/Lagrange.Core、go-cqhttp 等）渠道插件。

> **Fork 说明**：本项目 Fork 自 [@kirigaya/openclaw-onebot](https://github.com/LSTM-Kirigaya/openclaw-onebot)，在原版基础上新增了消息过滤和用户导向会话功能。感谢原作者 [LSTM-Kirigaya](https://github.com/LSTM-Kirigaya) 的开源贡献。

[![npm version](https://img.shields.io/npm/v/@pigeonmuyz/openclaw-onebot?style=flat-square)](https://www.npmjs.com/package/@pigeonmuyz/openclaw-onebot)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen?style=flat-square)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square)](https://www.typescriptlang.org/)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-Plugin-9cf?style=flat-square)](https://openclaw.ai)

</div>

---

## 与原版的差异

### 🧑 用户导向会话（非消息渠道导向）

原版中，群聊和私聊各自维护独立的 AI 上下文。本 Fork **以用户为中心**：同一用户无论在群聊中 @bot 还是在私聊中发消息，都共享同一个 AI 对话上下文。

```
原版：群聊 A → 上下文 A    私聊 → 上下文 B    （互相隔离）
Fork：群聊 A → 上下文 User  私聊 → 上下文 User  （共享记忆）
```

回复仍然发送到正确位置——群消息回群，私聊回私聊。

### 🔒 消息过滤规则

| 场景 | 规则 |
|------|------|
| **群聊** | 白名单非空时，仅白名单用户 @bot 才处理；非白名单用户**静默忽略** |
| **私聊** | 白名单非空时，非白名单用户回复"权限不足"；有前缀时消息必须以前缀开头 |

### 🔧 新增配置项

| 配置项 | 说明 |
|--------|------|
| `privateMessagePrefix` | 私聊消息前缀符号（如 `/` 或 `#`），仅以此符号开头的私聊消息才处理 |

可通过 `openclaw onebot setup` 向导配置。

---

## 安装

```bash
openclaw plugins install @pigeonmuyz/openclaw-onebot
openclaw onebot setup
```

## 配置示例

```json
{
  "channels": {
    "onebot": {
      "whitelistUserIds": [1193466151, 2575183654],
      "privateMessagePrefix": "/",
      "requireMention": true,
      "renderMarkdownToPlain": true,
      "longMessageMode": "normal",
      "longMessageThreshold": 300
    }
  }
}
```

## 功能

- ✅ 私聊/群聊消息处理（用户导向共享上下文）
- ✅ 群聊 @bot 触发回复（可配置）
- ✅ 白名单 + 私聊前缀符号过滤
- ✅ 自动获取引用上下文
- ✅ 新成员入群欢迎
- ✅ 自动合并转发长消息
- ✅ 长消息生成图片（og_image 模式）
- ✅ 支持文件、图像读取/上传
- ✅ 通过 `openclaw message send` CLI 发送

## 使用

1. 安装并配置（`openclaw onebot setup`）
2. 重启 Gateway：`openclaw gateway restart`
3. 在 QQ 私聊或群聊中发消息（群聊需 @ 机器人）

## 参考

- [原版 openclaw-onebot](https://github.com/LSTM-Kirigaya/openclaw-onebot) — 原作者 [LSTM-Kirigaya](https://github.com/LSTM-Kirigaya)
- [OneBot 11](https://github.com/botuniverse/onebot-11)
- [go-cqhttp](https://docs.go-cqhttp.org/)
- [Lagrange.Core](https://github.com/LSTM-Kirigaya/Lagrange.Core)
- [NapCat](https://github.com/NapNeko/NapCatQQ)

## License

MIT © [LSTM-Kirigaya](https://github.com/LSTM-Kirigaya) (原版) / [PigeonMuyz](https://github.com/PigeonMuyz) (Fork)
