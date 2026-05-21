# Jarvis v1.1.0

高性能低开销项目生成与管理中枢 — Claude Code Skill 版。

**Jarvis 是用于创建其它工具的工具。**

## v1.1.0 更新

- **记忆架构自举修复**：安装脚本自动创建 `~/.claude/CLAUDE.md` 全局引导，确保新用户从零开始也能完整初始化三层记忆体系
- **新增 reviewagent**：视觉审查官 — 前端页面/动画完成后自动审查布局、色彩、动效、响应式
- **L2 Agent 记忆预置**：安装时自动创建 8 个 Agent 的记忆目录（含种子 MEMORY.md）
- **brain-memory 全局经验**：新增超脑全局经验记忆文件，记录卡顿突破和调度教训
- **强化经验检索**：Agent 重试前自动 Grep 三层经验（pre_retry_gate），用户 `/exp` 命令随时刹车检索
- **调度规则升级**：dispatch-rules v1.1 — 含完整决策树、reviewagent 调度模式、冲突解决规则

## 核心设计：子 Agent 上下文隔离

Jarvis 的低开销基于一个关键机制：**主模型调用子 Agent 进程，子 Agent 拥有独立上下文窗口，不占用主模型上下文**。

```
用户 ↔ Jarvis(主模型)     ← 上下文窗口：规则 + 记忆 + 当前对话（精简）
       │
       ├─ 派 project-manager  → [独立进程，独立上下文] → 返回结果摘要
       ├─ 派 frontend-builder  → [独立进程，独立上下文] → 返回结果摘要
       ├─ 派 evaluator        → [独立进程，独立上下文] → 返回验收报告
       └─ ...
```

每个 Agent 只接收：当前任务描述 + L2 最近 5 条经验 + L3 项目上下文 + 交付物规格。完成后只返回结果摘要（代码 diff、验收结论、产出物路径），不返回完整思考过程。

**效果**：主模型上下文始终保持精简，可支撑长会话、大项目、多任务编排。

## 是什么

Jarvis 是搭载在 Claude Code 上的项目管理 AI 层。它不写代码，负责：

- **意图理解** → 分析你想做什么
- **项目匹配** → 自动路由到已有项目或创建新项目
- **需求精化** → 模糊需求追问到具体
- **任务拆分** → 大任务拆为行为树逐节点执行
- **Agent 调度** → 按任务类型自动派发最合适的 Agent（子进程隔离）
- **记忆维护** → 三层记忆体系，越用越懂你

## 三层记忆

| 层级 | 存什么 | 效果 |
|------|--------|------|
| L1 全局 | 用户画像、偏好、规则、超脑经验 | 越用越了解你 |
| L2 Agent | 跨项目可复用经验 | 同类任务一次比一次快 |
| L3 项目 | 项目特有决策/约束 | 切换项目不丢上下文 |

## 8 个专职 Agent

| Agent | 角色 |
|-------|------|
| project-manager | 需求翻译官，不写代码 |
| architect | 系统架构师 |
| backend-builder | 后端构建师 |
| database-administrator | 数据库管理员 |
| frontend-builder | 前端构建师 |
| security-administrator | 安全管理员 |
| reviewagent | 视觉审查官（v1.1 新增） |
| evaluator | 验收工程师（必选） |

按任务自动编排执行顺序，支持并行派发。

## 安装

### 方式一：npx 一键安装（推荐）

```bash
# 从 npm 安装
npx jarvis-claude

# 或从 GitHub 安装
npx github:aimtowin/Jarvis-super
```

安装脚本自动完成：
1. 复制 `SKILL.md` 到 `~/.claude/skills/jarvis/`
2. 创建 `~/.claude/CLAUDE.md` 全局引导（**v1.1 新增：确保记忆架构可自举**）
3. 预置 `~/.jarvis/` 数据目录（含完整模板 + 8 个 Agent 记忆目录）
4. 验证安装完整性

重启 Claude Code 或新开会话即可生效。

### 方式二：手动安装

```bash
mkdir -p ~/.claude/skills/jarvis
cp SKILL.md ~/.claude/skills/jarvis/
```

手动安装后需自行创建 `~/.claude/CLAUDE.md` 全局引导（内容见 SKILL.md §首次激活 — Step 0），否则记忆架构可能无法自举。

### 更新

再次运行相同安装命令即可覆盖更新 SKILL.md，数据目录（`~/.jarvis/`）中的记忆文件不受影响。v1.0.0 → v1.1.0 升级会自动补充缺失的 Agent 记忆目录。

## 首次使用

Jarvis 首次激活时自动检测并补全环境：
1. 检查 `~/.claude/CLAUDE.md` → 缺失则自动创建
2. 检查 `~/.jarvis/` → 缺失则创建完整目录结构
3. 引导用户完成自我介绍以建立用户画像

画像建立后即可开始创建项目。示例：
- "做一个个人博客网站"
- "帮我创建视频生成工具"
- "调用 blog 项目，加个评论功能"

## 记忆架构自举保证

Jarvis v1.1.0 通过以下 4 层兜底机制确保新用户在任何环境下都能完整初始化记忆体系：

1. **install.js** → 创建 `~/.claude/CLAUDE.md` + `~/.jarvis/` + 所有 Agent 记忆目录
2. **SKILL.md Step 0** → 若 install.js 未执行（手动安装），首次激活时自动创建 `~/.claude/CLAUDE.md`
3. **SKILL.md Step 1** → 若 `~/.jarvis/` 不存在，自动创建完整目录结构
4. **Agent 派发前** → 若对应 L2/L3 记忆文件不存在，自动创建种子文件

## 可选配置

### 外部验证模型（推荐）

设置环境变量启用交叉验证，避免 AI 自评失真：

```bash
export EVALUATOR_API_KEY=your_api_key
export EVALUATOR_MODEL=kimi-k2.5
```

不配置不影响使用，但验收精度降低。

## 目录结构

```
~/.claude/
├── CLAUDE.md             ← 全局引导（★ v1.1 新增：记忆架构入口）
└── skills/jarvis/
    └── SKILL.md          ← Jarvis Skill

~/.jarvis/                ← Jarvis 数据目录
├── memory/               ← L1 全局记忆
│   ├── MEMORY.md
│   ├── user_preferences.md
│   └── brain-memory.md   ← ★ v1.1 新增：超脑全局经验
├── agents/               ← Agent 注册 + L2 跨项目经验
│   ├── index.json
│   ├── dispatch-rules.json
│   └── <name>/memory/MEMORY.md  ← 8 个 Agent 均预置
└── projects/             ← 项目索引 + L3 分支记忆
    └── index.json
```

## 版本历史

- **1.1.0** — 记忆架构自举修复、reviewagent 视觉审查、brain-memory 全局经验、L2 Agent 记忆预置、调度规则 v1.1
- **1.0.0** — 首次发布，从 E:\Jarvis\ 生产环境提炼

## 发布

### 发布到 npm

```bash
cd Jarvis1.0.0
npm login
npm publish --access public
```

### 发布到 GitHub

```bash
cd Jarvis1.0.0
git add .
git commit -m "feat: Jarvis v1.1.0 — 记忆架构自举修复 + reviewagent + brain-memory"
git push
```
