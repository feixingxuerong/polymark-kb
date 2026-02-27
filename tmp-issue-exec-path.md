目标：优化 KB 的“一键执行路径”，让用户从首页/今日天气面板出发，30 秒内完成看→核对→决定。

需求：
1) 从 /weather/today 的每个行动条目提供快捷链接：
- 查看异动雷达（/watchlist/diff/latest）
- 查看数据源（/sources/weather-aviation/latest，并尽量滚动/高亮到绑定站点）
- 打开市场链接（外链）

2) 若 watchlist item 有 stations（ICAO/IATA），在卡片上显示并提供跳转锚点：
- /sources/weather-aviation/latest#KJFK 形式（需要在 sources 页面给每个卡片加 id）

3) 缺 stations 时 fallback 到 sources 页面顶部。

验收：
- 移动端也好点
- npm run build 通过
