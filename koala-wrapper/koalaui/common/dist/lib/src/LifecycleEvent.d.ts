export declare enum LifecycleEventKind {
    SHOW_FRAME = 0,
    HIDE_FRAME = 1,
    CLOSE_FRAME = 2,
    ON_APPEAR = 3,
    ON_DISAPPEAR = 4,
    SHOW_COMPONENT = 5,
    HIDE_COMPONENT = 6,
    BACK = 7,
    FOCUS_FRAME = 8,
    UNFOCUS_FRAME = 9
}
export declare class LifecycleEvent {
    kind: LifecycleEventKind;
    constructor(kind: LifecycleEventKind);
}
//# sourceMappingURL=LifecycleEvent.d.ts.map