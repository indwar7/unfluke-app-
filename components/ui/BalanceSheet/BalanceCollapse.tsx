import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown, Plus } from 'react-native-feather'; // or your preferred icon library

const MyCollapse = ({ item, getValue, yr }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={toggleCollapse}
        activeOpacity={0.8}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Plus width={13} height={13} color="blue" style={styles.plusIcon} />
            <Text style={styles.titleText}>{item?.title}</Text>
          </View>
          
          {item?.children?.length > 1 ? (
            <View style={styles.valueContainer}>
              <Text style={styles.valueText}>
                {getValue(yr, item.title)}
              </Text>
              <ChevronDown 
                width={16} 
                height={16} 
                color="#6b7280"
                style={[
                  styles.chevron,
                  isOpen && styles.chevronOpen
                ]}
              />
            </View>
          ) : (
            <View style={styles.singleValueContainer}>
              <Text style={styles.valueText}>
                {getValue(yr, item.title)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {isOpen && item?.children?.length > 1 && (
        <View style={styles.childrenContainer}>
          {item.children.map((data, index) => (
            <View key={index} style={styles.childItem}>
              <Text style={styles.childText}>{data}</Text>
              <Text style={styles.childValue}>
                {getValue(yr, data, item.title)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 13,
  },
  header: {
    paddingTop: 10,
    paddingBottom:10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    backgroundColor:'#fcfcfc'

  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plusIcon: {
    marginLeft: 12,
  },
  titleText: {
    fontSize: 12,
    color: '#515050',
    marginLeft: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 12,
  },
  singleValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 24,
  },
  valueText: {
    fontSize: 12,
    color: '#000000',
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  childrenContainer: {
    marginTop:-7,
    marginBottom: -4,
    borderBottomWidth: 1,
    borderLeftWidth:1,
    borderRightWidth:1,
    borderColor: '#d9d9d9',
    paddingBottom: 8,
    paddingTop:16,
    borderBottomLeftRadius:8,
    borderBottomRightRadius:8,
  },
  childItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginTop: -2,
    paddingHorizontal: 24,
  },
  childText: {
    fontSize: 12,
    color: '#000000',
  },
  childValue: {
    fontSize: 12,
    color: '#000000',
  },
});

export default MyCollapse;