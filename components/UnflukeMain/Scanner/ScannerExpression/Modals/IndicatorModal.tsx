// import React, { useEffect, useState } from 'react'
// import { Button, Col, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
// import { addSuffixToNumber, deepCopy, fundamentalYears, indicatorTimeframes, offset1s, offset2s, ohlc } from '../../../Utils/common_vars';
// import { ToastContainer, toast } from 'react-toastify';
// import axios from 'axios';

// const IndicatorModal = ({closeModal, settings, type}) => {

//     const [customOffset1s, setCustomOffset1s] = useState([])
//     const [customOffset2s, setCustomOffset2s] = useState([])

//     const defaultSettings = {
//         timeframe: settings.type === "fundamental" ? "yearly" : type === "fundamental" ? "daily" : "1-min",
//         offset: "latest-candle",
//         offset2: "all-candles",
//     }

//     const [newSettings, setSettings] = useState(settings)

//     const showErrorToast = (message) => toast(message, { position: "bottom-center", hideProgressBar: true, closeOnClick: false, className: 'bg-danger text-white' });

//     function handleChange(e) {
//         const dataset = e.target.dataset
//         const value = e.target.value
//         const settingName = dataset.setting

//         const tmp = JSON.parse(JSON.stringify(newSettings))

//         tmp[settingName] = value

//         setSettings(tmp)
//     }

//     function handleAdvSettingsChange(e) {
//         const dataset = e.target.dataset
//         const value = e.target.value
//         const settingName = dataset.setting

//         const tmp = JSON.parse(JSON.stringify(newSettings))

//         if(!tmp["settings"]) tmp["settings"] = []

//         for(let index in tmp["settings"]){
//             const setting = tmp["settings"][index]

//             if(setting.name === settingName){
//                 const newObj = {
//                     ...setting,
//                     name: setting.name,
//                     value: value,
//                 }

//                 const datatype = setting.datatype ? setting.datatype : "string"
//                 if(datatype === "number" && (isNaN(value) || value == "e")){
//                     continue
//                 }

//                 tmp["settings"][index] = newObj
//                 setSettings(tmp)
//                 return
//             }
//         }

//         const newObj = {
//             name: settingName,
//             value: value
//         }

//         tmp["settings"].push(newObj)
//         setSettings(tmp)
//     }

//     function getAdvSettingsValue(settingName) {
//         const tmp = newSettings

//         for(let index in tmp["settings"]){
//             const setting = tmp["settings"][index]

//             if(setting.name === settingName){
//                 return setting.value
//             }
//         }

//         return defaultSettings[settingName]
//     }

//     const handleDependentChange = (name, value) => {
//         handleChange({
//             target: {
//                 dataset: {
//                     setting: name
//                 },
//                 value: value
//             }
//         })
//     }

//     const searchObjArray = (arr, searchStr) => {
//         for(let row of arr){
//             if(row.value === searchStr) return true
//         }

//         return false
//     }

//     const handleSubmit = () => {
//         if (getAdvSettingsValue('Length') === "")
//         {
//             showErrorToast('Fields cannot be empty.')
//             return
//         }

//         closeModal({
//             indicatorName: newSettings.indicatorName,
//             timeframe: newSettings.timeframe ? newSettings.timeframe : defaultSettings.timeframe,
//             offset: newSettings.offset ? newSettings.offset : defaultSettings.offset,
//             offset2: newSettings.offset2 ? newSettings.offset2 : defaultSettings.offset2,
//             type: newSettings.type ? newSettings.type : settings.type,
//             collection: newSettings.collection ? newSettings.collection : null,
//             sources: settings.sources ? settings.sources : null,
//             quarteryear: newSettings.quarteryear ? newSettings.quarteryear : null,
//             settings: newSettings.settings,
//         })
//     }

//     useEffect(()=>{
//         if (settings.offset && !searchObjArray(offset1s, settings.offset)){
//             const tmp = deepCopy(customOffset1s)
//             tmp.push({
//                 value: settings.offset,
//                 label: settings.offset.split("-")[0]+" candle/s ago"
//             })
//             setCustomOffset1s(tmp)
//         }

