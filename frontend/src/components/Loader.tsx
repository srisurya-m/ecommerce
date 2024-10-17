const Loader = () => {
  return (
    <section className="loader">
      <div></div>
    </section>
  );
};

interface SkeletonProps {
  width?: string;
  length?: number;
  height?: string;
  containerHeight?: string;
}

export const SkeletonLoader = ({ width = "unset",
  length = 3,
  height = "30px",
  containerHeight = "unset",} : SkeletonProps) => {
    const skeletons = Array.from({ length }, (_, idx) => (
      <div key={idx} className="skeleton-shape" style={{ height }}></div>
    ));
  
    return (
      <div className="skeleton-loader" style={{ width, height: containerHeight }}>
        {skeletons}
      </div>
    );
};

export default Loader;
