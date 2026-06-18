export default function InputField({ label, type = 'text', name, value, onChange, placeholder, required = false }) {
  return (
    <div className="form-group mb-4">
      {label && <label className="form-label">{label} {required && <span className="text-errorText">*</span>}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="form-input"
      />
    </div>
  );
}
