const Card = ({ children, glass = false, interactive = false, className = '', ...props }) => {
  const classes = [
    'card',
    glass && 'card-glass',
    interactive && 'card-interactive',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
