import { forwardRef, useState } from 'react';

/** Controlled Qoder switch. Import tokens.css + components.css once in the app. */
const QSwitch = forwardRef(function QSwitch({
  checked = false,
  onCheckedChange,
  disabled = false,
  size = 'md',
  className = '',
  onClick,
  onPointerEnter,
  ...props
}, ref) {
  const [motion, setMotion] = useState(null);

  function handleClick(event) {
    if (disabled || props['aria-disabled'] === true || props['aria-disabled'] === 'true') return;
    setMotion(event.detail > 0 ? (checked ? 'off' : 'on') : null);
    onCheckedChange?.(!checked);
    onClick?.(event);
  }

  function handlePointerEnter(event) {
    setMotion(null);
    onPointerEnter?.(event);
  }

  return (
    <button
      {...props}
      ref={ref}
      type="button"
      role="switch"
      className={`q-switch${size === 'sm' ? ' q-switch--sm' : ''}${className ? ` ${className}` : ''}`}
      aria-checked={checked}
      disabled={disabled}
      data-switch-motion={motion || undefined}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
    >
      <span className="q-switch__thumb" data-switch-thumb="">
        <span className="q-switch__visual" data-switch-visual="" aria-hidden="true" />
      </span>
    </button>
  );
});

export default QSwitch;
