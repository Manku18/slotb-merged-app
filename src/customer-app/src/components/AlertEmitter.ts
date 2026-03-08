/**
 * AlertEmitter - lightweight event bus for showing CustomAlert from anywhere,
 * including inside non-component context (AuthContext, etc.)
 */
type AlertPayload = {
    type: 'error' | 'success' | 'info' | 'warning';
    title: string;
    message?: string;
    buttonText?: string;
};

type AlertListener = (payload: AlertPayload) => void;

const listeners: AlertListener[] = [];

export const AlertEmitter = {
    show(payload: AlertPayload) {
        listeners.forEach(fn => fn(payload));
    },
    addListener(fn: AlertListener) {
        listeners.push(fn);
        return () => {
            const idx = listeners.indexOf(fn);
            if (idx !== -1) listeners.splice(idx, 1);
        };
    },
};

export type { AlertPayload };
