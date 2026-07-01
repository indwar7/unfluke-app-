// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Switch,
//   TouchableOpacity,
//   useColorScheme,
// } from "react-native";
// import { Picker } from '@react-native-picker/picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import {
//   equitySegment2a,
//   futureSegment2a,
//   indexSegment2a,
//   niftysWithWeeklyExpiry,
//   scannerGlobalTimeframes,
//   segment1aList,
//   segments,
// } from "../../Utils/common_vars";
// import OptionsAdvanced from "./OptionsAdvanced";
// import axios from "axios";
// import {
//   getEquityStocks,
//   getFutureStocks,
//   getIndexStocks,
//   getOptionsStocks,
// } from "../../Utils/general_api_functions";

// const ScannerFilters = ({ scannerState, type, handleChange, entryexit }) => {
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === 'dark';

//   const [segment1aList, setSegment1aList] = useState([]);
//   const [equityStocks, setEquityStocks] = useState([]);
//   const [indexStocks, setIndexStocks] = useState([]);
//   const [optionStocks, setOptionStocks] = useState([]);
//   const [futureStocks, setFutureStocks] = useState([]);
//   const [expiryOptions, setExpiryOptions] = useState([
//     { label: "Current Month", value: "Current Month" },
//   ]);

//   // Time picker states
//   const [showStartTimePicker, setShowStartTimePicker] = useState(false);
//   const [showEndTimePicker, setShowEndTimePicker] = useState(false);

//   const setSegment2a = (value) => {
//     handleChange({
//       target: {
//         name: "segment2a",
//         value: value,
//       },
//     });
//   };

//   const resetSegment1a2a = (value) => {
//     if (
//       equityStocks.length > 0 &&
//       indexStocks.length > 0 &&
//       optionStocks.length > 0 &&
//       futureStocks.length > 0
//     ) {
//       const parsedSegment = parseInt(value);

//       let first = "";
//       let segment2a = "";

//       switch (parsedSegment) {
//         case 0:
//           setSegment1aList(equityStocks);
//           setSegment2a([equitySegment2a[0]]);
//           segment2a = [equitySegment2a[0]];
//           first = equityStocks[0];
//           break;
//         case 1:
//           setSegment1aList(indexStocks);
//           setSegment2a([indexSegment2a[0]]);
//           segment2a = [indexSegment2a[0]];
//           first = indexStocks[0];
//           break;
//         case 2:
//           setSegment1aList(optionStocks);
//           setSegment2a([]);
//           segment2a = [];
//           first = optionStocks[0];
//           break;
//         case 3:
//           setSegment1aList(futureStocks);
//           setSegment2a([futureSegment2a[0]]);
//           segment2a = [futureSegment2a[0]];
//           first = futureStocks[0];
//           break;
//       }

//       handleChange({
//         target: {
//           name: "segment1a",
//           value: first,
//         },
//       });

//       if (type !== "advanced") {
//         handleChange({
//           target: {
//             name: "segment",
//             value: parsedSegment,
//           },
//         });
//       } else {
//         handleChange({
//           target: {
//             name: "segment",
//             value: parsedSegment,
//             segment1a: first,
//             segment2a: segment2a,
//           },
//         });
//       }
//     }
//   };

//   const handleSegment1aChange = (value) => {
//     if (type !== "advanced") {
//       handleChange({
//         target: {
//           name: "segment1a",
//           value: value,
//         },
//       });
//     } else {
//       let segment2a = "";
//       switch (scannerState.segment) {
//         case 0:
//           segment2a = [equitySegment2a[0]];
//           break;
//         case 1:
//           segment2a = [indexSegment2a[0]];
//           break;
//         case 2:
//           segment2a = [];
//           break;
//         case 3:
//           segment2a = [futureSegment2a[0]];
//           break;
//       }
//       handleChange({
//         target: {
//           name: "segment1a",
//           value: value,
//           segment2a: segment2a,
//         },
//       });
//       return;
//     }
//     if (scannerState.segment === 2 && type !== "advanced") {
//       handleChange({
//         target: {
//           name: "segment2a",
//           value: [],
//         },
//       });
//     }
//   };

//   const formatTimeFromString = (timeString) => {
//     if (!timeString) return new Date();
//     const [hours, minutes] = timeString.split(':');
//     const date = new Date();
//     date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
//     return date;
//   };

