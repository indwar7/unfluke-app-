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
//   ScrollView,
//   Alert,
// } from 'react-native';

// const PremiumModal = ({ closeModal, cePE, preLoadedState, isVisible = true }) => {
//   const [premiums, setPremiums] = useState(
//     preLoadedState?.closest !== undefined 
//       ? preLoadedState 
//       : {
//           closest: 0,
//           min: 0,
//           max: 100000,
//         }
//   );

//   const showErrorToast = (message) => {
//     Alert.alert('Error', message, [{ text: 'OK' }]);
//   };

//   const handleChange = (value, id) => {
//     const tmp = JSON.parse(JSON.stringify(premiums));

//     if (value === '' || !isNaN(parseFloat(value))) {
//       tmp[id] = value === '' ? 0 : parseFloat(value);
//     }

//     setPremiums(tmp);
//   };

//   const handleSubmit = () => {
//     closeModal(premiums);
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
//               <Text style={styles.modalTitle}>Select strike by premium({cePE})</Text>
//               <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
//                 <Text style={styles.closeButtonText}>×</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Modal Body */}
//             <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
//               <View style={styles.formContainer}>
//                 {/* Closest Input */}
//                 <View style={styles.inputGroup}>
//                   <Text style={styles.label}>Closest</Text>
//                   <TextInput
//                     style={styles.textInput}
//                     placeholder="Closest"
//                     value={premiums.closest.toString()}
//                     onChangeText={(text) => handleChange(text, 'closest')}
//                     keyboardType="numeric"
//                     returnKeyType="next"
//                   />
//                 </View>

//                 {/* Min Input */}
//                 <View style={styles.inputGroup}>
//                   <Text style={styles.label}>Min</Text>
//                   <TextInput
//                     style={styles.textInput}
//                     placeholder="Min"
//                     value={premiums.min.toString()}
//                     onChangeText={(text) => handleChange(text, 'min')}
//                     keyboardType="numeric"
//                     returnKeyType="next"
//                   />
//                 </View>

//                 {/* Max Input */}
//                 <View style={styles.inputGroup}>
//                   <Text style={styles.label}>Max</Text>
//                   <TextInput
//                     style={styles.textInput}
//                     placeholder="Max"
//                     value={premiums.max.toString()}
//                     onChangeText={(text) => handleChange(text, 'max')}
//                     keyboardType="numeric"
//                     returnKeyType="done"
//                     onSubmitEditing={handleSubmit}
//                   />
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
//             </ScrollView>
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
//     width: '85%',
//     maxWidth: 400,
//     maxHeight: '80%',
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
//     flex: 1,
//   },
//   formContainer: {
//     padding: 20,
//     gap: 16,
//   },
//   inputGroup: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#212529',
//     marginBottom: 4,
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

// export default PremiumModal;













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
  ScrollView,
} from "react-native";

const PremiumModal = ({ closeModal, cePE, preLoadedState }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dynamicStyles = styles(isDark);

  const [premiums, setPremiums] = useState(
    preLoadedState.closest
      ? preLoadedState
      : {
          closest: 0,
          min: 0,
          max: 100000,
        }
  );

  const handleChange = (field, value) => {
    const tmp = { ...premiums };
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      tmp[field] = numValue;
      setPremiums(tmp);
    }
  };

  const handleSubmit = () => {
    closeModal(premiums);
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
              Select strike by premium ({cePE})
            </Text>
            <TouchableOpacity onPress={() => closeModal()}>
              <Text style={dynamicStyles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={dynamicStyles.body}>
            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>Closest</Text>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Closest"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                value={String(premiums.closest)}
                onChangeText={(value) => handleChange("closest", value)}
                keyboardType="numeric"
              />
            </View>

            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>Min</Text>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Min"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                value={String(premiums.min)}
                onChangeText={(value) => handleChange("min", value)}
                keyboardType="numeric"
              />
            </View>

            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>Max</Text>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Max"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                value={String(premiums.max)}
                onChangeText={(value) => handleChange("max", value)}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={dynamicStyles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={dynamicStyles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </ScrollView>
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
      maxHeight: "80%",
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
      flex: 1,
    },
    closeButton: {
      fontSize: 24,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    body: {
      padding: 16,
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#D1D5DB" : "#374151",
      marginBottom: 8,
    },
    input: {
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
      marginTop: 8,
    },
    submitButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default PremiumModal;