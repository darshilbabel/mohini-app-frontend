import { GrEmptyCircle } from "react-icons/gr";
import Footer from "../common/Footer";
import Header from "../listing/Header";

function NotFound() {
  return (
    <>
      <div className="container">
        <Header isHeroSection={false} />
        <div className="flex flex-col items-center justify-center h-screen">
          <GrEmptyCircle size={100} />
          <h1 className="text-2xl font-bold text-center mt-20">
            404 Not Found
          </h1>
          <p className="text-center">
            The page you are looking for does not exist.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
export default NotFound;
