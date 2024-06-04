import React, { useEffect, useRef, useState } from 'react';
import { fetchGoogleMapsApiKeyAndLoadScript } from '../utils/loadGoogleMaps';

const containerStyle = {
  width: '50vh',
  height: '50vh',
};

const libraries = ['places'];

const GoogleMapsComponent = () => {
  const mapRef = useRef(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [places, setPlaces] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [placeDetails, setPlaceDetails] = useState(null);
  const mapInstance = useRef(null);
  const serviceInstance = useRef(null);

  useEffect(() => {
    console.log("Component mounted, fetching Google Maps API key");
    fetchGoogleMapsApiKeyAndLoadScript(libraries)
      .then(() => {
        console.log("Google Maps script loaded, setting isLoaded to true");
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error(`Error loading Google Maps script: ${error.message}`);
        setError(error);
      });
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      console.log("Google Maps script not loaded yet");
      return;
    }

    if (!mapRef.current) {
      console.error("Map container not found");
      return;
    }

    console.log("Google Maps script loaded, fetching current position");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Current position: lat=${latitude}, lng=${longitude}`);
        setCurrentPosition({ lat: latitude, lng: longitude });

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 10,
        });

        mapInstance.current = map;
        serviceInstance.current = new window.google.maps.places.PlacesService(map);

        console.log("Map initialized", map);

        const marker = new window.google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map,
          title: 'You are here',
        });

        const searchQueries = ['womens physician', 'hospital', 'obgyn'];
        const markerColors = {
          'womens physician': 'red',
          'hospital': 'blue',
          'obgyn': 'green',
        };

        const fetchPlaces = (location) => {
          searchQueries.forEach((query) => {
            console.log(`Fetching nearby places for query: ${query}`);
            const request = {
              location,
              radius: '80467', // 50 miles in meters
              keyword: query,
            };

            serviceInstance.current.nearbySearch(request, (results, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                console.log(`Nearby places fetched successfully for query: ${query}`, results);
                setPlaces((prevPlaces) => [...prevPlaces, ...results]);
                results.forEach((place) => {
                  const placeMarker = new window.google.maps.Marker({
                    position: place.geometry.location,
                    map,
                    title: place.name,
                    icon: {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 10,
                      fillColor: markerColors[query],
                      fillOpacity: 1,
                      strokeWeight: 1,
                      strokeColor: 'black',
                    },
                  });

                  placeMarker.addListener('click', () => {
                    setSelectedPlace(place);
                    setPlaceDetails(null); // Reset place details when a new place is selected
                  });
                });
              } else {
                console.error(`Error fetching nearby places for query: ${query}: ${status}`);
              }
            });
          });
        };

        fetchPlaces({ lat: latitude, lng: longitude });

        map.addListener('bounds_changed', () => {
          const bounds = map.getBounds();
          const center = bounds.getCenter();
          fetchPlaces(center.toJSON());
        });
      },
      (error) => {
        console.error(`Error fetching geolocation: ${error.message}`);
      }
    );
  }, [isLoaded]);

  const fetchPlaceDetails = (placeId) => {
    const request = {
      placeId,
      fields: ['name', 'formatted_address', 'formatted_phone_number', 'website', 'photos', 'opening_hours'],
    };

    serviceInstance.current.getDetails(request, (details, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setPlaceDetails(details);
      } else {
        console.error(`Error fetching place details: ${status}`);
      }
    });
  };

  if (error) {
    return <div>Error loading Google Maps: {error.message}</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="google-maps-component">
      <div className="google-maps-container" style={containerStyle} ref={mapRef}></div>
      {selectedPlace && (
        <div className="google-maps-selected-place" style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'white', padding: '10px', borderRadius: '5px', color: 'black' }}>
          <h2 className="google-maps-place-name" style={{ color: 'black' }}>{selectedPlace.name}</h2>
          {selectedPlace.photos && selectedPlace.photos[0] && (
            <img
              className="google-maps-place-photo"
              src={selectedPlace.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 })}
              alt={selectedPlace.name}
            />
          )}
          <p className="google-maps-place-vicinity" style={{ color: 'black' }}>{selectedPlace.vicinity}</p>
          {placeDetails && (
            <>
              {placeDetails.formatted_phone_number && <p className="google-maps-place-phone" style={{ color: 'black' }}>Phone: {placeDetails.formatted_phone_number}</p>}
              {placeDetails.formatted_address && <p className="google-maps-place-address" style={{ color: 'black' }}>Address: {placeDetails.formatted_address}</p>}
              {placeDetails.website && (
                <p className="google-maps-place-website" style={{ color: 'black' }}>
                  Website: <a href={placeDetails.website} target="_blank" rel="noopener noreferrer">{placeDetails.website}</a>
                </p>
              )}
              {placeDetails.opening_hours && (
                <p className="google-maps-place-hours" style={{ color: 'black' }}>
                  Hours: {placeDetails.opening_hours.weekday_text.join(', ')}
                </p>
              )}
            </>
          )}
          <button className="google-maps-get-details-button" onClick={() => fetchPlaceDetails(selectedPlace.place_id)}>Get Details</button>
          <a
            className="google-maps-get-directions"
            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.geometry.location.lat()},${selectedPlace.geometry.location.lng()}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'black' }}
          >
            Get Directions
          </a>
          <button className="google-maps-close-button" onClick={() => setSelectedPlace(null)}>Close</button>
        </div>
      )}
    </div>
  );
};
  
  export default GoogleMapsComponent;