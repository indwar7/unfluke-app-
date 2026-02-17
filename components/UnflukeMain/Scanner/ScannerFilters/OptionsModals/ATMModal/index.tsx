// import React, { useEffect, useState } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   BackHandler,
// } from 'react-native';

// import { Picker } from '@react-native-picker/picker';

// const ATMModal = ({ closeModal, cePE, preLoadedState, isVisible = true }) => {
//   const [atm, setAtm] = useState(
//     preLoadedState && preLoadedState[cePE] 
//       ? preLoadedState 
//       : {
//           CE: {
//             selected: cePE === "CE",
//             sign: "+",
//             number: 0,
//           },
//           PE: {
//             selected: cePE === "PE",
//             sign: "+",
//             number: 0,
//           },
//         }
//   );

//   const handleNumberChange = (text) => {
//     const tmp = JSON.parse(JSON.stringify(atm));
    
//     if (text === '' || !isNaN(parseFloat(text))) {
//       tmp[cePE].number = text === '' ? 0 : parseFloat(text);
//     }
    
//     setAtm(tmp);
//   };

//   const handleSignChange = (sign) => {
//     const tmp = JSON.parse(JSON.stringify(atm));
//     tmp[cePE].sign = sign;
//     setAtm(tmp);
//   };

//   const handleSubmit = () => {
//     closeModal(atm);
//   };

//   const handleClose = () => {
//     closeModal();
//   };

//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
//       if (isVisible) {
//         handleClose();
//         return true;
//       }
//       return false;
//     });

//     return () => backHandler.remove();
//   }, [isVisible]);

//   return (
//     <Modal
//       visible={isVisible}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={handleClose}
//     >
//       <KeyboardAvoidingView 
//         style={styles.overlay}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <TouchableOpacity 
//           style={styles.backdrop}
//           activeOpacity={1}
//           onPress={handleClose}
//         >
//           <TouchableOpacity 
//             style={styles.modalContainer}
//             activeOpacity={1}
//             onPress={() => {}}
//           >
//             {/* Modal Header */}
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select strike by ATM ({cePE})</Text>
//               <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
//                 <Text style={styles.closeButtonText}>×</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Modal Body */}
//             <View style={styles.modalBody}>
//               <View style={styles.formContainer}>
//                 {/* Row with ATM label, sign selector, and number input */}
//                 <View style={styles.row}>
//                   {/* ATM Label */}
//                   <View style={styles.atmLabelContainer}>
//                     <Text style={styles.atmLabel}>ATM</Text>
//                   </View>

//                   {/* Sign Selector */}
//                   <View style={styles.signContainer}>
//                     <View style={styles.pickerContainer}>
//                       <Picker
//                         selectedValue={atm[cePE].sign}
//                         style={styles.picker}
//                         onValueChange={handleSignChange}
//                       >
//                         <Picker.Item label="+" value="+" />
//                         <Picker.Item label="-" value="-" />
//                       </Picker>
//                     </View>
//                   </View>

//                   {/* Number Input */}
//                   <View style={styles.numberInputContainer}>
//                     <TextInput
//                       style={styles.textInput}
//                       placeholder="Enter your strike"
//                       value={atm[cePE].number.toString()}
//                       onChangeText={handleNumberChange}
//                       keyboardType="numeric"
//                       returnKeyType="done"
//                       onSubmitEditing={handleSubmit}
//                     />
//                   </View>
//                 </View>
                
