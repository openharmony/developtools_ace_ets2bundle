class Meta {
  belongModulePath: string;
  hostModulesInfo: Array<object>;
  moduleName: string;
  pkgName: string;
  isLocalDependency: boolean;
  isNodeEntryFile: boolean;
  pkgPath: string;
  dependencyPkgInfo: Object;
  belongProjectPath: string;

  constructor(entryModuleName: string, modulePath: string) {
    this.belongModulePath = '';
    this.hostModulesInfo = [];
    this.moduleName = entryModuleName;
    this.pkgName = '';
    this.isLocalDependency = true;
    this.isNodeEntryFile = false;
    this.pkgPath = modulePath;
    this.dependencyPkgInfo = undefined;
    this.belongProjectPath = '';
  }
};

class ModuleInfo {
  meta: Meta;
  id: string;
  importedIdMaps: object = {};
  importCache = [];

  constructor(id: string, entryModuleName: string, modulePath: string) {
    this.meta = new Meta(entryModuleName, modulePath);
    this.id = id;
  }

  setIsLocalDependency(value: boolean) {
    this.meta.isLocalDependency = value;
  }
  setIsNodeEntryFile(value: boolean) {
    this.meta.isNodeEntryFile = value;
  }

  setImportedIdMaps(path?: string) { }

  setNodeImportDeclaration() { }

  setNodeImportExpression() { }

  getNodeByType(IMPORT_NODE: string, EXPORTNAME_NODE: string, EXPORTALL_NODE: string, DYNAMICIMPORT_NODE: string) { }
}

export { 
	ModuleInfo 
};