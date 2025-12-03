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
      </div>
    </nav>
  );
};

export default Navbar;
