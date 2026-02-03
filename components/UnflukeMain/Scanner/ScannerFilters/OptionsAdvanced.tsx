// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Modal,
//   Alert,
//   useColorScheme,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import NumberModal from './OptionsModals/NumberModal';
// import ATMModal from './OptionsModals/ATMModal';
// import PremiumModal from './OptionsModals/PremiumModal';
// import { darkErrorToastOps, deepCopy, successToastOps } from '../../Utils/common_vars';

// const OptionsAdvanced = ({ expiryOptions, preLoadedState, handleChange, disabled }) => {
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === 'dark';

//   const [objToCat, setObjCat] = useState({});
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [selectedOptions, setSelectedOptions] = useState([]);

//   const [numberModalOpen, setNumberModalOpen] = useState(false);
//   const [atmModalOpen, setATMModalOpen] = useState(false);
//   const [premiumModalOpen, setPremiumModalOpen] = useState(false);

//   const [strikeState, setStrikeState] = useState({});
//   const [strikeType, setStrikeType] = useState('');

//   const [cePE, setCEPE] = useState('');

//   const sortbyMulti = [
//     {
//       label: 'Expiry',
//       options: expiryOptions,
//     },
//     {
//       label: 'Type',
//       options: [
//         { label: 'CE', value: 'CE' },
//         { label: 'PE', value: 'PE' },
//       ],
//     },
//     {
//       label: 'Underline',
//       options: [
//         { label: 'Spot', value: 'Spot' },
//         { label: 'Future', value: 'Future' },
//       ],
//     },
//     {
//       label: 'Strike',
//       options: [
//         { label: 'ATM', value: 'ATM' },
//         { label: 'Premium', value: 'Premium' },
//         { label: 'Number', value: 'Number' },
//       ],
//     },
//   ];

//   const showErrorToast = (message) => {
//     Alert.alert('Error', message, [{ text: 'OK', style: 'default' }]);
//   };

//   const showSuccessToast = (message) => {
//     Alert.alert('Success', message, [{ text: 'OK', style: 'default' }]);
//   };

//   const updateSelection = (newOption) => {
//     const isSelected = selectedOptions.some(opt => opt.label === newOption.label);
//     let values;

//     if (isSelected) {
//       values = selectedOptions.filter(opt => opt.label !== newOption.label);
//     } else {
//       values = [...selectedOptions, newOption];
//     }

//     setSelectedOptions(values);

//     if (!isSelected) {
//       const lastAdded = newOption;
//       let isCatAlreadyPicked = false;

//       for (let obj of preLoadedState) {
//         if (obj && lastAdded && obj.cat === objToCat[lastAdded.label]) {
//           isCatAlreadyPicked = true;
//           break;
//         }
//       }

//       if (!isCatAlreadyPicked || values.length < preLoadedState.length) {
//         let cePE = '';

//         for (let value of values) {
//           if (value.label === 'CE' || value.label === 'PE') {
//             cePE = value.label;
//           }
//         }

//         if (cePE !== '') {
//           setCEPE(cePE);
//         }

//         if (lastAdded) {
//           const modalType = lastAdded.label;

//           if (
//             cePE === '' &&
//             (modalType.startsWith('ATM') ||
//               modalType.startsWith('Premium') ||
//               modalType.startsWith('Number'))
//           ) {
//             showErrorToast('A type is required(CE/PE)');
//             return;
//           }

//           if (modalType.startsWith('ATM')) {
//             setATMModalOpen(true);
//             return;
//           } else if (modalType.startsWith('Premium')) {
//             setPremiumModalOpen(true);
//             return;
//           } else if (modalType.startsWith('Number')) {
//             setNumberModalOpen(true);
//             return;
//           }
//         }

//         const parsedState = convertToValidState(values);

//         handleChange({
//           target: {
//             name: 'segment2a',
//             value: parsedState,
//           },
//         });
//       }
//     } else {
//       const parsedState = convertToValidState(values);
//       handleChange({
//         target: {
//           name: 'segment2a',
//           value: parsedState,
//         },
//       });
//     }
//   };

