// import api from '../api';
// import { resourceType } from 'store/patientSlicer';

export const extractGetpagesoffsetValue = (url) => {
  const regex = /_getpagesoffset=(\d+)/;
  const match = regex.exec(url);
  return match ? Number(match[1]) : undefined;
};

export const parseCzn = (patient) => {
  return (
    patient?.identifier?.filter((element) =>
      element?.type?.coding?.filter(
        (element1) => element1?.code === 'CZ' && element1.system === 'http://terminology.hl7.org/CodeSystem/v2-0203'
      )[0]
        ? true
        : false
    )[0]?.value || ''
  );
};

export const parseName = (patient) => {
  const humanName = patient.name;
  const parseSingleName = (singleName) => {
    let names = '';
    if (!singleName) return '-';
    if (singleName.given) {
      if (Array.isArray(singleName?.given)) {
        singleName.given.forEach((name1) => {
          names = names.concat(name1, ' ');
        });
      } else {
        names = names.concat(singleName.given, ' ');
      }
    }
    names = names.concat(singleName.family ? singleName.family : '');
    names = names.trim();
    if (!names) {
      if (singleName.text) {
        return singleName.text;
      }
    }
    return names;
  };
  if (humanName && Array.isArray(humanName)) {
    let chosenNameEntry = null;

    for (let i = 0; i < humanName.length; i++) {
      const nameEntry = humanName[i];
      const nameUse = nameEntry.use;
      if (!nameUse) {
        chosenNameEntry = nameEntry;
        break;
      }
      if (nameUse === 'official') {
        chosenNameEntry = nameEntry;
        break;
      }

      if (!chosenNameEntry && ['usual', 'temp', 'nickname', 'anonymous', 'old', 'maiden'].includes(nameUse)) {
        chosenNameEntry = nameEntry;
      }
    }

    if (chosenNameEntry) {
      return parseSingleName(chosenNameEntry);
    }
    return '-';
  }
  return parseSingleName(humanName);
};

export const nextPageExists = (oldBundle) => {
  if (!oldBundle || !oldBundle.link) {
    return false;
  }
  const nextLinkObject = oldBundle?.link?.find((link) => link?.relation?.match(/^next$/));
  return nextLinkObject ? true : false;
};

export const prevPageExists = (oldBundle) => {
  if (!oldBundle || !oldBundle.link) {
    return false;
  }
  const prevLinkObject = oldBundle?.link?.find((link) => link?.relation?.match(/^prev(ious)?$/));
  return prevLinkObject ? true : false;
};
