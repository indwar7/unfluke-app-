import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  useWindowDimensions,
} from 'react-native';


const OptionChainTable = ({
  tableData,
  expiry,
  instrument,
  currentDate,
  addPosition,
}) => {
  const { width, height } = useWindowDimensions()

  const [selectedPosition, setSelectedPosition] = useState('Buy');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cepe, setCEPE] = useState(null);
  const [lotSize, setLotSize] = useState(null);
  const [greeks, setGreeks] = useState({
    iv: 0,
    delta: 0,
    gamma: 0,
    theta: 0,
    vega: 0,
  });
  const [ltp, setLTP] = useState(null);
  const [strike, setStrike] = useState(null);
  const [lotQuantity, setLotQuantity] = useState(1);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  function countUP(id, prev_data_attr) {
    if (prev_data_attr === 500) return;
    id(prev_data_attr + 1);
  }

  function countDown(id, prev_data_attr) {
    if (prev_data_attr === 1) return;
    id(prev_data_attr - 1);
  }

  const handleCallBtn = (row, type = null) => {
    setCEPE('CE');
    setLTP(row.callPrice);
    setStrike(row.strike);
    setIsModalOpen(true);
    setLotSize(row.lotSize);
    setGreeks({
      iv: row.callIV,
      delta: row.callDelta,
      gamma: row.callGamma,
      vega: row.callVega,
      theta: row.callTheta,
    });
    if (type) {
      setSelectedPosition(type);
    }
  };

  const handlePutBtn = (row, type = null) => {
    setCEPE('PE');
    setLTP(row.putPrice);
    setStrike(row.strike);
    setIsModalOpen(true);
    setLotSize(row.lotSize);
    setGreeks({
      iv: row.putIV,
      delta: row.putDelta,
      gamma: row.putGamma,
      vega: row.putVega,
      theta: row.putTheta,
    });
    if (type) {
      setSelectedPosition(type);
    }
  };

  const renderActionButtons = (row, isCall = true) => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity
        style={[
          styles.actionButton,
          styles.buyButton,
          !(isCall ? row.callPrice : row.putPrice) && styles.disabledButton,
        ]}
        disabled={!(isCall ? row.callPrice : row.putPrice)}
        onPress={() =>
          isCall ? handleCallBtn(row, 'Buy') : handlePutBtn(row, 'Buy')
        }
      >
        <Text style={styles.actionButtonText}>BUY</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.actionButton,
          styles.sellButton,
          !(isCall ? row.callPrice : row.putPrice) && styles.disabledSellButton,
        ]}
        disabled={!(isCall ? row.callPrice : row.putPrice)}
        onPress={() =>
          isCall ? handleCallBtn(row, 'Sell') : handlePutBtn(row, 'Sell')
        }
      >
        <Text style={styles.actionButtonText}>SELL</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTableHeader = () => (
    <View style={styles.tableRow}>
      <View style={[styles.cell, styles.actionCell]}>
        <Text style={styles.headerText}>Action</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.headerText}>Call LTP</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.headerText}>Call IV</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.headerText}>Call Delta</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.headerText}>Call Gamma</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.headerText}>Call Vega</Text>
      </View>
      <View style={[styles.cell, styles.strikeCell]}>
        <Text style={[styles.headerText, styles.strikeHeaderText]}>Strike</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.headerText}>Put Vega</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.headerText}>Put Gamma</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.headerText}>Put Delta</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.headerText}>Put IV</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.headerText}>Put LTP</Text>
      </View>
      <View style={[styles.cell, styles.actionCell]}>
        <Text style={styles.headerText}>Action</Text>
      </View>
    </View>
  );

  const renderTableRow = (row, index) => (
    <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.striped]}>
      {/* Call Action */}
      <View style={[styles.cell, styles.actionCell]}>
        {renderActionButtons(row, true)}
      </View>

      {/* Call Data */}
      <View style={styles.cell}>
        <Text style={styles.cellText}>{row.callPrice || '-'}</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>
          {row.callIV ? `${row.callIV}%` : '-'}
        </Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>{row.callDelta || '-'}</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>{row.callGamma || '-'}</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>{row.callVega || '-'}</Text>
      </View>

      {/* Strike Price */}
      <View style={[styles.cell, styles.strikeCell]}>
        <Text style={styles.strikeCellText}>{row.strike}</Text>
      </View>

      {/* Put Data */}
      <View style={styles.cell}>
        <Text style={styles.cellText}>{row.putVega || '-'}</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>{row.putGamma || '-'}</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>{row.putDelta || '-'}</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>
          {row.putIV ? `${row.putIV}%` : '-'}
        </Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>{row.putPrice || '-'}</Text>
      </View>

      {/* Put Action */}
      <View style={[styles.cell, styles.actionCell]}>
        {renderActionButtons(row, false)}
      </View>
    </View>
  );

  const renderQuantitySelector = () => (
    <View style={styles.quantityContainer}>
      <Text style={styles.quantityLabel}>Lot quantity</Text>
      <View style={styles.quantitySelector}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => countDown(setLotQuantity, lotQuantity)}
        >
          <Text style={styles.quantityButtonText}>−</Text>
        </TouchableOpacity>
        <View style={styles.quantityInput}>
          <Text style={styles.quantityInputText}>{lotQuantity}</Text>
        </View>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => countUP(setLotQuantity, lotQuantity)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPositionSelector = () => (
    <View style={styles.positionContainer}>
      <TouchableOpacity
        style={[
          styles.radioContainer,
          selectedPosition === 'Buy' && styles.selectedRadio,
        ]}
        onPress={() => setSelectedPosition('Buy')}
      >
        <View style={styles.radioButton}>
          {selectedPosition === 'Buy' && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.radioText}>Buy</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.radioContainer,
          selectedPosition === 'Sell' && styles.selectedRadio,
        ]}
        onPress={() => setSelectedPosition('Sell')}
      >
        <View style={styles.radioButton}>
          {selectedPosition === 'Sell' && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.radioText}>Sell</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Option Chain</Text>
        <Text style={styles.dateText}>
          {currentDate || '13 Jun 2025 09:20 AM'}
        </Text>
      </View>

      {/* Table Container - Fixed the scrolling structure */}
      <View style={[styles.tableContainer,{    height: height * 0.6, 
}]}>
        <ScrollView 
          horizontal={true} 
          showsHorizontalScrollIndicator={true}
          style={styles.horizontalScrollContainer}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          <View style={[styles.tableContent,{    minWidth: width * 1.8,
}]}>
            {/* Sticky Header */}
            <View style={styles.stickyHeader}>
              {renderTableHeader()}
            </View>
            
            {/* Scrollable Table Body */}
            <ScrollView 
              style={styles.tableBodyScroll}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {tableData.map((row, index) => renderTableRow(row, index))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Legend */}
    <View style={styles.legend}>
  <View style={styles.legendItem}>
    <View style={styles.legendColor} />
    <Text style={styles.legendText}>At The Money</Text>
  </View>
  <Text style={styles.legendText}>IV: Implied Volatility</Text>
  <Text style={styles.legendText}>LTP: Last Traded Price</Text>
