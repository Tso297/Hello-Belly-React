const loadGoogleMapsScript = (apiKey, libraries = []) => {
  console.log(`Attempting to load Google Maps script with API key: ${apiKey}`);
  return new Promise((resolve, reject) => {
    if (window.google) {
      console.log("Google Maps script already loaded");
      resolve();
      return;
    }
    const script = document.createElement('script');
    const librariesParam = libraries.length > 0 ? `&libraries=${libraries.join(',')}` : '';
    script.src = `https://hello-belly-flask-1.onrender.com/maps/api/js?key=${apiKey}${librariesParam}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    window.initMap = () => {
      console.log("Google Maps script loaded successfully");
      resolve();
    };

    script.onerror = () => {
      console.error("Failed to load the Google Maps script");
      reject(new Error('Failed to load the Google Maps script'));
    };
  });
};

export const fetchGoogleMapsApiKeyAndLoadScript = (libraries = []) => {
  console.log("Fetching Google Maps API key from server");
  return fetch('https://hello-belly-flask-1.onrender.com/api/google_maps_key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log(`Response status: ${response.status}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Google Maps API key');
      }
      return response.json();
    })
    .then(data => {
      console.log(`Received Google Maps API key: ${data.google_maps_key}`);
      return loadGoogleMapsScript(data.google_maps_key, libraries);
    })
    .catch(error => {
      console.error(`Error fetching Google Maps API key: ${error.message}`);
      throw error;
    });
};