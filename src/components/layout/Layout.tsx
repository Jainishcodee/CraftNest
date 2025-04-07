
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import NotificationAlert from './NotificationAlert';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-4 md:py-8">
        {children}
      </main>
      <Footer />
      <NotificationAlert />
    </div>
  );
};

export default Layout;
