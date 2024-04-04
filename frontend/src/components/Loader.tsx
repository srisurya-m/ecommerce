

const Loader = () => {
  return (
    <div>
      Loading...
    </div>
  )
}

export const SkeletonLoader = ()=>{
  return <div className="skeleton-loader">
    <div className="skeleton-shape"></div>
    <div className="skeleton-shape"></div>
    <div className="skeleton-shape"></div>
  </div>
}

export default Loader
