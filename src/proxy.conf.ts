const proxyConfig = [
    {
      context: ['/static/json/'], // Rest of other API call
      target: 'https://cdn.nba.com',
      secure: true,
      changeOrigin: true
    }
  ];
  
  module.exports = proxyConfig;