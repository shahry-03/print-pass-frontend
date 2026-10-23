import Button from './Button';

const EmptyState = ({ icon: Icon, title, description, action, onAction }) => {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={28} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
      {action && onAction && (
        <div style={{ marginTop: '20px' }}>
          <Button onClick={onAction}>{action}</Button>
        </div>
      )}
      {action && !onAction && (
        <div style={{ marginTop: '20px' }}>
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