//         if (settings.offset2)
//         {

//             const tmp = deepCopy(customOffset2s)

//             let label = ""
//             const split = settings.offset2.split("-")

//             const num = addSuffixToNumber(split[0])

//             if(split[1] === "todays"){
//                 label = "Todays "+num+" candle"
//                 if (searchObjArray(offset2s["todays"], settings.offset2)) return
//             }else if(split[1] === "yester"){
//                 label = "Yesterdays "+num+" candle"
//                 if (searchObjArray(offset2s["yesterdays"], settings.offset2)) return
//             }

//             if(label === "") return

//             tmp.push({
//                 value: settings.offset2,
//                 label: label
//             })

//             setCustomOffset2s(tmp)
//         }
//     }, [])

//     useEffect(()=>{

//         if(newSettings.offset === "custom-candle"){
//             const customCandle = prompt("Enter a number", 5)
//             const newVal = customCandle+"-candle"

//             if (!searchObjArray(offset1s, newVal)){
//                 const tmp = deepCopy(customOffset1s)
//                 tmp.push({
//                     value: newVal,
//                     label: customCandle+" candle/s ago"
//                 })
//                 setCustomOffset1s(tmp)
//             } 

//             handleDependentChange("offset", newVal)
            
//         }else if(newSettings.offset2 === "custom-todays-candle"){
//             const customCandle = prompt("Enter a number", 5)
//             const newVal = customCandle+"-todays-candle"

//             if (!searchObjArray(offset2s["todays"], newVal)){
//                 const tmp = deepCopy(customOffset2s)
//                 tmp.push({
//                     value: newVal,
//                     label: "Todays "+addSuffixToNumber(customCandle)+" candle"
//                 })
//                 setCustomOffset2s(tmp)
//             } 

//             handleDependentChange("offset2", newVal)
//         }else if(newSettings.offset2 === "custom-yester-candle"){
//             const customCandle = prompt("Enter a number", 5)
//             const newVal = customCandle+"-yester-candle"

//             if (!searchObjArray(offset2s["yesterdays"], newVal)){
//                 const tmp = deepCopy(customOffset2s)
//                 tmp.push({
//                     value: newVal,
//                     label: "Yesterdays "+addSuffixToNumber(customCandle)+" candle"
//                 })
//                 setCustomOffset2s(tmp)
//             } 

//             handleDependentChange("offset2", newVal)
//         }
//     }, [newSettings])

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
//                 {newSettings.indicatorName}
//             </ModalHeader>
//             <ModalBody>
//                 <form action="#">
//                     <div className="row g-3">
//                         {
//                         type !== "fundamental" && 
//                             <Col>
//                                 <Label htmlFor='timeframe-indicator'>Timeframe</Label>
//                                 <select className="form-select" id='timeframe-indicator'
//                                 data-setting={"timeframe"}
//                                 disabled={settings && settings.type === "fundamental"}
//                                 value={newSettings.timeframe ? newSettings.timeframe : defaultSettings.timeframe} 
//                                 onChange={handleChange}>
//                                     {
//                                         indicatorTimeframes.map((timeframe, i)=>
//                                             <option value={timeframe.value} key={i}>{timeframe.label}</option>
//                                         )
//                                     }
//                                     {(settings && settings.type === "fundamental") && <option value={"yearly"}>Yearly</option>}
//                                 </select>
//                             </Col>
//                         }
//                         {(type !== "fundamental" && !newSettings.indicatorName.startsWith("CDL")) && 
//                         <>
//                             <Col>
//                                 <Label htmlFor='offset1'>Offset 1</Label>
//                                 <select className="form-select" id='offset1'
//                                 data-setting={"offset"}
//                                 value={newSettings.offset ? newSettings.offset : defaultSettings.offset} 
//                                 onChange={handleChange}>
//                                     {
//                                         type !== "fundamental" ? 
//                                         offset1s.map((offset, i)=>
//                                             <option value={offset.value} key={i}>{offset.label}</option>
//                                         )
//                                         :
//                                         offset1s.slice(0, 2).map((offset, i)=>
//                                             <option value={offset.value} key={i}>{offset.label}</option>
//                                         )
//                                     }
//                                     {
//                                     type !== "fundamental" &&
//                                     <>
//                                         <option value="custom-candle">Custom candle/s ago</option>
//                                         {
//                                             customOffset1s.map((offset, i)=>
//                                                 <option value={offset.value} key={i}>{offset.label}</option>
//                                             )
//                                         }
//                                     </>
//                                     }
//                                 </select>
//                             </Col>
                            
