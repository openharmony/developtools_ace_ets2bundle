interface Event {
    name: string,
    startTime: number,
    endTime?: number,
    parentEvent?: string,
    duration?: number
}

function formatTime(ms: number): string {
    const milliseconds = Math.floor(ms % 1000);
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
  
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}:${pad(milliseconds, 3)}`;
}

function pad(value: number, length: number): string {
    return value.toString().padStart(length, '0');
}

export class Performance {
    private static instance: Performance;
    private events: Map<string, Event>;
    private scopes: string[];
    private shouldSkip: boolean;

    private constructor() {
        this.events = new Map();
        this.scopes = [];
        this.shouldSkip = true;
    }

    public static getInstance(): Performance {
        if (!this.instance) {
            this.instance = new Performance();
        }
        return this.instance;
    }

    skip(shouldSkip: boolean = true): void {
        this.shouldSkip = shouldSkip;
    }

    createEvent(name: string): Event {
        if (this.shouldSkip) return { name: '', startTime: 0 };
        const startTime: number = performance.now();
        const newEvent: Event = { name, startTime };
        this.events.set(name, newEvent);
        this.scopes.push(name);
        return newEvent;
    }

    stopEvent(name: string, shouldLog: boolean = false): Event {
        if (this.shouldSkip) return { name: '', startTime: 0 };
        if (!this.events.has(name) || this.scopes.length === 0) {
            throw new Error(`Event ${name} is not created.`);
        }
        if (this.scopes[this.scopes.length - 1] !== name) {
            console.warn(`[PERFORMANCE WARNING] Event ${name} early exit.`);
        }
        this.scopes.pop();

        const event: Event = this.events.get(name)!;
        const endTime: number = performance.now();
        const parentEvent: string = this.scopes[this.scopes.length - 1];
        const duration: number = endTime - event.startTime;

        if (shouldLog) {
            console.log(`[PERFORMANCE] name: ${event.name}, parent: ${parentEvent}, duration: ${formatTime(duration)}`);
        }

        return { ...event, endTime, parentEvent, duration };
    }

    stopLastEvent(shouldLog: boolean = false): Event {
        if (this.shouldSkip) return { name: '', startTime: 0 };
        if (this.scopes.length === 0) {
            throw new Error("No last event");
        }
        const name: string = this.scopes.pop()!;
        if (!this.events.has(name)) {
            throw new Error(`Event ${name} is not created.`);
        }

        const event: Event = this.events.get(name)!;
        const endTime: number = performance.now();
        const parentEvent: string = this.scopes[this.scopes.length - 1];
        const duration: number = endTime - event.startTime;

        if (shouldLog) {
            console.log(`[PERFORMANCE] name: ${event.name}, parent: ${parentEvent}, duration: ${formatTime(duration)}`);
        }

        return { ...event, endTime, parentEvent, duration };
    }

    clearAllEvents(shouldLog: boolean = false): void {
        if (this.shouldSkip) return;
        for (let i = 0; i < this.scopes.length; i ++) {
            this.stopLastEvent(shouldLog);
        }
        this.events = new Map();
    }
}