//                 {/* Submit Button */}
//                 <View style={styles.buttonContainer}>
//                   <TouchableOpacity 
//                     style={styles.submitButton}
//                     onPress={handleSubmit}
//                     activeOpacity={0.8}
//                   >
//                     <Text style={styles.submitButtonText}>Submit</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>
//           </TouchableOpacity>
//         </TouchableOpacity>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: '100%',
//   },
//   modalContainer: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     width: '90%',
//     maxWidth: 450,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//     backgroundColor: '#f8f9fa',
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#212529',
//     flex: 1,
//   },
//   closeButton: {
//     width: 30,
//     height: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   closeButtonText: {
//     fontSize: 24,
//     color: '#6c757d',
//     fontWeight: '300',
//   },
//   modalBody: {
//     padding: 20,
//   },
//   formContainer: {
//     gap: 16,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginBottom: 16,
//   },
//   atmLabelContainer: {
//     width: 60,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   atmLabel: {
//     fontSize: 20,
//     fontWeight: '500',
//     color: '#212529',
//   },
//   signContainer: {
//     width: 80,
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#ced4da',
//     borderRadius: 4,
//     backgroundColor: 'white',
//     overflow: 'hidden',
//   },
//   picker: {
//     height: 40,
//     width: '100%',
//   },
//   numberInputContainer: {
//     flex: 1,
//   },
//   textInput: {
//     borderWidth: 1,
//     borderColor: '#ced4da',
//     borderRadius: 4,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     fontSize: 16,
//     backgroundColor: 'white',
//     color: '#495057',
//     height: 40,
//   },
//   buttonContainer: {
//     alignItems: 'flex-end',
//     marginTop: 8,
//   },
//   submitButton: {
//     backgroundColor: '#007bff',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 4,
//     minWidth: 80,
//     alignItems: 'center',
//   },
//   submitButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });

// export default ATMModal;

















import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const ATMModal = ({ closeModal, cePE, preLoadedState }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dynamicStyles = styles(isDark);

  const [atm, setAtm] = useState(
    preLoadedState && preLoadedState[cePE]
      ? preLoadedState
      : {
          CE: {
            selected: cePE === "CE",
            sign: "+",
            number: 0,
          },
          PE: {
            selected: cePE === "PE",
            sign: "+",
            number: 0,
          },
        }
  );

  const handleSignChange = (value) => {
    const tmp = { ...atm };
    tmp[cePE].sign = value;
    setAtm(tmp);
  };

  const handleNumberChange = (value) => {
    const tmp = { ...atm };
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      tmp[cePE].number = numValue;
      setAtm(tmp);
    }
  };

  const handleSubmit = () => {
    closeModal(atm);
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={() => closeModal()}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={dynamicStyles.overlay}
      >
        <View style={dynamicStyles.modalContainer}>
          {/* Header */}
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.title}>
              Select strike by ATM ({cePE})
            </Text>
            <TouchableOpacity onPress={() => closeModal()}>
              <Text style={dynamicStyles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={dynamicStyles.body}>
            <View style={dynamicStyles.row}>
              <View style={dynamicStyles.atmLabel}>
                <Text style={dynamicStyles.atmText}>ATM</Text>
              </View>

              <View style={dynamicStyles.pickerContainer}>
                <Picker
                  selectedValue={atm[cePE].sign}
                  onValueChange={handleSignChange}
                  style={dynamicStyles.picker}
                  dropdownIconColor={isDark ? "#9CA3AF" : "#6B7280"}
                >
                  <Picker.Item label="+" value="+" />
                  <Picker.Item label="-" value="-" />
                </Picker>
              </View>

              <TextInput
                style={dynamicStyles.input}
                placeholder="Number"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                value={String(atm[cePE].number)}
                onChangeText={handleNumberChange}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={dynamicStyles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={dynamicStyles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = (isDark) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
      borderRadius: 12,
      width: "85%",
      maxWidth: 400,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#374151" : "#E5E7EB",
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#111827",
    },
    closeButton: {
      fontSize: 24,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    body: {
      padding: 16,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
    },
    atmLabel: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 8,
    },
    atmText: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#111827",
    },
    pickerContainer: {
      flex: 1,
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 8,
      backgroundColor: isDark ? "#111827" : "#FFFFFF",
      overflow: "hidden",
    },
    picker: {
      height: 48,
      color: isDark ? "#FFFFFF" : "#111827",
    },
    input: {
      flex: 2,
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#111827",
      backgroundColor: isDark ? "#111827" : "#FFFFFF",
    },
    submitButton: {
      backgroundColor: "#3B82F6",
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
    },
    submitButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default ATMModal;