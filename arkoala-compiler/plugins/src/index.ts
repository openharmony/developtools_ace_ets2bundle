import * as ts from "@koalaui/libarkts"
import { ComponentTransformer, ComponentTransformerOptions } from './component-transformer'
import { BuilderLambdaTransformer } from './builder-lambda-transformer'
import { StructTransformer } from './struct-transformer'
import { PositionalIdTracker } from "./utils";
import { ImportTransformer } from "./import-transformer";
import { FunctionTransformer } from "./function-transformer";
import { TestTransformer } from "./only-test-transformer";

// TODO: move this to arkts-api
class PluginContext {
  private ast: ts.EtsScript | undefined;

  constructor() {
    this.ast = undefined;
  }

  public setArkTSAst(ast: ts.EtsScript): void {
    this.ast = ast;
  }

  public getArkTSAst(): ts.EtsScript | undefined {
    return this.ast;
  }
}

export function koalaUITransform() {
    return {
        name: 'ArkUI',
        parsed(this: PluginContext) {
            console.log("In ArkUI afterParsed")
            const node = this.getArkTSAst();
            if (node) {
                let script: ts.EtsScript = node;
                script = new ComponentTransformer({ arkui: "@koalaui.arkui.StructBase" }).visitor(node) as ts.EtsScript;
                ts.setAllParents(script);
                this.setArkTSAst(script);
                return script;
            }
        },
        checked(this: PluginContext) {
            console.log("In ArkUI afterChecked")
            const node = this.getArkTSAst();
            if (node) {
                const builderLambdaTransformer = new BuilderLambdaTransformer();
                const structTransformer = new StructTransformer();
                const importTransformer = new ImportTransformer();

                let script: ts.EtsScript = node;
                importTransformer.visitor(script);
                script = builderLambdaTransformer.visitor(script) as ts.EtsScript;
                script = structTransformer.visitor(script) as ts.EtsScript;

                const positionalIdTracker = new PositionalIdTracker(ts.getFileName(), false);
                const functionTransformer = new FunctionTransformer(positionalIdTracker);
                script = functionTransformer.visitor(script) as ts.EtsScript;

                // TODO: remove this when the .d.ets transformation is ready
                const testTransformer = new TestTransformer();
                script = testTransformer.visitor(script) as ts.EtsScript;

                ts.setAllParents(script);
                this.setArkTSAst(script);
                return script;
            }
        },
        clean(this: PluginContext) {
            console.log("In ArkUI clean")
        }
    }
}