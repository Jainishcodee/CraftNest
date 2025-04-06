
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-craft-cream border-t mt-auto">
      <div className="craft-container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-craft-teal flex items-center justify-center">
                <span className="text-white font-bold text-lg">CN</span>
              </div>
              <span className="font-bold text-xl text-craft-brown">
                CraftNest
              </span>
            </Link>
            <p className="text-muted-foreground mb-4">
              A marketplace for unique handcrafted items made with love by
              independent artisans.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-craft-brown hover:text-craft-teal transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-craft-brown hover:text-craft-teal transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-craft-brown hover:text-craft-teal transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-craft-brown">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products?category=pottery"
                  className="text-muted-foreground hover:text-craft-teal transition-colors"
                >
                  Pottery
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=jewelry"
                  className="text-muted-foreground hover:text-craft-teal transition-colors"
                >
                  Jewelry
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=woodwork"
                  className="text-muted-foreground hover:text-craft-teal transition-colors"
                >
                  Woodwork
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=textiles"
                  className="text-muted-foreground hover:text-craft-teal transition-colors"
                >
                  Textiles
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=art"
                  className="text-muted-foreground hover:text-craft-teal transition-colors"
                >
                  Art
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-craft-brown">Company</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-craft-teal transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-craft-teal transition-colors"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-craft-teal transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-craft-teal transition-colors"
                >
                  Press
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-craft-brown">Support</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-craft-teal transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-craft-teal transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-craft-teal transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-craft-teal transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} CraftNest. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-craft-teal transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-craft-teal transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-craft-teal transition-colors"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
