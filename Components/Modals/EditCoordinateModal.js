// Import modules and firebase to access data from database
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { auth, db } from '../../firebase';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';



// We could have made add coordinate and edit coordinate to be one, but this makes the code a little more simple
const EditCoordinateModal = ({ isOpen, handleClose, coordinate }) => {
  // Initial state oject with 3
  const initialState = {
    address: '',
    date: '',
    availableSeats: '',
  };
    // Here we take in the different variables we want to use
  // A userDate made from the data picker

  //Joined users are not used.
  const [joinedUsers, setjoinedUsers] = useState([]);
  const [newCoordinate, setNewCoordinate] = useState(initialState);
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [userDate, setUserDate] = useState(new Date(coordinate.date));

  //Get the mode to show in date picker, depending if you press change time or date
  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || userDate;
    setShow(Platform.OS === 'ios');
    setUserDate(currentDate);
  };

  // This modal is used for editing

  useEffect(() => {
    //Here we find the joined users, which are on the coordinate, which is not used right now, but is supposed to be showing in this modal
    setNewCoordinate(coordinate);
    if (coordinate.userjoined) {
      setjoinedUsers(Object.keys(coordinate.userjoined));
    }
  }, []);

  // When receving input if puts it in a newcordinate object. 
  const changeTextInput = (key, event) => {
    setNewCoordinate({ ...newCoordinate, [key]: event });
  };


  const handleSave = () => {

    //If this happens, it handles it. 
    if (newCoordinate.userid != auth.currentUser.uid) {
      return Alert.alert('Not your ride');
    }

    //Gets the variables we need. Lat and long are included for future use, but will always be the value of the pressed coordinate
    const date = userDate
    const id = newCoordinate.id;
    const {  availableSeats } = newCoordinate;
    const { latitude, longitude } = coordinate;
    if (
      latitude.length === 0 ||
      latitude.length === 0 ||
      date.length === 0 ||
      availableSeats.length === 0
    ) {
      return console.log('Error with input');
    }

    // If we want to edit the coordinate we request the id from firebase and use .update to update the attributes of the initalState object
    
    try {
      db.ref(`coordinates/${id}`)
        // Only choosen fields will be updated
        .update({ latitude, longitude, date, availableSeats });
      // Alert after updating info, this only updates lat and long, address cannot be edited yet. 
      Alert.alert('Your info has been updated');
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
    // This closes the modal
    handleClose();
  };

  // Alert to either cancel or accept deletion of coordinate, will run handleDelete if Delete is pressed
  const confirmDelete = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Alert.alert('Are you sure?', 'Do you want to delete the coordinate?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete() },
      ]);
    }
  };

  // Removes coordinate from firebase database and navigates back or catch an error and console.logs the message
  const handleDelete = () => {
    const id = coordinate.id;
    try {
      db.ref(`coordinates/` + id).remove();
      handleClose();
    } catch (error) {
      console.log(error.message);
    }
  };

  if (!newCoordinate) {
    return (
      <Modal
        visible={isOpen}
        animationType='slide'
        transparent={true}
        onRequestClose={() => {
          handleClose();
        }}
      >
        <Text>Loading...</Text>
        <Button title='Close' onPress={() => handleClose()} />
      </Modal>
    );
  }

  // This shows coordinates by their id, and creates a TextInput field for each attribute of initialState? 
  return (
    <Modal
      visible={isOpen}
      animationType='slide'
      transparent={true}
      onRequestClose={() => {
        handleClose();
      }}
    >
      <View style={styles.modalView}>
        {Object.keys(initialState).map((key, index) => {
          if (typeof newCoordinate[key] == 'number') {
            newCoordinate[key] = newCoordinate[key].toString();
          }
          //Address and date keys, need some formatting. 
          if (key == 'address') {
            return (
              <View key={index}>
                <View style={styles.row}>
                  <Text style={styles.label}>Street</Text>
                  <TextInput
                    value={`${coordinate[key].street} ${coordinate[key].name}` }
                    onChangeText={(event) => changeTextInput(key, event)}
                    style={styles.input}
                  />
                   </View>
                   <View style={styles.row}>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    value={`${coordinate[key].city}`}
                    onChangeText={(event) => changeTextInput(key, event)}
                    style={styles.input}
                  />
                  </View>
              </View>
            );
          } else if(key == 'date') {
            return (
              <View  key={index}>
                <Text style={styles.modalText}>Departure Time</Text>
                <View style={styles.pickedDateContainer}>
                  <Text>{userDate.toString().split(' ').splice(0, 5).join(' ')}</Text>
                </View>
                <TouchableOpacity onPress={showDatepicker} style={{ marginTop: 5 }}>
                  <Text>Choose date</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={showTimepicker} style={{ marginTop: 5 }}>
                  <Text>Choose departure time</Text>
                </TouchableOpacity>
                {show && (
                  <DateTimePicker
                    testID='dateTimePicker'
                    value={userDate}
                    mode={mode}
                    is24Hour={true}
                    display='default'
                    onChange={onChange}
                  />
                )}
              </View>
            );
          } else {
            return (
              <View style={styles.row} key={index}>
                <Text style={styles.label}>{key}</Text>
                <TextInput
                  value={newCoordinate[key]}
                  onChangeText={(event) => changeTextInput(key, event)}
                  style={styles.input}
                />
              </View>
            );
          }
        })}
        {/*This button use handleSave() to save the changes in the ride */}
        <Button title={'Save changes'} onPress={() => handleSave()} />

        {/*This button use handleClose() from MapScreen to remove the modal from the screen  */}
        <Button
          title='Close'
          onPress={() => {
            handleClose();
          }}
        />

        {/*This button use confirmDelete() and deletes the ride   */}
        <Button title={'Delete ride'} onPress={() => confirmDelete()} />
      </View>
    </Modal>
  );
};

export default EditCoordinateModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAED',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    height: 30,
    width: 10,
  },
  label: {
    fontWeight: 'bold',
    width: 100,
  },
  input: {
    borderWidth: 1,
    padding: 5,
    width: 200,
  },
  modalView: {
    margin: 30,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    marginTop: 70,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pickedDateContainer: {
    padding: 5,
    backgroundColor: '#eee',
    borderRadius: 2,
  },
  modalText: {
    marginBottom: 15,
    marginTop: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
