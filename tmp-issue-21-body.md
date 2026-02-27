背景：polymark-task 的 watchlist 输出将升级为“可执行清单”（polymark-task Issue #19），新增字段 action/entry_plan/monitor_sources/key_risks/thesis，并对天气/航空提供更具体模板。

目标：polymark-kb 的 watchlist 卡片/页面同步升级，并做中文化展示，避免英文标签导致看不懂。

需求：
1) 卡片中文化：
- action 显示为中文徽标：跟踪/等待/考虑/避免
- 核心字段标题使用中文：入场计划、监控源、关键风险、核心理由

2) 卡片内容：
- 更突出“预测什么事件”：标题/问题置顶 + 关键时间（若有）
- 展示 thesis（1句）
- 展示 entry_plan（1-2句）
- 监控源、风险用折叠/小列表（避免卡片过长）

3) 兼容：字段缺失时优雅降级（不报错，显示 “-” 或隐藏区块）

4) 影响范围：
- components/WatchlistCard.tsx
- /watchlist/latest 与 /watchlist/[date]
- 首页 watchlist 模块（如有）

验收：
- 新字段在 KB 可见
- 时间/布局不拥挤，移动端可读
- npm run build 通过，Vercel 部署正常
