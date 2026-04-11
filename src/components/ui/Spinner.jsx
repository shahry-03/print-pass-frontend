const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '';
  return (
    <div className="spinner-wrapper">
      <div className={`spinner ${sizeClass} ${className}`} />
    </div>
  );
};

export default Spinner;
