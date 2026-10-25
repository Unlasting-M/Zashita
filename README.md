# Zashita · iPad PWA 0.1.2

[简体中文](README.md) · [English](README.en.md) · [Русский](README.ru.md)

[打开 Zashita 公开版](https://russian-defense-ipad-unlasting.docileemu11.chatgpt.site)

本页及英文、俄文版本是项目介绍和使用说明的翻译；软件当前界面为中文，生成的问题和回答采用俄文与中文对照。

面向线下现场答辩。iPad麦克风 → 站点WebSocket转发 → Qwen实时俄语识别 → 最近五条上下文与续句合并 → DeepSeek提问提取/缩写修复 → iPad本地论文检索 → DeepSeek中俄双语回答。

不需要Mac，也不需要Windows电脑常开。实时识别与问答需要网络、使用者自己的百炼和DeepSeek API Key。根据用户要求公开链接，无需GPT账号登录。

0.1.2新增“保存密钥”按钮：百炼与DeepSeek Key以AES-GCM密文及不可导出的CryptoKey保存至本机IndexedDB独立记录。重新打开自动恢复，支持覆盖和清除；存储失败时保留旧记录并明确提示，密钥不进入答辩备份。此为浏览器本机保存，不是iOS钥匙串或跨设备同步。

本版品牌名称统一为Zashita（页眉、网页标题、manifest及Apple主屏幕名称），设置页底部署名“by xinyu”。保留原网址、IndexedDB名称及备份格式ID，原有资料和设置继续使用。

0.1.1修复：PDF提取改用getReader/read，兼容缺少ReadableStream异步遍历接口的iPad Safari；导入失败清除“正在提取”状态；JS/CSS以构建指纹加载，避免旧Service Worker继续提供旧版脚本。现有本机资料不清除。

## 在iPad上使用

1. 在Safari打开公开网址，无需登录GPT账号。将同一链接发给其他人即可使用。
2. 分享 → 添加到主屏幕，之后从主屏幕图标启动。建议先安装，再在主屏幕应用内导入资料。
3. 在设置填写百炼与DeepSeek API Key，选择百炼密钥对应地域，点击“保存密钥”。看到“已保存到此设备”后，刷新及重新打开会自动恢复；未点击保存的编辑只保留在当前页面。可用“清除已保存密钥”删除本机记录。仅对当前设备/浏览器生效，清除网站数据也会删除已存密钥。
4. 资料库可导入文本PDF、DOCX、UTF-8 TXT/Markdown。最大20MB、PDF最多250页；扫描件需要先做OCR。
5. 点击连接麦克风并授权。老师发问时选“老师提问”，自己作答时选“我在回答”。这是单麦克风角色切换，不是自动声纹分离。
6. 新问题后台排队，当前答案保持显示。读完点击下一题。漏抓时可补抓某段，或在手动提问中提交。
7. 定期导出JSON备份。文字、记录和检索数据在本机IndexedDB内，浏览器存储可能被系统清理。

保持页面前台运行；锁屏、切换App或系统音频中断时暂停收音，返回后重新连接。不支持采集其他App的系统音频。iPad页面保留轻磨砂标题栏，不透视系统桌面或其他App背景。

## 与桌面版的差别

- 本地BM25关键词检索，加俄文词尾归一化、中文双字切分和模型中俄检索词；不携带桌面embedding模型或Whisper语音模型。
- Qwen通过同源Worker服务转发，浏览器不直接暴露Authorization到URL；模型域名固定。
- 资料保留为可检索文字，PDF按页切块。原文件不长期保存在服务端；只有匹配片段发送给DeepSeek，音频实时发送给阿里云。
- Key不写入部署代码、导出备份或日志；用户点击保存后，仅以加密记录保存在当前设备浏览器中。Worker不长期保存音频、论文和记录。
- Safari/PWA最低目标为iPadOS 17；实际硬件麦克风、权限、网络可用性及站点所在网络访问情况仍需真机确认。

## 开发与部署

`npm ci` → `npm run build` → `npm test`。`node scripts/preview.mjs` 启动本地预览；`--mock`仅本地协议验收，不包含在Worker发布代码内。

`scripts/assemble.mjs`将源码、图标和本地PDF解析库嵌入单一Worker ESM，`scripts/build.mjs`是starter build.sh的Windows可运行等价版本。最终包仅含dist/server/index.js与dist/.openai/hosting.json，符合Sites Worker ESM契约。

源站ID保存在.openai/hosting.json，后续必须复用。使用Sites源代码helper提交和推送确切源码，再发布相同commit构建出的归档。

## 已完成的检查

16项离线规则/协议/兼容性测试通过；包含原七条俄语案例、缩写修复、44.1/48k到16k连续PCM重采样、最终转写去重、队列保持、本地双语召回、Qwen服务端鉴权与finish flush、公开API自备密钥/来源/体积限制、无异步迭代接口的PDF读取和错误清理，以及密钥加密恢复、覆盖/清除、损坏与失败存储行为。

真实浏览器验收通过：1366×1024、1024×768、834×1194、390×844无横向溢出；PDF/DOCX/TXT实际导入、上下文修复、论文片段进入回答请求、队列保持、设置及选题恢复、未保存的密钥编辑不落盘、备份导出。另在主页面及PDF Worker中移除ReadableStream异步迭代接口，验证真实俄文PDF提取、DOCX/TXT、失败后重试与刷新持久化。0.1.2另验证实际IndexedDB中的不可导出CryptoKey及密文、刷新与新页面恢复、覆盖保存、注入写入失败后旧值仍可恢复且不显示假成功、清除后不再恢复、导出备份不含密钥。使用模拟模型，无录音、无付费模型调用。此验证不等于iPad真机或真实云端音频验收。

共享说明：公开的是程序，不是各设备的论文或记录；服务器没有全局模型密钥，也不保存用户记录。各浏览器使用各自本机IndexedDB，不会跨设备同步；共用同一台设备的同一浏览器会共用本机资料，分享设备前请先备份并按需要删除记录。模型调用分别使用各人输入的密钥。

界面沿用桌面版Taste Skill的Achromatic ledger方向与现有声波图标。品牌字体使用iPad系统字体，未重新抽取风格。官方检查仅允许用户要求的glass例外。初始页的实时转写与阅读区各有独立内容长度，允许不同底边；不以虚构记录填空。最终截图主观评分约7.7/10，首要目标是稳定双语阅读，手机只是兼容布局。

## 官方协议依据

- [Qwen客户端事件：俄语ru、16k PCM与server VAD](https://www.alibabacloud.com/help/en/model-studio/qwen-asr-realtime-client-events)
- [Qwen服务端事件](https://www.alibabacloud.com/help/en/model-studio/qwen-asr-realtime-server-events)
- [Cloudflare Workers WebSocket](https://developers.cloudflare.com/workers/runtime-apis/websockets/)
- [Apple：将网站作为App使用](https://support.apple.com/guide/ipad/open-as-web-app-ipad8f1f7a29/ipados)

PDF文字提取依赖pdfjs-dist（Apache-2.0），DOCX解压依赖fflate（MIT），构建依赖esbuild（MIT）；版本锁定于package-lock.json。保留依赖源码中的许可说明。
