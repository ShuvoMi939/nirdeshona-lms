"use client";

import Link from "next/link";
import { EnvelopeIcon, PhoneIcon, MapPinIcon, LinkIcon } from "@heroicons/react/24/outline";

const Footer = () => {
  const year = new Date().getFullYear();

  const sections = {
    quickLinks: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/feed", label: "Feed" },
      { href: "/dashboard/courses", label: "Courses" },
      { href: "/dashboard/posts", label: "Posts" },
      { href: "/dashboard/support", label: "Support" },
    ],
    resources: [
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/faq", label: "FAQ" },
      { href: "/blog", label: "Blog" },
      { href: "/careers", label: "Careers" },
    ],
    support: [
      { href: "/help-center", label: "Help Center" },
      { href: "/contact", label: "Contact Us" },
      { href: "/community", label: "Community" },
      { href: "/guides", label: "Guides" },
    ],
  };

  const socialIcons = [
    { href: "https://facebook.com", svg: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.325v21.351c0 .732.592 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.658-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.764v2.314h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.322-.592 1.322-1.325V1.325C24 .592 23.408 0 22.675 0z"/>
      </svg>
    ) },
    { href: "https://twitter.com", svg: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 4.557a9.828 9.828 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.196 4.916 4.916 0 00-8.384 4.482A13.939 13.939 0 011.671 3.149 4.916 4.916 0 003.195 9.723a4.903 4.903 0 01-2.229-.616v.062a4.918 4.918 0 003.946 4.827 4.902 4.902 0 01-2.224.084 4.917 4.917 0 004.588 3.417A9.867 9.867 0 010 21.543a13.92 13.92 0 007.548 2.212c9.058 0 14.01-7.513 14.01-14.016 0-.213-.005-.425-.014-.636A10.012 10.012 0 0024 4.557z"/>
      </svg>
    ) },
    { href: "https://linkedin.com", svg: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.23 0H1.77C.792 0 0 .774 0 1.73v20.54C0 23.225.792 24 1.77 24h20.46C23.208 24 24 23.225 24 22.27V1.73C24 .774 23.208 0 22.23 0zM7.12 20.452H3.556V9h3.564v11.452zM5.338 7.561a2.062 2.062 0 01-2.067-2.065c0-1.14.926-2.066 2.067-2.066s2.066.926 2.066 2.066a2.064 2.064 0 01-2.066 2.065zM20.452 20.452h-3.563v-5.563c0-1.328-.025-3.037-1.852-3.037-1.854 0-2.138 1.446-2.138 2.938v5.662H9.885V9h3.422v1.561h.049c.477-.899 1.637-1.848 3.369-1.848 3.6 0 4.268 2.37 4.268 5.451v6.288z"/>
      </svg>
    ) },
    { href: "https://instagram.com", svg: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.849.07 1.366.062 2.633.334 3.608 1.31.975.975 1.247 2.243 1.31 3.608.058 1.265.069 1.645.069 4.849s-.012 3.584-.07 4.849c-.062 1.366-.334 2.633-1.31 3.608-.975.975-2.243 1.247-3.608 1.31-1.265.058-1.645.069-4.849.069s-3.584-.012-4.849-.07c-1.366-.062-2.633-.334-3.608-1.31-.975-.975-1.247-2.243-1.31-3.608-.058-1.265-.069-1.645-.069-4.849s.012-3.584.07-4.849c.062-1.366.334-2.633 1.31-3.608.975-.975 2.243-1.247 3.608-1.31C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.13 4.629.443 3.635 1.438 2.641 2.432 2.328 3.574 2.27 4.855.013 8.332 0 8.741 0 12s.013 3.668.072 4.948c.058 1.281.371 2.423 1.365 3.417.995.995 2.137 1.308 3.418 1.365 1.28.059 1.689.072 4.948.072s3.668-.013 4.948-.072c1.281-.058 2.423-.371 3.417-1.365.995-.995 1.308-2.137 1.365-3.418.059-1.28.072-1.689.072-4.948s-.013-3.668-.072-4.948c-.058-1.281-.371-2.423-1.365-3.417C19.423.443 18.281.13 17 .072 15.719.013 15.309 0 12 0z"/>
        <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998z"/>
        <circle cx="18.406" cy="5.594" r="1.44"/>
      </svg>
    ) },
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 px-6 py-16 font-anek-bangla">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12">

        {/* Brand / About */}
        <div className="space-y-4">
          <h3 className="text-white text-xl font-semibold">Nirdeshona</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Nirdeshona is an educational platform empowering students across Bangladesh
            with interactive courses, mentorship, and career-focused tools.
          </p>
          <div className="flex space-x-3 mt-2">
            {socialIcons.map(({ href, svg }, idx) => (
              <Link key={idx} href={href} target="_blank" className="hover:text-white transition">
                {svg}
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {sections.quickLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Resources</h3>
          <ul className="space-y-2 text-sm">
            {sections.resources.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            {sections.support.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-3 text-sm">
          <h3 className="text-white text-lg font-semibold mb-4">Contact</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <EnvelopeIcon className="w-5 h-5 text-slate-400" />
              <a href="mailto:ins.org.24@gmail.com" className="hover:text-white transition">
                ins.org.24@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <PhoneIcon className="w-5 h-5 text-slate-400" />
              <a href="tel:+880123456789" className="hover:text-white transition">
                +880 123 456 789
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-slate-400" />
              Dhaka, Bangladesh
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal */}
      <div className="mt-12 border-t border-slate-800 pt-6 text-center text-slate-500 text-xs">
        &copy; {year} Nirdeshona. All rights reserved. | 
        <Link href="/terms" className="hover:text-white mx-1">Terms</Link> | 
        <Link href="/privacy" className="hover:text-white mx-1">Privacy</Link>
      </div>
    </footer>
  );
};

export default Footer;