//   const convertToValidState = (state) => {
//     const finalState = [];

//     for (let prop of state) {
//       const cat = objToCat[prop.label];

//       if (cat !== 'Strike') {
//         finalState.push({
//           cat: cat,
//           key: prop.label,
//           value: prop.value,
//         });
//       }
//     }

//     return finalState;
//   };

//   const parsePreLoadedState = (state) => {
//     const finalState = [];

//     for (let prop of state) {
//       finalState.push({
//         label: prop.key,
//         value: prop.value ? prop.value : prop.key,
//       });
//     }

//     return finalState;
//   };

//   const closeNumberModal = (output) => {
//     setNumberModalOpen(false);
//     setStrikeType('number');
//     setStrikeState(output);
//   };

//   const closeATMModal = (output) => {
//     setATMModalOpen(false);
//     setStrikeType('atm');
//     setStrikeState(output);
//   };

//   const closePremiumModal = (output) => {
//     setPremiumModalOpen(false);
//     setStrikeType('premium');
//     setStrikeState(output);
//   };

//   const removeSelectedOption = (optionToRemove) => {
//     const newSelected = selectedOptions.filter(opt => opt.label !== optionToRemove.label);
//     setSelectedOptions(newSelected);
    
//     const parsedState = convertToValidState(newSelected);
//     handleChange({
//       target: {
//         name: 'segment2a',
//         value: parsedState,
//       },
//     });
//   };

//   useEffect(() => {
//     const tmp = objToCat;

//     for (let key of sortbyMulti) {
//       const cat = key.label;

//       for (let option of key.options) {
//         tmp[option.label] = cat;
//       }
//     }

//     setObjCat(tmp);
//   }, [expiryOptions]);

//   useEffect(() => {
//     if (strikeState && strikeType) {
//       const tmp = deepCopy(preLoadedState);

//       for (let obj of tmp) {
//         if (obj.cat === 'Strike') return;
//       }

//       let key = '';

//       if (strikeType === 'number') {
//         key = 'Number: ' + strikeState;
//       } else if (strikeType === 'atm') {
//         key = 'ATM-' + cePE + '-' + strikeState[cePE].number;
//       } else if (strikeType === 'premium') {
//         key = 'Closest to ' + strikeState.closest + ', Min ' + strikeState.min + ', Max ' + strikeState.max;
//       }

//       tmp.push({
//         cat: 'Strike',
//         key: key,
//         value: strikeState,
//       });

//       handleChange({
//         target: {
//           name: 'segment2a',
//           value: tmp,
//         },
//       });
//     }
//   }, [strikeState, strikeType]);

//   useEffect(() => {
//     const preLoadedSelections = parsePreLoadedState(preLoadedState);
//     setSelectedOptions(preLoadedSelections);
//   }, [preLoadedState]);

