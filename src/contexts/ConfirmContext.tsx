import { createContext, useCallback, useRef, useState, type ReactNode } from "react";
import { Modal } from "../components/common/Modal";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setOptions(opts);
    });
  }, []);

  function respond(result: boolean) {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setOptions(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <Modal title={options.title ?? "Xác nhận"} onClose={() => respond(false)}>
          <p style={{ margin: "0 0 16px" }}>{options.message}</p>
          <div className="admin-form-actions">
            <button
              type="button"
              className={`admin-btn ${options.danger ? "admin-btn--danger" : "admin-btn--primary"}`}
              onClick={() => respond(true)}
            >
              {options.confirmText ?? "Xác nhận"}
            </button>
            <button type="button" className="admin-btn admin-btn--neutral" onClick={() => respond(false)}>
              {options.cancelText ?? "Huỷ"}
            </button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}
