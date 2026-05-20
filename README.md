# Jarvis v1.0.0

高性能低开销项目生成与管理中枢 — Claude Code Skill 版。

**Jarvis 是用于创建其它工具的工具。**

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

## 核心设计

### 子 Agent 上下文隔离

主模型只做调度决策，业务逻辑全部下沉到子 Agent 独立进程。主模型上下文窗口保持精简。

### 三层记忆

| 层级 | 存什么 | 效果 |
|------|--------|------|
| L1 全局 | 用户画像、偏好、规则 | 越用越了解你 |
| L2 Agent | 跨项目可复用经验 | 同类任务一次比一次快 |
| L3 项目 | 项目特有决策/约束 | 切换项目不丢上下文 |

### 多 Agent 协作

7 个专职 Agent，按任务自动编排执行顺序：
project-manager → architect → backend-builder → database-administrator → frontend-builder → security-administrator → evaluator

### 确认制

新项目/大改动前必须用户确认（4 选项），防止 AI 自作主张。

### 自我进化

每轮对话自动判断是否写入新记忆。无需手动维护，自动累积经验。

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
2. 预置 `~/.jarvis/` 数据目录（含模板文件）
3. 验证安装完整性

重启 Claude Code 或新开会话即可生效。

### 方式二：手动安装

```bash
mkdir -p ~/.claude/skills/jarvis
cp SKILL.md ~/.claude/skills/jarvis/
```

### 更新

再次运行相同安装命令即可覆盖更新 SKILL.md，数据目录（`~/.jarvis/`）中的记忆文件不受影响。

## 首次使用

Jarvis 首次激活时自动创建 `~/.jarvis/` 目录结构，并引导用户完成自我介绍以建立用户画像：

1. 怎么称呼你？
2. 主要做什么方向？
3. 熟悉哪些技术栈？
4. 编程水平如何？
5. 喜欢详细解释还是直接结论？
6. 近期目标是什么？

画像建立后即可开始创建项目。示例：
- "做一个个人博客网站"
- "帮我创建视频生成工具"
- "调用 blog 项目，加个评论功能"

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
~/.jarvis/              ← Jarvis 数据目录（自动创建）
├── memory/             ← L1 全局记忆
├── agents/             ← Agent 注册 + L2 跨项目经验
└── projects/           ← 项目索引 + L3 分支记忆
```

## 版本

1.0.0 — 首次发布，从 E:\Jarvis\ 生产环境提炼。

## 发布到 npm / GitHub

### 发布到 npm

```bash
cd Jarvis1.0.0
npm login
npm publish --access public
```

发布后用户可通过 `npx jarvis-claude` 安装。

### 发布到 GitHub

推送仓库到 GitHub，用户可通过 `npx github:username/jarvis-claude` 安装。

```bash
cd Jarvis1.0.0
git init
git add .
git commit -m "Jarvis v1.0.0 — 项目生成与管理中枢"
git remote add origin https://github.com/YOUR_USERNAME/jarvis-claude.git
git push -u origin main
```

记得修改 `package.json` 中的 `repository.url` 为实际 GitHub 地址。
