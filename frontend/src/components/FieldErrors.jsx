import { AlertCircle } from 'lucide-react';

const FieldErrors = ({ errors, id }) => {
  if (!errors?.length) return null;

  return (
    <div className="field-errors" id={id} role="alert">
      <AlertCircle size={15} aria-hidden="true" />
      <ul>
        {errors.map((message) => <li key={message}>{message}</li>)}
      </ul>
    </div>
  );
};

export default FieldErrors;
