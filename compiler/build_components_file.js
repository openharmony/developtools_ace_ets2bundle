const ts = require('typescript');
const path = require('path');
const fs = require('fs');

const SOURCE_DTS_DIR = process.argv[2];
const COMPONENT_OUTPUT_DIR = process.argv[3];
const FORM_COMPONENT_OUTPUT_DIR = process.argv[4];

const SPECIAL_EXTEND_ATTRS = new Map();
const SPECIAL_EXTEND_ATTR_NAMES = [
  "DynamicNode", 
  "BaseSpan", 
  "ScrollableCommonMethod",
  "CommonShapeMethod",
  "SecurityComponentMethod"
];

const SPECIAL_COMPONENTS = [
  {
    componentName: "common_attrs",
    apiName: "common",
    className: "CommonMethod",
    includeClassName: false,
  }
];

const COMPONENT_WHITE_LIST = ["common"];
const FORM_COMPONENT_WHITE_LIST = ["common"];

registerSpecialExtends(path.join(SOURCE_DTS_DIR, 'common.d.ts'));
registerSpecialExtends(path.join(SOURCE_DTS_DIR, 'span.d.ts'));
registerSpecialExtends(path.join(SOURCE_DTS_DIR, 'security_component.d.ts'));
generateSpecialTargetFiles();
generateTargetFile(SOURCE_DTS_DIR);

function registerSpecialExtends(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  ts.forEachChild(sourceFile, (node) => {
    if (isSpecialExtendClass(node)) {
      const specialExtendClassName = node.name.getText();
      const attrs = getAttrs(node, false);
      SPECIAL_EXTEND_ATTRS.set(specialExtendClassName, attrs);
    }
  });
}

function generateSpecialTargetFiles() {
  SPECIAL_COMPONENTS.forEach((special) => {
    const { componentName, apiName, className, includeClassName } = special;

    const apiFilePath = path.join(SOURCE_DTS_DIR, `${apiName}.d.ts`);

    const content = fs.readFileSync(apiFilePath, 'utf8');
    const sourceFile = ts.createSourceFile(apiFilePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isClassDeclaration(node) && node.name && ts.isIdentifier(node.name) &&
        node.name.getText() === className) {
        const [ flags, isForm ] = getFlags(node);
        const component = { attrs: Array.from(new Set(getAttrs(node, false))), ...flags };
        const formComponent = { attrs: Array.from(new Set(getAttrs(node, isForm))), ...flags };

        if (includeClassName) {
          component['name'] = className;
          formComponent['name'] = className;
        }

        if (!COMPONENT_WHITE_LIST.includes(componentName)) {
          if (isForm && !FORM_COMPONENT_WHITE_LIST.includes(componentName)) {
            const formComponentFileName = path.join(FORM_COMPONENT_OUTPUT_DIR, `${componentName}.json`);
            generateComponentJSONFile(formComponentFileName, formComponent);
          }
          const componentFileName = path.join(COMPONENT_OUTPUT_DIR, `${componentName}.json`);
          generateComponentJSONFile(componentFileName, component);
        }
      }
    });
  });
}

function generateTargetFile(filePath) {
  const files = [];
  readFile(filePath, files);

  const program = ts.createProgram(files, {});
  const checker = program.getTypeChecker();
  const sourceFiles = program.getSourceFiles()
    .filter((f) => files.includes(toUnixPath(f.fileName)));

  sourceFiles.forEach((sourceFile) => {
    const sourceFilePath = path.parse(toUnixPath(sourceFile.fileName));
    const baseName = path.basename(sourceFilePath.name, path.extname(sourceFilePath.name));

    const [ component, formComponent, isForm ] = findComponent(sourceFile, checker, program);

    if (Object.keys(component).length > 0 && !COMPONENT_WHITE_LIST.includes(baseName)) {
      if (isForm && !FORM_COMPONENT_WHITE_LIST.includes(baseName)) {
        const formComponentFileName = path.join(FORM_COMPONENT_OUTPUT_DIR, `${baseName}.json`);
        generateComponentJSONFile(formComponentFileName, formComponent);
      }
      const componentFileName = path.join(COMPONENT_OUTPUT_DIR, `${baseName}.json`);
      generateComponentJSONFile(componentFileName, component);
    }
  });
}

