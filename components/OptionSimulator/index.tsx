import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StrategyChartInstruments } from '@/redux/Unfluke_slices/thunks';
// Import your custom components (you'll need to create React Native versions)
// import CustomExpirySelect from './customExpirySelect';
// import CustomSelect from '../StrategyCharts/CustomSelect';
import OptionChainTable from './OptionChainTable';
import StrategyPositions from './StrategyPositions';
import PreBuildStrategies from './PreBuildStrategies';
import { setLoading } from '@/redux/Unfluke_slices/strategyCharts/reducer';

// Import your API functions
import {
  getOptionChain,
  getSimulatorExpiries,
  getSpotFutureData,
} from '../../Unfluke_helpers/backend_helper';

import { CustomExpirySelect, CustomSelect } from './Selects';
import { createSelector } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { ChevronRight } from 'lucide-react-native';
import Toast from 'react-native-toast-message';


const data = createSelector(
  (state) => state.StrategyCharts,
  (data) => data.instrumentNames,
);

const OptionSimulator = () => {
const [user, setUser] = useState(null);
const { width } = useWindowDimensions();

  const dispatch = useDispatch()
  const [selectedInstrument, setSelectedInstrument] = useState({
    name: 'NIFTY',
    spotPrice: '-',
    futurePrice: '-',
    lotSize: '-',
    iv: '14.25',
    multiple: '-',
  });
  const [forceRefresh, setForceRefresh] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const [payOffDate, setPayOffDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(true);
  const [expiry, setExpiry] = useState(null);
  const [isTimeChanged, setIsTimeChanged] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [displayExpiry, setDisplayExpiry] = useState('');
  const [tableData, setTableData] = useState([]);
  const [price, setPrice] = useState(25000);
  const [positions, setPositions] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(moment().format('DD MMM YYYY hh:mm A'));
  
  // Date picker states
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isPayoffDatePickerVisible, setPayoffDatePickerVisibility] = useState(false);
  const [activePickerType, setActivePickerType] = useState(null);
  
  // Reset popup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingSelection, setPendingSelection] = useState(null);
  
  const instrumentList = useSelector(data);
  const [expiries, setExpiries] = useState([
    {
      options: [{ label: '', value: '' }],
    },
  ]);
  
  const [instruments, setInstruments] = useState(null);
  const [isSearchingData, setIsSearchingData] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const tempDateTimeRef = useRef(null);

  // Load user data from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('authUser');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUser();
  }, []);

  const errorNotify = (error) => {

    // Alert.alert('Error', error);

  };

  const handleGetOptionChain = async (customDateTime = null) => {
    if (!user || !expiry || !selectedInstrument.name) {
      errorNotify('Missing required data for option chain');
      return;
    }
    
    const dateTimeToUse = customDateTime || currentDateTime;
    
    setIsLoading(true);
    setIsTimeChanged(false); // Reset this flag
    
    try {
      const result = await getOptionChain({
        name: selectedInstrument.name,
        minute: dateTimeToUse,
        expiry: expiry.to_expiry,
        id: user._id,
      });

      if (result.length > 0) {
        setTableData(result);
        setDisplayName(selectedInstrument.name);
        setDisplayExpiry(expiry.to_expiry);
        setIsTimeChanged(true); // Set this after successful fetch
      } else {
        errorNotify('No option chain data found');
      }

      setIsLoading(false);
    } catch (error) {
      // console.error('Option chain fetch error:', error);
      errorNotify('Option Chain Data not found');
      setIsLoading(false);
    }
  };

  const disableWeekends = (date) => {
    return date.getDay() === 0 || date.getDay() === 6;
  };

  // Helper function to get safe date before expiry
  const getSafeDateBeforeExpiry = (targetDate, expiryDate) => {
    const targetMoment = moment(targetDate, 'DD MMM YYYY hh:mm A');
    const expiryMoment = moment(expiryDate, 'DDMMMYY');
    
    // If target date is after expiry, set it to one day before expiry
    if (targetMoment.isAfter(expiryMoment)) {
      const safeMoment = expiryMoment.clone().subtract(1, 'day');
      // Skip weekends
      while (safeMoment.day() === 0 || safeMoment.day() === 6) {
        safeMoment.subtract(1, 'day');
      }
      return safeMoment.set({ hour: 9, minute: 20, second: 0 });
    }
    
    return targetMoment;
  };

  const adjustTime = (minutes) => {
    if (!currentDateTime || currentDateTime === 'Invalid date' || !expiry?.to_expiry) return null;
    setIsTimeChanged(false);
    
    // Parse the date with the correct format
    const currentMoment = moment(currentDateTime, 'DD MMM YYYY hh:mm A');
    
    // Check if the parsed date is valid
    if (!currentMoment.isValid()) {
      console.error('Invalid date format:', currentDateTime);
      return;
    }
    
    let newDateTime;
    
    if (minutes < 0) {
      if (minutes === -1) {
        // Subtract 1 day
        newDateTime = currentMoment.subtract(1, 'day');
      } else {
        // For negative minutes, subtract them
        newDateTime = currentMoment.subtract(Math.abs(minutes), 'minutes');
      }
    } else {
      if (minutes === 1) {
        // Add 1 day
        newDateTime = currentMoment.add(1, 'day');
      } else {
        // Add minutes
        newDateTime = currentMoment.add(minutes, 'minutes');
      }
    }
    
    // Ensure the new date is before expiry
    const safeDateTime = getSafeDateBeforeExpiry(
      newDateTime.format('DD MMM YYYY hh:mm A'),
      expiry.to_expiry
    );
    
    const newDateTimeString = safeDateTime.format('DD MMM YYYY hh:mm A');
    setCurrentDateTime(newDateTimeString);
    
    // Immediately fetch option chain for the new time using the new datetime directly
    setTimeout(() => {
      handleGetOptionChain(newDateTimeString);
    }, 100);
  };

  // Date picker handlers with collision prevention
  const handleStartDatePress = () => {
    if (activePickerType === 'payoff') return; // Prevent collision
    setActivePickerType('start');
    setStartDatePickerVisibility(true);
  };

  const handlePayoffDatePress = () => {
    if (activePickerType === 'start') return; // Prevent collision
    setActivePickerType('payoff');
    setPayoffDatePickerVisibility(true);
  };

  const handleStartDateConfirm = (date) => {
    // Ensure selected date is not a weekend
    const selectedMoment = moment(date);
    while (selectedMoment.day() === 0 || selectedMoment.day() === 6) {
      selectedMoment.add(1, 'day');
    }
    
    setStartDate(selectedMoment.toDate());
    setStartDatePickerVisibility(false);
    setActivePickerType(null);
  };

  const handleStartDateCancel = () => {
    setStartDatePickerVisibility(false);
    setActivePickerType(null);
  };

  const handlePayoffDateConfirm = (date) => {
    // Ensure selected date is not a weekend
    const selectedMoment = moment(date);
    while (selectedMoment.day() === 0 || selectedMoment.day() === 6) {
      selectedMoment.subtract(1, 'day');
    }
    
    setPayOffDate(selectedMoment.toDate());
    setPayoffDatePickerVisibility(false);
    setActivePickerType(null);
  };

  const handlePayoffDateCancel = () => {
    setPayoffDatePickerVisibility(false);
    setActivePickerType(null);
  };

  const getMinDate = () => {
    if (expiry?.from_expiry) {
      const fromDate = moment(expiry.from_expiry, 'DDMMMYY').toDate();
      return new Date(fromDate.setMonth(fromDate.getMonth() - 1));
    }
    return new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
  };

  const getMaxDate = () => {
    if (activePickerType === 'start') {
      return payOffDate;
    } else if (activePickerType === 'payoff') {
      if (expiry?.to_expiry) {
        return moment(expiry.to_expiry, 'DDMMMYY').toDate();
      }
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    }
    return new Date();
  };

  // Filter out weekends for date picker
  const filterWeekends = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
  };

  useEffect(() => {
    if (instrumentList.length > 0) {
      setInstruments([
        {
          options: instrumentList.map((item) => ({
            label: item,
            value: item,
          })),
        },
      ]);
    }
  }, [instrumentList]);

  useEffect(() => {
    if (expiry?.to_expiry) {
      // Ensure start date is before expiry and sync currentDateTime with startDate
      const safeStartDateTime = getSafeDateBeforeExpiry(
        moment(startDate).set({ hour: 9, minute: 20, second: 0 }).format('DD MMM YYYY hh:mm A'),
        expiry.to_expiry
      );
      
      // Update startDate to match the safe date
      const safeDateOnly = safeStartDateTime.clone().startOf('day').toDate();
      if (!moment(startDate).isSame(moment(safeDateOnly), 'day')) {
        setStartDate(safeDateOnly);
      }
      
      setCurrentDateTime(safeStartDateTime.format('DD MMM YYYY hh:mm A'));
    } else {
      const newDateTime = moment(startDate)
        .set({ hour: 9, minute: 20, second: 0 })
        .format('DD MMM YYYY hh:mm A');
      setCurrentDateTime(newDateTime);
    }
  }, [startDate, expiry?.to_expiry]);

  // Fetch expiries when instrument changes
  useEffect(() => {
    const fetchExpiries = async () => {
      if (!user || !selectedInstrument.name) return;
      
      try {
        const expiryResponse = await getSimulatorExpiries({
          params: {
            optionName: selectedInstrument.name,
            optionType: 'CE - Call',
            id: user._id,
          },
        });
        
        if (expiryResponse?.expiry_date) {
          const newExpiries = [
            {
              options: expiryResponse?.expiry_date.map((item) => ({
                label: item.to_expiry.split('-').join('').toUpperCase(),
                value: item,
              })),
            },
          ];
          setExpiries(newExpiries);
          
          // Set the first expiry as default
          if (newExpiries[0]?.options[0]?.value) {
            setExpiry(newExpiries[0].options[0].value);
          }
        }
      } catch (error) {
        errorNotify('Expiries not found');
      }
    };
    
    fetchExpiries();
  }, [selectedInstrument.name, user]);

  // Fetch spot/future data when currentDateTime, instrument, or expiry changes
  useEffect(() => {
    const fetchSpotFutureData = async (dateTime) => {
      if (!user || !selectedInstrument.name || !expiry?.to_expiry) return false;
      
      try {
        const data = await getSpotFutureData({
          name: selectedInstrument.name,
          minute: dateTime,
          expiry: expiry.to_expiry,
          id: user._id,
        });

        console.log("Stock Data",data)

        if (data) {
          setSelectedInstrument((prev) => ({
            ...prev,
            spotPrice: data.spotPrice ? data.spotPrice : '-',
            futurePrice: data.futPrice ? data.futPrice : '-',
            lotSize: data?.lotSize || '-',
            multiple: data?.multiple || '-',
          }));
          return true;
        }
        return false;
      } catch (error) {
        // Toast.show({
        //       type:"error",
        //       text1: `Error Fetching ${selectedInstrument.name} data`, 
        //       text2: "",
        //       position: "top",
        //       visibilityTime: 3000,
        //       autoHide: true,
        //     });
        return false;
      }
    };

    const tryNextValidDay = async () => {
      if (!currentDateTime || isSearchingData || !user || !expiry?.to_expiry) return;

      // Initialize temp date if not already set
      if (!tempDateTimeRef.current) {
        const currentMoment = moment(currentDateTime, 'DD MMM YYYY hh:mm A');
        const expiryMoment = moment(expiry.to_expiry, 'DDMMMYY');
        
        // If current date is after expiry, start from one day before expiry
        if (currentMoment.isAfter(expiryMoment)) {
          tempDateTimeRef.current = expiryMoment.clone().subtract(1, 'day');
          // Skip weekends
          while (tempDateTimeRef.current.day() === 0 || tempDateTimeRef.current.day() === 6) {
            tempDateTimeRef.current.subtract(1, 'day');
          }
          tempDateTimeRef.current.set({ hour: 9, minute: 20, second: 0 });
        } else {
          tempDateTimeRef.current = currentMoment.clone();
        }
      }

      setIsSearchingData(true);

      let dataFound = false;
      let attempts = 0;
      const maxAttempts = 10;
      const expiryMoment = moment(expiry.to_expiry, 'DDMMMYY');

      while (!dataFound && attempts < maxAttempts) {
        // Ensure we don't go beyond expiry date
        if (tempDateTimeRef.current.isAfter(expiryMoment)) {
          console.log('Reached expiry date, stopping search');
          break;
        }

        dataFound = await fetchSpotFutureData(
          tempDateTimeRef.current.format('DD MMM YYYY hh:mm A'),
        );

        if (!dataFound) {
          // Move to previous day to find data (going backwards from expiry)
          tempDateTimeRef.current.subtract(1, 'days');
          
          // Skip weekends when going backwards
          const dayOfWeek = tempDateTimeRef.current.day();
          if (dayOfWeek === 0) { // Sunday
            tempDateTimeRef.current.subtract(2, 'days'); // Go to Friday
          } else if (dayOfWeek === 6) { // Saturday
            tempDateTimeRef.current.subtract(1, 'days'); // Go to Friday
          }

          tempDateTimeRef.current.set({ hour: 9, minute: 20, second: 0 });
          
          // Additional safety check - don't go too far back
          const startMoment = moment(expiry.from_expiry, 'DDMMMYY');
          if (tempDateTimeRef.current.isBefore(startMoment)) {
            console.log('Reached start date limit, stopping search');
            break;
          }
        }
        attempts++;
      }

      if (dataFound) {
        const newDateTime = tempDateTimeRef.current.format('DD MMM YYYY hh:mm A');
        if (newDateTime !== currentDateTime) {
          setCurrentDateTime(newDateTime);
        }
        
        // Auto-fetch option chain on initial load
        if (isInitialLoad) {
          setIsInitialLoad(false);
          setTimeout(() => {
            handleGetOptionChain();
          }, 500);
        }
      } else {
        errorNotify('Data not found within valid date range');
      }

      tempDateTimeRef.current = null;
      setIsSearchingData(false);
    };

    if (expiry && selectedInstrument.name && !isSearchingData) {
      // Add a small delay to ensure state is properly set
      const timeoutId = setTimeout(() => {
        tryNextValidDay();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedInstrument.name, expiry?.to_expiry, user, startDate]); // Added startDate to dependencies

  // Set dates when expiry changes and ensure proper initialization
  useEffect(() => {
    if (expiry) {
      const fromDate = moment(expiry.from_expiry, 'DDMMMYY');
      const toDate = moment(expiry.to_expiry, 'DDMMMYY');
      
      // Ensure dates are not weekends
      while (fromDate.day() === 0 || fromDate.day() === 6) {
        fromDate.add(1, 'day');
      }
      while (toDate.day() === 0 || toDate.day() === 6) {
        toDate.subtract(1, 'day');
      }
      
      setStartDate(fromDate.toDate());
      setPayOffDate(toDate.toDate());
      
      // Set currentDateTime to startDate to ensure we start from there
      const startDateTime = fromDate.clone().set({ hour: 9, minute: 20, second: 0 });
      setCurrentDateTime(startDateTime.format('DD MMM YYYY hh:mm A'));
      
      // Reset initial load flag to trigger option chain fetch
      setIsInitialLoad(true);
    }
  }, [expiry]);

  const handleAddPosition = async (position) => {
    setPositions([...positions, position]);
  };

  const handleTogglePosition = (id) => {
    setPositions(
      positions.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)),
    );
  };

  const handleDeletePosition = (id) => {
    setPositions(positions.filter((p) => p.id !== id));
  };

  const handleEditPosition = (id) => {
    // Implementation for editing position
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPendingSelection(null);
  };

  const handleInstrumentChange = (value) => {
    const selectedOption = instruments[0].options.find(opt => opt.value === value);
    if (selectedOption && selectedOption.value !== selectedInstrument.name) {
      setPendingSelection(selectedOption);
      setIsModalOpen(true);
    }
  };

  // Update the modal reset handler
  const handleModalReset = () => {
    if (pendingSelection) {
      // Reset all related state
      setSelectedInstrument((prev) => ({
        ...prev,
        name: pendingSelection.value,
        spotPrice: '-',
        futurePrice: '-',
        lotSize: '-',
        multiple: '-',
      }));
      setPositions([]);
      setTableData([]);
      setIsTimeChanged(false);
      setDisplayName('');
      setDisplayExpiry('');
      setIsInitialLoad(true); // Reset initial load flag
      
      // This will trigger the useEffect to fetch new expiries
    }
    handleModalClose();
  };

  const renderTimeAdjustButton = (label, minutes, color) => {
    // Check if the adjustment would go beyond expiry
    const wouldExceedExpiry = () => {
      if (!expiry?.to_expiry || !currentDateTime) return false;
      
      const currentMoment = moment(currentDateTime, 'DD MMM YYYY hh:mm A');
      const expiryMoment = moment(expiry.to_expiry, 'DDMMMYY');
      
      let adjustedMoment;
      if (minutes < 0) {
        if (minutes === -1) {
          adjustedMoment = currentMoment.clone().subtract(1, 'day');
        } else {
          adjustedMoment = currentMoment.clone().subtract(Math.abs(minutes), 'minutes');
        }
      } else {
        if (minutes === 1) {
          adjustedMoment = currentMoment.clone().add(1, 'day');
        } else {
          adjustedMoment = currentMoment.clone().add(minutes, 'minutes');
        }
      }
      
      return adjustedMoment.isAfter(expiryMoment);
    };

    const isDisabled = wouldExceedExpiry();
    
    // useEffect(()=>{
    //   if(instrumentList.length ===0){
    //     setIsLoading(true);
    //     dispatch(StrategyChartInstruments())
    //   }
    // },
    // [dispatch])
    
    return (
      <TouchableOpacity
        style={[
          styles.timeButton, 
          { backgroundColor: isDisabled ? '#9ca3af' : color }
        ]}
        onPress={() => !isDisabled && adjustTime(minutes)}
        disabled={isDisabled}
      >
        <Text style={styles.timeButtonText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderInfoCard = (label, value) => (
    <View style={[styles.infoCard,{    minWidth: (width - 44) / 2, 
}]}>
      <Text style={styles.infoCardLabel}>{label}</Text>
      <Text style={styles.infoCardValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.headerCont}>
          <Text style={styles.title}>Option Simulator</Text>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>Pages</Text>
                        <ChevronRight size={13} color="#6B7280" />
            <Text style={styles.breadcrumbText}>Simulator</Text>
          </View>
        </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCardsContainer}>
          {renderInfoCard('Spot Price', selectedInstrument.spotPrice)}
          {renderInfoCard('Futures Price', selectedInstrument.futurePrice)}
          {renderInfoCard('Lot Size', selectedInstrument.lotSize)}
          {renderInfoCard('IV', selectedInstrument.iv)}
        </View>

       {instruments?.length > 0 && expiries?.length > 0 ? (
  <View style={styles.selectionContainer}>
    <Text style={styles.sectionTitle}>Select Index/Stock</Text>
    
    {/* Row 1 - Instrument + Expiry */}
    <View style={styles.selectionRow}>
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>Index / Stock</Text>
        <CustomSelect
          name="choices-instrument-default"
          options={instruments[0].options}
          selected={selectedInstrument?.name || ''}
          placeholder="Select instrument"
          onChange={handleInstrumentChange}
        />
      </View>

      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>Select Expiry</Text>
        <CustomExpirySelect
          name="choices-expiry-default"
          selected={expiry}
          onChange={(value) => setExpiry(value)}
          options={expiries[0]?.options || []}
          placeholder="Select Expiry"
        />
      </View>
    </View>

    {/* Row 2 - Dates */}
    <View style={styles.selectionRow}>
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>Start Date</Text>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={handleStartDatePress}
        >
          <Text style={styles.datePickerText}>
            {moment(startDate).format('DD MMM YYYY')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>Payoff Date</Text>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={handlePayoffDatePress}
        >
          <Text style={styles.datePickerText}>
            {moment(payOffDate).format('DD MMM YYYY')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>

    {/* Action Button */}
    <View style={styles.actionButtonContainer}>
      <TouchableOpacity
        style={[
          styles.actionButton,
          (new Date(currentDateTime).getDay() === 0 || 
           new Date(currentDateTime).getDay() === 6) && styles.disabledButton
        ]}
        onPress={() => {
          setForceRefresh(prev => prev + 1); // Force a refresh
          handleGetOptionChain();
        }}
        disabled={
          new Date(currentDateTime).getDay() === 0 ||
          new Date(currentDateTime).getDay() === 6 ||
          isLoading
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.actionButtonText}>Loading...</Text>
          </View>
        ) : (
          <Text style={styles.actionButtonText}>Get Option Chain →</Text>
        )}
      </TouchableOpacity>
    </View>
  </View>
) : (
  // Show loader while waiting for instruments/expiries
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#000" />
    <Text>Loading instruments & expiries...</Text>
  </View>
)}

        {currentDateTime !== 'Invalid date' && expiry ? (
          <PreBuildStrategies
            setPositions={setPositions}
            positions={positions}
            optionChain={tableData}
            getOptionChain={handleGetOptionChain}
            selectedInstrument={selectedInstrument}
            selectedExpiry={expiry?.to_expiry}
            expiry={expiries}
          />
        ):(
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center",height:400, borderRadius:8,backgroundColor:"#FFFFFF" }}>
            <ActivityIndicator size="large" color="#000" />
            <Text>Loading strategies...</Text>
          </View>
        )}

        <View style={styles.timeControlsContainer}>
          <View style={styles.timeControlsRow}>
            {renderTimeAdjustButton('-1 day', -1, '#ef4444')}
            {renderTimeAdjustButton('-30 min', -30, '#ef4444')}
            {renderTimeAdjustButton('-15 min', -15, '#ef4444')}
            {renderTimeAdjustButton('-5 min', -5, '#ef4444')}
          </View>

          <View style={styles.currentTimeContainer}>
            <TouchableOpacity style={styles.currentTimeButton}>
              <Text style={styles.currentTimeText}>{currentDateTime}</Text>
            </TouchableOpacity>
            
            {/* Show expiry warning if close to expiry */}
            {expiry?.to_expiry && (
              <Text style={styles.expiryWarning}>
                Expiry: {moment(expiry.to_expiry, 'DDMMMYY').format('DD MMM YYYY')}
              </Text>
            )}
          </View>

          <View style={styles.timeControlsRow}>
            {renderTimeAdjustButton('+5 min', 5, '#16a34a')}
            {renderTimeAdjustButton('+15 min', 15, '#16a34a')}
            {renderTimeAdjustButton('+30 min', 30, '#16a34a')}
            {renderTimeAdjustButton('+1 day', 1, '#16a34a')}
          </View>
        </View>

        {/* Strategy Positions */}
        <StrategyPositions
          positions={positions}
          minute={currentDateTime}
          instrument={selectedInstrument.name}
          currentPrice={selectedInstrument.spotPrice}
          selectedInstrument={selectedInstrument}
          deletePosition={handleDeletePosition}
          togglePosition={handleTogglePosition}
          setPositions={setPositions}
          editPosition={handleEditPosition}
        />

        {isTimeChanged && displayExpiry && displayName ? (
          <View style={styles.optionChainContainer}>
            <Text style={styles.optionChainTitle}>
              {displayExpiry?.split('-').join('')} - Option Chain - {displayName} Future : {selectedInstrument.futurePrice}
            </Text>
            <OptionChainTable
              tableData={tableData}
              instrument={selectedInstrument.name}
              expiry={expiry?.to_expiry}
              currentDate={currentDateTime}
              addPosition={handleAddPosition}
            />
          </View>
        ):(
           <View style={{ flex: 1, justifyContent: "center", alignItems: "center",height:400, borderRadius:8,backgroundColor:"#FFFFFF",marginBottom:20 }}>
            <ActivityIndicator size="large" color="#000" />
            <Text>Loading Option Table...</Text>
          </View>
        )}

        <DateTimePickerModal
          isVisible={isStartDatePickerVisible}
          mode="date"
          onConfirm={handleStartDateConfirm}
          onCancel={handleStartDateCancel}
          maximumDate={getMaxDate()}
          minimumDate={getMinDate()}
          date={startDate}
        />

        <DateTimePickerModal
          isVisible={isPayoffDatePickerVisible}
          mode="date"
          onConfirm={handlePayoffDateConfirm}
          onCancel={handlePayoffDateCancel}
          maximumDate={getMaxDate()}
          minimumDate={startDate} // Payoff date should be after start date
          date={payOffDate}
        />

        <Modal
          visible={isModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={handleModalClose}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirm Instrument Change</Text>
              <Text style={styles.modalBody}>
                Changing the instrument to "{pendingSelection?.label}" will clear
                current positions and fetch new data. Do you want to proceed?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.resetButton]}
                  onPress={handleModalReset}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleModalClose}
                >
                  <Text style={styles.cancelButtonText}>Don't Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    paddingTop:85,
    paddingBottom:60
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 12,
  },
  headerCont:{
   marginBottom:14,
   paddingHorizontal:12
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  breadcrumbText: {
    fontSize: 12,
    color: "#6B7280",
  },
  infoCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoCardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  infoCardValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  selectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  selectionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  selectorContainer: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  customSelect: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  datePickerText: {
    fontSize: 16,
    color: '#111827',
  },
  actionButtonContainer: {
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeControlsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  timeControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  timeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  currentTimeContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  currentTimeButton: {
    backgroundColor: '#06b6d4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#06b6d4',
  },
  currentTimeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  expiryWarning: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 8,
    textAlign: 'center',
  },
  optionChainContainer: {
    marginTop: 16,
    marginBottom: 20,
    flex: 1,
    alignItems: "center"
  },
  optionChainTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 400,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#2563eb',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default OptionSimulator;