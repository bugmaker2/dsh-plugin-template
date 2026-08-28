# dsh-plugin-template

[English](README.md) | 中文

[![dsh.so security](https://www.dsh.so/badge/dsh-plugin-template.svg)](https://www.dsh.so/artifact/dsh-plugin-template)
[![dsh.so install](https://www.dsh.so/badge/install/dsh-plugin-template.svg)](https://www.dsh.so/artifact/dsh-plugin-template)

一个完整的双端 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 插件模板。它演示了完整的插件能力面——**Host** 端暴露 Typert Remote，**Client** 端把该 Remote 挂载进 React 视图——并且类型检查、lint、单元测试、CI 和发布元数据全部接好。

开箱即用会注册一个 `greet` Remote：Host 端用可配置的前缀拼出 `"Hello, <name>"`，Client 端在一个新的 "Greet" tab 里渲染结果。

## 目录结构

```text
package.json           # dsh.bundle + dsh.client manifest、脚本、peer 依赖
cordis.patch.yml       # 把 Host 插件行挂载进 profile
dsh.plugin.json        # dsh.so 注册表 manifest
src/index.ts           # Host 入口：Config schema + Typert manifest 注册
src/runtime.ts         # Host Remote 服务（TypertRemoteService）
src/typert.ts          # Typert 模型 manifest
src/contract.ts        # Host/Client 共享的严格 wire contract
src/types.ts           # 共享类型
src/client/index.tsx   # Client 入口：挂载 Remote + 注册视图 slot
src/client/remote.ts   # Client Remote 贡献 + 类型化 namespace
src/client/locales.ts  # 中英文字典
src/client/view.tsx    # 最小 React 视图
src/client/styles.ts   # 主题 token 样式
tests/                 # vitest 单元测试（contract + runtime）
build.mjs              # esbuild 双端构建（Host ESM + Client CJS）
.github/workflows/ci.yml
dsh-testkit.yaml       # 真实 Host 生命周期预期
.github/workflows/dsh-lifecycle.yml
.agents/skills/dsh-testkit/SKILL.md
```

Harness 唯一需要的 manifest 是 `package.json`：`dsh.bundle.patch` 让包成为可安装的 profile bundle，`dsh.client` 声明 Web 客户端 bundle 及其注入的客户端包。Host 入口是普通 Cordis `name`/`apply` 导出；Client 入口被打包成 `lib/client.js`，由 Web harness 的模块加载器加载。

## 环境要求

- Node.js `>= 22.19`（或 `>= 24`）
- pnpm `>= 9`
- DeepSeek Harness `>=0.1.0-rc.6`

## 从本地目录安装

```sh
pnpm install
pnpm run build
dsh plugin --profile web add .
```

重新构建插件后重启 Web Harness。会话视图环中会出现一个 "Greet" tab，显示 `Hello, DSH`。

卸载：

```sh
dsh plugin --profile web remove dsh-plugin-template
```

## 从 Git 安装

```sh
dsh plugin --profile web add github:you/dsh-plugin-template
```

Git 安装拉取的是源码而非构建产物，因此 pnpm 会运行 `prepare` 脚本来构建 `lib/`。pnpm ≥10 在得到允许前会阻止该构建；第一次 `add` 失败时，`dsh` 会给出修法——把它打印的包键复制进该 profile 的 `pnpm-workspace.yaml`：

```yaml
allowBuilds:
  dsh-plugin-template: true
```

然后重新执行 `add`。该授权允许包在安装时运行代码，因此只对可信的包授权（并锁定 commit）。

## 开发

```sh
pnpm run check
```

`check` 依次执行 `typecheck`、`lint`、`test` 和 `build`。CI 在 `pnpm install --frozen-lockfile` 之后运行同一命令。

单独脚本：

```sh
pnpm run build      # esbuild 双端打包 + 声明文件生成
pnpm run typecheck  # 对 src 和 tests 运行 tsc
pnpm run lint       # eslint
pnpm run test       # vitest
pnpm run test:lifecycle # 真实 DSH 的安装、启动、注册、卸载与重启
```

## 真实 Host 生命周期门禁

`pnpm run test:lifecycle` 先使用仓库锁定的工具链构建 package tarball，再在 Docker 中使用 [DSH Testkit v0.4.0](https://github.com/iiwish/dsh-testkit/releases/tag/v0.4.0) 和 DSH `0.1.1-rc.2`。场景会将这个确定的制品安装进真实 Host，验证 `dsh-plugin-template` row 和 `greet` service，卸载插件，再重启同一个 profile；不需要模型 API Key。

外部 pull request job 明确只授予 `contents: read`；它直接运行固定的 npm 版本并保留证据，不调用拥有写权限的第三方 Action。可信分支 job 额外获得 `checks: write`，让固定版本的 Testkit Action 发布 JUnit check。所有引用的 Action 都固定到不可变提交。

当前 Testkit 场景观测 Host 注册，尚不直接断言 Client 端的 `conversation.view` slot。类型检查与 Client 构建覆盖其静态集成；现有单元测试覆盖共享 contract 与 Host runtime，不覆盖真实 slot 注入。

## 重命名包

改名时以下位置必须保持一致：

- `package.json` → `name`、`exports`、`files`
- `build.mjs` → `__ModuleLoader__.load` id
- `src/index.ts` → `name`
- `src/client/remote.ts` → 包 id 与服务 key 的 `TypertRemoteNamespace$…` 十六进制名
- `src/client/locales.ts` → locale namespace key
- `src/client/index.tsx` → slot id
- `src/typert.ts` → `package`
- `src/contract.ts` → invocation id
- `cordis.patch.yml` → `id` 和 `name`
- `dsh.plugin.json` → `id`

## 被发现

给 fork 添加 GitHub topic [`dsh-plugin`](https://github.com/topics/dsh-plugin)：

```sh
gh api --method PUT repos/YOUR-USER/dsh-plugin-template/topics \
  -H 'Accept: application/vnd.github+json' \
  -f 'names[]=dsh-plugin'
```

## 许可证

MIT
