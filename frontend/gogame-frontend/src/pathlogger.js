import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function PathLogger() {
  const location = useLocation();

  useEffect(() => {
    console.log('Current path:', location.pathname);

    // Add conditional logging for specific paths
    if (location.pathname === '/playgo') {
      console.log('Accessing Play Go page');
    } else if (location.pathname === '/gorules') {
      console.log('Accessing Go Rules page');
    } else if (location.pathname === '/chooseboard') {
      console.log('Accessing Choose Board page');
    } else if (location.pathname === '/settings') {
      console.log('Accessing Settings page');
    } else if (location.pathname === '/') {
      console.log('Accessing Home page');
    } else {
      console.log('Accessing an undefined or other page');
    }
  }, [location]);

  return null; // This component does not render anything
}

export default PathLogger;