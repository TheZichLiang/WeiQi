import React from 'react';
import { useLocation } from 'react-router-dom';

function NotFound() {
  const location = useLocation();

  console.error('Page not found:', location.pathname);

  return (
    <div>
      <h1>The page didn’t load.</h1>
      <p>Requested URL: {location.pathname}</p>
    </div>
  );
}

export default NotFound;