//   const formatTimeToString = (date) => {
//     const hours = date.getHours().toString().padStart(2, '0');
//     const minutes = date.getMinutes().toString().padStart(2, '0');
//     return `${hours}:${minutes}`;
//   };

//   const handleTimeChange = (event, selectedTime, type) => {
//     if (type === 'start') {
//       setShowStartTimePicker(false);
//       if (selectedTime) {
//         handleChange({
//           target: {
//             name: "starttime",
//             value: formatTimeToString(selectedTime),
//           },
//         });
//       }
//     } else {
//       setShowEndTimePicker(false);
//       if (selectedTime) {
//         handleChange({
//           target: {
//             name: "endtime",
//             value: formatTimeToString(selectedTime),
//           },
//         });
//       }
//     }
//   };

//   useEffect(() => {
//     const getStocks = async () => {
//       const equityStocks = await getEquityStocks(
//         axios,
//         type ? type : "scanner",
//       );
//       setEquityStocks(equityStocks);

//       const indexStocks = getIndexStocks();
//       setIndexStocks(indexStocks);

//       const optionStocks = await getOptionsStocks(
//         axios,
//         type ? type : "scanner",
//       );
//       setOptionStocks(optionStocks);

//       const futureStocks = await getFutureStocks(
//         axios,
//         type ? type : "scanner",
//       );
//       setFutureStocks(futureStocks);
//     };

//     getStocks();
//   }, []);

//   useEffect(() => {
//     const setStocks = () => {
//       if (
//         equityStocks.length > 0 &&
//         indexStocks.length > 0 &&
//         optionStocks.length > 0 &&
//         futureStocks.length > 0
//       ) {
//         switch (scannerState.segment) {
//           case 0:
//             setSegment1aList(equityStocks);
//             break;
//           case 1:
//             setSegment1aList(indexStocks);
//             break;
//           case 2:
//             setSegment1aList(optionStocks);
//             break;
//           case 3:
//             setSegment1aList(futureStocks);
//             break;
//         }
//       }
//     };

//     setStocks();
//   }, [
//     scannerState.segment,
//     equityStocks,
//     indexStocks,
//     optionStocks,
//     futureStocks,
//   ]);

//   useEffect(() => {
//     const segment1a = scannerState.segment1a;

//     if (niftysWithWeeklyExpiry.indexOf(segment1a) !== -1) {
//       setExpiryOptions([{ label: "Current Week", value: "Current Week" }]);
//     } else {
//       setExpiryOptions([{ label: "Current Month", value: "Current Month" }]);
//     }
//   }, [scannerState.segment1a]);

//   const styles = StyleSheet.create({
//     container: {
//       backgroundColor: isDark ? '#1f2937' : '#ffffff',
//       borderRadius: 8,
//       padding: 16,
//       shadowColor: '#000',
//       shadowOffset: {
//         width: 0,
//         height: 1,
//       },
//       shadowOpacity: 0.1,
//       shadowRadius: 3,
//       elevation: 2,
//       flex: 1,
//     },
//     title: {
//       fontSize: 18,
//       fontWeight: '600',
//       color: isDark ? '#ffffff' : '#111827',
//       marginBottom: 24,
//     },
//     row: {
//       flexDirection: 'row',
//       marginBottom: 24,
//     },
//     halfWidth: {
//       flex: 1,
//       marginHorizontal: 8,
//     },
//     fullWidth: {
//       flex: 1,
//       marginHorizontal: 8,
//     },
//     label: {
//       fontSize: 14,
//       fontWeight: '500',
//       color: isDark ? '#d1d5db' : '#374151',
//       marginBottom: 8,
//     },
//     pickerContainer: {
//       borderWidth: 1,
//       borderColor: isDark ? '#4b5563' : '#d1d5db',
//       borderRadius: 6,
//       backgroundColor: isDark ? '#1f2937' : '#ffffff',
//     },
//     picker: {
//       color: isDark ? '#ffffff' : '#111827',
//     },
//     timeButton: {
//       height: 48,
//       borderWidth: 1,
//       borderColor: isDark ? '#4b5563' : '#d1d5db',
//       borderRadius: 6,
//       backgroundColor: isDark ? '#1f2937' : '#ffffff',
//       paddingHorizontal: 12,
//       justifyContent: 'center',
//     },
//     timeButtonText: {
//       fontSize: 16,
//       color: isDark ? '#ffffff' : '#111827',
//     },
//     timeButtonDisabled: {
//       backgroundColor: isDark ? '#374151' : '#f3f4f6',
//       borderColor: isDark ? '#4b5563' : '#e5e7eb',
//     },
//     radioContainer: {
//       marginTop: 8,
//     },
//     radioOption: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginBottom: 12,
//     },
//     radioButton: {
//       height: 16,
//       width: 16,
//       borderRadius: 8,
//       borderWidth: 2,
//       borderColor: isDark ? '#6b7280' : '#d1d5db',
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginRight: 12,
//     },
//     radioButtonSelected: {
//       borderColor: '#3b82f6',
//     },
//     radioButtonInner: {
//       height: 8,
//       width: 8,
//       borderRadius: 4,
//       backgroundColor: '#3b82f6',
//     },
//     radioText: {
//       fontSize: 14,
//       color: isDark ? '#d1d5db' : '#6b7280',
//     },
//     switchContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       paddingTop: 8,
//     },
//     switchLabel: {
//       fontSize: 14,
//       fontWeight: '500',
//       color: isDark ? '#d1d5db' : '#374151',
//     },
//   });

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       <Text style={styles.title}>Filters</Text>

