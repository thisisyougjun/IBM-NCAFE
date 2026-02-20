import { InputHTMLAttributes, forwardRef, useId } from "react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth, className, ...props }, ref) => {
    const id = useId();

    return (
      <div
        className={styles.container}
        style={fullWidth ? { width: "100%" } : undefined}
      >
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.inputWrapper}>
          <input
            ref={ref}
            id={id}
            className={`${styles.input} ${error ? styles.error : ""} ${className || ""}`}
            {...props}
          />
        </div>
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