</View>

      {/* Position Modal */}
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make Position</Text>
              <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View style={styles.modalBody}>
              <Text style={styles.positionSummary}>
                {instrument} {expiry?.split('-').join('').toUpperCase()} {strike}
                {cepe} - {ltp}
              </Text>

              <View style={styles.modalContent}>
                {/* Position Type Selector */}
                <View style={styles.modalSection}>
                  {renderPositionSelector()}
                </View>

                {/* Quantity Selector */}
                <View style={styles.modalSection}>
                  {renderQuantitySelector()}
                </View>
              </View>
            </View>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  toggleModal();
                  addPosition({
                    id: new Date().getTime(),
                    isActive: true,
                    expiry: expiry?.split('-').join('').toUpperCase(),
                    strike: strike,
                    cepe: cepe,
                    ltp: ltp,
                    iv: greeks.iv,
                    gamma: greeks.gamma,
                    delta: greeks.delta,
                    vega: greeks.vega,
                    theta: greeks.theta,
                    lotQuantity: lotQuantity,
                    lotSize: lotSize,
                    type: selectedPosition,
                  });
                }}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={toggleModal}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  tableContainer: {
    backgroundColor: '#fff',
  },
  horizontalScrollContainer: {
    flex: 1,
  },
  horizontalScrollContent: {
    flexGrow: 1,
  },
  tableContent: {
    flex: 1,
  },
  stickyHeader: {
    backgroundColor: '#f5f6fa',
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    zIndex: 10,
  },
  tableBodyScroll: {
    flex: 1,
  },
   tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 50,
    alignItems: 'center',
  },
  striped: {
    backgroundColor: '#f8f9fa',
  },
  cell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  actionCell: {
    minWidth: 120,
    flex: 1.2,
  },
  strikeCell: {
    backgroundColor: '#f3f4f6',
    minWidth: 90,
    flex: 1.1,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
  },
  strikeHeaderText: {
    fontWeight: 'bold',
  },
  cellText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
  },
  strikeCellText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: '#0ab39c',
  },
  sellButton: {
    backgroundColor: '#f06548',
  },
  disabledButton: {
    backgroundColor: '#5fcdbe',
    opacity: 0.6,
  },
  disabledSellButton: {
    backgroundColor: '#f49a87',
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  legend: {
  flexDirection: 'row',
  flexWrap: 'wrap', // Allow items to wrap to next line
  justifyContent: 'space-around',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: '#ffffff',
  borderTopWidth: 1,
  borderTopColor: '#e5e7eb',
},
legendItem: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  marginBottom: 8, // Add some spacing between rows
},
legendColor: {
  width: 12,
  height: 12,
  backgroundColor: '#fbbf24',
  borderRadius: 2,
  borderWidth: 1,
  borderColor: '#f59e0b',
  flexShrink: 0, // Prevent the color box from shrinking
},
legendText: {
  fontSize: 12,
  color: '#6b7280',
  flexShrink: 1, // Allow text to shrink and wrap
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
    marginHorizontal: 24,
    maxWidth: 400,
    width: '100%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  positionSummary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalContent: {
    gap: 20,
  },
  modalSection: {
    marginBottom: 16,
  },
  positionContainer: {
    gap: 12,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  selectedRadio: {
    // Optional styling for selected state
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  radioText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  quantityContainer: {
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  quantityButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  quantityInput: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    minWidth: 60,
    alignItems: 'center',
  },
  quantityInputText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeModalButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  closeModalButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OptionChainTable;