import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { ChevronDown, Plus } from 'react-native-feather';

const BankRatioCollapse = ({ item, getValue, yr, thickBorderRows }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = () => {
    if (item?.children?.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  const isThickBorder = thickBorderRows.includes(item?.title);

  // For parent sections (category headers that don't have values themselves)
  if (item?.children?.length > 0 && !isThickBorder) {
    return (
      <View style={styles.parentSectionContainer}>
        {/* Parent header */}
        <TouchableOpacity 
          style={styles.parentHeader}
          onPress={toggleCollapse}
          activeOpacity={0.8}
        >
          <View style={styles.parentHeaderContent}>
            <Text style={styles.parentHeaderText}>{item?.title}</Text>
            <View style={styles.buttonCont}>
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
          </View>
        </TouchableOpacity>
        
        {/* Table-like structure for children */}
        {isOpen && (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>FINANCIAL METRICS</Text>
              <Text style={styles.tableHeaderText}>{yr}</Text>
            </View>
            
            <FlatList
              data={item.children}
              keyExtractor={(childItem, index) => index.toString()}
              scrollEnabled={false}
              renderItem={({ item: child, index }) => {
                const childIsThickBorder = thickBorderRows.includes(child);
                
                if (childIsThickBorder) {
                  // This child should be expandable with its own sub-items
                  return (
                    <BankRatioCollapse
                      key={index}
                      item={{ title: child, children: [], expandable: true }}
                      getValue={getValue}
                      yr={yr}
                      thickBorderRows={thickBorderRows}
                    />
                  );
                } else {
                  // Regular child row in table format
                  const isLast = index === item.children.length - 1;
                  return (
                    <View 
                      key={index} 
                      style={[
                        isLast ? styles.lastTableRow : styles.tableRow,
                        index % 2 === 0 ? styles.evenRow : styles.oddRow,
                      ]}
                    >
                      <Text style={styles.tableRowTitle}>
                        {child}
                      </Text>
                      <Text style={styles.tableRowValue}>                                  
                        {getValue(yr, child)}
                      </Text>
                    </View>
                  );
                }
              }}
            />
          </View>
        )}
      </View>
    );
  }

  // For thick border items (main expandable items) or regular rows
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.header,
          isThickBorder && styles.thickBorderHeader
        ]}
        onPress={toggleCollapse}
        activeOpacity={0.8}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Plus 
              width={13} 
              height={13} 
              color="blue"
              style={styles.plusIcon} 
            />
            <Text style={[
              styles.titleText,
              isThickBorder && styles.thickBorderText
            ]}>
              {item?.title}
            </Text>
          </View>
          
          <View style={styles.valueContainer}>
            <Text style={[
              styles.valueText,
              isThickBorder && styles.thickBorderText
            ]}>
              {getValue(yr, item?.title)}
            </Text>
            {(item?.children?.length > 0 || isThickBorder) && (
              <ChevronDown 
                width={16} 
                height={16} 
                color="#6b7280"
                style={[
                  styles.chevron,
                  isOpen && styles.chevronOpen
                ]}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>

      {isOpen && isThickBorder && (
        <View style={styles.childrenContainer}>
          {/* For thick border items, show related sub-items */}
          {item.children && item.children.length > 0 ? (
            item.children.map((data, index) => (
              <View key={index} style={styles.childItem}>
                <Text style={styles.childText}>{data}</Text>
                <Text style={styles.childValue}>                        
                  {getValue(yr, item?.title)}
                </Text>
              </View>
            ))
          ) : (
            // If no predefined children, you might want to show related items
            // This depends on your data structure - you may need to modify this part
            <View style={styles.childItem}>
              <Text style={styles.childText}>Details for {item?.title}</Text>
              <Text style={styles.childValue}>-</Text>
            </View>
          )}
        </View>
      )}

      {isOpen && item?.children?.length > 0 && !isThickBorder && (
        <View style={styles.childrenContainer}>
          {item.children.map((data, index) => (
            <View key={index} style={styles.childItem}>
              <Text style={styles.childText}>{data}</Text>
              <Text style={styles.childValue}>
                {getValue(yr, item?.title)}
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
  parentSectionContainer: {
    marginBottom: 7,
  },
  parentHeader: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  parentHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position:"relative"
  },
  parentHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingRight:24
  },
  buttonCont:{
    position:"absolute", 
    right:0
  },
  // Table styles similar to CashFlowTable
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#f3f4f6',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#6b7280',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  lastTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 10,
  },
  evenRow: {
    backgroundColor: 'white',
  },
  oddRow: {
    backgroundColor: '#f9fafb',
  },
  tableRowTitle: {
    color: '#111827',
    flex: 1,
    fontSize: 12,
  },
  tableRowValue: {
    color: '#6b7280',
    textAlign: 'right',
    fontSize: 12,
    marginLeft:5
  },
  childRowContainer: {
    marginBottom: 8,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    backgroundColor: '#fcfcfc'
  },
  thickBorderHeader: {
    borderTopWidth: 4,
    borderTopColor: '#3b82f6',
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
  childTitleText: {
    fontSize: 12,
    color: '#515050',
    marginLeft: 8,
    paddingLeft: 16, // Indent for child items
  },
  thickBorderText: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#111827',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 12,
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
    marginTop: -7,
    marginBottom: -4,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#d9d9d9',
    paddingBottom: 8,
    paddingTop: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
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

export default BankRatioCollapse;