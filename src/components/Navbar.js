import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-[#c1b599] p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold text-black">
          SonicScript
        </Link>
        
        <div className="flex space-x-6">
          <Link href="/" className="font-medium text-black hover:text-gray-700">
            HOME
          </Link>
          <Link href="/dashboard" className="font-medium text-black hover:text-gray-700">
            DASHBOARD
          </Link>
          <Link href="/about" className="font-medium text-black hover:text-gray-700">
            About Us
          </Link>
          <Link href="/help" className="font-medium text-black hover:text-gray-700">
            Help
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;