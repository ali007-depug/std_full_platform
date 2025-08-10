import { useState } from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  logoSrc?: string;
  logoAlt?: string;
}

export default function Header({ logoSrc, logoAlt }: HeaderProps) {
  // mobile menu state
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  //   func for mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { id: 0, linkName: "الرئيسية",link:"home" },
    { id: 1, linkName: "نافذة النتيجة",link:"std-UI" },
  ];

  //   mobile links mapping
  const Mobilelinks = navLinks.map((link) => {
    return (
      <li key={link.id}>
        <Link
          to={`/${link.link === "home" ? " " : link.link}`}
          onClick={toggleMenu}
          className={`transition-all duration-100 ease-in-out ${
            location.pathname === `/${link.link === "home" ? "" : link.link}`
              ? "border-b-s-color border-b-[3px]"
              : ""
          }`}
        >
          {link.linkName}
        </Link>
      </li>
    );
  });
//   desktop links
  const Desktoplinks = navLinks.map((link) => {
    return (
      <li key={link.id}>
        <Link
          to={`/${link.link === "home" ? "" : link.link}`}
          className={`transition-all duration-100 ease-in-out ${
            location.pathname === `/${link.link === "home" ? "" : link.link}`
              ? "border-b-s-color border-b-[3px]"
              : ""
          }`}
        >
          {link.linkName}
        </Link>
      </li>
    );
  });

  return (
    <header className="flex justify-between items-center py-5 bg-sky-200 px-dyp">
      <h1>شعار الكلية</h1>
      {/* logo */}
      <div>
        <img className=" rounded-full" src={logoSrc} alt={logoAlt} />
      </div>
      {/* nav liks */}
      <nav aria-label="Main-Nav">
        <button
          onClick={toggleMenu}
          className="sm:hidden p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-p-color cursor-pointer"
          aria-expanded={isMenuOpen}
          aria-controls="mobileMenu"
          aria-label={isMenuOpen ? "close menu" : "open menu"}
        >
          {/* menu icon */}
          <img
            src={isMenuOpen ? "./icon-close.svg" : "./icon-hamburger.svg"}
            alt=""
            aria-hidden="true"
          />
        </button>
        {/* desktop nav */}
        <ul className="hidden sm:flex sm:flex-wrap sm:justify-center space-x-8  [&_li]:w-fit  [&_a]:px-4 [&_a]:py-2  [&_a]:inline-block  [&_a]:capitalize [&_a]:font-semibold [&_a]:text-p-color [&_a]:hover:border-b-[3px] [&_a]:hover:border-s-color [&_a]:focus:outline-none [&_a]:focus:ring-2 [&_a]:focus:ring-offset-2 [&_a]:focus:ring-white">
          {Desktoplinks}
        </ul>
        {/* ====== End Desktop nav ====== */}

        {/* ====== mobile nav ====== */}
        <ul
          id="mobileMenu"
          className={
            isMenuOpen
              ? "flex flex-col justify-center items-center absolute right-0 mt-4 w-full text-center bg-n-color min-h-90 [&_li]:w-fit [&_a]:px-4 [&_a]:py-2 [&_a]:min-w-[90px] [&_a]:inline-block [&_a]:bg-bg-color [&_a]:text-p-color [&_a]:my-4 [&_a]:rounded-[5px] [&_a]:capitalize [&_a]:font-semibold [&_a]:focus:outline-none [&_a]:focus:ring-2 [&_a]:focus:ring-offset-2 [&_a]:focus:ring-white"
              : "hidden"
          }
        >
          {Mobilelinks}
        </ul>
        {/* ===== End mobile Nav ===== */}
      </nav>
      {/* ===== End Nav ====== */}
    </header>
  );
}
