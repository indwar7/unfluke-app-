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

// const NumberModal = ({ closeModal, preLoadedState, isVisible = true }) => {
//   const [number, setNumber] = useState(!isNaN(preLoadedState) ? preLoadedState.toString() : '0');

//   const handleSubmit = () => {
//     const numValue = parseInt(number) || 0;
//     closeModal(numValue);
//   };

//   const handleClose = () => {
//     closeModal();
//   };

//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
//       if (isVisible) {
//         handleClose();
//         return true; // Prevent default behavior
//       }
//       return false;
//     });

//     return () => backHandler.remove();
//   }, [isVisible]);

//   const handleNumberChange = (text) => {
//     // Allow empty string or valid numbers (including negative)
//     if (text === '' || /^-?\d+$/.test(text)) {
//       setNumber(text);
//     }
//   };

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
//             onPress={() => {}} // Prevent modal from closing when touching content
//           >
//             {/* Modal Header */}
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select strike by number</Text>
//               <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
//                 <Text style={styles.closeButtonText}>×</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Modal Body */}
//             <View style={styles.modalBody}>
//               <View style={styles.formContainer}>
//                 <View style={styles.inputContainer}>
//                   <TextInput
//                     style={styles.textInput}
//                     placeholder="Enter your strike"
//                     value={number}
//                     onChangeText={handleNumberChange}
//                     keyboardType="numeric"
//                     returnKeyType="done"
//                     onSubmitEditing={handleSubmit}
//                     autoFocus={true}
//                   />
//                 </View>
                
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
//     width: '85%',
//     maxWidth: 400,
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
//   inputContainer: {
//     marginBottom: 16,
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
//   },
//   buttonContainer: {
//     alignItems: 'flex-end',
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

// export default NumberModal;









import React, { useState, useEffect } from "react";
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

const NumberModal = ({ closeModal, preLoadedState }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dynamicStyles = styles(isDark);

  const [number, setNumber] = useState(
    !isNaN(preLoadedState) ? String(preLoadedState) : "0"
  );

  const handleSubmit = () => {
    closeModal(parseFloat(number) || 0);
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
            <Text style={dynamicStyles.title}>Select strike by number</Text>
            <TouchableOpacity onPress={() => closeModal()}>
              <Text style={dynamicStyles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={dynamicStyles.body}>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Enter your strike"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={number}
              onChangeText={setNumber}
              keyboardType="numeric"
              autoFocus
            />

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
    input: {
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#111827",
      backgroundColor: isDark ? "#111827" : "#FFFFFF",
      marginBottom: 16,
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

export default NumberModal;