//                             <Col>
//                                 <Label htmlFor='offset2'>Offset 2</Label>
//                                 <select className="form-select" id='offset2'
//                                 data-setting={"offset2"}
//                                 value={newSettings.offset2 ? newSettings.offset2 : defaultSettings.offset2} 
//                                 onChange={handleChange}>
//                                     {
//                                         offset2s["todays"].map((offset, i)=>
//                                             <option value={offset.value} key={i}>{offset.label}</option>
//                                         )
//                                     }
//                                     <option value="custom-todays-candle">Todays Custom Candle</option>
//                                     {
//                                         offset2s["yesterdays"].map((offset, i)=>
//                                             <option value={offset.value} key={i}>{offset.label}</option>
//                                         )
//                                     }
//                                     <option value="custom-yester-candle">Yesterdays custom candle</option>
//                                     {
//                                         customOffset2s.map((offset, i)=>
//                                             <option value={offset.value} key={i}>{offset.label}</option>
//                                         )
//                                     }
//                                 </select>
//                             </Col>
//                         </>
//                         }

//                         {
//                             settings && settings["settings"] &&
//                             <>
//                                 {
//                                     settings["settings"].map((setting)=>
//                                         <Col lg={12}>
//                                             <Label htmlFor={setting.name}>{setting.name}</Label>
//                                             {setting.options ? 
//                                                 <select className="form-select" id={setting.name}
//                                                     value={getAdvSettingsValue(setting.name)}
//                                                     data-setting={setting.name}
//                                                     onChange={handleAdvSettingsChange}>
//                                                         {
//                                                             setting.options.map((option, i)=>
//                                                                 <option value={
//                                                                     typeof option === "object" ? option.value : option
//                                                                 } key={i}>{
//                                                                     typeof option === "object" ? option.name : option
//                                                                 }</option>
//                                                             )
//                                                         }
//                                                 </select>
//                                             :
//                                                 <Input type='text' id={setting.name}
//                                                     value={getAdvSettingsValue(setting.name)}
//                                                     data-setting={setting.name}
//                                                     onChange={handleAdvSettingsChange} />
//                                             }
//                                         </Col>
//                                     )
//                                 }
//                             </>
//                         }

//                         <Col lg={12}>
//                             <div className="hstack gap-2 justify-content-end">
//                                 <Button color="primary" onClick={handleSubmit}>Submit</Button>
//                             </div>
//                         </Col>
//                     </div>
//                 </form>
//             </ModalBody>

//             <ToastContainer />
//         </Modal>
//     )
// }

// export default IndicatorModal





import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import {
  addSuffixToNumber,
  deepCopy,
  fundamentalYears,
  indicatorTimeframes,
  offset1s,
  offset2s,
  ohlc,
} from "../../../Utils/common_vars";

