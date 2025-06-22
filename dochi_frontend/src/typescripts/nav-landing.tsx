import { Link } from 'react-router-dom';

function NavLanding() {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-50 shadow-sm z-50 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 italic">Dochi</h1>

        <div className="flex items-center space-x-8">
          <a href="#features" className="text-gray-700 hover:text-gray-500 font-small transition-colors">
            Features
          </a>
          <a href="#about" className="text-gray-700 hover:text-gray-500 font-small transition-colors">
            About
          </a>
          <a href="#contact" className="text-gray-700 hover:text-gray-500 font-small transition-colors">
            Contact Us
          </a>

          <Link
            to="/calendar"
            className="text-gray-700 hover:text-gray-500 font-small transition-colors"
          >
            Calendar
          </Link>

          <a href="#login" className="bg-white text-gray-700 px-4 py-1 rounded-full border border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-medium transition-all shadow-sm">
            Login
          </a>
        </div>
      </div>
    </>
  )
}

export default NavLanding;