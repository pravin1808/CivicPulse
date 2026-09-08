import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './PasswordInput.css';

const PasswordInput = ({ icon: InputIcon, id, ...inputProps }) => {
  const [isVisible, setIsVisible] = useState(false);
  const label = isVisible ? 'Hide password' : 'Show password';

  return (
    <div className="input-field-wrapper password-input-wrapper">
      {InputIcon && <InputIcon size={18} className="input-icon" aria-hidden="true" />}
      <input id={id} type={isVisible ? 'text' : 'password'} {...inputProps} />
      <button
        type="button"
        className="password-visibility-toggle"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={label}
        aria-pressed={isVisible}
        title={label}
        disabled={inputProps.disabled}
      >
        {isVisible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  );
};

export default PasswordInput;
