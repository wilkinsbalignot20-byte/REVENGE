import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto max-w-[1200px] px-[83px] pt-[56px]">
      <p className="font-[family-name:var(--font-nunito)] text-lg font-bold uppercase text-white">
        Full Stack Developer
      </p>

      <h1 className="mt-1 font-[family-name:var(--font-playfair)] text-[56px] font-bold leading-[1.15] text-[#2b2b2b]">
        Hello, my name is
        <br />
        Wilkins Balignot
      </h1>

      <p className="mt-8 max-w-[400px] font-[family-name:var(--font-nunito)] text-xl leading-[30px] text-white/90">
        &quot;I build high-converting online stores and custom websites that
        help businesses sell more products dynamically.&quot;
      </p>

      <div className="mt-10 flex gap-[10px]">
        <Link
          href="#projects"
          className="rounded-lg bg-[#e6f4ef] px-5 py-2 text-[15px] font-medium text-black transition hover:bg-white"
        >
          Projects
        </Link>
        <Link
          href="https://www.linkedin.com/"
          target="_blank"
          className="rounded-lg border-2 border-[#04503c] px-5 py-2 text-[15px] font-medium text-[#04503c] transition hover:bg-[#04503c] hover:text-white"
        >
          LinkedIn
        </Link>
      </div>
    </section>
  );
}