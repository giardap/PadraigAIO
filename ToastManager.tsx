import { React } from "@webpack/common";

// Toast notification types
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    timestamp: number;
}

interface ToastManagerState {
    toasts: Toast[];
}

// Global toast manager instance
class ToastManagerClass {
    private listeners: Set<(toasts: Toast[]) => void> = new Set();
    private toasts: Toast[] = [];
    private nextId = 1;

    addToast(message: string, type: ToastType, duration: number = 5000): string {
        const id = `toast-${this.nextId++}`;
        const toast: Toast = {
            id,
            message,
            type,
            duration,
            timestamp: Date.now()
        };

        this.toasts = [toast, ...this.toasts];
        this.notifyListeners();

        // Auto-remove toast after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(id);
            }, duration);
        }

        return id;
    }

    removeToast(id: string): void {
        this.toasts = this.toasts.filter(toast => toast.id !== id);
        this.notifyListeners();
    }

    clearAll(): void {
        this.toasts = [];
        this.notifyListeners();
    }

    subscribe(listener: (toasts: Toast[]) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener([...this.toasts]));
    }

    getToasts(): Toast[] {
        return [...this.toasts];
    }
}

export const toastManager = new ToastManagerClass();

// Brand colors for consistency
const BRAND_COLORS = {
    primary: "#F2F0E8",
    success: "#38B2AC",
    warning: "#FBB040", 
    danger: "#E53E3E",
    text: "#2D3748",
    textMuted: "#718096"
};

// Individual toast component
export function ToastNotification({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const getToastStyles = (type: ToastType) => {
        const baseStyles = {
            display: "flex",
            alignItems: "center",
            padding: "12px 16px",
            marginBottom: "8px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontSize: "14px",
            fontWeight: "500",
            minWidth: "300px",
            maxWidth: "400px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            animation: "slideIn 0.3s ease-out",
            border: "1px solid",
            position: "relative" as const,
            overflow: "hidden" as const
        };

        switch (type) {
            case "success":
                return {
                    ...baseStyles,
                    backgroundColor: BRAND_COLORS.success + "20",
                    borderColor: BRAND_COLORS.success,
                    color: BRAND_COLORS.success
                };
            case "error":
                return {
                    ...baseStyles,
                    backgroundColor: BRAND_COLORS.danger + "20", 
                    borderColor: BRAND_COLORS.danger,
                    color: BRAND_COLORS.danger
                };
            case "warning":
                return {
                    ...baseStyles,
                    backgroundColor: BRAND_COLORS.warning + "20",
                    borderColor: BRAND_COLORS.warning,
                    color: BRAND_COLORS.warning
                };
            case "info":
            default:
                return {
                    ...baseStyles,
                    backgroundColor: BRAND_COLORS.primary + "40",
                    borderColor: BRAND_COLORS.textMuted,
                    color: BRAND_COLORS.text
                };
        }
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case "success": return "✅";
            case "error": return "❌";
            case "warning": return "⚠️";
            case "info": return "ℹ️";
            default: return "ℹ️";
        }
    };

    return (
        <div
            style={getToastStyles(toast.type)}
            onClick={() => onRemove(toast.id)}
            title="Click to dismiss"
        >
            <span style={{ marginRight: "8px", fontSize: "16px" }}>
                {getIcon(toast.type)}
            </span>
            <div style={{ flex: 1, lineHeight: "1.4" }}>
                {toast.message}
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(toast.id);
                }}
                style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    padding: "4px",
                    marginLeft: "8px",
                    borderRadius: "4px",
                    opacity: 0.7,
                    fontSize: "12px"
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = "1"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = "0.7"; }}
            >
                ✕
            </button>
        </div>
    );
}

// Toast container component
export function ToastContainer() {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    React.useEffect(() => {
        const unsubscribe = toastManager.subscribe(setToasts);
        setToasts(toastManager.getToasts());
        return unsubscribe;
    }, []);

    if (toasts.length === 0) return null;

    return (
        <>
            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `}</style>
            <div
                style={{
                    position: "fixed",
                    top: "20px",
                    right: "20px",
                    zIndex: 9999,
                    pointerEvents: "auto"
                }}
            >
                {toasts.map(toast => (
                    <ToastNotification
                        key={toast.id}
                        toast={toast}
                        onRemove={toastManager.removeToast.bind(toastManager)}
                    />
                ))}
            </div>
        </>
    );
}

// Convenience functions for showing toasts
export const showToast = {
    success: (message: string, duration?: number) => toastManager.addToast(message, "success", duration),
    error: (message: string, duration?: number) => toastManager.addToast(message, "error", duration),
    warning: (message: string, duration?: number) => toastManager.addToast(message, "warning", duration),
    info: (message: string, duration?: number) => toastManager.addToast(message, "info", duration)
};