function generateComponentJSONFile(filePath, component) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(path.resolve(filePath), JSON.stringify(component, null, 2));
    return;
  }
  const source = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const updateComponent = { ...source, ...component };
  fs.writeFileSync(path.resolve(filePath), JSON.stringify(updateComponent, null, 2));
}

function readFile(dir, fileDir) {
  const files = fs.readdirSync(dir);
  files.forEach((element) => {
    const filePath = path.join(dir, element);
    const status = fs.statSync(filePath);
    if (status.isDirectory()) {
      readFile(filePath, fileDir);
    } else {
      fileDir.push(path.resolve(filePath));
    }
  });
}

function findComponent(sourceFile, checker, program) {
  let component = {};
  let formComponent = {};
  let isForm = false;

  ts.forEachChild(sourceFile, (node) => {
    if (isClass(node)) {
      const [ flags, _isForm ] = getFlags(node);
      component = {
        name: node.name.getText().replace(/Attribute$/, ''),
        attrs: Array.from(new Set([
          ...getAttrs(node, false),
          ...getCommonAttrs(node)
        ])),
        ...flags
      };
      formComponent = {
        name: node.name.getText().replace(/Attribute$/, ''),
        attrs: Array.from(new Set([
          ...getAttrs(node, _isForm),
          ...getCommonAttrs(node)
        ])),
        ...flags
      }
      isForm = _isForm;
    }
  });

  return [ component, formComponent, isForm ];
}

function isClass(node) {
  return ts.isClassDeclaration(node) && node.name && ts.isIdentifier(node.name) &&
    /Attribute$/.test(node.name.getText());
}

function isSpecialExtendClass(node) {
  return ts.isClassDeclaration(node) && node.name && ts.isIdentifier(node.name) &&
    SPECIAL_EXTEND_ATTR_NAMES.includes(node.name.getText());
}

function isMethod(node) {
  return ts.isMethodDeclaration(node) && node.name && ts.isIdentifier(node.name) &&
    node.name.escapedText;
}

function isExtendSpecialDeclaration(node) {
  return ts.isClassDeclaration(node) && node.heritageClauses && node.heritageClauses.length > 0;
}

function isFormComponent(node) {
  const flags = getFlags(node);
  return flags && flags[1];
}

function getExtendIdentifiers(node) {
  if (!ts.isHeritageClause(node)) {
    return [];
  }

  const identifiers = [];
  node.types.forEach((type) => {
    if (ts.isExpressionWithTypeArguments(type) && type.expression) {
      identifiers.push(type.expression);
    }
  });

  return identifiers;
}

function getCommonAttrs(node) {
  if (!isExtendSpecialDeclaration(node)) {
    return [];
  }

  const attrs = [];
  const heritageClause = node.heritageClauses[0];
  const identifiers = getExtendIdentifiers(heritageClause);
  identifiers.forEach((identifier) => {
    if (SPECIAL_EXTEND_ATTRS.has(identifier.escapedText)) {
      attrs.push(...SPECIAL_EXTEND_ATTRS.get(identifier.escapedText));
    }
  });
  return attrs;
}

function getAttrs(node, shouldFilterForm) {
  const attrs = [];

  ts.forEachChild(node, (child) => {
    if (isMethod(child) && (!shouldFilterForm || isFormComponent(child))) {
      const attrName = child.name.escapedText;
      attrs.push(attrName);
    }
  });

  return attrs;
}

function getFlags(node) {
  const tags = parseTags(node);
  const flags = filterFlags(tags);

  if (flags.form) {
    delete flags.form;
    return [ flags, true ];
  }
  return [ flags, false ];
}

function parseTags(node) {
  const tags = [];
  const jsTags = ts.getJSDocTags(node);

  jsTags.forEach((jsTag) => {
    tags.push(jsTag.tagName.getText());
  });
  return tags;
}

function filterFlags(tags) {
  let form;

  tags.forEach((tag) => {
    const name = typeof tag === "string" ? tag : tag?.['title'];

    if (name) {
      if (name === "form") {
        form = true;
      }
    }
  });

  return {
    ...(form && { form }),
  };
}

function toUnixPath(data) {
  if (/^win/.test(require('os').platform())) {
    const fileTmps = data.split(path.sep);
    const newData = path.posix.join(...fileTmps);
  }
  return data;
}
