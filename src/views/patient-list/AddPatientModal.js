// import React, { useRef, useState } from 'react';
// import { Button, Modal, TextField } from '@mui/material';
// import { toast } from 'react-toastify';

// const AddPatientModal = ({ open, onClose, onSave, id }) => {
//   const initialPatientData = {
//     name: '',
//     gender: '',
//     birthDate: '',
//     telecom: '',
//     id: undefined
//   };
//   const [patientData, setPatientData] = useState(initialPatientData);
//   const textFieldRefs = useRef({});

//   const handleClose = () => {
//     setPatientData(initialPatientData);
//     onClose();
//   };

//   const handleSave = () => {
//     var data = {
//       name: textFieldRefs.nameRef.value,
//       gender: textFieldRefs.genderRef.value,
//       birthDate: textFieldRefs.birthDateRef.value,
//       telecom: textFieldRefs.telecomRef.value
//     };

//     if (!data.name) {
//       toast.error('name cannot be empty!');
//       return;
//     }
//     if (!data.gender) {
//       toast.error('gender cannot be empty!');
//       return;
//     }
//     if (!data.birthDate) {
//       toast.error('birthDate cannot be empty!');
//       return;
//     }
//     if (!data.telecom) {
//       toast.error('telecom cannot be empty!');
//       return;
//     }

//     var testString = String(data.name);
//     data.name = {};
//     testString = testString.split(' ');
//     if (testString.length > 1) {
//       data.name.family = testString[testString.length - 1];
//       data.name.given = testString.slice(0, -1);
//     } else {
//       data.name.text = testString[0];
//     }
//     const tempArray = [];
//     tempArray.push(data.name);
//     data.name = tempArray;

//     data.telecom = [
//       {
//         system: 'phone',
//         value: data.telecom
//       }
//     ];
//     if (id) {
//       data = { id, ...data };
//     }

//     onSave(data);
//     handleClose(id);
//   };

//   return (
//     <Modal open={open} onClose={() => handleClose(id)}>
//       <div>
//         <h2>Create Patient</h2>
//         <TextField
//           label="Name"
//           inputRef={(el) => (textFieldRefs.nameRef = el)}
//           value={patientData.name}
//           onChange={(e) =>
//             setPatientData((prevData) => ({
//               ...prevData,
//               name: e.target.value
//             }))
//           }
//         />
//         <TextField
//           label="Gender"
//           inputRef={(el) => (textFieldRefs.genderRef = el)}
//           value={patientData.gender}
//           onChange={(e) =>
//             setPatientData((prevData) => ({
//               ...prevData,
//               gender: e.target.value
//             }))
//           }
//         />
//         <TextField
//           label="Birth Date"
//           inputRef={(el) => (textFieldRefs.birthDateRef = el)}
//           value={patientData.birthDate}
//           onChange={(e) =>
//             setPatientData((prevData) => ({
//               ...prevData,
//               birthDate: e.target.value
//             }))
//           }
//         />
//         <TextField
//           label="Telecom"
//           inputRef={(el) => (textFieldRefs.telecomRef = el)}
//           value={patientData.telecom}
//           onChange={(e) =>
//             setPatientData((prevData) => ({
//               ...prevData,
//               telecom: e.target.value
//             }))
//           }
//         />
//         <div className="modal-actions">
//           <Button variant="outlined" onClick={() => handleClose(id)}>
//             Cancel
//           </Button>
//           <Button variant="contained" onClick={handleSave}>
//             Save
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default AddPatientModal;

import React, { useRef, useState } from 'react';
import { Button, ButtonGroup, Modal, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { Box } from '@mui/system';

const styles = {
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '4px',
    outline: 'none'
  },
  textField: {
    marginBottom: '1rem'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '1rem'
  }
};

const AddPatientModal = ({ open, onClose, onSave, id }) => {
  const initialPatientData = {
    name: '',
    gender: '',
    birthDate: '',
    telecom: '',
    id: undefined
  };
  const [patientData, setPatientData] = useState(initialPatientData);
  const textFieldRefs = useRef({});

  const handleClose = () => {
    setPatientData(initialPatientData);
    onClose();
  };

  const handleSave = () => {
    var data = {
      name: textFieldRefs.nameRef.value,
      gender: textFieldRefs.genderRef.value,
      birthDate: textFieldRefs.birthDateRef.value,
      telecom: textFieldRefs.telecomRef.value
    };

    if (!data.name || !data.gender || !data.birthDate || !data.telecom) {
      toast.error('All fields are required!');
      return;
    }

    var testString = String(data.name);
    data.name = {};
    testString = testString.split(' ');
    if (testString.length > 1) {
      data.name.family = testString[testString.length - 1];
      data.name.given = testString.slice(0, -1);
    } else {
      data.name.text = testString[0];
    }
    const tempArray = [];
    tempArray.push(data.name);
    data.name = tempArray;

    data.telecom = [
      {
        system: 'phone',
        value: data.telecom
      }
    ];
    if (id) {
      data = { id, ...data };
    }

    onSave(data);
    handleClose(id);
  };

  return (
    <Modal open={open} onClose={() => handleClose(id)} style={styles.modal}>
      <Box style={styles.modalContent}>
        <h2>Create Patient</h2>
        <form>
          <TextField
            style={styles.textField}
            label="Name"
            inputRef={(el) => (textFieldRefs.nameRef = el)}
            value={patientData.name}
            onChange={(e) =>
              setPatientData((prevData) => ({
                ...prevData,
                name: e.target.value
              }))
            }
          />
          <TextField
            style={styles.textField}
            label="Gender"
            inputRef={(el) => (textFieldRefs.genderRef = el)}
            value={patientData.gender}
            onChange={(e) =>
              setPatientData((prevData) => ({
                ...prevData,
                gender: e.target.value
              }))
            }
          />
          <TextField
            style={styles.textField}
            label="Birth Date"
            inputRef={(el) => (textFieldRefs.birthDateRef = el)}
            value={patientData.birthDate}
            onChange={(e) =>
              setPatientData((prevData) => ({
                ...prevData,
                birthDate: e.target.value
              }))
            }
          />
          <TextField
            style={styles.textField}
            label="Telecom"
            inputRef={(el) => (textFieldRefs.telecomRef = el)}
            value={patientData.telecom}
            onChange={(e) =>
              setPatientData((prevData) => ({
                ...prevData,
                telecom: e.target.value
              }))
            }
          />
        </form>
        <div className="modal-actions">
          <ButtonGroup style={styles.buttonContainer}>
            <Button variant="outlined" onClick={() => handleClose(id)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave}>
              {id ? 'Update' : 'Create'}
            </Button>
          </ButtonGroup>
        </div>
      </Box>
    </Modal>
  );
};

export default AddPatientModal;
