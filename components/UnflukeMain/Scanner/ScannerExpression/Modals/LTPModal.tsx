// import React, { useEffect, useState } from 'react'
// import { Button, Col, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
// import { ohlc } from '../../../Utils/common_vars';

// const LTPModal = ({closeModal, settings}) => {
//     const [source, setSource] = useState(settings.source ? settings.source : "Close")

//     const handleSubmit = () => {
//         closeModal({
//             indicatorName: settings.indicatorName,
//             source: source,
//         })
//     }

//     useEffect(() => {
//         const handleKeyDown = (event) => {
//             if (event.key === 'Enter' || event.key === 'Escape') {
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
//                 LTP
//             </ModalHeader>
//             <ModalBody>
//                 <form action="#">
//                     <div className="row g-3">
//                         <Col lg={12}>
//                             <Label htmlFor='source'>Source</Label>
//                             <select className="form-select" id='source' value={source} onChange={(e)=>{
//                                 setSource(e.target.value)
//                             }}>
//                                 {
//                                     ohlc.map((ohlc, i)=>
//                                         <option key={i}>{ohlc}</option>
//                                     )
//                                 }
//                             </select>
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

// export default LTPModal
















import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ohlc } from "../../../Utils/common_vars";

const LTPModal = ({ closeModal, settings }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dynamicStyles = styles(isDark);

  const [source, setSource] = useState(
    settings.source ? settings.source : "Close"
  );

  const handleSubmit = () => {
    closeModal({
      indicatorName: settings.indicatorName || "ltp",
      source: source,
    });
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={() => closeModal()}
    >
      <View style={dynamicStyles.overlay}>
        <View style={dynamicStyles.modalContainer}>
          {/* Header */}
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.title}>LTP</Text>
            <TouchableOpacity onPress={() => closeModal()}>
              <Text style={dynamicStyles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={dynamicStyles.body}>
            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>Source</Text>
              <View style={dynamicStyles.pickerContainer}>
                <Picker
                  selectedValue={source}
                  onValueChange={(value) => setSource(value)}
                  style={dynamicStyles.picker}
                  dropdownIconColor={isDark ? "#9CA3AF" : "#6B7280"}
                >
                  {ohlc.map((item, i) => (
                    <Picker.Item
                      key={i}
                      label={item}
                      value={item}
                      color={isDark ? "#FFFFFF" : "#111827"}
                    />
                  ))}
                </Picker>
              </View>
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
      </View>
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
      backgroundColor: isDark ? "#14161B" : "#FFFFFF",
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
      borderBottomColor: isDark ? "#262A33" : "#E5E7EB",
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
    pickerContainer: {
      borderWidth: 1,
      borderColor: isDark ? "#262A33" : "#D1D5DB",
      borderRadius: 8,
      backgroundColor: isDark ? "#14161B" : "#FFFFFF",
      overflow: "hidden",
    },
    picker: {
      height: 50,
      color: isDark ? "#FFFFFF" : "#111827",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#262A33" : "#E5E7EB",
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

export default LTPModal;