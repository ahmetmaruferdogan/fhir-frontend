import { MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageChangerSection = () => {
  const { t, i18n } = useTranslation('global');
  t('hey');
  return (
    <TextField
      id="language-select"
      select
      defaultValue={i18n.language}
      onChange={(event) => {
        console.log('event.target', event.target);
        i18n.changeLanguage(event.target.value);
      }}
      variant="standard"
    >
      <MenuItem key="en" value="en">
        EN
      </MenuItem>
      <MenuItem key="tr" value="tr">
        TR
      </MenuItem>
    </TextField>
  );
};
export default LanguageChangerSection;
