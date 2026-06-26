import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OptionChainTable from './OptionChainTable';
import StrategyPositions from './StrategyPositions';
import PreBuildStrategies from './PreBuildStrategies';
import {
  getOptionChain,
  getSimulatorExpiries,
  getSpotFutureData,
} from '../../Unfluke_helpers/backend_helper';
import { CustomExpirySelect, CustomSelect } from './Selects';
import { createSelector } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { StrategyChartInstruments } from '../../redux/Unfluke_slices/strategyCharts/thunk';

const data = createSelector(
  (state) => state.StrategyCharts,
  (data) => data.instrumentNames,
);

const OptionSimulator = () => {
  const [user, setUser] = useState(null);
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();

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
  const [expiry, setExpiry] = useState(null);
  const [isTimeChanged, setIsTimeChanged] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [displayExpiry, setDisplayExpiry] = useState('');
  const [tableData, setTableData] = useState([]);
  const [positions, setPositions] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(moment().format('DD MMM YYYY hh:mm A'));
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isPayoffDatePickerVisible, setPayoffDatePickerVisibility] = useState(false);
  const [activePickerType, setActivePickerType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingSelection, setPendingSelection] = useState(null);
  const instrumentList = useSelector(data);
  const [expiries, setExpiries] = useState([{ options: [{ label: '', value: '' }] }]);
  const [instruments, setInstruments] = useState(null);
  const [isSearchingData, setIsSearchingData] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [expiriesError, setExpiriesError] = useState(false);
  const tempDateTimeRef = useRef(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const optionChainYRef = useRef(0);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('authUser');
        if (userData) setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUser();
  }, []);

  const errorNotify = () => { };

  const handleGetOptionChain = async (customDateTime = null) => {
    if (!user || !expiry || !selectedInstrument.name) return;
    const dateTimeToUse = customDateTime || currentDateTime;
    setIsLoading(true);
    setIsTimeChanged(false);
    try {
      const result = await getOptionChain({
        name: selectedInstrument.name,
        minute: dateTimeToUse,
        expiry: expiry.to_expiry,
        id: user._id,
      });
      if (result?.length > 0) {
        setTableData(result);
        setDisplayName(selectedInstrument.name);
        setDisplayExpiry(expiry.to_expiry);
        setIsTimeChanged(true);
      }
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  };

  const getSafeDateBeforeExpiry = (targetDate, expiryDate) => {
    const targetMoment = moment(targetDate, 'DD MMM YYYY hh:mm A');
    const expiryMoment = moment(expiryDate, 'DDMMMYY');
    if (targetMoment.isAfter(expiryMoment)) {
      const safeMoment = expiryMoment.clone().subtract(1, 'day');
      while (safeMoment.day() === 0 || safeMoment.day() === 6) safeMoment.subtract(1, 'day');
      return safeMoment.set({ hour: 9, minute: 20, second: 0 });
    }
    return targetMoment;
  };

  const adjustTime = (minutes) => {
    if (!currentDateTime || currentDateTime === 'Invalid date' || !expiry?.to_expiry) return;
    setIsTimeChanged(false);
    const currentMoment = moment(currentDateTime, 'DD MMM YYYY hh:mm A');
    if (!currentMoment.isValid()) return;
    let newDateTime;
    if (minutes < 0) {
      newDateTime = minutes === -1 ? currentMoment.subtract(1, 'day') : currentMoment.subtract(Math.abs(minutes), 'minutes');
    } else {
      newDateTime = minutes === 1 ? currentMoment.add(1, 'day') : currentMoment.add(minutes, 'minutes');
    }
    const safeDateTime = getSafeDateBeforeExpiry(newDateTime.format('DD MMM YYYY hh:mm A'), expiry.to_expiry);
    const newDateTimeString = safeDateTime.format('DD MMM YYYY hh:mm A');
    setCurrentDateTime(newDateTimeString);
    setTimeout(() => handleGetOptionChain(newDateTimeString), 100);
  };

  const handleStartDateConfirm = (date) => {
    const m = moment(date);
    while (m.day() === 0 || m.day() === 6) m.add(1, 'day');
    setStartDate(m.toDate());
    setStartDatePickerVisibility(false);
    setActivePickerType(null);
  };

  const handlePayoffDateConfirm = (date) => {
    const m = moment(date);
    while (m.day() === 0 || m.day() === 6) m.subtract(1, 'day');
    setPayOffDate(m.toDate());
    setPayoffDatePickerVisibility(false);
    setActivePickerType(null);
  };

  const getMinDate = () => {
    if (expiry?.from_expiry) {
      const d = moment(expiry.from_expiry, 'DDMMMYY').toDate();
      return new Date(d.setMonth(d.getMonth() - 1));
    }
    return new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  };

  const getMaxDate = () => {
    if (activePickerType === 'start') return payOffDate;
    if (activePickerType === 'payoff' && expiry?.to_expiry) return moment(expiry.to_expiry, 'DDMMMYY').toDate();
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  };

  useEffect(() => {
    if (!instrumentList || instrumentList.length === 0) {
      dispatch(StrategyChartInstruments());
    }
  }, [dispatch]);

  useEffect(() => {
    if (isTimeChanged && displayName && tableData.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: optionChainYRef.current, animated: true });
      }, 300);
    }
  }, [isTimeChanged, displayName, tableData.length]);

  useEffect(() => {
    if (instrumentList && instrumentList.length > 0) {
      setInstruments([{ options: instrumentList.map((item) => ({ label: item, value: item })) }]);
    }
  }, [instrumentList]);

  useEffect(() => {
    if (expiry?.to_expiry) {
      const safe = getSafeDateBeforeExpiry(
        moment(startDate).set({ hour: 9, minute: 20, second: 0 }).format('DD MMM YYYY hh:mm A'),
        expiry.to_expiry
      );
      setCurrentDateTime(safe.format('DD MMM YYYY hh:mm A'));
    } else {
      setCurrentDateTime(moment(startDate).set({ hour: 9, minute: 20, second: 0 }).format('DD MMM YYYY hh:mm A'));
    }
  }, [startDate, expiry?.to_expiry]);

  useEffect(() => {
    const fetchExpiries = async () => {
      if (!user || !selectedInstrument.name) return;
      setExpiriesError(false);
      try {
        const res = await getSimulatorExpiries({
          params: { optionName: selectedInstrument.name, optionType: 'CE - Call', id: user._id },
        });
        if (res?.expiry_date) {
          const newExpiries = [{ options: res.expiry_date.map((item) => ({ label: item.to_expiry.split('-').join('').toUpperCase(), value: item })) }];
          setExpiries(newExpiries);
          if (newExpiries[0]?.options[0]?.value) setExpiry(newExpiries[0].options[0].value);
        } else {
          setExpiriesError(true);
        }
      } catch (e) {
        console.error('fetchExpiries error:', e);
        setExpiriesError(true);
      }
    };
    fetchExpiries();
  }, [selectedInstrument.name, user]);

  useEffect(() => {
    const fetchSpotFuture = async (dateTime) => {
      if (!user || !selectedInstrument.name || !expiry?.to_expiry) return false;
      try {
        const res = await getSpotFutureData({ name: selectedInstrument.name, minute: dateTime, expiry: expiry.to_expiry, id: user._id });
        if (res) {
          setSelectedInstrument((prev) => ({ ...prev, spotPrice: res.spotPrice || '-', futurePrice: res.futPrice || '-', lotSize: res?.lotSize || '-', multiple: res?.multiple || '-' }));
          return true;
        }
        return false;
      } catch { return false; }
    };

    const tryNextValidDay = async () => {
      if (!currentDateTime || isSearchingData || !user || !expiry?.to_expiry) return;
      if (!tempDateTimeRef.current) {
        const cur = moment(currentDateTime, 'DD MMM YYYY hh:mm A');
        const exp = moment(expiry.to_expiry, 'DDMMMYY');
        tempDateTimeRef.current = cur.isAfter(exp) ? exp.clone().subtract(1, 'day') : cur.clone();
        while (tempDateTimeRef.current.day() === 0 || tempDateTimeRef.current.day() === 6) tempDateTimeRef.current.subtract(1, 'day');
        tempDateTimeRef.current.set({ hour: 9, minute: 20, second: 0 });
      }
      setIsSearchingData(true);
      let found = false, attempts = 0;
      const expM = moment(expiry.to_expiry, 'DDMMMYY');
      while (!found && attempts < 10) {
        if (tempDateTimeRef.current.isAfter(expM)) break;
        found = await fetchSpotFuture(tempDateTimeRef.current.format('DD MMM YYYY hh:mm A'));
        if (!found) {
          tempDateTimeRef.current.subtract(1, 'days');
          const d = tempDateTimeRef.current.day();
          if (d === 0) tempDateTimeRef.current.subtract(2, 'days');
          else if (d === 6) tempDateTimeRef.current.subtract(1, 'days');
          tempDateTimeRef.current.set({ hour: 9, minute: 20, second: 0 });
          if (tempDateTimeRef.current.isBefore(moment(expiry.from_expiry, 'DDMMMYY'))) break;
        }
        attempts++;
      }
      if (found) {
        const newDT = tempDateTimeRef.current.format('DD MMM YYYY hh:mm A');
        if (newDT !== currentDateTime) setCurrentDateTime(newDT);
        if (isInitialLoad) { setIsInitialLoad(false); setTimeout(() => handleGetOptionChain(), 500); }
      }
      tempDateTimeRef.current = null;
      setIsSearchingData(false);
    };

    if (expiry && selectedInstrument.name && !isSearchingData) {
      const t = setTimeout(() => tryNextValidDay(), 100);
      return () => clearTimeout(t);
    }
  }, [selectedInstrument.name, expiry?.to_expiry, user, startDate]);

  useEffect(() => {
    if (expiry) {
      const from = moment(expiry.from_expiry, 'DDMMMYY');
      const to = moment(expiry.to_expiry, 'DDMMMYY');
      while (from.day() === 0 || from.day() === 6) from.add(1, 'day');
      while (to.day() === 0 || to.day() === 6) to.subtract(1, 'day');
      setStartDate(from.toDate());
      setPayOffDate(to.toDate());
      setCurrentDateTime(from.clone().set({ hour: 9, minute: 20, second: 0 }).format('DD MMM YYYY hh:mm A'));
      setIsInitialLoad(true);
    }
  }, [expiry]);

  const handleModalReset = () => {
    if (pendingSelection) {
      setSelectedInstrument((prev) => ({ ...prev, name: pendingSelection.value, spotPrice: '-', futurePrice: '-', lotSize: '-', multiple: '-' }));
      setPositions([]); setTableData([]); setIsTimeChanged(false);
      setDisplayName(''); setDisplayExpiry(''); setIsInitialLoad(true);
    }
    setIsModalOpen(false); setPendingSelection(null);
  };

  const renderTimeBtn = (label, minutes, color) => {
    const wouldExceed = () => {
      if (!expiry?.to_expiry || !currentDateTime) return false;
      const cur = moment(currentDateTime, 'DD MMM YYYY hh:mm A');
      const exp = moment(expiry.to_expiry, 'DDMMMYY');
      const adj = minutes < 0
        ? (minutes === -1 ? cur.clone().subtract(1, 'day') : cur.clone().subtract(Math.abs(minutes), 'minutes'))
        : (minutes === 1 ? cur.clone().add(1, 'day') : cur.clone().add(minutes, 'minutes'));
      return adj.isAfter(exp);
    };
    const disabled = wouldExceed();
    return (
      <TouchableOpacity
        key={label}
        style={[styles.timeButton, { backgroundColor: disabled ? '#9ca3af' : color }]}
        onPress={() => !disabled && adjustTime(minutes)}
        disabled={disabled}
      >
        <Text style={styles.timeButtonText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderInfoCard = (label, value) => (
    <View key={label} style={[styles.infoCard, { minWidth: (width - 44) / 2 }]}>
      <Text style={styles.infoCardLabel}>{label}</Text>
      <Text style={styles.infoCardValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* ✅ Single heading - only shown here, no nav header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Option Simulator</Text>
        <Text style={styles.headerSub}>Pages · Simulator</Text>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>

        <View style={styles.infoCardsContainer}>
          {renderInfoCard('Spot Price', selectedInstrument.spotPrice)}
          {renderInfoCard('Futures Price', selectedInstrument.futurePrice)}
          {renderInfoCard('Lot Size', selectedInstrument.lotSize)}
          {renderInfoCard('IV', selectedInstrument.iv)}
        </View>

        {instruments?.length > 0 && expiries?.length > 0 ? (
          <View style={styles.selectionContainer}>
            <Text style={styles.sectionTitle}>Select Index/Stock</Text>
            <View style={styles.selectionRow}>
              <View style={styles.selectorContainer}>
                <Text style={styles.selectorLabel}>Index / Stock</Text>
                <CustomSelect
                  name="choices-instrument-default"
                  options={instruments[0].options}
                  selected={selectedInstrument?.name || ''}
                  placeholder="Select instrument"
                  onChange={(value) => {
                    const opt = instruments[0].options.find(o => o.value === value);
                    if (opt && opt.value !== selectedInstrument.name) { setPendingSelection(opt); setIsModalOpen(true); }
                  }}
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
            <View style={styles.selectionRow}>
              <View style={styles.selectorContainer}>
                <Text style={styles.selectorLabel}>Start Date</Text>
                <TouchableOpacity style={styles.datePickerButton} onPress={() => { setActivePickerType('start'); setStartDatePickerVisibility(true); }}>
                  <Text style={styles.datePickerText}>{moment(startDate).format('DD MMM YYYY')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.selectorContainer}>
                <Text style={styles.selectorLabel}>Payoff Date</Text>
                <TouchableOpacity style={styles.datePickerButton} onPress={() => { setActivePickerType('payoff'); setPayoffDatePickerVisibility(true); }}>
                  <Text style={styles.datePickerText}>{moment(payOffDate).format('DD MMM YYYY')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.actionButton, isLoading && styles.disabledButton]}
              onPress={() => { setForceRefresh(p => p + 1); handleGetOptionChain(); }}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.actionButtonText}> Loading...</Text>
                </View>
              ) : (
                <Text style={styles.actionButtonText}>Get Option Chain →</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : expiriesError ? (
          <View style={styles.loaderBox}>
            <Text style={[styles.loaderText, { color: '#F23645' }]}>Failed to load data. Please check your connection and try again.</Text>
          </View>
        ) : (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#2962FF" />
            <Text style={styles.loaderText}>Loading instruments & expiries...</Text>
          </View>
        )}

        {currentDateTime !== 'Invalid date' && expiry ? (
          <PreBuildStrategies
            setPositions={setPositions} positions={positions} optionChain={tableData}
            getOptionChain={handleGetOptionChain} selectedInstrument={selectedInstrument}
            selectedExpiry={expiry?.to_expiry} expiry={expiries}
          />
        ) : (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#2962FF" />
            <Text style={styles.loaderText}>Loading strategies...</Text>
          </View>
        )}

        <View style={styles.timeControlsContainer}>
          <View style={styles.timeControlsRow}>
            {renderTimeBtn('-1 day', -1, '#ef4444')}
            {renderTimeBtn('-30 min', -30, '#ef4444')}
            {renderTimeBtn('-15 min', -15, '#ef4444')}
            {renderTimeBtn('-5 min', -5, '#ef4444')}
          </View>
          <View style={styles.currentTimeContainer}>
            <View style={styles.currentTimeButton}>
              <Text style={styles.currentTimeText}>{currentDateTime}</Text>
            </View>
            {expiry?.to_expiry && (
              <Text style={styles.expiryWarning}>
                Expiry: {moment(expiry.to_expiry, 'DDMMMYY').format('DD MMM YYYY')}
              </Text>
            )}
          </View>
          <View style={styles.timeControlsRow}>
            {renderTimeBtn('+5 min', 5, '#16a34a')}
            {renderTimeBtn('+15 min', 15, '#16a34a')}
            {renderTimeBtn('+30 min', 30, '#16a34a')}
            {renderTimeBtn('+1 day', 1, '#16a34a')}
          </View>
        </View>

        <StrategyPositions
          positions={positions} minute={currentDateTime} instrument={selectedInstrument.name}
          currentPrice={selectedInstrument.spotPrice} selectedInstrument={selectedInstrument}
          deletePosition={(id) => setPositions(positions.filter(p => p.id !== id))}
          togglePosition={(id) => setPositions(positions.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p))}
          setPositions={setPositions} editPosition={() => { }}
        />

        {isTimeChanged && displayExpiry && displayName ? (
          <View
            style={styles.optionChainContainer}
            onLayout={(e) => { optionChainYRef.current = e.nativeEvent.layout.y; }}
          >
            <Text style={styles.optionChainTitle}>
              {displayExpiry?.split('-').join('')} — Option Chain — {displayName} Future: {selectedInstrument.futurePrice}
            </Text>
            <OptionChainTable
              tableData={tableData} instrument={selectedInstrument.name}
              expiry={expiry?.to_expiry} currentDate={currentDateTime} addPosition={(p) => setPositions([...positions, p])}
            />
          </View>
        ) : (
          <View style={[styles.loaderBox, { height: 400, marginBottom: 20 }]}>
            <ActivityIndicator size="large" color="#2962FF" />
            <Text style={styles.loaderText}>Loading Option Table...</Text>
          </View>
        )}

        <DateTimePickerModal isVisible={isStartDatePickerVisible} mode="date"
          onConfirm={handleStartDateConfirm} onCancel={() => { setStartDatePickerVisibility(false); setActivePickerType(null); }}
          maximumDate={getMaxDate()} minimumDate={getMinDate()} date={startDate} />

        <DateTimePickerModal isVisible={isPayoffDatePickerVisible} mode="date"
          onConfirm={handlePayoffDateConfirm} onCancel={() => { setPayoffDatePickerVisibility(false); setActivePickerType(null); }}
          maximumDate={getMaxDate()} minimumDate={startDate} date={payOffDate} />

        <Modal visible={isModalOpen} transparent animationType="fade" onRequestClose={() => { setIsModalOpen(false); setPendingSelection(null); }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirm Instrument Change</Text>
              <Text style={styles.modalBody}>
                Changing to "{pendingSelection?.label}" will clear current positions. Proceed?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#2563eb' }]} onPress={handleModalReset}>
                  <Text style={styles.modalBtnText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6b7280' }]} onPress={() => { setIsModalOpen(false); setPendingSelection(null); }}>
                  <Text style={styles.modalBtnText}>Cancel</Text>
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
    flex: 1,
    backgroundColor: '#131722',
  },

  /* ── Single header ── */
  header: {
    backgroundColor: '#1E222D',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D1D4DC',
  },
  headerSub: {
    fontSize: 12,
    color: '#787B86',
    marginTop: 2,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
  },
  loaderBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E222D',
    borderRadius: 8,
    marginBottom: 16,
    paddingVertical: 40,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 13,
    color: '#787B86',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    marginTop: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#1E222D',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    elevation: 1,
  },
  infoCardLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#787B86',
    marginBottom: 6,
  },
  infoCardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D1D4DC',
    fontVariant: ['tabular-nums'],
  },
  selectionContainer: {
    backgroundColor: '#1E222D',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D1D4DC',
    marginBottom: 14,
  },
  selectionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  selectorContainer: { flex: 1 },
  selectorLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#787B86',
    marginBottom: 6,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#363A45',
  },
  datePickerText: { fontSize: 15, color: '#D1D4DC' },
  actionButton: {
    backgroundColor: '#2962FF',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  disabledButton: { backgroundColor: '#4C525E' },
  actionButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },
  timeControlsContainer: {
    backgroundColor: '#1E222D',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
  },
  timeControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    minWidth: 68,
    alignItems: 'center',
  },
  timeButtonText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  currentTimeContainer: { alignItems: 'center', marginVertical: 16 },
  currentTimeButton: {
    backgroundColor: '#2962FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  currentTimeText: { color: '#D1D4DC', fontSize: 14, fontWeight: '600' },
  expiryWarning: { fontSize: 12, color: '#F23645', marginTop: 8 },
  optionChainContainer: { marginTop: 16, marginBottom: 20, alignItems: 'center' },
  optionChainTitle: { fontSize: 13, fontWeight: '600', color: '#787B86', marginBottom: 12, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: '#1E222D', borderRadius: 12, padding: 24, width: '88%', maxWidth: 400 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#D1D4DC', marginBottom: 12, textAlign: 'center' },
  modalBody: { fontSize: 14, color: '#787B86', lineHeight: 22, marginBottom: 20, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default OptionSimulator;