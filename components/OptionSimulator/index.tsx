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
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  CalendarDays,
  ChevronRight,
  Minus,
  Plus,
  Clock,
  AlertTriangle,
  RotateCcw,
  X,
} from 'lucide-react-native';
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
import { useTheme } from '@/constants/ThemeContext';
import type { AppColors } from '@/constants/Colors';

const data = createSelector(
  (state) => state.StrategyCharts,
  (data) => data.instrumentNames,
);

const OptionSimulator = () => {
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);
  const [user, setUser] = useState(null);
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();

  // Current market ("in" | "crypto"). Drives instrument list + default symbol.
  const appType = useSelector((state: any) => state?.Layout?.appType ?? 'in');
  const isCrypto = appType === 'crypto';

  const [selectedInstrument, setSelectedInstrument] = useState({
    name: isCrypto ? 'BTCUSDT' : 'NIFTY',
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

  // Fetch the instrument list for the CURRENT market. Mirrors the original
  // (only fetch when empty) so stock behaviour is unchanged; re-fetch on an
  // actual market change so crypto never keeps the NSE list.
  const prevAppTypeRef = useRef(appType);
  useEffect(() => {
    const marketChanged = prevAppTypeRef.current !== appType;
    if (marketChanged || !instrumentList || instrumentList.length === 0) {
      dispatch(StrategyChartInstruments(appType));
    }
    // Only reset the selected instrument when the market actually CHANGES —
    // never on first mount (that would wipe the default before expiries load
    // and break "Get Option Chain" in stock mode too).
    if (marketChanged) {
      setSelectedInstrument((prev) => ({
        ...prev,
        name: isCrypto ? 'BTCUSDT' : 'NIFTY',
        spotPrice: '-', futurePrice: '-', lotSize: '-', multiple: '-',
      }));
    }
    prevAppTypeRef.current = appType;
  }, [dispatch, appType]);

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
        // The option-simulator endpoint returns { expiry_date: ["DD-Mon-YY", ...] }.
        // The simulator's date logic needs objects shaped { to_expiry, from_expiry }
        // (both parsed via moment(x,'DDMMMYY')). Normalize the string list here,
        // supporting both the string shape and the legacy object shape defensively.
        const rawList = Array.isArray(res?.expiry_date) ? res.expiry_date : null;
        if (rawList && rawList.length > 0) {
          const normalized = rawList
            .map((item) =>
              typeof item === 'string'
                ? { to_expiry: item, raw: item }
                : { to_expiry: item?.to_expiry, from_expiry: item?.from_expiry, raw: item }
            )
            .filter((e) => e.to_expiry)
            .sort(
              (a, b) =>
                moment(a.to_expiry, 'DDMMMYY').valueOf() - moment(b.to_expiry, 'DDMMMYY').valueOf()
            );

          // Fill from_expiry (start of each expiry's trading window). For string
          // responses it is the previous expiry; for the earliest expiry fall back
          // to ~7 days before it. Keep the original DD-Mon-YY format so all the
          // existing moment(...,'DDMMMYY') calls keep working.
          const withRange = normalized.map((e, idx) => {
            const from =
              e.from_expiry ||
              (idx > 0
                ? normalized[idx - 1].to_expiry
                : moment(e.to_expiry, 'DDMMMYY').subtract(7, 'days').format('DD-MMM-YY'));
            return { to_expiry: e.to_expiry, from_expiry: from };
          });

          const newExpiries = [
            {
              options: withRange.map((item) => ({
                label: String(item.to_expiry).split('-').join('').toUpperCase(),
                value: item,
              })),
            },
          ];
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
    const negative = minutes < 0;
    const tone = negative ? c.loss : c.profit;
    const toneBg = negative ? c.lossBg : c.profitBg;
    return (
      <TouchableOpacity
        key={label}
        activeOpacity={0.8}
        style={[
          s.timeButton,
          {
            backgroundColor: disabled ? c.surfaceElevated : toneBg,
            borderColor: disabled ? c.border : tone,
          },
        ]}
        onPress={() => !disabled && adjustTime(minutes)}
        disabled={disabled}
      >
        <View style={s.timeButtonInner}>
          {negative ? (
            <Minus size={11} color={disabled ? c.textMuted : tone} strokeWidth={2.5} />
          ) : (
            <Plus size={11} color={disabled ? c.textMuted : tone} strokeWidth={2.5} />
          )}
          <Text style={[s.timeButtonText, { color: disabled ? c.textMuted : tone }]}>{label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderInfoCard = (label, value) => (
    <View key={label} style={[s.infoCard, { minWidth: (width - 44) / 2 }]}>
      <Text style={s.infoCardLabel}>{label}</Text>
      <Text style={s.infoCardValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>

      {/* ✅ Single heading - only shown here, no nav header */}
      <View style={s.header}>
        <View style={s.headerIcon}>
          <TrendingUp size={20} color={c.gold} strokeWidth={2.4} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Option Simulator</Text>
          <Text style={s.headerSub}>Pages · Simulator</Text>
        </View>
      </View>

      <ScrollView ref={scrollViewRef} style={s.scrollView} showsVerticalScrollIndicator={false}>

        <View style={s.infoCardsContainer}>
          {renderInfoCard('Spot Price', selectedInstrument.spotPrice)}
          {renderInfoCard('Futures Price', selectedInstrument.futurePrice)}
          {renderInfoCard('Lot Size', selectedInstrument.lotSize)}
          {renderInfoCard('IV', selectedInstrument.iv)}
        </View>

        {instruments?.length > 0 && expiries?.length > 0 ? (
          <View style={s.selectionContainer}>
            <Text style={s.sectionTitle}>Select Index/Stock</Text>
            <View style={s.selectionRow}>
              <View style={s.selectorContainer}>
                <Text style={s.selectorLabel}>Index / Stock</Text>
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
              <View style={s.selectorContainer}>
                <Text style={s.selectorLabel}>Select Expiry</Text>
                <CustomExpirySelect
                  name="choices-expiry-default"
                  selected={expiry}
                  onChange={(value) => setExpiry(value)}
                  options={expiries[0]?.options || []}
                  placeholder="Select Expiry"
                />
              </View>
            </View>
            <View style={s.selectionRow}>
              <View style={s.selectorContainer}>
                <Text style={s.selectorLabel}>Start Date</Text>
                <TouchableOpacity style={s.datePickerButton} onPress={() => { setActivePickerType('start'); setStartDatePickerVisibility(true); }}>
                  <CalendarDays size={15} color={c.gold} strokeWidth={2.2} />
                  <Text style={s.datePickerText}>{moment(startDate).format('DD MMM YYYY')}</Text>
                </TouchableOpacity>
              </View>
              <View style={s.selectorContainer}>
                <Text style={s.selectorLabel}>Payoff Date</Text>
                <TouchableOpacity style={s.datePickerButton} onPress={() => { setActivePickerType('payoff'); setPayoffDatePickerVisibility(true); }}>
                  <CalendarDays size={15} color={c.gold} strokeWidth={2.2} />
                  <Text style={s.datePickerText}>{moment(payOffDate).format('DD MMM YYYY')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[s.actionButtonWrap, isLoading && s.disabledButton]}
              onPress={() => { setForceRefresh(p => p + 1); handleGetOptionChain(); }}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[c.goldBright, c.gold, c.goldDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.actionButton}
              >
                {isLoading ? (
                  <View style={s.loadingRow}>
                    <ActivityIndicator size="small" color={c.onGold} />
                    <Text style={s.actionButtonText}> Loading...</Text>
                  </View>
                ) : (
                  <View style={s.loadingRow}>
                    <Text style={s.actionButtonText}>Get Option Chain</Text>
                    <ChevronRight size={17} color={c.onGold} strokeWidth={2.6} />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : expiriesError ? (
          <View style={s.loaderBox}>
            <Text style={[s.loaderText, { color: c.loss }]}>Failed to load data. Please check your connection and try again.</Text>
          </View>
        ) : (
          <View style={s.loaderBox}>
            <ActivityIndicator size="large" color={c.gold} />
            <Text style={s.loaderText}>Loading instruments & expiries...</Text>
          </View>
        )}

        {currentDateTime !== 'Invalid date' && expiry ? (
          <PreBuildStrategies
            setPositions={setPositions} positions={positions} optionChain={tableData}
            getOptionChain={handleGetOptionChain} selectedInstrument={selectedInstrument}
            selectedExpiry={expiry?.to_expiry} expiry={expiries}
          />
        ) : (
          <View style={s.loaderBox}>
            <ActivityIndicator size="large" color={c.gold} />
            <Text style={s.loaderText}>Loading strategies...</Text>
          </View>
        )}

        <View style={s.timeControlsContainer}>
          <View style={s.timeControlsRow}>
            {renderTimeBtn('-1 day', -1, '#ef4444')}
            {renderTimeBtn('-30 min', -30, '#ef4444')}
            {renderTimeBtn('-15 min', -15, '#ef4444')}
            {renderTimeBtn('-5 min', -5, '#ef4444')}
          </View>
          <View style={s.currentTimeContainer}>
            <View style={s.currentTimeButton}>
              <Clock size={14} color={c.gold} strokeWidth={2.3} />
              <Text style={s.currentTimeText}>{currentDateTime}</Text>
            </View>
            {expiry?.to_expiry && (
              <View style={s.expiryWarningRow}>
                <AlertTriangle size={12} color={c.loss} strokeWidth={2.3} />
                <Text style={s.expiryWarning}>
                  Expiry: {moment(expiry.to_expiry, 'DDMMMYY').format('DD MMM YYYY')}
                </Text>
              </View>
            )}
          </View>
          <View style={s.timeControlsRow}>
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
            style={s.optionChainContainer}
            onLayout={(e) => { optionChainYRef.current = e.nativeEvent.layout.y; }}
          >
            <Text style={s.optionChainTitle}>
              {displayExpiry?.split('-').join('')} — Option Chain — {displayName} Future: {selectedInstrument.futurePrice}
            </Text>
            <OptionChainTable
              tableData={tableData} instrument={selectedInstrument.name}
              expiry={expiry?.to_expiry} currentDate={currentDateTime} addPosition={(p) => setPositions([...positions, p])}
            />
          </View>
        ) : (
          <View style={[s.loaderBox, { height: 400, marginBottom: 20 }]}>
            <ActivityIndicator size="large" color={c.gold} />
            <Text style={s.loaderText}>Loading Option Table...</Text>
          </View>
        )}

        <DateTimePickerModal isVisible={isStartDatePickerVisible} mode="date"
          onConfirm={handleStartDateConfirm} onCancel={() => { setStartDatePickerVisibility(false); setActivePickerType(null); }}
          maximumDate={getMaxDate()} minimumDate={getMinDate()} date={startDate} />

        <DateTimePickerModal isVisible={isPayoffDatePickerVisible} mode="date"
          onConfirm={handlePayoffDateConfirm} onCancel={() => { setPayoffDatePickerVisibility(false); setActivePickerType(null); }}
          maximumDate={getMaxDate()} minimumDate={startDate} date={payOffDate} />

        <Modal visible={isModalOpen} transparent animationType="fade" onRequestClose={() => { setIsModalOpen(false); setPendingSelection(null); }}>
          <View style={s.modalOverlay}>
            <View style={s.modalContainer}>
              <View style={s.modalIconWrap}>
                <AlertTriangle size={22} color={c.gold} strokeWidth={2.3} />
              </View>
              <Text style={s.modalTitle}>Confirm Instrument Change</Text>
              <Text style={s.modalBody}>
                Changing to "{pendingSelection?.label}" will clear current positions. Proceed?
              </Text>
              <View style={s.modalButtons}>
                <TouchableOpacity activeOpacity={0.85} style={s.modalResetWrap} onPress={handleModalReset}>
                  <LinearGradient
                    colors={[c.goldBright, c.gold, c.goldDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.modalButton}
                  >
                    <RotateCcw size={15} color={c.onGold} strokeWidth={2.4} />
                    <Text style={s.modalBtnText}>Reset</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} style={[s.modalButton, s.modalCancelButton]} onPress={() => { setIsModalOpen(false); setPendingSelection(null); }}>
                  <X size={15} color={c.textSecondary} strokeWidth={2.4} />
                  <Text style={s.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },

  /* ── Single header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: c.headerBg,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 4,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.goldLight,
    borderWidth: 1,
    borderColor: c.gold,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: c.text,
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: c.textMuted,
    marginTop: 3,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
  },
  loaderBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: c.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    marginBottom: 16,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '500',
    color: c.textSecondary,
    textAlign: 'center',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    marginTop: 14,
  },
  infoCard: {
    flex: 1,
    backgroundColor: c.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.04,
    shadowRadius: 3,
  },
  infoCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: c.textMuted,
    marginBottom: 8,
  },
  infoCardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: c.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.2,
  },
  selectionContainer: {
    backgroundColor: c.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: c.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.22 : 0.05,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: c.text,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  selectionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  selectorContainer: { flex: 1 },
  selectorLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: c.textMuted,
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: c.inputBg,
  },
  datePickerText: { fontSize: 14, fontWeight: '600', color: c.text },
  actionButtonWrap: {
    borderRadius: 14,
    marginTop: 6,
    shadowColor: c.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  actionButton: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.6, shadowOpacity: 0 },
  actionButtonText: { color: c.onGold, fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeControlsContainer: {
    backgroundColor: c.card,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: c.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.22 : 0.05,
    shadowRadius: 6,
  },
  timeControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeButton: {
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 68,
    alignItems: 'center',
  },
  timeButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeButtonText: { fontSize: 11, fontWeight: '700' },
  currentTimeContainer: { alignItems: 'center', marginVertical: 18 },
  currentTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: c.surfaceElevated,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.gold,
  },
  currentTimeText: { color: c.text, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  expiryWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  expiryWarning: { fontSize: 12, fontWeight: '600', color: c.loss },
  optionChainContainer: { marginTop: 16, marginBottom: 20, alignItems: 'center' },
  optionChainTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: c.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalContainer: {
    backgroundColor: c.surfaceElevated,
    borderRadius: 20,
    padding: 24,
    width: '88%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.5 : 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.goldLight,
    borderWidth: 1,
    borderColor: c.gold,
    marginBottom: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: c.text, marginBottom: 10, textAlign: 'center', letterSpacing: 0.2 },
  modalBody: { fontSize: 14, fontWeight: '500', color: c.textSecondary, lineHeight: 22, marginBottom: 22, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  modalResetWrap: {
    flex: 1,
    borderRadius: 12,
    shadowColor: c.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
  },
  modalCancelButton: {
    backgroundColor: c.surface,
    borderWidth: 1.5,
    borderColor: c.border,
  },
  modalBtnText: { color: c.onGold, fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  modalCancelText: { color: c.textSecondary, fontSize: 15, fontWeight: '700' },
});

export default OptionSimulator;
