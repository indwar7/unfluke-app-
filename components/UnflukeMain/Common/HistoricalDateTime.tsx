import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { createSelector } from 'reselect';
import { useSelector, useDispatch } from 'react-redux';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { getHistoricTradingLastDate } from '../../../Unfluke_helpers/backend_helper';
import {
  UserHistoricalDateTime,
  UserHistoricalWatchlist,
} from '../../../redux/Unfluke_slices/thunks';
import { useTheme } from '@/constants/ThemeContext';
import type { AppColors } from '@/constants/Colors';

const dateData = createSelector(
  (state) => state.Historical,
  (data) => data.historicalDateTime
);

const auth = createSelector(
  (state) => state.Login,
  (data) => data.user
);

const HistoricalDateTime = () => {
  const dispatch = useDispatch();
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);

  const [lastDate, setLastDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const DateTime = useSelector(dateData);
  const user = useSelector(auth);

  const formatDateTime = (date) => {
    if (!date) return '';
    return moment(date).format('DD MMM YYYY hh:mm:ss A');
  };

  const formatDate = (date) => {
    if (!date) return 'Select Date';
    return moment(date).format('YYYY-MM-DD');
  };

  const formatTime = (date) => {
    if (!date) return 'Select Time';
    return moment(date).format('HH:mm');
  };

  const handleDateConfirm = (date) => {
    const newDate = selectedDate ? new Date(selectedDate) : new Date();
    newDate.setFullYear(date.getFullYear());
    newDate.setMonth(date.getMonth());
    newDate.setDate(date.getDate());
    setSelectedDate(newDate);
    setDatePickerVisibility(false);
  };

  const handleTimeConfirm = (time) => {
    const newDate = selectedDate ? new Date(selectedDate) : new Date();
    newDate.setHours(time.getHours());
    newDate.setMinutes(time.getMinutes());
    
    // Check if time is within market hours
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    if (totalMinutes < 555 || totalMinutes > 930) { // 9:15 AM to 3:30 PM
      Alert.alert(
        'Invalid Time',
        'Please select time within market hours (9:15 AM to 3:30 PM)'
      );
      return;
    }
    
    setSelectedDate(newDate);
    setTimePickerVisibility(false);
  };

  const adjustTime = (minutes) => {
    setSelectedDate((prevDate) => {
      if (!prevDate) return null;
      return new Date(prevDate.getTime() + minutes * 60000);
    });
  };

  useEffect(() => {
    async function getLastDate() {
      try {
        const result = await getHistoricTradingLastDate();
        if (result?.date) {
          const d = new Date(result.date);
          if (!isNaN(d.getTime())) {
            setLastDate(d);
          }
        }
      } catch (error) {
        console.error('Error fetching last date:', error);
      }
    }
    getLastDate();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      dispatch(UserHistoricalDateTime(selectedDate));
    }
  }, [selectedDate, dispatch]);

  useEffect(() => {
    if (DateTime && selectedDate == null) {
      setSelectedDate(new Date(DateTime));
    }
  }, [DateTime]);

  useEffect(() => {
    if (user) {
      dispatch(UserHistoricalWatchlist(user._id));
    }
  }, [dispatch, user]);

  const getMinDate = () => {
    if (user?.charts_fno) {
      return new Date(parseInt(user.charts_fno), 0, 1);
    }
    return new Date(2020, 0, 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <View style={styles.pickerGroup}>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setDatePickerVisibility(true)}
          >
            <Text style={styles.pickerLabel}>Date:</Text>
            <Text style={styles.pickerValue}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pickerGroup}>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setTimePickerVisibility(true)}
          >
            <Text style={styles.pickerLabel}>Time:</Text>
            <Text style={styles.pickerValue}>{formatTime(selectedDate)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedDate && (
        <View style={styles.timeControls}>
          <TouchableOpacity
            style={[styles.timeButton, styles.minusButton]}
            onPress={() => adjustTime(-5)}
          >
            <Text style={styles.timeButtonText}>-5m</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeButton, styles.minusButton]}
            onPress={() => adjustTime(-15)}
          >
            <Text style={styles.timeButtonText}>-15m</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeButton, styles.plusButton]}
            onPress={() => adjustTime(15)}
          >
            <Text style={styles.timeButtonText}>+15m</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeButton, styles.plusButton]}
            onPress={() => adjustTime(5)}
          >
            <Text style={styles.timeButtonText}>+5m</Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedDate && (
        <Text style={styles.currentDateTime}>
          {formatDateTime(selectedDate)}
        </Text>
      )}

      {isDatePickerVisible && (
        <DateTimePickerModal
          isVisible={true}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisibility(false)}
          minimumDate={getMinDate()}
          maximumDate={lastDate instanceof Date && !isNaN(lastDate.getTime()) ? lastDate : new Date()}
        />
      )}

      {isTimePickerVisible && (
        <DateTimePickerModal
          isVisible={true}
          mode="time"
          onConfirm={handleTimeConfirm}
          onCancel={() => setTimePickerVisibility(false)}
        />
      )}
    </View>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: c.card,
    borderRadius: 8,
    padding: 12,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  pickerGroup: {
    flex: 1,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: c.border,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: c.textSecondary,
    marginRight: 8,
  },
  pickerValue: {
    fontSize: 14,
    color: c.text,
    flex: 1,
  },
  timeControls: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  minusButton: {
    backgroundColor: c.lossBg,
  },
  plusButton: {
    backgroundColor: c.profitBg,
  },
  timeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: c.text,
  },
  currentDateTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: c.text,
    textAlign: 'center',
  },
});

export default HistoricalDateTime;