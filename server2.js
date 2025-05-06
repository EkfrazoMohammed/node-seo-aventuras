const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = "https://admin.aventuras.co.in";

// Serve static files from CRA build
app.use(express.static(path.join(__dirname, "build")));

// Static meta tags for non-dynamic routes
const staticMeta = {
  "/": {
    title: "Aventuras Holidays",
    description:
      "Discover amazing travel experiences with Aventuras Holidays. Book your dream vacation today!",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/register": {
    title: "Register - Aventuras Holidays",
    description:
      "Create an account with Aventuras Holidays to start planning your next adventure.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/all-destinations": {
    title: "All Destinations - Aventuras Holidays",
    description:
      "Explore our wide range of travel destinations with Aventuras Holidays.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/all-packages": {
    title: "All Packages - Aventuras Holidays",
    description:
      "Browse our exclusive travel packages for your perfect holiday.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/group-tour": {
    title: "Group Tours - Aventuras Holidays",
    description:
      "Join our exciting group tours for a memorable travel experience.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/group-tour-pay-now": {
    title: "Pay for Group Tour - Aventuras Holidays",
    description:
      "Secure your spot on our group tours with easy payment options.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/all-themes": {
    title: "Travel Themes - Aventuras Holidays",
    description:
      "Discover travel themes tailored to your interests with Aventuras Holidays.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/flight": {
    title: "Book Flights - Aventuras Holidays",
    description:
      "Find and book flights for your travel with Aventuras Holidays.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/pay-now": {
    title: "Pay Now - Aventuras Holidays",
    description: "Complete your booking with secure payment options.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/pay-now-with-package": {
    title: "Pay for Package - Aventuras Holidays",
    description: "Secure your travel package with easy payment options.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/about-us": {
    title: "About Us - Aventuras Holidays",
    description:
      "Learn more about Aventuras Holidays and our passion for travel.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/contact-us": {
    title: "Contact Us - Aventuras Holidays",
    description:
      "Get in touch with Aventuras Holidays for travel inquiries and support.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/Why_choose": {
    title: "Why Choose Us - Aventuras Holidays",
    description:
      "Discover why Aventuras Holidays is your trusted travel partner.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/disclaimer": {
    title: "Disclaimer - Aventuras Holidays",
    description: "Read the disclaimer for Aventuras Holidays services.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/privacy-policy": {
    title: "Privacy Policy - Aventuras Holidays",
    description: "Understand how Aventuras Holidays protects your privacy.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/cancelation-policy": {
    title: "Cancellation Policy - Aventuras Holidays",
    description:
      "Review the cancellation policy for Aventuras Holidays bookings.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/terms-and-condition": {
    title: "Terms and Conditions - Aventuras Holidays",
    description:
      "Read the terms and conditions for using Aventuras Holidays services.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
  "/myprofile": {
    title: "My Profile - Aventuras Holidays",
    description: "Manage your profile and bookings with Aventuras Holidays.",
    image: "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png",
  },
};

// SEO Middleware
const seoMiddleware = async (req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";
  const isBot =
    /bot|crawler|spider|googlebot|bingbot|yahoo|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|instagram|slackbot|pinterest/i.test(
      userAgent
    );

  if (!isBot) {
    return next();
  }

  let title = "Aventuras Holidays";
  let description =
    "Discover amazing travel experiences with Aventuras Holidays.";
  let image = "https://admin.aventuras.co.in/uploads/image_1_1_2a69dfc02b.png";
  let content =
    '<div class="page-section"><h1>Aventuras Holidays</h1><p>Discover amazing travel experiences with Aventuras Holidays.</p></div>';

  const path = req.path;
  const { dname, package_id, id } = req.params;

  try {
    // Static routes
    if (staticMeta[path]) {
      title = staticMeta[path].title;
      description = staticMeta[path].description;
      image = staticMeta[path].image;
      content = `<div class="page-section"><h1>${title}</h1><p>${description}</p></div>`;
    }
    // Dynamic routes
    else if (path.startsWith("/single-destination/") && dname) {
      const response = await axios.get(
        `${BASE_URL}/api/all-destinations?populate=deep&filters[name][$containsi]=${dname}`
      );
      const data = response.data.data[0];
      if (data) {
        title = data.attributes.name;
        description = data.attributes.description;
        image = data.attributes.images?.data[0]?.attributes.url
          ? `${BASE_URL}${data.attributes.images.data[0].attributes.url}`
          : image;
        content = `<div class="single-destination-section"><h1>${title}</h1><p>${description}</p>${
          image ? `<img src="${image}" alt="${title}" />` : ""
        }</div>`;
      }
    } else if (path.startsWith("/search-destination/") && dname) {
      const response = await axios.get(
        `${BASE_URL}/api/all-destinations?populate=deep&filters[name][$containsi]=${dname}`
      );
      const data = response.data.data[0];
      if (data) {
        title = `Search ${data.attributes.name} - Aventuras Holidays`;
        description = data.attributes.description;
        image = data.attributes.images?.data[0]?.attributes.url
          ? `${BASE_URL}${data.attributes.images.data[0].attributes.url}`
          : image;
        content = `<div class="search-destination-section"><h1>Search ${title}</h1><p>${description}</p>${
          image ? `<img src="${image}" alt="${title}" />` : ""
        }</div>`;
      }
    } else if (path.startsWith("/single-package/") && package_id) {
      const response = await axios.get(
        `${BASE_URL}/api/all-packages?populate=*&filters[package_id][$eq]=${package_id}`
      );
      const data = response.data.data[0];
      if (data) {
        title = data.attributes.name;
        description = data.attributes.description;
        image = data.attributes.package_images?.data[0]?.attributes.url
          ? `${BASE_URL}${data.attributes.package_images.data[0].attributes.url}`
          : image;
        content = `<div class="single-package-section"><h1>${title}</h1><p>${description}</p>${
          image ? `<img src="${image}" alt="${title}" />` : ""
        }</div>`;
      }
    } else if (path.startsWith("/single-group-tour/") && package_id) {
      const response = await axios.get(
        `${BASE_URL}/api/all-packages?populate=*&filters[package_id][$eq]=${package_id}`
      );
      const data = response.data.data[0];
      if (data) {
        title = `${data.attributes.name} Group Tour`;
        description = data.attributes.description;
        image = data.attributes.package_images?.data[0]?.attributes.url
          ? `${BASE_URL}${data.attributes.package_images.data[0].attributes.url}`
          : image;
        content = `<div class="single-group-tour-section"><h1>${title}</h1><p>${description}</p>${
          image ? `<img src="${image}" alt="${title}" />` : ""
        }</div>`;
      }
    } else if (path.startsWith("/single-theme/") && id) {
      const response = await axios.get(
        `${BASE_URL}/api/themes/${id}?populate=*`
      );
      const data = response.data.data;
      if (data) {
        title = data.attributes.name;
        description =
          data.attributes.description ||
          "Explore this exciting travel theme with Aventuras Holidays.";
        image = data.attributes.image?.data?.attributes.url
          ? `${BASE_URL}${data.attributes.image.data.attributes.url}`
          : image;
        content = `<div class="single-theme-section"><h1>${title}</h1><p>${description}</p>${
          image ? `<img src="${image}" alt="${title}" />` : ""
        }</div>`;
      }
    } else {
      title = "Not Found - Aventuras Holidays";
      description = "Page not found on Aventuras Holidays.";
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
        ${image ? `<meta property="og:image" content="${image}">` : ""}
        <meta property="og:type" content="website">
        <meta property="og:url" content="${req.protocol}://${req.get("host")}${
      req.originalUrl
    }">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        ${image ? `<meta name="twitter:image" content="${image}">` : ""}
        <link rel="stylesheet" href="/static/css/main.css">
      </head>
      <body>
        <div id="root">${content}</div>
        <script src="/static/js/main.js"></script>
      </body>
      </html>
    `;

    res.set("Cache-Control", "public, max-age=3600");
    res.send(html);
  } catch (error) {
    console.error("SEO Middleware Error:", error.message);
    next();
  }
};

// Routes
app.get("/", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/register", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/all-destinations", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/single-destination/:dname", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/search-destination/:dname", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/all-packages", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/single-package/:package_id", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/group-tour", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/single-group-tour/:package_id", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/group-tour-pay-now", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/all-themes", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/single-theme/:id", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/flight", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/pay-now", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/pay-now-with-package", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/about-us", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/contact-us", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/Why_choose", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/disclaimer", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/privacy-policy", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/cancelation-policy", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/terms-and-condition", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/myprofile", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("*", seoMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
