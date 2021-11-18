// Importing modules
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { auth , db } from '../firebase';  

// Is passed navigation as a prop as it is used in the CoordinateStackNavigator
const CoordinateListScreen = ({ navigation }) => {
  const [coordinates, setCoordinates] = useState([]);

  // useEffect hook updates on change and checks if any coordinates are in the firebase database
  useEffect(() => {
    getCoordinates();
  }, []);

  const getCoordinates = async () => {
    let groupid;

   await db.ref('userData/' + auth.currentUser.uid).get().then(snapshot => {
      if (snapshot.exists()) { 
        groupid = snapshot.val().group
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    })

    let coordinates = []
    await db.ref('coordinates/').get().then(snapshot => {
      if (snapshot.exists()) {
        snapshot.forEach(coordinate => {
          if(coordinate.val().groupId == groupid){
            coordinates.push(coordinate.val())
          }
         
        })
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    })

    setCoordinates(coordinates)

  }

  

  

  // If no coordinates return loading
  if (!coordinates) {
    return <Text>Loading...</Text>;
  }

  // For editing a coordinate, we find the specific coordinate by id and show coordinate details for that specific one
  const handleSelectCoordinate = (id) => {
    const coordinate = Object.entries(coordinates).find(
      (coordinate) => coordinate[0] === id /*id*/
    );
    navigation.navigate('Coordinate Details', { coordinate });
  };

  const coordinateArray = Object.values(coordinates);
  const coordinateKeys = Object.keys(coordinates);

  // Flatlist of all coordinates which has a TouchableOpacity(button) for going to a specific coordinate.
  return (
    <FlatList
      data={coordinateArray}
      keyExtractor={(item, index) => coordinateKeys[index]}
      renderItem={({ item, index }) => {
        return (
          <TouchableOpacity
            style={styles.container}
            onPress={() => handleSelectCoordinate(coordinateKeys[index])}
          >
            <Text>
              {item.date} {item.lat} {item.long} 
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    margin: 5,
    padding: 5,
    height: 50,
    justifyContent: 'center',
  },
  label: { fontWeight: 'bold' },
});

export default CoordinateListScreen;