const IndicatorModal = ({ closeModal, settings, type }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dynamicStyles = styles(isDark);

  const [customOffset1s, setCustomOffset1s] = useState([]);
  const [customOffset2s, setCustomOffset2s] = useState([]);

  const defaultSettings = {
    timeframe:
      settings.type === "fundamental"
        ? "yearly"
        : type === "fundamental"
        ? "daily"
        : "1-min",
    offset: "latest-candle",
    offset2: "all-candles",
  };

  const [newSettings, setSettings] = useState(settings);

  const showErrorToast = (message) => {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: message,
      position: "bottom",
    });
  };

  function handleChange(settingName, value) {
    const tmp = JSON.parse(JSON.stringify(newSettings));
    tmp[settingName] = value;
    setSettings(tmp);
  }

  function handleAdvSettingsChange(settingName, value, datatype = "string") {
    const tmp = JSON.parse(JSON.stringify(newSettings));

    if (!tmp["settings"]) tmp["settings"] = [];

    for (let index in tmp["settings"]) {
      const setting = tmp["settings"][index];

      if (setting.name === settingName) {
        if (datatype === "number" && (isNaN(value) || value === "e")) {
          return;
        }

        const newObj = {
          ...setting,
          name: setting.name,
          value: value,
        };

        tmp["settings"][index] = newObj;
        setSettings(tmp);
        return;
      }
    }

    const newObj = {
      name: settingName,
      value: value,
    };

    tmp["settings"].push(newObj);
    setSettings(tmp);
  }

  function getAdvSettingsValue(settingName) {
    const tmp = newSettings;

    for (let index in tmp["settings"]) {
      const setting = tmp["settings"][index];

      if (setting.name === settingName) {
        return setting.value;
      }
    }

    return defaultSettings[settingName];
  }

  const searchObjArray = (arr, searchStr) => {
    for (let row of arr) {
      if (row.value === searchStr) return true;
    }
    return false;
  };

  const handleCustomOffset = (offsetType) => {
    Alert.prompt(
      "Enter Custom Value",
      "Enter a number:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: (customCandle) => {
            if (!customCandle || isNaN(customCandle)) {
              Alert.alert("Error", "Please enter a valid number");
              return;
            }

            let newVal, label, tmp;

            if (offsetType === "offset1") {
              newVal = customCandle + "-candle";
              label = customCandle + " candle/s ago";

              if (!searchObjArray(offset1s, newVal)) {
                tmp = deepCopy(customOffset1s);
                tmp.push({ value: newVal, label: label });
                setCustomOffset1s(tmp);
              }

              handleChange("offset", newVal);
            } else if (offsetType === "offset2-todays") {
              newVal = customCandle + "-todays-candle";
              label = "Todays " + addSuffixToNumber(customCandle) + " candle";

              if (!searchObjArray(offset2s["todays"], newVal)) {
                tmp = deepCopy(customOffset2s);
                tmp.push({ value: newVal, label: label });
                setCustomOffset2s(tmp);
              }

              handleChange("offset2", newVal);
            } else if (offsetType === "offset2-yester") {
              newVal = customCandle + "-yester-candle";
              label =
                "Yesterdays " + addSuffixToNumber(customCandle) + " candle";

              if (!searchObjArray(offset2s["yesterdays"], newVal)) {
                tmp = deepCopy(customOffset2s);
                tmp.push({ value: newVal, label: label });
                setCustomOffset2s(tmp);
              }

              handleChange("offset2", newVal);
            }
          },
        },
      ],
      "plain-text",
      "5"
    );
  };

  const handleSubmit = () => {
    if (getAdvSettingsValue("Length") === "") {
      showErrorToast("Fields cannot be empty.");
      return;
    }

    closeModal({
      indicatorName: newSettings.indicatorName,
      timeframe: newSettings.timeframe
        ? newSettings.timeframe
        : defaultSettings.timeframe,
      offset: newSettings.offset ? newSettings.offset : defaultSettings.offset,
      offset2: newSettings.offset2
        ? newSettings.offset2
        : defaultSettings.offset2,
      type: newSettings.type ? newSettings.type : settings.type,
      collection: newSettings.collection ? newSettings.collection : null,
      sources: settings.sources ? settings.sources : null,
      quarteryear: newSettings.quarteryear ? newSettings.quarteryear : null,
      settings: newSettings.settings,
    });
  };

  // Initialize custom offsets
  useEffect(() => {
    if (settings.offset && !searchObjArray(offset1s, settings.offset)) {
      const tmp = deepCopy(customOffset1s);
      tmp.push({
        value: settings.offset,
        label: settings.offset.split("-")[0] + " candle/s ago",
      });
      setCustomOffset1s(tmp);
    }

    if (settings.offset2) {
      const tmp = deepCopy(customOffset2s);
      let label = "";
      const split = settings.offset2.split("-");
      const num = addSuffixToNumber(split[0]);

      if (split[1] === "todays") {
        label = "Todays " + num + " candle";
        if (searchObjArray(offset2s["todays"], settings.offset2)) return;
      } else if (split[1] === "yester") {
        label = "Yesterdays " + num + " candle";
        if (searchObjArray(offset2s["yesterdays"], settings.offset2)) return;
      }

      if (label === "") return;

      tmp.push({
        value: settings.offset2,
        label: label,
      });

      setCustomOffset2s(tmp);
    }
  }, []);

  // Handle offset changes that trigger prompts
  useEffect(() => {
    if (newSettings.offset === "custom-candle") {
      handleCustomOffset("offset1");
    } else if (newSettings.offset2 === "custom-todays-candle") {
      handleCustomOffset("offset2-todays");
    } else if (newSettings.offset2 === "custom-yester-candle") {
      handleCustomOffset("offset2-yester");
    }
  }, [newSettings.offset, newSettings.offset2]);

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={() => closeModal()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={dynamicStyles.overlay}
      >
        <View style={dynamicStyles.modalContainer}>
          {/* Header */}
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.title}>
              {newSettings.indicatorName}
            </Text>
            <TouchableOpacity onPress={() => closeModal()}>
              <Text style={dynamicStyles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={dynamicStyles.body} showsVerticalScrollIndicator={true}>
            {/* Timeframe */}
            {type !== "fundamental" && (
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Timeframe</Text>
                <View style={dynamicStyles.pickerContainer}>
                  <Picker
                    selectedValue={
                      newSettings.timeframe
                        ? newSettings.timeframe
                        : defaultSettings.timeframe
                    }
                    onValueChange={(value) => handleChange("timeframe", value)}
                    enabled={!(settings && settings.type === "fundamental")}
                    style={dynamicStyles.picker}
                    dropdownIconColor={isDark ? "#9CA3AF" : "#6B7280"}
                  >
                    {indicatorTimeframes.map((timeframe, i) => (
                      <Picker.Item
                        key={i}
                        label={timeframe.label}
                        value={timeframe.value}
                        color={isDark ? "#FFFFFF" : "#111827"}
                      />
                    ))}
                    {settings && settings.type === "fundamental" && (
                      <Picker.Item
                        label="Yearly"
                        value="yearly"
                        color={isDark ? "#FFFFFF" : "#111827"}
                      />
                    )}
                  </Picker>
                </View>
              </View>
            )}

            {/* Offset 1 */}
            {type !== "fundamental" &&
              !newSettings.indicatorName.startsWith("CDL") && (
                <>
                  <View style={dynamicStyles.formGroup}>
                    <Text style={dynamicStyles.label}>Offset 1</Text>
                    <View style={dynamicStyles.pickerContainer}>
                      <Picker
                        selectedValue={
                          newSettings.offset
                            ? newSettings.offset
                            : defaultSettings.offset
                        }
                        onValueChange={(value) => handleChange("offset", value)}
                        style={dynamicStyles.picker}
                        dropdownIconColor={isDark ? "#9CA3AF" : "#6B7280"}
                      >
                        {(type !== "fundamental"
                          ? offset1s
                          : offset1s.slice(0, 2)
                        ).map((offset, i) => (
                          <Picker.Item
                            key={i}
                            label={offset.label}
                            value={offset.value}
                            color={isDark ? "#FFFFFF" : "#111827"}
                          />
                        ))}
                        {type !== "fundamental" && (
                          <>
                            <Picker.Item
                              label="Custom candle/s ago"
                              value="custom-candle"
                              color={isDark ? "#FFFFFF" : "#111827"}
                            />
                            {customOffset1s.map((offset, i) => (
                              <Picker.Item
                                key={`custom1-${i}`}
                                label={offset.label}
                                value={offset.value}
                                color={isDark ? "#FFFFFF" : "#111827"}
                              />
                            ))}
                          </>
                        )}
                      </Picker>
                    </View>
                  </View>

                  {/* Offset 2 */}
                  <View style={dynamicStyles.formGroup}>
                    <Text style={dynamicStyles.label}>Offset 2</Text>
                    <View style={dynamicStyles.pickerContainer}>
                      <Picker
                        selectedValue={
                          newSettings.offset2
                            ? newSettings.offset2
                            : defaultSettings.offset2
                        }
                        onValueChange={(value) =>
                          handleChange("offset2", value)
                        }
                        style={dynamicStyles.picker}
                        dropdownIconColor={isDark ? "#9CA3AF" : "#6B7280"}
                      >
                        {offset2s["todays"].map((offset, i) => (
                          <Picker.Item
                            key={i}
                            label={offset.label}
                            value={offset.value}
                            color={isDark ? "#FFFFFF" : "#111827"}
                          />
                        ))}
                        <Picker.Item
                          label="Todays Custom Candle"
                          value="custom-todays-candle"
                          color={isDark ? "#FFFFFF" : "#111827"}
                        />
                        {offset2s["yesterdays"].map((offset, i) => (
                          <Picker.Item
                            key={i}
                            label={offset.label}
                            value={offset.value}
                            color={isDark ? "#FFFFFF" : "#111827"}
                          />
                        ))}
                        <Picker.Item
                          label="Yesterdays custom candle"
                          value="custom-yester-candle"
                          color={isDark ? "#FFFFFF" : "#111827"}
                        />
                        {customOffset2s.map((offset, i) => (
                          <Picker.Item
                            key={`custom2-${i}`}
                            label={offset.label}
                            value={offset.value}
                            color={isDark ? "#FFFFFF" : "#111827"}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </>
              )}

            {/* Advanced Settings */}
            {settings &&
              settings["settings"] &&
              settings["settings"].map((setting, index) => (
                <View key={index} style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.label}>{setting.name}</Text>
                  {setting.options ? (
                    <View style={dynamicStyles.pickerContainer}>
                      <Picker
                        selectedValue={getAdvSettingsValue(setting.name)}
                        onValueChange={(value) =>
                          handleAdvSettingsChange(
                            setting.name,
                            value,
                            setting.datatype
                          )
                        }
                        style={dynamicStyles.picker}
                        dropdownIconColor={isDark ? "#9CA3AF" : "#6B7280"}
                      >
                        {setting.options.map((option, i) => (
                          <Picker.Item
                            key={i}
                            label={
                              typeof option === "object"
                                ? option.name
                                : option
                            }
                            value={
                              typeof option === "object"
                                ? option.value
                                : option
                            }
                            color={isDark ? "#FFFFFF" : "#111827"}
                          />
                        ))}
                      </Picker>
                    </View>
                  ) : (
                    <TextInput
                      style={dynamicStyles.input}
                      value={String(getAdvSettingsValue(setting.name))}
                      onChangeText={(value) =>
                        handleAdvSettingsChange(
                          setting.name,
                          value,
                          setting.datatype
                        )
                      }
                      keyboardType={
                        setting.datatype === "number" ? "numeric" : "default"
                      }
                      placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                    />
                  )}
                </View>
              ))}
          </ScrollView>

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
      width: "90%",
      maxWidth: 500,
      maxHeight: "85%",
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
      maxHeight: 500,
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
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 8,
      backgroundColor: isDark ? "#111827" : "#FFFFFF",
      overflow: "hidden",
    },
    picker: {
      height: 50,
      color: isDark ? "#FFFFFF" : "#111827",
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
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

export default IndicatorModal;