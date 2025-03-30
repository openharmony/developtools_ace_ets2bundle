export { MyStateSample, Child } from "./index";
@Component
export declare struct MyStateSample1 {
    public get message(): string;
    public set message(value: string);
    public build(): void;
}
@Component
export declare struct Child1 {
    public get stateVar(): string;
    public set stateVar(value: string);
    public build(): void;
}