//       {type !== "fundamental" && (
//         <>
//           {/* First Row - Segment and Segment1A */}
//           <View style={styles.row}>
//             <View style={styles.halfWidth}>
//               <View style={styles.pickerContainer}>
//                 <Picker
//                   selectedValue={scannerState.segment}
//                   onValueChange={(value) => resetSegment1a2a(value)}
//                   style={styles.picker}
//                   enabled={!(entryexit && entryexit === "exit")}
//                 >
//                   {segments.map((option) => (
//                     <Picker.Item
//                       key={option.value}
//                       label={option.name}
//                       value={option.value}
//                       color={isDark ? '#ffffff' : '#111827'}
//                                             style={{fontSize:14}}
//                     />
//                   ))}
//                 </Picker>
//               </View>
//             </View>

//             <View style={styles.halfWidth}>
//               <View style={styles.pickerContainer}>
//                 <Picker
//                   selectedValue={scannerState.segment1a}
//                   onValueChange={(value) => handleSegment1aChange(value)}
//                   style={styles.picker}
//                   enabled={!(entryexit && entryexit === "exit")}
//                 >
//                   {segment1aList.map((option, index) => (
//                     <Picker.Item
//                       key={index}
//                       label={option}
//                       value={option}
//                       color={isDark ? '#ffffff' : '#111827'}
//                                             style={{fontSize:14}}

//                     />
//                   ))}
//                 </Picker>
//               </View>
//             </View>
//           </View>

//           {/* Segment 2A */}
//           <View style={styles.fullWidth}>
//             <Text style={styles.label}>Segment 2A</Text>
//             {scannerState.segment === 0 && (
//               <View style={styles.pickerContainer}>
//                 <Picker
//                   selectedValue={scannerState.segment2a && scannerState.segment2a[0]}
//                   onValueChange={(value) => setSegment2a([value])}
//                   style={styles.picker}
//                   enabled={!(entryexit && entryexit === "exit")}
//                 >
//                   {equitySegment2a.map((option, index) => (
//                     <Picker.Item
//                       key={index}
//                       label={option}
//                       value={option}
//                       color={isDark ? '#ffffff' : '#111827'}
//                                             style={{fontSize:14}}

//                     />
//                   ))}
//                 </Picker>
//               </View>
//             )}
//             {scannerState.segment === 1 && (
//               <View style={styles.pickerContainer}>
//                 <Picker
//                   selectedValue={scannerState.segment2a && scannerState.segment2a[0]}
//                   onValueChange={(value) => setSegment2a([value])}
//                   style={styles.picker}
//                   enabled={!(entryexit && entryexit === "exit")}
//                 >
//                   {indexSegment2a.map((option, index) => (
//                     <Picker.Item
//                       key={index}
//                       label={option}
//                       value={option}
//                       color={isDark ? '#ffffff' : '#111827'}
//                                             style={{fontSize:14}}

