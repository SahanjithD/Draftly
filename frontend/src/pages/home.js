import React from 'react';

const HomePage = () => {
  const token = localStorage.getItem('token');
  return (
    <div style={{padding: '40px', fontFamily: 'var(--dl-font-sans)'}}>
      <h1 style={{marginBottom: '16px'}}>Home</h1>
      {token ? (
        <p>You are logged in. Token (truncated): <code>{token.substring(0, 24)}...</code></p>
      ) : (
        <p>No token found. Please <a href="/login">login</a>.</p>
      )}
      <p style={{marginTop: '32px'}}>Next: Build your feed, protected routes, and logout.</p>
    </div>
  );
};

export default HomePage;
