# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.1.0](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/compare/v1.0.1...v1.1.0) (2026-01-06)


### ✨ Features

* add device preset and throttling options ([1602264](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/1602264e48e1c9bc057ad24e9ff0bc7c57191c26))
* add multiple runs option and median selection ([47ae60d](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/47ae60d741855c16bc3690fc263382f5f9fbbaf8))
* add performance threshold option to CLI ([fc8a3ab](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/fc8a3ab034103ffc9978886766ab743cc3a47fd5))


### 📝 Documentation

* update README with new features and usage examples ([ce60014](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/ce600145b10c375d4709f589648d5fe986a1fcf2))

### [1.0.1](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/compare/v1.0.0...v1.0.1) (2026-01-06)

## [1.0.0](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/compare/v0.3.2...v1.0.0) (2026-01-06)


### 🛠 Maintenance

* rename CLI to fpa-cli ([6215421](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/6215421467ab9a34d11dd91a155a2785d9ea5f9d))


### 📝 Documentation

* expand README with usage and contribution details ([bf5d399](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/bf5d399adf5e559fb61ab128e67522318b5e69c6))
* update README ([81618aa](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/81618aa49cda673dc9b3cc579f9d1490ec7e2aa7))

### [0.3.2](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/compare/v0.3.1...v0.3.2) (2026-01-06)


### ✅ Testing

* remove Vitest and related test files ([e73ec7f](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/e73ec7f8d0a4fba539f51e1a06a8d7f73a773345))

### [0.3.1](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/compare/v0.3.0...v0.3.1) (2025-07-30)


### ✨ Features

* rewrite logger logic using classes ([02b56f0](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/02b56f025069d51f31e68232bffc0760289235eb))


### ♻️ Code Refactoring

* shorten version parsing in json export ([e1f43a2](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/e1f43a21095096fefe985ae47413ef47cb97c249))
* shorten version parsing in md export ([e609440](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/e60944018582a8cb3f84eef57ef54f0c1c94ece4))


### 🐛 Bug Fixes

* configure logger using options from cli ([310b2f0](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/310b2f0dd92be52570458f199ac09c4b0de08aed))
* remove unused import ([0c0f099](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/0c0f0995887ace371413d5f32469d72565b975a7))

## [0.3.0](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/compare/v0.2.0...v0.3.0) (2025-06-09)


### ⚠ BREAKING CHANGES

* add test coverage

### 🐛 Bug Fixes

* delete unused script ([492074b](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/492074bc3e0664a3b24386d5239e66fd6b3c1511))


### 🛠 Maintenance

* create a Vitest configuration file ([83cba3a](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/83cba3a316cdc1cb71cea5ece7bbe63d14fa618b))
* **deps:** add testing dependencies ([e07b0eb](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/e07b0eb4fd45fffad7ceef4ef5658bdc2fe709af))


### ✅ Testing

* add test coverage ([3c2a367](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/3c2a3679d0940d08aefedcdc7354597f55c7b164))

## [0.2.0](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/compare/v0.1.7...v0.2.0) (2025-06-08)


### ⚠ BREAKING CHANGES

* modularize code into separate files

### 🛠 Maintenance

* add keywords to `package.json` ([8b71ee2](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/8b71ee2ba12c46febc19d8322dfc641f1c51996a))


### ♻️ Code Refactoring

* modularize code into separate files ([d78e86a](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/d78e86a78ed2c51b25d4726127840b70e2b3e622))


### 🐛 Bug Fixes

* configure logger for silent of verbose modes ([18341ec](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/18341ec86b5714525ecbc00a598055b2c2498967))


### 📝 Documentation

* update `README.md` ([4ea0e61](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/4ea0e61f4f891ef624518e5a36f3786f5c05fab3))

### [0.1.7](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/compare/v0.1.6...v0.1.7) (2025-06-08)


### ✨ Features

* add `--json-file <file>` export option ([fca6228](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/fca62282c090356cd6fe5e94d27c2d856bb2fa21))
* add `--verbose` and `--silent` mode flags ([88eea69](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/88eea697cddb968bf166328523dbffb05690f1c9))
* improve Markdown formatting ([e3a49db](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/e3a49db1266232272166d9f94499505d03e24e7c))

### [0.1.6](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/compare/v0.1.5...v0.1.6) (2025-06-07)


### 📝 Documentation

* update `README.md` ([4a6b745](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/4a6b745f765bcfd65b5b7e6764bb01e952602fd1))

### [0.1.5](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/compare/v0.1.4...v0.1.5) (2025-06-07)


### ✨ Features

* add input validation with error messages ([82bc71f](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/82bc71f1adb4f8f2a0240b1693290b891aceeb47))
* continue on URL failures ([5380ea6](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/5380ea6f1ffa7512fa7ab564cd2f9d65ec79ade4))
* optimize browser launch configuration ([cd46aea](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/cd46aea3b00ab25354552d546a2b333e7a1b8e34))


### 🐛 Bug Fixes

* check URL accessibility before analyzing ([b5d710f](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/b5d710fc7a9252032d35cc9557c4fae35cfcd0a0))
* get version directly from `package.json` ([60d27f6](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/60d27f60d62d5a7bad3438d25a7ffa3d2ee704e5))
* handle Lighthouse internal errors ([f79bce3](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/f79bce3a6f6d61e90879d86cb3aae0abb756eefa))

### [0.1.4](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/compare/v0.1.3...v0.1.4) (2025-06-06)


### ✨ Features

* **cli:** add score threshold check ([96ce47a](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/96ce47af676336c533f82f6be438076d8e806a2e))
* **cli:** support multiple URLs ([b03a597](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/b03a597ba3dcfa66d354b233a1f810f796fc4afa))


### 🐛 Bug Fixes

* **cli:** exit with non-zero on fail ([cc59f06](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/cc59f063a24abe30576858ea33f53f80a89c08a4))


### 🛠 Maintenance

* prepare `package.json` for npm publish ([eb3fb72](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/eb3fb72c3ee389d51c4810364ec74f7b2b7d94b4))


### 📝 Documentation

* create `README.md` ([ff31897](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/ff318972e35e5e533432f7821fbc60992c5fc1ca))

### [0.1.3](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/compare/v0.1.2...v0.1.3) (2025-06-06)


### 🛠 Maintenance

* **deps:** add chalk for color output ([2c2dec8](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/2c2dec8bed17fbc327f036b7c925920c142ffebf))


### ✨ Features

* **cli:** show key performance metrics ([de39fa6](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/de39fa63cc68cf5d0487be8a56d7fcbd4f3ebcdb))
* **cli:** support Markdown report export ([9f6e3a9](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/9f6e3a9b54a0f4a510ccbbef35f7ff97616e7b00))

### [0.1.2](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/compare/v0.1.1...v0.1.2) (2025-06-06)


### 🛠 Maintenance

* **deps:** add commander for CLI support ([a7a5401](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/a7a540119747dabc1905b67a19bc259cd9f8e18f))


### ✨ Features

* **cli:** add basic CLI with URL option ([d9db3ce](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/d9db3ceac90024f3d9318d6fc906bfeb2b31f3ca))

### 0.1.1 (2025-06-06)


### 🛠 Maintenance

* **deps:** add puppeteer and lighthouse ([0aea4fa](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/0aea4fa40dc995242e72fba833925521eabdb103))
* **init:** initialize npm project ([0c7eafa](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/0c7eafab0bc215480f650dc038f6e9a6d65cb8c0))


### ✨ Features

* add basic URL performance analyzer ([5d272c0](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer/commit/5d272c026898015630e5e12179b621dc3cd87472))