//                     />
//                   ))}
//                 </Picker>
//               </View>
//             )}
//             {scannerState.segment === 2 && (
//               <OptionsAdvanced
//                 expiryOptions={expiryOptions}
//                 preLoadedState={scannerState.segment2a}
//                 handleChange={handleChange}
//                 disabled={entryexit && entryexit === "exit"}
//               />
//             )}
//             {scannerState.segment === 3 && (
//               <View style={styles.pickerContainer}>
//                 <Picker
//                   selectedValue={scannerState.segment2a && scannerState.segment2a[0]}
//                   onValueChange={(value) => setSegment2a([value])}
//                   style={styles.picker}
//                   enabled={!(entryexit && entryexit === "exit")}
//                 >
//                   {futureSegment2a.map((option, index) => (
//                     <Picker.Item
//                       key={index}
//                       label={option}
//                       value={option}
//                       color={isDark ? '#ffffff' : '#111827'}
//                                             style={{fontSize:14}}

//                     />
//                   ))}
//                 </Picker>
//               </View>
//             )}
//           </View>

//           {/* Time Inputs */}
//           <View style={styles.row}>
//             <View style={styles.halfWidth}>
//               <Text style={styles.label}>Start time</Text>
//               <TouchableOpacity
//                 style={[
//                   styles.timeButton,
//                   entryexit && entryexit === "exit" && styles.timeButtonDisabled
//                 ]}
//                 onPress={() => setShowStartTimePicker(true)}
//                 disabled={entryexit && entryexit === "exit"}
//               >
//                 <Text style={styles.timeButtonText}>
//                   {scannerState.starttime || "00:00"}
//                 </Text>
//               </TouchableOpacity>
//               {showStartTimePicker && (
//                 <DateTimePicker
//                   value={formatTimeFromString(scannerState.starttime)}
//                   mode="time"
//                   is24Hour={true}
//                   onChange={(event, time) => handleTimeChange(event, time, 'start')}
//                 />
//               )}
//             </View>

//             <View style={styles.halfWidth}>
//               <Text style={styles.label}>End time</Text>
//               <TouchableOpacity
//                 style={[
//                   styles.timeButton,
//                   entryexit && entryexit === "exit" && styles.timeButtonDisabled
//                 ]}
//                 onPress={() => setShowEndTimePicker(true)}
//                 disabled={entryexit && entryexit === "exit"}
//               >
//                 <Text style={styles.timeButtonText}>
//                   {scannerState.endtime || "00:00"}
//                 </Text>
//               </TouchableOpacity>
//               {showEndTimePicker && (
//                 <DateTimePicker
//                   value={formatTimeFromString(scannerState.endtime)}
//                   mode="time"
//                   is24Hour={true}
//                   onChange={(event, time) => handleTimeChange(event, time, 'end')}
//                 />
//               )}
//             </View>
//           </View>

//           {/* Timeframe & Others */}
//           <View style={styles.row}>
//             <View style={styles.halfWidth}>
//               <Text style={styles.label}>
//                 Timeframe ℹ️
//               </Text>
//               <View style={styles.pickerContainer}>
//                 <Picker
//                   selectedValue={scannerState.timeframe}
//                   onValueChange={(value) => handleChange({
//                     target: { name: "timeframe", value: value }
//                   })}
//                   style={styles.picker}
//                 >
//                   {scannerGlobalTimeframes.map((option, index) => (
//                     <Picker.Item
//                       key={index}
//                       label={option}
//                       value={option}
//                       color={isDark ? '#ffffff' : '#111827'}
//                       style={{fontSize:14}}
//                     />
//                   ))}
//                 </Picker>
//               </View>
//             </View>

//             <View style={styles.halfWidth}>
//               <Text style={styles.label}>Other</Text>
//               <View style={styles.radioContainer}>
//                 <TouchableOpacity
//                   style={styles.radioOption}
//                   onPress={() =>
//                     handleChange({
//                       target: { name: "satisfy", value: true },
//                     })
//                   }
//                 >
//                   <View style={[
//                     styles.radioButton,
//                     scannerState.satisfy && styles.radioButtonSelected
//                   ]}>
//                     {scannerState.satisfy && <View style={styles.radioButtonInner} />}
//                   </View>
//                   <Text style={styles.radioText}>Satisfy</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.radioOption}
//                   onPress={() =>
//                     handleChange({
//                       target: { name: "satisfy", value: false },
//                     })
//                   }
//                 >
//                   <View style={[
//                     styles.radioButton,
//                     !scannerState.satisfy && styles.radioButtonSelected
//                   ]}>
//                     {!scannerState.satisfy && <View style={styles.radioButtonInner} />}
//                   </View>
//                   <Text style={styles.radioText}>Not satisfy</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>