//   const styles = StyleSheet.create({
//     container: {
//       marginVertical: 8,
//     },
//     selectButton: {
//       borderWidth: 1,
//       borderColor: isDark ? '#4b5563' : '#d1d5db',
//       borderRadius: 6,
//       backgroundColor: isDark ? '#1f2937' : '#ffffff',
//       minHeight: 48,
//       paddingHorizontal: 12,
//       paddingVertical: 8,
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//     },
//     selectButtonDisabled: {
//       backgroundColor: isDark ? '#374151' : '#f3f4f6',
//       borderColor: isDark ? '#4b5563' : '#e5e7eb',
//     },
//     selectButtonText: {
//       flex: 1,
//       color: isDark ? '#ffffff' : '#111827',
//       fontSize: 16,
//     },
//     selectedOptionsContainer: {
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//       gap: 8,
//       flex: 1,
//     },
//     selectedOption: {
//       backgroundColor: '#9ebef9',
//       borderRadius: 4,
//       paddingHorizontal: 8,
//       paddingVertical: 4,
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginBottom: 4,
//     },
//     selectedOptionText: {
//       color: '#000000',
//       fontSize: 14,
//       marginRight: 4,
//     },
//     removeButton: {
//       marginLeft: 4,
//     },
//     dropdown: {
//       position: 'absolute',
//       top: '100%',
//       left: 0,
//       right: 0,
//       backgroundColor: isDark ? '#1f2937' : '#ffffff',
//       borderWidth: 1,
//       borderColor: isDark ? '#4b5563' : '#d1d5db',
//       borderRadius: 6,
//       marginTop: 4,
//       maxHeight: 300,
//       zIndex: 1000,
//       elevation: 5,
//     },
//     groupHeader: {
//       backgroundColor: isDark ? '#374151' : '#f3f4f6',
//       paddingHorizontal: 12,
//       paddingVertical: 8,
//       borderBottomWidth: 1,
//       borderBottomColor: isDark ? '#4b5563' : '#e5e7eb',
//     },
//     groupHeaderText: {
//       fontSize: 14,
//       fontWeight: '600',
//       color: isDark ? '#d1d5db' : '#374151',
//     },
//     option: {
//       paddingHorizontal: 12,
//       paddingVertical: 12,
//       borderBottomWidth: 1,
//       borderBottomColor: isDark ? '#374151' : '#f3f4f6',
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//     },
//     optionSelected: {
//       backgroundColor: isDark ? '#374151' : '#eff6ff',
//     },
//     optionText: {
//       fontSize: 16,
//       color: isDark ? '#ffffff' : '#111827',
//     },
//     chevron: {
//       color: isDark ? '#9ca3af' : '#6b7280',
//     },
//     overlay: {
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'transparent',
//     },
//   });

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         style={[styles.selectButton, disabled && styles.selectButtonDisabled]}
//         onPress={() => !disabled && setShowDropdown(!showDropdown)}
//         disabled={disabled}
//       >
//         <View style={styles.selectedOptionsContainer}>
//           {selectedOptions.length === 0 ? (
//             <Text style={[styles.selectButtonText, { opacity: 0.5 }]}>
//               Select options...
//             </Text>
//           ) : (
//             selectedOptions.map((option, index) => (
//               <View key={index} style={styles.selectedOption}>
//                 <Text style={styles.selectedOptionText}>{option.label}</Text>
//                 {!disabled && (
//                   <TouchableOpacity
//                     style={styles.removeButton}
//                     onPress={() => removeSelectedOption(option)}
//                   >
//                     <Ionicons name="close" size={16} color="#000000" />
//                   </TouchableOpacity>
//                 )}
//               </View>
//             ))
//           )}
//         </View>
//         <Ionicons 
//           name={showDropdown ? "chevron-up" : "chevron-down"} 
//           size={20} 
//           style={styles.chevron} 
//         />
//       </TouchableOpacity>

//       {showDropdown && (
//         <>
//           <TouchableOpacity
//             style={StyleSheet.absoluteFill}
//             onPress={() => setShowDropdown(false)}
//             activeOpacity={1}
//           />
//           <View style={styles.dropdown}>
//             <ScrollView style={{ maxHeight: 300 }}>
//               {sortbyMulti.map((group, groupIndex) => (
//                 <View key={groupIndex}>
//                   <View style={styles.groupHeader}>
//                     <Text style={styles.groupHeaderText}>{group.label}</Text>
//                   </View>
//                   {group.options.map((option, optionIndex) => {
//                     const isSelected = selectedOptions.some(selected => selected.label === option.label);
//                     return (
//                       <TouchableOpacity
//                         key={optionIndex}
//                         style={[styles.option, isSelected && styles.optionSelected]}
//                         onPress={() => {
//                           updateSelection(option);
//                           setShowDropdown(false);
//                         }}
//                       >
//                         <Text style={styles.optionText}>{option.label}</Text>
//                         {isSelected && (
//                           <Ionicons name="checkmark" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
//                         )}
//                       </TouchableOpacity>
//                     );
//                   })}
//                 </View>
//               ))}
//             </ScrollView>
//           </View>
//         </>
//       )}

