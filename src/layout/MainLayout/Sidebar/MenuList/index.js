// material-ui
import { Typography } from '@mui/material';

// project imports
import NavGroup from './NavGroup';
import { useTranslation } from 'react-i18next';
// import menuItem from 'menu-items';

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
  const [t] = useTranslation('global');
  const patientTabs = {
    id: 'patientMenu',
    title: t('patient.menu.title'),
    type: 'group',
    children: [
      {
        id: 'patientList',
        title: t('patient.list.title'),
        type: 'item',
        url: '/patient/patients'
      }
    ]
  };
  const appointmentTabs = {
    id: 'appointmentMenu',
    title: t('appointment.menu.title'),
    type: 'group',
    children: [
      {
        id: 'appointmentList',
        title: t('appointment.list.title'),
        type: 'item',
        url: 'appointment/appointments'
      }
    ]
  };

  const menuItems = {
    items: [patientTabs, appointmentTabs]
  };

  const navItems = menuItems.items.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return <>{navItems}</>;
};

export default MenuList;
