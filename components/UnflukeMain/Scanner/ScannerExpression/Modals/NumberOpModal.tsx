// import React, { useEffect, useState } from 'react'
// import { Button, Col, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';

// const NumberOpModal = ({closeModal, settings}) => {

//     const [numberVal, setNumberVal] = useState(settings.value ? settings.value : 0)

//     const handleSubmit = () => {
//         if (isNaN(numberVal) || numberVal === "") {
//             alert("Please enter a valid number.");
//             return;
//         }

//         closeModal({
//             ...settings,
//             value: numberVal
//         })
//     }

//     useEffect(() => {
//         const handleKeyDown = (event) => {
//             if (event.key === 'Enter' || event.key === 'Escape') {
//                 event.preventDefault();
//                 handleSubmit();
//             }
//         };

//         window.addEventListener('keydown', handleKeyDown);

//         return () => {
//             window.removeEventListener('keydown', handleKeyDown);
//         };
//     }, [handleSubmit]);

//     return (
//         <Modal
//             isOpen={true}
//         >
//             <ModalHeader className="modal-title">
//                 Number
//             </ModalHeader>
//             <ModalBody>
//                 <form action="#">
//                     <div className="row g-3">
//                         <Col lg={12}>
//                             <Label htmlFor='length'>Value</Label>
//                             <Input type='text' value={numberVal} onChange={(e)=>{
//                                 setNumberVal(e.target.value);
//                             }} />
//                         </Col>

//                         <Col lg={12}>
//                             <div className="hstack gap-2 justify-content-end">
//                                 <Button color="primary" onClick={handleSubmit}>Submit</Button>
//                             </div>
//                         </Col>
//                     </div>
//                 </form>
//             </ModalBody>
//         </Modal>
//     )
// }

// export default NumberOpModal













import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const NumberOpModal = ({ closeModal, settings }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dynamicStyles = styles(isDark);

  const [numberVal, setNumberVal] = useState(
    settings.value !== undefined ? String(settings.value) : "0"
  );

  const handleSubmit = () => {
    if (isNaN(numberVal) || numberVal === "") {
      Alert.alert("Error", "Please enter a valid number.");
      return;
    }

    closeModal({
      ...settings,
      indicatorName: settings.indicatorName || "number",
      value: parseFloat(numberVal),
    });
  };

  return (
    <Modal
      visible={true}
      transparent
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
            <Text style={dynamicStyles.title}>Number</Text>
            <TouchableOpacity onPress={() => closeModal()}>
              <Text style={dynamicStyles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={dynamicStyles.body}>
            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>Value</Text>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Enter number"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                value={numberVal}
                onChangeText={setNumberVal}
                keyboardType="numeric"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={dynamicStyles.footer}>
            <TouchableOpacity
              style={[dynamicStyles.button, dynamicStyles.buttonSecondary]}
              onPress={() => closeModal()}
            >
              <Text style={dynamicStyles.buttonTextSecondary}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[dynamicStyles.button, dynamicStyles.buttonPrimary]}
              onPress={handleSubmit}
            >
              <Text style={dynamicStyles.buttonTextPrimary}>Submit</Text>
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
    footer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#374151" : "#E5E7EB",
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      minWidth: 100,
      alignItems: "center",
    },
    buttonPrimary: {
      backgroundColor: "#3B82F6",
    },
    buttonSecondary: {
      backgroundColor: isDark ? "#374151" : "#E5E7EB",
    },
    buttonTextPrimary: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
    },
    buttonTextSecondary: {
      color: isDark ? "#FFFFFF" : "#111827",
      fontSize: 14,
      fontWeight: "600",
    },
  });

export default NumberOpModal;