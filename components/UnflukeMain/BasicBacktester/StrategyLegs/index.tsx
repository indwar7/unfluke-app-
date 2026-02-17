import React, { useEffect, useState } from "react";
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Alert,
  ScrollView 
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import Leg from "./Leg";
import { deepCopy } from "./utils";
import { addLeg } from "../../../../redux/slices/basicBacktester/reducer";
import { initialLegPositions } from "../../Utils/common_vars";
// Import icon library - you might need to install react-native-vector-icons or use Expo icons
import { Ionicons } from '@expo/vector-icons';

const StrategyLegs = () => {
  // Inside StrategyLegs component

  const { legs, legOptions } = useSelector(
    (store) => store.BasicBacktester.positions,
  );
  const dispatch = useDispatch();
  const [legsForCheckDisable, setlegsForCheckDisable] = useState([]);

  const [positions, setPositions] = useState({
    ...initialLegPositions,
    legOptions: { ...legOptions },
  });

  // function handleAddLeg() {
  //   if (legs.length < 10) {
  //     let leg = deepCopy(positions);
  //     leg = { id: v4(), ...leg };
      
  //     if (leg.strike == "based_on_premium" && leg.strikeDetails == "ATM_0") {
  //       Alert.alert("Invalid Premium", "Please add a valid Premium value.");
  //       return;
  //     }
      
  //     delete leg.legOptions;
  //     dispatch(addLeg(leg));
  //     setlegsForCheckDisable((prev) => {
  //       return [...prev, leg];
  //     });
  //   }
  // }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop:16
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginVertical: 12,
    },
    addButton: {
      backgroundColor: '#2563eb',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 6,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 4,
    },
    legsContainer: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      {/* <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddLeg}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={16} color="#ffffff" />
          <Text style={styles.buttonText}>Add Leg</Text>
        </TouchableOpacity>
      </View> */}

      <ScrollView style={styles.legsContainer}>
        {legs.length > 0 &&
          legs.map((leg, i) => (
          <Leg key={leg.id || leg._id} index={i} {...leg} />
          ))
        }
      </ScrollView>
    </View>
  );
};

export default StrategyLegs;