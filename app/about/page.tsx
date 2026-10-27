 // app/about/page.tsx
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/homepage/about/Navbar';
import AnimatedContent from '@/components/homepage/about/AnimatedContent';

const responsibilities = [
  {
    title: 'Inventory tracking',
    body: 'Stock levels update as orders come in, so sellers always know what is available.',
  },
  {
    title: 'Courier coordination',
    body: 'Shipping is arranged with J&T, Flash, and SPX, so orders reach customers without manual back-and-forth.',
  },
  {
    title: 'Secure checkout',
    body: 'Payments are processed safely, and every order is recorded accurately from purchase to delivery.',
  },
];

const principles = [
  {
    title: 'The store belongs to the seller',
    body: 'Every storefront carries the seller’s name, colors, and voice. Manipu stays in the background.',
  },
  {
    title: 'Simplicity over complexity',
    body: 'Every feature is judged by one question: does it give the seller more control, or does it only add complexity? If it is the latter, we do not ship it.',
  },
  {
    title: 'Clear terms, no surprises',
    body: 'Pricing is stated plainly. There are no hidden fees buried in fine print.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-body antialiased flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-3xl mx-auto px-6 py-20 w-full">
        {/* HERO */}
        <AnimatedContent delay={0.1} distance={30}>
          <header className="mb-14">
            <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-6">
              About Manipu
            </h1>
            <p className="text-xl text-ink/80 leading-relaxed font-light">
              Manipu is a storefront platform built for independent merchants and creators in the
              Philippines. We give sellers a professional online store they fully own, and we take
              care of the operations behind it.
            </p>
          </header>
        </AnimatedContent>

        <div className="space-y-14 border-t border-ink/10 pt-10">
          {/* STORY */}
          <AnimatedContent delay={0.1}>
            <section>
              <h2 className="font-display font-bold text-xl text-ink mb-3">Why we built Manipu</h2>
              <div className="space-y-4 text-ink/70 leading-relaxed">
                <p>
                  Many Filipino sellers build something real: a following, a product line, a loyal
                  base of customers. Too often, that growth ends up boxed in by marketplaces that
                  charge high fees, place their own logo above the seller’s brand, and force every
                  seller to compete for visibility against thousands of other listings.
                </p>
                <p>
                  Manipu exists to change that. We believe a seller’s store should belong to the
                  person running it, and that running it should not require a developer, a large
                  budget, or a team.
                </p>
              </div>
            </section>
          </AnimatedContent>

          {/* WHAT WE HANDLE */}
          <AnimatedContent delay={0.1}>
            <section>
              <h2 className="font-display font-bold text-xl text-ink mb-3">What we take care of</h2>
              <p className="text-ink/70 leading-relaxed mb-6">
                We act as infrastructure, not a landlord. Sellers spend their time on their products
                and customers, and we handle the operational work that keeps orders moving.
              </p>
              <dl className="divide-y divide-ink/10 border-y border-ink/10">
                {responsibilities.map((item) => (
                  <div key={item.title} className="grid sm:grid-cols-3 gap-2 sm:gap-6 py-5">
                    <dt className="font-semibold text-ink">{item.title}</dt>
                    <dd className="sm:col-span-2 text-ink/70 leading-relaxed text-sm sm:text-base">
                      {item.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </AnimatedContent>

          {/* CUSTOMERS */}
          <AnimatedContent delay={0.1}>
            <section>
              <h2 className="font-display font-bold text-xl text-ink mb-3">For shoppers</h2>
              <p className="text-ink/70 leading-relaxed">
                When you buy from a store powered by Manipu, you are buying directly from the
                seller. Manipu works behind the scenes to keep the order accurate, the payment
                secure, and the delivery on track, so the relationship between you and the person
                who made or curated your purchase stays direct and honest.
              </p>
            </section>
          </AnimatedContent>

          {/* PRINCIPLES */}
          <AnimatedContent delay={0.1}>
            <section>
              <h2 className="font-display font-bold text-xl text-ink mb-6">How we work</h2>
              <div className="space-y-6">
                {principles.map((item) => (
                  <div key={item.title} className="border-l-2 border-marigold-dark pl-5">
                    <h3 className="font-semibold text-ink mb-1">{item.title}</h3>
                    <p className="text-ink/70 leading-relaxed text-sm sm:text-base">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </AnimatedContent>

          {/* SUPPORT */}
          <AnimatedContent delay={0.1}>
            <section>
              <h2 className="font-display font-bold text-xl text-ink mb-3">Support you can rely on</h2>
              <p className="text-ink/70 leading-relaxed">
                Support is part of the service, not an afterthought. Whether you have a courier
                issue, a payout question, or need help setting up your first product listing, our
                team is here to respond and resolve it.
              </p>
            </section>
          </AnimatedContent>

          {/* MISSION & VISION */}
          <AnimatedContent delay={0.1}>
            <div className="grid sm:grid-cols-2 gap-8 bg-white border border-ink/10 rounded-2xl p-8">
              <div>
                <h2 className="text-sm font-semibold text-teal mb-2">Our mission</h2>
                <p className="text-ink/70 leading-relaxed text-sm">
                  To give every independent Filipino merchant the tools to run a professional online
                  store, without needing a developer, a big budget, or a team.
                </p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-marigold-dark mb-2">Our vision</h2>
                <p className="text-ink/70 leading-relaxed text-sm">
                  A future where the neighborhood tindahan and the small-batch creator have the same
                  digital reach as any large brand, each with a store that is truly their own.
                </p>
              </div>
            </div>
          </AnimatedContent>
        </div>

        {/* CALL TO ACTION */}
        <AnimatedContent delay={0.1} distance={40}>
          <section className="mt-16 pt-12 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-1">Ready to launch your storefront?</h3>
              <p className="text-sm text-ink/60">Create your account and start selling today.</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Link href="/" className="text-sm text-ink/60 hover:text-ink transition-colors">
                Back to home
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold px-5 py-2.5 rounded-full bg-ink text-paper hover:bg-ink/90 transition-colors"
              >
                Sign up free
              </Link>
            </div>
          </section>
        </AnimatedContent>
      </main>
    </div>
  );
}