import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 bg-opacity-70 backdrop-blur-md shadow-lg rounded-b-lg">
      <div className="flex justify-between items-center h-16 px-6 sm:px-10 lg:px-16">
        
        {/* Left side — Title */}
        <div className="flex items-center">
          <span className="text-xl font-semibold text-white tracking-wider">
            Smart Version Control Analytics
          </span>
        </div>

        {/* Right side — Buttons */}
        <div className="flex items-center space-x-4">
          {/* Login button navigates to /login */}
          <Link
            to="/login"
            className="text-gray-300 hover:text-cyan-400 font-medium transition duration-200"
          >
            Login
          </Link>

          {/* Get Started button navigates to /signup */}
          <Link
            to="/signup"
            className="px-5 py-2 bg-cyan-500 text-gray-900 font-semibold rounded-full hover:bg-cyan-400 transition duration-200"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
