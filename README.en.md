# Zashita — Russian thesis defense assistant

[简体中文](README.md) · [English](README.en.md) · [Русский](README.ru.md)

**[Open Zashita](https://russian-defense-ipad-unlasting.docileemu11.chatgpt.site)** · Web app / PWA · Version 0.1.2

Zashita helps you prepare and follow an in-person thesis defense in Russian. It transcribes speech, identifies questions using recent context, retrieves relevant passages from your documents, and generates reference answers with Russian–Chinese translations.

This is an English version of the project documentation. The app interface is currently in Chinese; generated questions and answers are shown in Russian and Chinese.

The public app does not require a GPT account or a computer running in the background. Each user supplies their own Alibaba Cloud Model Studio (Bailian) and DeepSeek API keys. Live transcription and answer generation require an internet connection and may incur provider charges.

## Features

- **Russian speech transcription:** tablet microphone audio is relayed through the site's WebSocket service to Qwen ASR.
- **Context-aware question extraction:** DeepSeek receives recent transcript entries and merged speech fragments. Extraction can handle questions without question marks and repair abbreviations when the context supports the correction.
- **Russian–Chinese answers:** questions and reference answers include Chinese translations. You can set answer preferences.
- **Local document library:** import text-based PDFs, DOCX, UTF-8 TXT, or Markdown and retrieve relevant passages before generating an answer.
- **Question queue:** incoming questions do not replace the answer you are reading. Select a queued question when ready.
- **Local settings and saved keys:** preferences persist in the browser; use the save button to store cloud keys on the current device.
- **Tablet browser access:** designed for iPad and usable in compatible Android tablet browsers. Hardware microphone behavior still needs device-specific testing.

## Getting started

1. Open the public app in your tablet browser. On iPad, use Safari. You do not need to sign in to GPT.
2. Optionally add the app to your home screen. On iPad, choose **Share → Add to Home Screen**. Configure and import documents inside the browser or installed app you intend to use: storage may differ between these contexts.
3. Open **Settings (设置)**. Enter your **Bailian API Key (百炼 API Key)** and **DeepSeek API Key**. Select the region that matches your Bailian key: mainland China / Beijing or international / Singapore.
4. Select **Save keys (保存密钥)** and wait for the saved confirmation. The app restores saved keys when reopened in the same browser context. Unsaved edits remain in the current page only. **Clear saved keys (清除已保存密钥)** removes the locally stored keys.
5. In **Document library (资料库)**, import your thesis, defense script, or terminology notes. You may also start without documents and receive general reference answers.
6. Connect the microphone and allow microphone access. Choose **Teacher's question (老师提问)** when the examiner speaks and **I am answering (我在回答)** when you speak. This is a manual role switch for one microphone, not automatic speaker recognition.
7. Read the current answer, then select the next question when ready. If a question was missed, capture it from the transcript or enter it manually.
8. Export a JSON backup regularly. Documents and defense records are stored in the current browser and are not synchronized across devices.

Keep the app in the foreground while recording. Switching apps, locking the screen, or an audio interruption can pause microphone capture; reconnect after returning. The app does not capture audio from other apps.

## Documents and retrieval

| Format | Requirements |
| --- | --- |
| PDF | Selectable text; up to 250 pages. Scanned PDFs require OCR first. |
| DOCX | Text is extracted from the document. |
| TXT / Markdown | UTF-8 encoding. |
| All imported files | Maximum 20 MB per file. |

The web version uses local BM25 keyword retrieval with Russian word normalization, Chinese bigram tokens, and model-generated Russian/Chinese search terms. It does not download the desktop app's embedding model or local Whisper speech models. Check reference answers against your thesis and the cited passages.

## Data and API keys

- The public link shares the program, not a user's private library or defense history.
- Documents, transcript records, preferences, and saved keys belong to the current device/browser storage. They are not tied to a GPT account.
- Saved keys are encrypted with AES-GCM and stored alongside a non-extractable Web Crypto key in IndexedDB. This is browser-local storage, not iOS Keychain or cross-device synchronization. The app can decrypt the keys to use them.
- Exported JSON backups exclude API keys. Clearing website data removes local documents, records, settings, and saved keys.
- Live audio is sent to Alibaba Cloud. Questions, recent context, and matching document passages are sent to DeepSeek. User-supplied keys are passed through the site's service for the corresponding provider calls. The Worker does not keep long-term copies of audio, papers, records, or keys.
- People sharing the same browser profile also share its local app data. Back up records and clear saved keys as appropriate before sharing a device.

## Development

Install a current Node.js runtime compatible with the pinned dependencies, then run:

```sh
npm ci
npm run build
npm test
node scripts/preview.mjs
```

For local QA without microphone capture or paid model calls:

```sh
node scripts/preview.mjs --mock
```

The mock server is a local development tool and is not included in the deployed Worker.

| Path | Purpose |
| --- | --- |
| `src/client.mjs` | UI, app state, transcript flow, and question queue |
| `src/audio.mjs` | Browser microphone capture and audio processing |
| `src/backend.mjs` | Qwen relay and DeepSeek requests |
| `src/core.mjs` | Question rules, normalization, retrieval, and PCM resampling |
| `src/files.mjs`, `src/pdf-text.mjs` | Document import and Safari-compatible PDF reading |
| `src/store.mjs`, `src/credentials.mjs` | IndexedDB data and encrypted key storage |
| `scripts/assemble.mjs` | Bundle client code, icons, and PDF parsing assets into the Worker |
| `scripts/build.mjs` | Produce the deployment artifact |
| `tests/` | Rule, protocol, storage, import, and browser checks |

## Deployment and maintenance

The current production app is hosted through Sites as a single Cloudflare Worker ESM bundle. Build output is `dist/server/index.js` with `dist/.openai/hosting.json`.

`.openai/hosting.json` identifies the existing Site. Preserve that ID when maintaining the same deployment. Use the Sites source workflow to commit and push the exact source, then publish the archive built from that commit. Deploying a separate copy requires its own hosting setup and HTTPS for microphone access; cloning the GitHub repository alone does not deploy it.

Changes to documentation do not translate the running app interface or change the model's output language settings.

## Validation and limits

The release passed 16 offline tests covering Russian question cases, contextual abbreviation repair, resampling, final transcript deduplication, queue stability, retrieval, provider protocols, PDF stream compatibility, and encrypted key persistence.

Browser checks covered tablet/phone layouts, real PDF/DOCX/TXT imports, context and evidence in mocked model requests, offline reading, backups, settings, and key save/restore/clear behavior. Tests used mock providers and did not record live audio or make paid model calls. Physical tablet microphones, provider access, and real network conditions still need testing on the target device. The Safari/PWA target is iPadOS 17 or later.

## Protocol references and dependencies

- [Qwen ASR client events](https://www.alibabacloud.com/help/en/model-studio/qwen-asr-realtime-client-events)
- [Qwen ASR server events](https://www.alibabacloud.com/help/en/model-studio/qwen-asr-realtime-server-events)
- [Cloudflare Workers WebSockets](https://developers.cloudflare.com/workers/runtime-apis/websockets/)

PDF parsing uses `pdfjs-dist` (Apache-2.0), DOCX decompression uses `fflate` (MIT), and bundling uses `esbuild` (MIT). Dependency versions are pinned in `package-lock.json`; retain their license notices.

by xinyu
