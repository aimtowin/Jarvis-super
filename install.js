#!/usr/bin/env node

/**
 * Jarvis — Claude Code Skill 安装脚本
 *
 * 用法:
 *   npx jarvis-claude          # 从 npm 安装
 *   npx github:user/jarvis     # 从 GitHub 安装
 *   node install.js            # 本地直接安装
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ── 路径解析 ──────────────────────────────────────────────

const HOME = os.homedir();
const CLAUDE_SKILLS = path.join(HOME, '.claude', 'skills', 'jarvis');
const CLAUDE_CONFIG = path.join(HOME, '.claude', 'CLAUDE.md');
const JARVIS_DATA = path.join(HOME, '.jarvis');

// 安装源目录（npx 下载的包目录）
const SRC = __dirname;

// ── 工具函数 ──────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return 'created';
  }
  return 'exists';
}

function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

function boxPrint(title) {
  const line = '─'.repeat(52);
  console.log(`\n┌${line}┐`);
  console.log(`│  ${title.padEnd(50)}│`);
  console.log(`└${line}┘\n`);
}

// ── 安装流程 ──────────────────────────────────────────────

async function install() {
  boxPrint('Jarvis v1.1.0 — 安装中');

  // Step 1: 安装 Skill 到 Claude Code
  console.log('📦 安装 Skill...');
  const skillStatus = ensureDir(CLAUDE_SKILLS);

  const skillSrc = path.join(SRC, 'SKILL.md');
  const skillDest = path.join(CLAUDE_SKILLS, 'SKILL.md');

  if (!fs.existsSync(skillSrc)) {
    console.error('❌ 错误: 找不到 SKILL.md，安装包可能不完整。');
    process.exit(1);
  }

  copyFile(skillSrc, skillDest);
  console.log(`   SKILL.md → ${CLAUDE_SKILLS}/SKILL.md  (${skillStatus === 'created' ? '新建' : '覆盖更新'})`);

  // Step 2: 创建 ~/.claude/CLAUDE.md 全局引导（关键：确保记忆架构可初始化）
  console.log('\n🔗 检查全局引导配置...');
  const claudeConfigContent = `# Claude Code 全局引导

## Jarvis 项目中枢

~/.jarvis/ 是本机的项目生成与管理中枢。通过自然语言描述需求即可激活 Jarvis Skill。

## 快捷指令

- "创建/开始/做/搞 项目" → 激活 Jarvis 项目管理中枢
- "调用 XX 项目" → 路由到已有项目
- "/审视" 或 "#审视" → 对最近决策做独立核验
- "/exp" 或 "查经验" → 卡住时强制检索三层经验
- "grill me" → 深度追问模糊意图
`;

  if (!fs.existsSync(CLAUDE_CONFIG)) {
    ensureDir(path.join(HOME, '.claude'));
    fs.writeFileSync(CLAUDE_CONFIG, claudeConfigContent, 'utf-8');
    console.log(`   ✅ 已创建 ~/.claude/CLAUDE.md（全局引导）`);
  } else {
    // 检查是否已包含 Jarvis 引用
    const existing = fs.readFileSync(CLAUDE_CONFIG, 'utf-8');
    if (!existing.includes('Jarvis') && !existing.includes('jarvis')) {
      const appended = existing.trimEnd() + '\n\n' + claudeConfigContent;
      fs.writeFileSync(CLAUDE_CONFIG, appended, 'utf-8');
      console.log(`   ✅ 已追加 Jarvis 引导到 ~/.claude/CLAUDE.md`);
    } else {
      console.log(`   ~/.claude/CLAUDE.md 已包含 Jarvis 引导，跳过`);
    }
  }

  // Step 3: 预置 Jarvis 数据目录模板（如果不存在）
  console.log('\n📂 检查数据目录...');
  const dataStatus = ensureDir(JARVIS_DATA);

  const templatesSrc = path.join(SRC, 'templates');
  if (dataStatus === 'created' && fs.existsSync(templatesSrc)) {
    // 创建子目录
    ensureDir(path.join(JARVIS_DATA, 'memory'));
    ensureDir(path.join(JARVIS_DATA, 'agents'));
    ensureDir(path.join(JARVIS_DATA, 'projects'));

    // 复制 L1 模板文件
    const templateFiles = [
      ['MEMORY.md', 'memory/MEMORY.md'],
      ['user_preferences.md', 'memory/user_preferences.md'],
      ['brain-memory.md', 'memory/brain-memory.md'],
      ['agents_index.json', 'agents/index.json'],
      ['dispatch-rules.json', 'agents/dispatch-rules.json'],
      ['projects_index.json', 'projects/index.json'],
    ];

    for (const [srcName, destRel] of templateFiles) {
      const srcPath = path.join(templatesSrc, srcName);
      const destPath = path.join(JARVIS_DATA, destRel);
      if (fs.existsSync(srcPath)) {
        copyFile(srcPath, destPath);
        console.log(`   ${destRel}`);
      }
    }

    // 创建 L2 Agent 记忆目录（含种子 MEMORY.md）
    const agentNames = [
      'project-manager',
      'architect',
      'backend-builder',
      'database-administrator',
      'frontend-builder',
      'security-administrator',
      'evaluator',
      'reviewagent',
    ];

    for (const agentName of agentNames) {
      const agentMemoryDir = path.join(JARVIS_DATA, 'agents', agentName, 'memory');
      ensureDir(agentMemoryDir);
      const memPath = path.join(agentMemoryDir, 'MEMORY.md');
      if (!fs.existsSync(memPath)) {
        const seedContent = `# ${agentName} — 跨项目经验记忆

> 无限积累，只增不删。每次记忆点按关键词标题 + 简介记录。

## 记忆条目

<!-- 格式：### <关键词标题> / 简介 1-3 句 / 日期 + 标签 -->

*创建: ${new Date().toISOString().slice(0, 10)}*
`;
        fs.writeFileSync(memPath, seedContent, 'utf-8');
      }
    }
    console.log('   Agent 记忆目录已初始化（8 个 Agent）');
    console.log('   数据目录已初始化（含完整模板）');
  } else {
    console.log(`   数据目录已存在，跳过初始化（保留现有数据）`);
    // 增量更新：补充可能缺失的 Agent 目录
    const agentNames = [
      'project-manager', 'architect', 'backend-builder',
      'database-administrator', 'frontend-builder', 'security-administrator',
      'evaluator', 'reviewagent',
    ];
    let createdCount = 0;
    for (const agentName of agentNames) {
      const agentMemoryDir = path.join(JARVIS_DATA, 'agents', agentName, 'memory');
      if (!fs.existsSync(agentMemoryDir)) {
        ensureDir(agentMemoryDir);
        const memPath = path.join(agentMemoryDir, 'MEMORY.md');
        const seedContent = `# ${agentName} — 跨项目经验记忆

> 无限积累，只增不删。每次记忆点按关键词标题 + 简介记录。

## 记忆条目

*创建: ${new Date().toISOString().slice(0, 10)}*
`;
        fs.writeFileSync(memPath, seedContent, 'utf-8');
        createdCount++;
      }
    }
    if (createdCount > 0) {
      console.log(`   补充创建了 ${createdCount} 个缺失的 Agent 记忆目录`);
    }
  }

  // Step 4: 验证
  const checks = [
    { label: 'SKILL.md', path: path.join(CLAUDE_SKILLS, 'SKILL.md') },
    { label: '全局引导', path: CLAUDE_CONFIG },
    { label: '数据目录', path: path.join(JARVIS_DATA, 'memory', 'MEMORY.md') },
    { label: '用户画像', path: path.join(JARVIS_DATA, 'memory', 'user_preferences.md') },
    { label: '全局经验', path: path.join(JARVIS_DATA, 'memory', 'brain-memory.md') },
    { label: '项目索引', path: path.join(JARVIS_DATA, 'projects', 'index.json') },
    { label: 'Agent 注册表', path: path.join(JARVIS_DATA, 'agents', 'index.json') },
    { label: '调度规则', path: path.join(JARVIS_DATA, 'agents', 'dispatch-rules.json') },
    { label: 'Agent 记忆(project-manager)', path: path.join(JARVIS_DATA, 'agents', 'project-manager', 'memory', 'MEMORY.md') },
    { label: 'Agent 记忆(evaluator)', path: path.join(JARVIS_DATA, 'agents', 'evaluator', 'memory', 'MEMORY.md') },
    { label: 'Agent 记忆(reviewagent)', path: path.join(JARVIS_DATA, 'agents', 'reviewagent', 'memory', 'MEMORY.md') },
  ];

  console.log('\n✅ 安装验证:');
  let allGood = true;
  for (const check of checks) {
    const status = fs.existsSync(check.path) ? '✅' : '❌';
    if (status === '❌') allGood = false;
    console.log(`   ${status} ${check.label}`);
  }

  boxPrint('安装完成');

  console.log('🚀 下一步:');
  console.log('   重启 Claude Code，或新开一个会话。');
  console.log('   然后直接描述你的需求，Jarvis 会自动激活。');
  console.log('');
  console.log('💡 首次激活时 Jarvis 会引导你完成自我介绍，建立用户画像。');
  console.log('');
  console.log('📖 可选配置（推荐）:');
  console.log('   设置外部验证模型做交叉验收:');
  console.log('     export EVALUATOR_API_KEY=your_key');
  console.log('     export EVALUATOR_MODEL=kimi-k2.5');
  console.log('');
  console.log('🏗️ 记忆架构已就绪:');
  console.log('   L1 全局记忆: ~/.jarvis/memory/');
  console.log('   L2 Agent 记忆: ~/.jarvis/agents/<name>/memory/ (8 个 Agent)');
  console.log('   L3 项目分支记忆: 项目创建时自动初始化');
  console.log('   全局引导: ~/.claude/CLAUDE.md');
  console.log('');

  if (!allGood) {
    console.warn('⚠️  部分文件缺失，但不影响核心功能。可重新运行安装脚本修复。');
    process.exit(1);
  }
}

install().catch((err) => {
  console.error('❌ 安装失败:', err.message);
  process.exit(1);
});
