import { Divider, MenuItem, TextField } from '@mui/material';
import { Country, State, City } from 'country-state-city';
import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const LocationPicker = ({ onSelect, errors, data, disabled, dynamicReturn }) => {
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
    const countryList = [...Country.getAllCountries()];
    const tempCountry = countryList?.filter((country) => country?.name === data?.country)[0] || undefined;
    setSelectedCountry(tempCountry);

    const stateList = [...State.getStatesOfCountry(tempCountry?.isoCode)];
    const tempState = stateList?.filter((state) => state.name === data?.state)[0] || undefined;
    setSelectedState(tempState);

    const cityList = [...City.getCitiesOfState(tempCountry?.isoCode, tempState?.isoCode)];
    const tempCity = cityList?.filter((city) => city.name === data?.city)[0] || undefined;
    setSelectedCity(tempCity);
  }, [data]);

  useEffect(() => {
    if (selectedCountry) {
      setStates(State.getStatesOfCountry(selectedCountry?.isoCode));
      if (dynamicReturn) onSelect({ country: selectedCountry });
    } else {
      setStates(undefined);
      setCities(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      setCities(City.getCitiesOfState(selectedCountry?.isoCode, selectedState?.isoCode));
      if (dynamicReturn) onSelect({ country: selectedCountry, state: selectedState });
    } else {
      setCities(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, selectedState]);

  useEffect(() => {
    if (selectedCountry && selectedState && selectedCity) {
      onSelect({ country: selectedCountry, state: selectedState, city: selectedCity });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, selectedState, selectedCity]);

  return (
    <Stack direction="row" spacing={1}>
      <TextField
        disabled={disabled}
        name={t('general.country')}
        value={selectedCountry || ''}
        id="countries-combobox"
        select
        variant="standard"
        selectprops={{
          native: true
        }}
        sx={{ width: 100 }}
        onChange={(event) => {
          if (errors) errors.country = '';
          handleCountryChange(event.target.value);
        }}
        label={t('general.country')}
        error={Boolean(errors?.country)}
        helperText={errors?.country}
      >
        {countries?.map((country) => (
          <MenuItem key={country.isoCode} value={country}>
            {country.name} ({country.phonecode})
          </MenuItem>
        ))}
      </TextField>
      <TextField
        value={selectedState || ''}
        disabled={disabled || !states}
        name={t('general.state')}
        id="states-combobox"
        select
        variant="standard"
        selectprops={{
          native: true
        }}
        sx={{ width: 100 }}
        onChange={(event) => {
          if (errors) errors.state = '';
          handleStateChange(event.target.value);
        }}
        label={t('general.state')}
        error={Boolean(errors?.state)}
        helperText={errors?.state}
      >
        {states?.map((state) => (
          <MenuItem key={state.isoCode} value={state}>
            {state.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        value={selectedCity || ''}
        disabled={disabled || !cities}
        name={t('general.city')}
        id="cities-combobox"
        select
        variant="standard"
        selectprops={{
          native: true
        }}
        sx={{ width: 100 }}
        onChange={(event) => {
          if (errors) errors.city = '';
          handleCityChange(event.target.value);
        }}
        label={t('general.city')}
        error={Boolean(errors?.city)}
        helperText={errors?.city}
      >
        {cities?.map((city) => (
          <MenuItem key={city.name} value={city}>
            {city.name}
          </MenuItem>
        ))}
      </TextField>
      <Divider />
    </Stack>
  );
};

LocationPicker.propTypes = {
  onSelect: PropTypes.func,
  errors: PropTypes.any,
  data: PropTypes.any,
  disabled: PropTypes.bool,
  dynamicReturn: PropTypes.bool
};

export default LocationPicker;
