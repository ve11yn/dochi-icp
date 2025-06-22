interface HeaderProps {
  currentPage: string;
}

const Header = ({ currentPage }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 h-16 flex items-center flex-shrink-0">
      <h1 className="text-xl font-bold text-gray-800">{currentPage}</h1>
    </header>
  );
};

export default Header;