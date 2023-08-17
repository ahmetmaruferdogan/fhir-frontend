import { MenuItem, TextField } from '@mui/material';
import { Country, State, City } from 'country-state-city';
import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const LocationPicker = ({ onSelect }) => {
  LocationPicker.propTypes = { onSelect: PropTypes.func };
  const [t] = useTranslation('global');

  const [selectedCountry, setSelectedCountry] = useState(undefined);
  const [selectedState, setSelectedState] = useState(undefined);
  const [selectedCity, setSelectedCity] = useState(undefined);

  const countries = Country.getAllCountries();
  const [states, setStates] = useState(undefined);
  const [cities, setCities] = useState(undefined);

  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
    setSelectedState(undefined);
    setSelectedCity(undefined);
  };

  const handleStateChange = (selectedOption) => {
    setSelectedState(selectedOption);
    setSelectedCity(undefined);
  };

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
  };

  useEffect(() => {
    if (selectedCountry) {
      setStates(State.getStatesOfCountry(selectedCountry?.isoCode));
    } else {
      setStates(undefined);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      setCities(City.getCitiesOfState(selectedCountry?.isoCode, selectedState?.isoCode));
    } else {
      setCities(undefined);
    }
  }, [selectedCountry, selectedState]);

  useEffect(() => {
    if (selectedCountry && selectedState && selectedCity) {
      onSelect({ country: selectedCountry, state: selectedState, city: selectedCity });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, selectedState, selectedCity]);

  return (
    <Stack direction="row" spacing={2}>
      <TextField
        name={t('general.country')}
        value={selectedCountry || ''}
        id="countries-combobox"
        select
        variant="standard"
        selectprops={{
          native: true
        }}
        sx={{ width: 200 }}
        onChange={(event) => handleCountryChange(event.target.value)}
        label={t('general.country')}
      >
        {countries?.map((country) => (
          <MenuItem key={country.isoCode} value={country}>
            {country.name} ({country.phonecode})
          </MenuItem>
        ))}
      </TextField>
      <TextField
        value={selectedState || ''}
        disabled={!states}
        name={t('general.state')}
        id="states-combobox"
        select
        variant="standard"
        selectprops={{
          native: true
        }}
        sx={{ width: 200 }}
        onChange={(event) => handleStateChange(event.target.value)}
        label={t('general.state')}
      >
        {states?.map((state) => (
          <MenuItem key={state.isoCode} value={state}>
            {state.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        value={selectedCity || ''}
        disabled={!cities}
        name={t('general.city')}
        id="cities-combobox"
        select
        variant="standard"
        selectprops={{
          native: true
        }}
        sx={{ width: 200 }}
        onChange={(event) => handleCityChange(event.target.value)}
        label={t('general.city')}
      >
        {cities?.map((city) => (
          <MenuItem key={city.name} value={city}>
            {city.name}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
};

export default LocationPicker;