//           {/* Show Latest Results */}
//           {!entryexit && type === "scanner" && (
//             <View style={styles.switchContainer}>
//               <Text style={styles.switchLabel}>Show latest results</Text>
//               <Switch
//                 value={scannerState.showLatestRes}
//                 onValueChange={(value) =>
//                   handleChange({
//                     target: { name: "showLatestRes", value: value }
//                   })
//                 }
//                 trackColor={{ false: isDark ? '#374151' : '#d1d5db', true: '#3b82f6' }}
//                 thumbColor={scannerState.showLatestRes ? '#ffffff' : '#f4f4f4'}
//               />
//             </View>
//           )}
//         </>
//       )}
//     </ScrollView>
//   );
// };

// export default ScannerFilters;

import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import {
  equitySegment2a,
  futureSegment2a,
  indexSegment2a,
  scannerGlobalTimeframes,
  segments,
} from "../../Utils/common_vars";
import {
  getEquityStocks,
  getFutureStocks,
  getIndexStocks,
  getOptionsStocks,
} from "../../Utils/general_api_functions";
import OptionsAdvanced from "./OptionsAdvanced";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const ScannerFilters = ({ scannerState, type, handleChange, entryexit }) => {
  const { colors: c, isDark } = useTheme();
  const dynamicStyles = styles(c, isDark);

  const [segment1aList, setSegment1aList] = useState([]);
  const [equityStocks, setEquityStocks] = useState([]);
  const [indexStocks, setIndexStocks] = useState([]);
  const [optionStocks, setOptionStocks] = useState([]);
  const [futureStocks, setFutureStocks] = useState([]);

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [expiryOptions, setExpiryOptions] = useState([
    { label: "Current Month", value: "Current Month" },
  ]);

  const niftysWithWeeklyExpiry = ["NIFTY", "BANKNIFTY", "FINNIFTY"];

  // Convert 24-hour time string to 12-hour format with AM/PM
  const formatTime12Hour = (timeString) => {
    if (!timeString) return "12:00 AM";

    const [hours24, minutes] = timeString.split(":");
    const hours = parseInt(hours24) || 0;
    const mins = parseInt(minutes) || 0;

    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12; // Convert 0 to 12

    return `${hours12}:${String(mins).padStart(2, "0")} ${period}`;
  };

  // Convert time string to Date object
  const timeStringToDate = (timeString) => {
    if (!timeString) return new Date();

    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours) || 0);
    date.setMinutes(parseInt(minutes) || 0);
    date.setSeconds(0);

    return date;
  };
  // Convert Date to 24-hour time string (for backend storage)
  const dateToTimeString = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const setSegment2a = (value) => {
    handleChange({
      target: {
        name: "segment2a",
        value: value,
      },
    });
  };

  const resetSegment1a2a = (value) => {
    if (
      equityStocks.length > 0 &&
      indexStocks.length > 0 &&
      optionStocks.length > 0 &&
      futureStocks.length > 0
    ) {
      const parsedSegment = parseInt(value);

      let first = "";
      let segment2a = "";

      switch (parsedSegment) {
        case 0:
          setSegment1aList(equityStocks);
          setSegment2a([equitySegment2a[0]]);
          segment2a = [equitySegment2a[0]];
          first = equityStocks[0];
          break;
        case 1:
          setSegment1aList(indexStocks);
          setSegment2a([indexSegment2a[0]]);
          segment2a = [indexSegment2a[0]];
          first = indexStocks[0];
          break;
        case 2:
          setSegment1aList(optionStocks);
          setSegment2a([]);
          segment2a = [];
          first = optionStocks[0];
          break;
        case 3:
          setSegment1aList(futureStocks);
          setSegment2a([futureSegment2a[0]]);
          segment2a = [futureSegment2a[0]];
          first = futureStocks[0];
          break;
      }

      handleChange({
        target: {
          name: "segment1a",
          value: first,
        },
      });

      if (type !== "advanced") {
        handleChange({
          target: {
            name: "segment",
            value: parsedSegment,
          },
        });
      } else {
        handleChange({
          target: {
            name: "segment",
            value: parsedSegment,
            segment1a: first,
            segment2a: segment2a,
          },
        });
      }
    }
  };

  // Fetch stocks on mount
  useEffect(() => {
    const getStocks = async () => {
      const equityStocks = await getEquityStocks(
        axios,
        type ? type : "scanner"
      );

      setEquityStocks(equityStocks);

      const indexStocks = getIndexStocks();
      setIndexStocks(indexStocks);

      const optionStocks = await getOptionsStocks(
        axios,
        type ? type : "scanner"
      );
      setOptionStocks(optionStocks);

      const futureStocks = await getFutureStocks(
        axios,
        type ? type : "scanner"
      );
      setFutureStocks(futureStocks);
    };

    getStocks();
  }, []);

  // Update segment1aList based on segment

  useEffect(() => {
    const setStocks = () => {
      if (
        equityStocks.length > 0 &&
        indexStocks.length > 0 &&
        optionStocks.length > 0 &&
        futureStocks.length > 0
      ) {
        switch (scannerState.segment) {
          case 0:
            setSegment1aList(equityStocks);
            break;
          case 1:
            setSegment1aList(indexStocks);
            break;
          case 2:
            setSegment1aList(optionStocks);
            break;
          case 3:
            setSegment1aList(futureStocks);
            break;
        }
      }
    };

    setStocks();
  }, [
    scannerState.segment,
    equityStocks,
    indexStocks,
    optionStocks,
    futureStocks,
  ]);

  // Update expiry options based on segment1a
  useEffect(() => {
    const segment1a = scannerState.segment1a;

    if (niftysWithWeeklyExpiry.indexOf(segment1a) !== -1) {
      setExpiryOptions([{ label: "Current Week", value: "Current Week" }]);
    } else {
      setExpiryOptions([{ label: "Current Month", value: "Current Month" }]);
    }
  }, [scannerState.segment1a]);

  const isDisabled = entryexit && entryexit === "exit";

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Filters</Text>

      <ScrollView
        style={dynamicStyles.scrollView}
        nestedScrollEnabled={true}
      >
        {type !== "fundamental" && (
          <View style={dynamicStyles.formContainer}>
            {/* Segment and Segment1A Row */}
            <View style={dynamicStyles.row}>
              {/* Segment Picker */}
              <View style={dynamicStyles.halfColumn}>
                <View style={dynamicStyles.pickerContainer}>
                  <Picker
                    selectedValue={scannerState.segment}
                    onValueChange={(value) => resetSegment1a2a(value)}
                    enabled={!isDisabled}
                    style={dynamicStyles.picker}
                    dropdownIconColor={c.textMuted}
                  >
                    {segments.map((option) => (
                      <Picker.Item
                        key={option.value}
                        label={option.name}
                        value={option.value}
                        color={c.text}
                        style={{ fontSize: 14 }}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Segment1a Picker */}
              <View style={dynamicStyles.halfColumn}>
                <View style={dynamicStyles.pickerContainer}>
                  <Picker
                    selectedValue={scannerState.segment1a}
                    onValueChange={(value) => {
                      if (type !== "advanced") {
                        handleChange({
                          target: { name: "segment1a", value },
                        });
                      } else {
                        let segment2a = "";
                        switch (scannerState.segment) {
                          case 0:
                            segment2a = [equitySegment2a[0]];
                            break;
                          case 1:
                            segment2a = [indexSegment2a[0]];
                            break;
                          case 2:
                            segment2a = [];
                            break;
                          case 3:
                            segment2a = [futureSegment2a[0]];
                            break;
                        }
                        handleChange({
                          target: {
                            name: "segment1a",
                            value: value,
                            segment2a: segment2a,
                          },
                        });
                      }
                      if (scannerState.segment === 2 && type !== "advanced") {
                        handleChange({
                          target: {
                            name: "segment2a",
                            value: [],
                          },
                        });
                      }
                    }}
                    enabled={!isDisabled}
                    style={dynamicStyles.picker}
                    dropdownIconColor={c.textMuted}
                  >
                    {segment1aList.map((option, index) => (
                      <Picker.Item
                        key={index}
                        label={option}
                        value={option}
                        color={c.text}
                        style={{ fontSize: 14 }}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            {/* Segment2a */}
            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>Segment 2A</Text>

              {scannerState.segment === 0 && (
                <View style={dynamicStyles.pickerContainer}>
                  <Picker
                    selectedValue={
                      scannerState.segment2a && scannerState.segment2a[0]
                    }
                    onValueChange={(value) => setSegment2a([value])}
                    enabled={!isDisabled}
                    style={dynamicStyles.picker}
                    dropdownIconColor={c.textMuted}
                  >
                    {equitySegment2a.map((option, index) => (
                      <Picker.Item
                        key={index}
                        label={option}
                        value={option}
                        color={c.text}
                        style={{ fontSize: 14 }}
                      />
                    ))}
                  </Picker>
                </View>
              )}

              {scannerState.segment === 1 && (
                <View style={dynamicStyles.pickerContainer}>
                  <Picker
                    selectedValue={
                      scannerState.segment2a && scannerState.segment2a[0]
                    }
                    onValueChange={(value) => setSegment2a([value])}
                    enabled={!isDisabled}
                    style={dynamicStyles.picker}
                    dropdownIconColor={c.textMuted}
                  >
                    {indexSegment2a.map((option, index) => (
                      <Picker.Item
                        key={index}
                        label={option}
                        value={option}
                        color={c.text}
                        style={{ fontSize: 14 }}
                      />
                    ))}
                  </Picker>
                </View>
              )}

              {scannerState.segment === 2 && (
                <OptionsAdvanced
                  expiryOptions={expiryOptions}
                  preLoadedState={scannerState.segment2a}
                  handleChange={handleChange}
                  disabled={isDisabled}
                />
              )}

              {scannerState.segment === 3 && (
                <View style={dynamicStyles.pickerContainer}>
                  <Picker
                    selectedValue={
                      scannerState.segment2a && scannerState.segment2a[0]
                    }
                    onValueChange={(value) => setSegment2a([value])}
                    enabled={!isDisabled}
                    style={dynamicStyles.picker}
                    dropdownIconColor={c.textMuted}
                  >
                    {futureSegment2a.map((option, index) => (
                      <Picker.Item
                        key={index}
                        label={option}
                        value={option}
                        color={c.text}
                        style={{ fontSize: 14 }}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

            {/* Time Inputs */}
            <View style={dynamicStyles.row}>
              {/* Start Time */}
              <View style={dynamicStyles.halfColumn}>
                <Text style={dynamicStyles.label}>Start time</Text>
                <TouchableOpacity
                  style={dynamicStyles.timeButton}
                  onPress={() => !isDisabled && setShowStartTimePicker(true)}
                  disabled={isDisabled}
                >
                  <View style={dynamicStyles.timeButtonContent}>
                    <Text style={dynamicStyles.timeButtonText}>
                      {formatTime12Hour(scannerState.starttime)}
                    </Text>
                    <Text style={dynamicStyles.timeButtonIcon}>🕐</Text>
                  </View>
                </TouchableOpacity>

                {showStartTimePicker && (
                  <DateTimePicker
                    value={timeStringToDate(scannerState.starttime)}
                    mode="time"
                    is24Hour={false} // ← Changed to false for 12-hour format
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowStartTimePicker(Platform.OS === "ios");
                      if (selectedDate) {
                        handleChange({
                          target: {
                            name: "starttime",
                            value: dateToTimeString(selectedDate),
                          },
                        });
                      }
                    }}
                  />
                )}
              </View>

              {/* End Time */}
              <View style={dynamicStyles.halfColumn}>
                <Text style={dynamicStyles.label}>End time</Text>
                <TouchableOpacity
                  style={dynamicStyles.timeButton}
                  onPress={() => !isDisabled && setShowEndTimePicker(true)}
                  disabled={isDisabled}
                >
                  <View style={dynamicStyles.timeButtonContent}>
                    <Text style={dynamicStyles.timeButtonText}>
                      {formatTime12Hour(scannerState.endtime)}
                    </Text>
                    <Text style={dynamicStyles.timeButtonIcon}>🕐</Text>
                  </View>
                </TouchableOpacity>

                {showEndTimePicker && (
                  <DateTimePicker
                    value={timeStringToDate(scannerState.endtime)}
                    mode="time"
                    is24Hour={false} // ← Changed to false for 12-hour format
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowEndTimePicker(Platform.OS === "ios");
                      if (selectedDate) {
                        handleChange({
                          target: {
                            name: "endtime",
                            value: dateToTimeString(selectedDate),
                          },
                        });
                      }
                    }}
                  />
                )}
              </View>
            </View>

            {/* Timeframe & Other */}
            <View style={dynamicStyles.row}>
              {/* Timeframe */}
              <View style={dynamicStyles.halfColumn}>
                <View style={dynamicStyles.labelWithIcon}>
                  <Text style={dynamicStyles.label}>Timeframe</Text>
                  <View style={dynamicStyles.infoIcon}>
                    <Text style={dynamicStyles.infoIconText}>i</Text>
                  </View>
                </View>
                <View style={dynamicStyles.pickerContainer}>
                  <Picker
                    selectedValue={scannerState.timeframe}
                    onValueChange={(value) =>
                      handleChange({
                        target: { name: "timeframe", value },
                      })
                    }
                    style={dynamicStyles.picker}
                    dropdownIconColor={c.textMuted}
                  >
                    {scannerGlobalTimeframes.map((option, index) => (
                      <Picker.Item
                        key={index}
                        label={option}
                        value={option}
                        color={c.text}
                        style={{ fontSize: 14 }}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Other (Satisfy/Not Satisfy) */}
              <View style={dynamicStyles.halfColumn}>
                <Text style={dynamicStyles.label}>Other</Text>
                <View style={dynamicStyles.radioGroup}>
                  <TouchableOpacity
                    style={dynamicStyles.radioOption}
                    onPress={() =>
                      handleChange({
                        target: { name: "satisfy", value: true },
                      })
                    }
                  >
                    <View
                      style={[
                        dynamicStyles.radioCircle,
                        scannerState.satisfy &&
                          dynamicStyles.radioCircleSelected,
                      ]}
                    >
                      {scannerState.satisfy && (
                        <View style={dynamicStyles.radioDot} />
                      )}
                    </View>
                    <Text style={dynamicStyles.radioLabel}>Satisfy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={dynamicStyles.radioOption}
                    onPress={() =>
                      handleChange({
                        target: { name: "satisfy", value: false },
                      })
                    }
                  >
                    <View
                      style={[
                        dynamicStyles.radioCircle,
                        !scannerState.satisfy &&
                          dynamicStyles.radioCircleSelected,
                      ]}
                    >
                      {!scannerState.satisfy && (
                        <View style={dynamicStyles.radioDot} />
                      )}
                    </View>
                    <Text style={dynamicStyles.radioLabel}>Not satisfy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Show Latest Results Toggle */}
            {!entryexit && type === "scanner" && (
              <View style={dynamicStyles.toggleRow}>
                <Text style={dynamicStyles.label}>Show latest results</Text>
                <Switch
                  value={scannerState.showLatestRes}
                  onValueChange={(value) =>
                    handleChange({
                      target: { name: "showLatestRes", checked: value },
                    })
                  }
                  trackColor={{
                    false: isDark ? "#4B5563" : "#D1D5DB",
                    true: isDark ? c.goldBright : c.gold,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}; 

const styles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: c.text,
      marginBottom: 16,
    },
    scrollView: {
      flex: 1,
    },
    formContainer: {
      gap: 16,
    },
    formGroup: {
      marginBottom: 16,
    },
    row: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    halfColumn: {
      flex: 1,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: c.textSecondary,
      marginBottom: 8,
    },
    labelWithIcon: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    infoIcon: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: isDark ? c.goldMuted : c.primaryMuted,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 6,
    },
    infoIconText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "600",
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: 8,
      backgroundColor: c.inputBg,
      overflow: "hidden",
    },
    picker: {
      paddingVertical: -6,
      color: c.text,
    },
    timeButton: {
      height: 48,
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: 8,
      backgroundColor: c.inputBg,
      justifyContent: "center",
      paddingHorizontal: 12,
    },
    timeButtonContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    timeButtonText: {
      fontSize: 14,
      color: c.text,
      fontWeight: "500",
    },
    timeButtonIcon: {
      fontSize: 16,
    },
    radioGroup: {
      gap: 12,
    },
    radioOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
    },
    radioCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: c.border,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    radioCircleSelected: {
      borderColor: isDark ? c.goldBright : c.gold,
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: isDark ? c.goldBright : c.gold,
    },
    radioLabel: {
      fontSize: 14,
      color: c.textSecondary,
    },
    toggleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 8,
    },
  });

export default ScannerFilters;