//       {numberModalOpen && (
//         <NumberModal closeModal={closeNumberModal} preLoadedState={strikeState} />
//       )}
//       {atmModalOpen && (
//         <ATMModal closeModal={closeATMModal} cePE={cePE} preLoadedState={strikeState} />
//       )}
//       {premiumModalOpen && (
//         <PremiumModal closeModal={closePremiumModal} cePE={cePE} preLoadedState={strikeState} />
//       )}
//     </View>
//   );
// };

// export default OptionsAdvanced;













import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
} from "react-native";
import Toast from "react-native-toast-message";
import NumberModal from "./OptionsModals/NumberModal";
import ATMModal from "./OptionsModals/ATMModal";
import PremiumModal from "./OptionsModals/PremiumModal";

const OptionsAdvanced = ({
  expiryOptions,
  preLoadedState,
  handleChange,
  disabled,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dynamicStyles = styles(isDark);

  const [objToCat, setObjCat] = useState({});
  const [numberModalOpen, setNumberModalOpen] = useState(false);
  const [atmModalOpen, setATMModalOpen] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [strikeState, setStrikeState] = useState({});
  const [strikeType, setStrikeType] = useState("");
  const [cePE, setCEPE] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const sortbyMulti = [
    {
      label: "Expiry",
      options: expiryOptions,
    },
    {
      label: "Type",
      options: [
        { label: "CE", value: "CE" },
        { label: "PE", value: "PE" },
      ],
    },
    {
      label: "Underline",
      options: [
        { label: "Spot", value: "Spot" },
        { label: "Future", value: "Future" },
      ],
    },
    {
      label: "Strike",
      options: [
        { label: "ATM", value: "ATM" },
        { label: "Premium", value: "Premium" },
        { label: "Number", value: "Number" },
      ],
    },
  ];

  const handleOptionSelect = (option) => {
    const cat = objToCat[option.label];

    // Check if category already selected
    const isCatAlreadyPicked = preLoadedState.some(
      (obj) => obj && obj.cat === cat
    );

    if (isCatAlreadyPicked) {
      Toast.show({
        type: "error",
        text1: "Already Selected",
        text2: `${cat} is already selected`,
      });
      return;
    }

    // Track CE/PE selection
    if (option.label === "CE" || option.label === "PE") {
      setCEPE(option.label);
    }

    // Handle strike options
    if (cat === "Strike") {
      const currentCePE = cePE || preLoadedState.find(obj => obj.cat === "Type")?.key;
      
      if (!currentCePE) {
        Toast.show({
          type: "error",
          text1: "Type Required",
          text2: "Please select CE or PE first",
        });
        return;
      }

      if (option.label === "ATM") {
        setATMModalOpen(true);
      } else if (option.label === "Premium") {
        setPremiumModalOpen(true);
      } else if (option.label === "Number") {
        setNumberModalOpen(true);
      }
      return;
    }

    // Add regular option
    const newState = [
      ...preLoadedState,
      {
        cat: cat,
        key: option.label,
        value: option.value,
      },
    ];

    handleChange({
      target: {
        name: "segment2a",
        value: newState,
      },
    });

    setShowOptions(false);
  };

  const handleRemoveOption = (index) => {
    const newState = preLoadedState.filter((_, i) => i !== index);
    handleChange({
      target: {
        name: "segment2a",
        value: newState,
      },
    });
  };

  const closeNumberModal = (output) => {
    setNumberModalOpen(false);
    if (output !== undefined) {
      setStrikeType("number");
      setStrikeState(output);
    }
  };

  const closeATMModal = (output) => {
    setATMModalOpen(false);
    if (output) {
      setStrikeType("atm");
      setStrikeState(output);
    }
  };

  const closePremiumModal = (output) => {
    setPremiumModalOpen(false);
    if (output) {
      setStrikeType("premium");
      setStrikeState(output);
    }
  };

  // Build objToCat mapping
  useEffect(() => {
    const tmp = {};
    sortbyMulti.forEach((category) => {
      category.options.forEach((option) => {
        tmp[option.label] = category.label;
      });
    });
    setObjCat(tmp);
  }, [expiryOptions]);

  // Add strike option when modal closes
  useEffect(() => {
    if (strikeState && strikeType) {
      const hasStrike = preLoadedState.some((obj) => obj.cat === "Strike");
      if (hasStrike) return;

      let key = "";

      if (strikeType === "number") {
        key = "Number: " + strikeState;
      } else if (strikeType === "atm") {
        key = "ATM-" + cePE + "-" + strikeState[cePE].number;
      } else if (strikeType === "premium") {
        key = `Closest to ${strikeState.closest}, Min ${strikeState.min}, Max ${strikeState.max}`;
      }

      const newState = [
        ...preLoadedState,
        {
          cat: "Strike",
          key: key,
          value: strikeState,
        },
      ];

      handleChange({
        target: {
          name: "segment2a",
          value: newState,
        },
      });

      setShowOptions(false);
    }
  }, [strikeState, strikeType]);

  return (
    <View style={dynamicStyles.container}>
      {/* Selected Options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={dynamicStyles.selectedContainer}
      >
        {preLoadedState.map((item, index) => (
          <View key={index} style={dynamicStyles.chip}>
            <Text style={dynamicStyles.chipText}>{item.key}</Text>
            <TouchableOpacity
              onPress={() => handleRemoveOption(index)}
              disabled={disabled}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={dynamicStyles.chipRemove}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Button */}
        {!disabled && (
          <TouchableOpacity
            style={dynamicStyles.addButton}
            onPress={() => setShowOptions(!showOptions)}
          >
            <Text style={dynamicStyles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Options Dropdown */}
      {showOptions && (
        <View style={dynamicStyles.optionsContainer}>
          <ScrollView style={dynamicStyles.optionsScroll}>
            {sortbyMulti.map((category) => (
              <View key={category.label} style={dynamicStyles.categoryGroup}>
                <Text style={dynamicStyles.categoryLabel}>
                  {category.label}
                </Text>
                {category.options.map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    style={dynamicStyles.optionItem}
                    onPress={() => handleOptionSelect(option)}
                  >
                    <Text style={dynamicStyles.optionText}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Modals */}
      {numberModalOpen && (
        <NumberModal
          closeModal={closeNumberModal}
          preLoadedState={strikeState}
        />
      )}
      {atmModalOpen && (
        <ATMModal
          closeModal={closeATMModal}
          cePE={cePE}
          preLoadedState={strikeState}
        />
      )}
      {premiumModalOpen && (
        <PremiumModal
          closeModal={closePremiumModal}
          cePE={cePE}
          preLoadedState={strikeState}
        />
      )}
    </View>
  );
};

const styles = (isDark) =>
  StyleSheet.create({
    container: {
      position: "relative",
    },
    selectedContainer: {
      flexDirection: "row",
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 8,
      padding: 8,
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
      minHeight: 48,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#9EBEF9",
      borderRadius: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      marginRight: 6,
    },
    chipText: {
      color: "#000000",
      fontSize: 13,
      marginRight: 6,
    },
    chipRemove: {
      color: "#000000",
      fontSize: 16,
      fontWeight: "bold",
    },
    addButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#3B82F6",
      justifyContent: "center",
      alignItems: "center",
    },
    addButtonText: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "bold",
    },
    optionsContainer: {
      position: "absolute",
      top: 56,
      left: 0,
      right: 0,
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 8,
      maxHeight: 300,
      zIndex: 1000,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    optionsScroll: {
      padding: 8,
    },
    categoryGroup: {
      marginBottom: 12,
    },
    categoryLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#D1D5DB" : "#374151",
      marginBottom: 6,
      paddingHorizontal: 8,
    },
    optionItem: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 6,
    },
    optionText: {
      fontSize: 14,
      color: isDark ? "#FFFFFF" : "#111827",
    },
  });

export default OptionsAdvanced;