import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const addToCartHandler = () => {};
  return (
    <div className="home">
      <section></section>

      <h1>
        Latest Products
        <Link to="/search" className="findmore">
          More
        </Link>
      </h1>

      <main>
        <ProductCard
          productId="vfi"
          name="Hp spectre"
          price={54423}
          stock={42}
          handler={addToCartHandler}
          photo="https://m.media-amazon.com/images/I/51rsV94YVCL._SL1024_.jpg"
        />
      </main>
    </div>
  );
};

export default Home;
