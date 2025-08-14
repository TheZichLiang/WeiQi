import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/*
WHY PATHLOGGER EXISTS:
- Provides a centralized way to monitor route changes.
- Useful for debugging navigation issues during development.
- Can later be expanded to:
    - Send analytics events to services like Google Analytics or Mixpanel.
    - Track user navigation for session replay tools.
- Doesn't render UI, but is purely a side-effect component for logging/tracking.
*/
function PathLogger() {
  // Hook from React Router to access the current location object
  const location = useLocation();
  useEffect(() => {
    // Always log the current path whenever the route changes
    console.log('Current path:', location.pathname);
    // Custom console messages for specific pages
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
  // Effect reruns every time the path changes
  return null; // This component does not render anything to the UI
}

export default PathLogger;