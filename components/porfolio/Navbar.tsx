import Link from "next/link";

const links = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contacts", href: "#contacts" },
];

export default function Navbar() {
  return (
    <header className="w-full bg-[#a6d8c2]">
      <nav className="mx-auto flex h-12 max-w-[1200px] items-center justify-between px-[83px] font-[family-name:var(--font-comfortaa)] text-black">
        <Link href="/" className="text-base font-medium">
          Wilkins Balignot
        </Link>

        <ul className="flex items-center gap-[58px] text-base font-medium">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:opacity-70 transition">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}