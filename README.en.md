# developtools_ace-ets2bundle

#### Description
Provide declarative paradigm syntax compilation conversion, syntax verification, rich and friendly syntax error prompting capabilities.

#### Software Architecture

* compiler/src: source code
* test: unit test file
* .eslintrc: eslint configure
* babel.config.js: babel configure
* main.js: source code
* package.json: define what libraries will be installed into node_modules when you run `npm install`
* tsconfig.json: the compiler options required to compile the project
* webpack.config.js: webpack configuration information

#### Prerequisites

```
> npm -v
  6.14.8
> node -v
  v12.18.3
```
Your `npm` and `node` should be of a later version. You can upgrade them to the **latest stable version**.

#### Installing

Enter the root directory of the compiler:
```
npm config set registry http://registry.npm.taobao.org
npm config set strict-ssl false
npm cache clean -f
npm install
```

#### Quick Start

Enter the root directory of the compiler:
```
npm run build
npm run compile
```
The `sample` project will be compiled. The output is in the `sample/build` directory.

#### Create a new project

Enter the root directory of the compiler:
```
npm run create [projectName]
```

**Note**: If `projectName` is empty, create the `HelloAce` project by default.
For example, use the following line to create a project named `foo`:
```
$ npm run create foo
```
The directory structure of project `foo`:
- foo
  - pages
    - index.ets
  - app.ets
  - manifest.json

#### Create a new page

For example, create a file `bar.ets` in the `pages` directory. And then add the following lines to `"pages"` field in `manifest.json`:
```
  "pages": [
    "pages/index",
    "pages/bar"
  ]
```

#### Compile a project

Enter the root directory of the compiler:
```
$ npm run build
$ npm run compile [projectName]
```
**Note**: If `projectName` is empty, compile the `sample` project by default. In the project root directory, the compilation result is in the `build` directory.
