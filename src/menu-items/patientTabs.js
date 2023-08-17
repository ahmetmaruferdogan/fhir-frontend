import i18next from 'i18next';

const patientTabs = () => {
  const tabs = {
    id: 'patientMenu',
    title: i18next.t('patient.menu.title'),
    type: 'group',
    children: [
      {
        id: 'patientList',
        title: i18next.t('patient.list.title'),
        type: 'item',
        url: '/patient/patients'
      }
    ]
  };
  return tabs;
};
export default patientTabs;
