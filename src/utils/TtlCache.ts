interface Entry<T> {
    value: T;
    expiresAt: number;
}

export class TtlCache<T> {
    private readonly store = new Map<string, Entry<T>>();

    constructor(
        private readonly ttlMs: number,
        private readonly maxEntries = 500,
    ) { }

    get(key: string): T | undefined {
        const entry = this.store.get(key);
        if (!entry) return undefined;

        if (entry.expiresAt <= Date.now()) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }

    set(key: string, value: T): void {
        this.store.delete(key);

        if (this.store.size >= this.maxEntries) {
            const oldest = this.store.keys().next().value;
            if (oldest !== undefined) this.store.delete(oldest);
        }

        this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    }
}