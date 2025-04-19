// src/components/common/Card.jsx
const Card = ({ title, subtitle, children, footer, className = "" }) => {
  return (
    <div className={`bg-white rounded shadow ${className}`}>
      {(title || subtitle) && (
        <div className="p-4 border-b">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}

      <div className="p-4">{children}</div>

      {footer && <div className="p-4 border-t">{footer}</div>}
    </div>
  );
};

export default Card;
