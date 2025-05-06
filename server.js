const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = 'https://admin.aventuras.co.in';

// Serve static files from CRA build
const buildPath = path.resolve(__dirname, 'build');
app.use('/static', express.static(path.join(buildPath, 'static')));

// Verify build folder and index.html exist
const indexPath = path.join(buildPath, 'index.html');
if (!fs.existsSync(buildPath)) {
  console.error('Build folder not found at:', buildPath);
} else {
  console.log('Build folder found at:', buildPath);
}
if (!fs.existsSync(indexPath)) {
  console.error('index.html not found at:', indexPath);
} else {
  console.log('index.html found at:', indexPath);
}

// Static meta tags for non-dynamic routes
const staticMeta = {
  '/': {
    title: 'Aventuras Holidays',
    description: 'Discover amazing travel experiences with Aventuras Holidays. Book your dream vacation today!',
    image: 'https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png'
  },
  // (other static routes remain unchanged)
};

// SEO Middleware
const seoMiddleware = async (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const isBot = /bot|crawler|spider|googlebot|bingbot|yahoo|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|instagram|slackbot|pinterest/i.test(userAgent);

  console.log(`Path: ${req.path}, User-Agent: ${userAgent}, IsBot: ${isBot}`);

  if (!isBot) {
    return next();
  }

  let title = 'Aventuras Holidays';
  let description = 'Discover amazing travel experiences with Aventuras Holidays.';
  let image = 'https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png';
  let content = '<div class="page-section"><h1>Aventuras Holidays</h1><p>Discover amazing travel experiences with Aventuras Holidays.</p></div>';

  const path = req.path;
  
  try {
    // Static routes
    if (staticMeta[path]) {
      title = staticMeta[path].title;
      description = staticMeta[path].description;
      image = staticMeta[path].image;
      content = `<div class="page-section"><h1>${title}</h1><p>${description}</p></div>`;
    }
    // Dynamic routes
    else if (path.startsWith('/single-destination/')) {
      const dname = path.split('/single-destination/')[1];
      if (dname) {
        const response = await axios.get(
          `${BASE_URL}/api/all-destinations?populate=deep&filters[name][$contains]=${dname}`
        );
        console.log(`Destination API response for ${dname}:`, response.data);
        const data = response.data.data[0];
        if (data) {
          title = data.attributes.name;
          description = data.attributes.description || 'Explore this destination with Aventuras Holidays.';
          image = data.attributes.images?.data[0]?.attributes.url ? `${BASE_URL}${data.attributes.images.data[0].attributes.url}` : image;
          content = `<div class="single-destination-section"><h1>${title}</h1><p>${description}</p>${image ? `<img src="${image}" alt="${title}" />` : ''}</div>`;
        }
      }
    }
    else if (path.startsWith('/search-destination/')) {
      const dname = path.split('/search-destination/')[1];
      if (dname) {
        const response = await axios.get(
          `${BASE_URL}/api/all-destinations?populate=deep&filters[name][$contains]=${dname}`
        );
        console.log(`Search destination API response for ${dname}:`, response.data);
        const data = response.data.data[0];
        if (data) {
          title = `Search ${data.attributes.name} - Aventuras Holidays`;
          description = data.attributes.description || 'Find your perfect destination with Aventuras Holidays.';
          image = data.attributes.images?.data[0]?.attributes.url ? `${BASE_URL}${data.attributes.images.data[0].attributes.url}` : image;
          content = `<div class="search-destination-section"><h1>Search ${title}</h1><p>${description}</p>${image ? `<img src="${image}" alt="${title}" />` : ''}</div>`;
        }
      }
    }
    else if (path.startsWith('/single-package/')) {
      const package_id = path.split('/single-package/')[1];
      console.log(`Handling package request for ID: ${package_id}`);
      
      if (package_id) {
        try {
          const response = await axios.get(
            `${BASE_URL}/api/all-packages?populate=*&filters[package_id][$eq]=${package_id}`
          );
          console.log(`Package API response status for ${package_id}:`, response.status);
          
          if (response.data && response.data.data && response.data.data.length > 0) {
            const data = response.data.data[0];
            console.log(`Found package data for ${package_id}:`, data.attributes.name);
            
            title = data.attributes.name;
            description = data.attributes.description || 'Book this exciting travel package with Aventuras Holidays.';
            
            if (data.attributes.package_images && 
                data.attributes.package_images.data && 
                data.attributes.package_images.data.length > 0 &&
                data.attributes.package_images.data[0].attributes &&
                data.attributes.package_images.data[0].attributes.url) {
              image = `${BASE_URL}${data.attributes.package_images.data[0].attributes.url}`;
            }
            
            content = `<div class="single-package-section"><h1>${title}</h1><p>${description}</p>${image ? `<img src="${image}" alt="${title}" />` : ''}</div>`;
          } else {
            console.log(`No data found for package ID: ${package_id}`);
            // Try an alternative API endpoint as a fallback
            const altResponse = await axios.get(
              `${BASE_URL}/api/packages/${package_id}?populate=*`
            );
            
            if (altResponse.data && altResponse.data.data) {
              const data = altResponse.data.data;
              title = data.attributes.name;
              description = data.attributes.description || 'Book this exciting travel package with Aventuras Holidays.';
              
              if (data.attributes.images && 
                  data.attributes.images.data && 
                  data.attributes.images.data.length > 0) {
                image = `${BASE_URL}${data.attributes.images.data[0].attributes.url}`;
              }
              
              content = `<div class="single-package-section"><h1>${title}</h1><p>${description}</p>${image ? `<img src="${image}" alt="${title}" />` : ''}</div>`;
            } else {
              title = `Package ${package_id} - Aventuras Holidays`;
              description = `Explore travel package ${package_id} with Aventuras Holidays.`;
              content = `<div class="single-package-section"><h1>Package ${package_id}</h1><p>${description}</p></div>`;
            }
          }
        } catch (packageError) {
          console.error(`Error fetching package data for ${package_id}:`, packageError.message);
          title = `Package ${package_id} - Aventuras Holidays`;
          description = `Explore travel package ${package_id} with Aventuras Holidays.`;
          content = `<div class="single-package-section"><h1>Package ${package_id}</h1><p>${description}</p></div>`;
        }
      }
    }
    else if (path.startsWith('/single-group-tour/')) {
      const package_id = path.split('/single-group-tour/')[1];
      if (package_id) {
        try {
          const response = await axios.get(
            `${BASE_URL}/api/all-packages?populate=*&filters[package_id][$eq]=${package_id}`
          );
          console.log(`Group tour API response for ${package_id}:`, response.data);
          
          if (response.data && response.data.data && response.data.data.length > 0) {
            const data = response.data.data[0];
            title = `${data.attributes.name} Group Tour`;
            description = data.attributes.description || 'Join this group tour with Aventuras Holidays.';
            
            if (data.attributes.package_images && 
                data.attributes.package_images.data && 
                data.attributes.package_images.data.length > 0) {
              image = `${BASE_URL}${data.attributes.package_images.data[0].attributes.url}`;
            }
            
            content = `<div class="single-group-tour-section"><h1>${title}</h1><p>${description}</p>${image ? `<img src="${image}" alt="${title}" />` : ''}</div>`;
          } else {
            // Try alternative endpoint
            const altResponse = await axios.get(
              `${BASE_URL}/api/group-tours/${package_id}?populate=*`
            );
            
            if (altResponse.data && altResponse.data.data) {
              const data = altResponse.data.data;
              title = `${data.attributes.name} Group Tour`;
              description = data.attributes.description || 'Join this group tour with Aventuras Holidays.';
              
              if (data.attributes.images && 
                  data.attributes.images.data && 
                  data.attributes.images.data.length > 0) {
                image = `${BASE_URL}${data.attributes.images.data[0].attributes.url}`;
              }
              
              content = `<div class="single-group-tour-section"><h1>${title}</h1><p>${description}</p>${image ? `<img src="${image}" alt="${title}" />` : ''}</div>`;
            } else {
              title = `Group Tour ${package_id} - Aventuras Holidays`;
              description = `Join group tour ${package_id} with Aventuras Holidays.`;
              content = `<div class="single-group-tour-section"><h1>Group Tour ${package_id}</h1><p>${description}</p></div>`;
            }
          }
        } catch (tourError) {
          console.error(`Error fetching group tour data for ${package_id}:`, tourError.message);
          title = `Group Tour ${package_id} - Aventuras Holidays`;
          description = `Join group tour ${package_id} with Aventuras Holidays.`;
          content = `<div class="single-group-tour-section"><h1>Group Tour ${package_id}</h1><p>${description}</p></div>`;
        }
      }
    }
    else if (path.startsWith('/single-theme/')) {
      const id = path.split('/single-theme/')[1];
      if (id) {
        try {
          const response = await axios.get(
            `${BASE_URL}/api/themes/${id}?populate=*`
          );
          console.log(`Theme API response for ${id}:`, response.data);
          
          if (response.data && response.data.data) {
            const data = response.data.data;
            title = data.attributes.name;
            description = data.attributes.description || 'Explore this exciting travel theme with Aventuras Holidays.';
            
            if (data.attributes.image && 
                data.attributes.image.data && 
                data.attributes.image.data.attributes && 
                data.attributes.image.data.attributes.url) {
              image = `${BASE_URL}${data.attributes.image.data.attributes.url}`;
            }
            
            content = `<div class="single-theme-section"><h1>${title}</h1><p>${description}</p>${image ? `<img src="${image}" alt="${title}" />` : ''}</div>`;
          }
        } catch (themeError) {
          console.error(`Error fetching theme data for ${id}:`, themeError.message);
          title = `Theme - Aventuras Holidays`;
          description = 'Explore exciting travel themes with Aventuras Holidays.';
          content = `<div class="single-theme-section"><h1>Travel Theme</h1><p>${description}</p></div>`;
        }
      }
    }
    else {
      title = 'Not Found - Aventuras Holidays';
      description = 'Page not found on Aventuras Holidays.';
      content = `<div class="not-found-section"><h1>404 - Page Not Found</h1><p>Sorry, the page you are looking for does not exist.</p></div>`;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <meta name="description" content="${description}">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        ${image ? `<meta property="og:image" content="${image}">` : ''}
        <meta property="og:type" content="website">
        <meta property="og:url" content="${req.protocol}://${req.get('host')}${req.originalUrl}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        ${image ? `<meta name="twitter:image" content="${image}">` : ''}
        <link rel="stylesheet" href="/static/css/main.css">
      </head>
      <body>
        <div id="root">${content}</div>
        <script src="/static/js/main.js"></script>
      </body>
      </html>
    `;

    res.set('Cache-Control', 'public, max-age=3600');
    res.send(html);
  } catch (error) {
    console.error(`SEO Middleware Error for ${req.path}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    title = 'Error - Aventuras Holidays';
    description = 'An error occurred while loading this page.';
    content = `<div class="error-section"><h1>Error</h1><p>An error occurred while loading this page. Please try again later.</p></div>`;
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <meta name="description" content="${description}">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        ${image ? `<meta property="og:image" content="${image}">` : ''}
        <meta property="og:type" content="website">
        <meta property="og:url" content="${req.protocol}://${req.get('host')}${req.originalUrl}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        ${image ? `<meta name="twitter:image" content="${image}">` : ''}
        <link rel="stylesheet" href="/static/css/main.css">
      </head>
      <body>
        <div id="root">${content}</div>
        <script src="/static/js/main.js"></script>
      </body>
      </html>
    `;
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(html);
  }
};

// Single route to handle all requests
app.get('*', seoMiddleware, (req, res) => {
  if (fs.existsSync(indexPath)) {
    console.log('Serving index.html for:', req.path);
    res.sendFile(indexPath);
  } else {
    console.error('index.html not found at:', indexPath);
    res.status(404).send('React build not found. Please ensure the build folder exists.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});