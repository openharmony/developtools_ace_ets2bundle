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
        const builderLambdaTransformer = new BuilderLambdaTransformer();
        const structTransformer = new StructTransformer();

        let script: ts.EtsScript = node;
        script = builderLambdaTransformer.visitor(script) as ts.EtsScript;
        script = structTransformer.visitor(script) as ts.EtsScript;

        const positionalIdTracker = new PositionalIdTracker(ts.getFileName(), false);
        const importTransformer = new ImportTransformer();
        const functionTransformer = new FunctionTransformer(positionalIdTracker);
        importTransformer.visitor(script);
        script = functionTransformer.visitor(script) as ts.EtsScript;

        // TODO: remove this when the .d.ets transformation is ready
        const testTransformer = new TestTransformer();
        script = testTransformer.visitor(script) as ts.EtsScript;

        return script;
    }
}
