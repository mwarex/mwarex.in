'use client';

import Link from 'next/link';
import { Youtube, Twitter, Github, Mail, Linkedin } from 'lucide-react';
import { MWareXLogo } from '@/components/mwarex-logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'API', href: '/api' },
      { label: 'Integrations', href: '/integrations' },
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/support' },
    ],
    legal: [
      { label: 'Privacy', href: '/privacy-policy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Security', href: '/security' },
    ],
  };

  const socialLinks = [
    { icon: Github, href: 'https://github.com/samay-hash', label: 'GitHub' },
    { icon: Twitter, href: 'https://x.com/mwarex', label: 'Twitter' },
    { icon: Youtube, href: 'https://www.youtube.com/@futxsamay', label: 'YouTube' },
    { icon: Mail, href: 'mailto:samay3076@gmail.com', label: 'Email' },
  ];

  return (
    <footer className="relative border-t border-border">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <MWareXLogo showText={true} size="md" href="/" />
            </div>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Streamline your YouTube workflow with seamless collaboration between creators and editors.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-foreground font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-foreground font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-foreground font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Connect Section - Professional Social Links */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col items-center gap-6">
            <h3 className="text-foreground font-semibold text-lg">Connect with me</h3>
            <div className="flex items-center gap-4">
              {socialLinks.slice(0, 3).map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  aria-label={social.label}
                >
                  <div className="w-12 h-12 rounded-2xl bg-secondary hover:bg-primary/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-300 border border-border hover:border-primary/50">
                    <social.icon className="w-6 h-6" />
                  </div>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                    {social.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {currentYear} MWareX. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Made with ❤️ for content creators everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
