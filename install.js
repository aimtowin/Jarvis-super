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
  boxPrint('Jarvis v1.0.0 — 安装中');

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

  // Step 2: 预置 Jarvis 数据目录模板（如果不存在）
  console.log('\n📂 检查数据目录...');
  const dataStatus = ensureDir(JARVIS_DATA);

  // 只在数据目录不存在时复制模板
  const templatesSrc = path.join(SRC, 'templates');
  if (dataStatus === 'created' && fs.existsSync(templatesSrc)) {
    // 创建子目录
    ensureDir(path.join(JARVIS_DATA, 'memory'));
    ensureDir(path.join(JARVIS_DATA, 'agents'));
    ensureDir(path.join(JARVIS_DATA, 'projects'));

    // 复制模板文件
    const templateFiles = [
      ['MEMORY.md', 'memory/MEMORY.md'],
      ['user_preferences.md', 'memory/user_preferences.md'],
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
    console.log('   数据目录已初始化（含模板文件）');
  } else {
    console.log(`   数据目录已存在，跳过初始化（保留现有数据）`);
  }

  // Step 3: 验证
  const checks = [
    { label: 'SKILL.md', path: path.join(CLAUDE_SKILLS, 'SKILL.md') },
    { label: '数据目录', path: path.join(JARVIS_DATA, 'memory', 'MEMORY.md') },
    { label: '项目索引', path: path.join(JARVIS_DATA, 'projects', 'index.json') },
    { label: 'Agent 注册表', path: path.join(JARVIS_DATA, 'agents', 'index.json') },
    { label: '调度规则', path: path.join(JARVIS_DATA, 'agents', 'dispatch-rules.json') },
  ];

  console.log('\n✅ 安装验证:');
  for (const check of checks) {
    const status = fs.existsSync(check.path) ? '✅' : '❌';
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
}

install().catch((err) => {
  console.error('❌ 安装失败:', err.message);
  process.exit(1);
});
