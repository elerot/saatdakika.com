// pages/api/fetchNews.js

export default async function handler(req, res) {
    const { url } = req.query; // Get URL from query parameters
  
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
  
    try {
      const response = await fetch(url); // Fetch the data from the provided URL
      const data = await response.text();
      
      res.status(200).send(data); // Send back the fetched data
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data from the URL' });
    }
  }
  