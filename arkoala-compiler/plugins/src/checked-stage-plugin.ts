import * as ts from "@koalaui/libarkts"
import { BuilderLambdaTransformer } from './builder-lambda-transformer'
import { StructTransformer } from './struct-transformer'
import { PositionalIdTracker } from "./utils"
import { ImportTransformer } from "./import-transformer"
import { FunctionTransformer } from "./function-transformer"
import { TestTransformer } from "./only-test-transformer"

export interface TransformerOptions {
    trace?: boolean,
}

export default function exampleTransformer(
    userPluginOptions?: TransformerOptions
) {
    return (node: ts.EtsScript) => {
        console.log("[BEFORE]: ", node.dumpSrc());
        const builderLambdaTransformer = new BuilderLambdaTransformer();
        const structTransformer = new StructTransformer();

        let script: ts.EtsScript = node;
        script = builderLambdaTransformer.visitor(script) as ts.EtsScript;
        console.log("[BuilderLambdaTransformer] script: ", script.dumpSrc());
        script = structTransformer.visitor(script) as ts.EtsScript;
        console.log("[structTransformer] script: ", script.dumpSrc());

        const positionalIdTracker = new PositionalIdTracker(ts.getFileName(), false);
        const importTransformer = new ImportTransformer();
        const functionTransformer = new FunctionTransformer(positionalIdTracker);
        importTransformer.visitor(script);
        console.log(`[FunctionTransformer] script: `, script.dumpJson());
        script = functionTransformer.visitor(script) as ts.EtsScript;
        console.log("[FunctionTransformer] script: ", script.dumpSrc());

        // TODO: remove this when the .d.ets transformation is ready
        // const testTransformer = new TestTransformer();
        // script = testTransformer.visitor(script) as ts.EtsScript;
        console.log("[TestTransformer] script: ", script.dumpSrc());

        console.log("[TestTransformer] script dumpJson: ", script.dumpJson());

        return script;
    }
}
