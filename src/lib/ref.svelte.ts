

export function ref<T>(init?: T) {
    let value = $state(init) as T;
    return {
        set value(newVal: T) {
            value = newVal;
        },
        get value() {
            return value;
        },
        onChange(cb: (newValue: T) => void) {
            return $effect.root(() => {
                $effect(() => {
                    cb(value);
                });
            });
        }
    };
}