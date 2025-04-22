const Card = ({ title, subtitle, children, footer, className = "" }) => {
  return (
    <div className={`card ${className}`}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h5 className="card-title mb-0">{title}</h5>}
          {subtitle && (
            <h6 className="card-subtitle text-muted mt-1">{subtitle}</h6>
          )}
        </div>
      )}

      <div className="card-body">{children}</div>

      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
