// Annotations

export @interface BuilderLambda {
    value: string
}

export @interface Component {}

export @interface State {}

export @interface memo {}

export abstract class StructBase<T, OptionsT> {

    static instantiateImpl<S extends StructBase<S, OptionsS>, OptionsS>(
        builder: ((instance: S)=>S)|undefined,
        factory: () => S,
        options?: OptionsS,
        content?: () => void
    ) {
        console.log("Struct instantiate redirected")
        const instance = factory()
        if (builder !== undefined) builder(instance)
        instance._build(builder, content, options)
    }
    build() {
        throw new Error("The struct build() should never be executed directly")
    }

    protected _build(style: ((instance: T)=>T)|undefined, content: (() => void)|undefined, options: OptionsT|undefined) {
        throw new Error("The struct _build() must have a valid override")
    }
}

export enum Color {
    White,
    Red
}

export interface ColumnOptions {
    space: number
}

export class CommonMethod {
    onClick(callback: () => void): this {
        console.log("registered Button.onClick()")
        return this
    }
    width(value: number): this {
        console.log(`.width(${value})`)
        return this
    }
    height(value: number): this {
        console.log(`.height(${value})`)
        return this
    }
}

// An attempt to put down a component
export class Column extends CommonMethod {

    static instantiateImpl(
        style: (instance: Column) => Column,
        factory: () => Column,
        options: ColumnOptions,
        content: () => void
    ): void {
        console.log("Column({space:", options.space, "})")
        const instance = factory()
        style(instance)
        content()
    }
}


export interface ButtonOptions {}

// An attempt to put down a component
export class Button extends CommonMethod {

    static instantiateImpl(
        style: (instance: Button) => Button,
        factory: () => Button,
        options?: ButtonOptions|string,
        //content?: () => void
    ): void {
        console.log("Button(", options,  ")")
        const instance = factory()
        style(instance)
        //content()

    }
}

export interface TextOptions {}

// An attempt to put down a component
export class Text extends CommonMethod {

    // TODO: the second argument will be gone after hte plugin is improved
    static instantiateImpl(
        style: (instance: Text) => Text,
        factory: () => Text,
        options?: TextOptions|string,
        //content?: () => void
    ): void {
        console.log("Text(", options,  ")")
        const instance = factory()
        style(instance)
        //content()
    }

    fontColor(value: Color): this {
        console.log("\.fontColor(", Color[value], ")")
        return this
    }
}
