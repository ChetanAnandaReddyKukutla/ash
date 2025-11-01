const NOMINATIM_BASE_URL = (process.env.REACT_APP_NOMINATIM_URL || 'https://nominatim.openstreetmap.org').replace(/\/$/, '');
const NOMINATIM_EMAIL = (process.env.REACT_APP_NOMINATIM_EMAIL || '').trim();

const buildReverseGeocodeUrl = (latitude, longitude) => {
    const params = new URLSearchParams({
        format: 'jsonv2',
        lat: String(latitude),
        lon: String(longitude),
        addressdetails: '1'
    });

    if (NOMINATIM_EMAIL) {
        params.append('email', NOMINATIM_EMAIL);
    }

    return `${NOMINATIM_BASE_URL}/reverse?${params.toString()}`;
};

export const reverseGeocode = async (latitude, longitude) => {
    if (latitude == null || longitude == null) {
        return null;
    }

    const url = buildReverseGeocodeUrl(latitude, longitude);

    try {
        const response = await fetch(url, {
            headers: {
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Reverse geocoding failed with status ${response.status}`);
        }

        const data = await response.json();
        const address = data.address || {};

        return {
            fullAddress: data.display_name || '',
            address: {
                city: address.city || address.town || address.village || address.hamlet || '',
                state: address.state || '',
                country: address.country || ''
            }
        };
    } catch (error) {
        console.warn('reverseGeocode error:', error);
        return null;
    }
};
