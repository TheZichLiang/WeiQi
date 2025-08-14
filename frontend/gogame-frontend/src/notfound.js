import React from 'react';
import { useLocation } from 'react-router-dom';

/*
WHY NOTFOUND FUNCTION EXISTS:
- Acts as a catch-all route for undefined paths in React Router.
- Lets users know they navigated to a non-existent page.
- Logs the missing path for developers so they can figure out where the broken links are.
*/
function NotFound() {
  // Hook from React Router to get the current URL path
  const location = useLocation();
  // Log the missing path in the console for debugging
  console.error('Page not found:', location.pathname);
  return (
    <div>
      {/* Main message for the user */}
      <h1>The page didn’t load.</h1>
      {/* Show the exact path the user tried to visit */}
      <p>Requested URL: {location.pathname}</p>
    </div>
  );
}
export default NotFound;
