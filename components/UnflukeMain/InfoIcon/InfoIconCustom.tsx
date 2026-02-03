import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  Dimensions,
  useColorScheme, 
  useWindowDimensions
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const InfoIconCustom = ({ tooltipText }) => {
  const {width} = useWindowDimensions()
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const toggleTooltip = () => setTooltipVisible(!tooltipVisible);
  const hideTooltip = () => setTooltipVisible(false);

  const styles = StyleSheet.create({
    iconContainer: {
      marginLeft: 4,
      padding: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    tooltipContainer: {
      backgroundColor: isDark ? '#374151' : '#1f2937',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    tooltipText: {
      color: '#ffffff',
      fontSize: 14,
      textAlign: 'center',
    },
  });

  return (
    <View>
      <TouchableOpacity onPress={toggleTooltip} style={styles.iconContainer}>
         <Svg width={16} height={16} viewBox="0 0 16 16" fill="#007AFF">
          <Circle cx={8} cy={8} r={8} fill="transparent" />
          <Path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm0-15A7 7 0 1 1 1 8a7 7 0 0 1 7-7zm.93 4.412c-.2-.2-.45-.312-.73-.312s-.53.112-.73.312c-.2.2-.312.45-.312.73s.112.53.312.73c.2.2.45.312.73.312s.53-.112.73-.312c.2-.2.312-.45.312-.73s-.112-.53-.312-.73zM8 6a1 1 0 1 0 .001-2A1 1 0 0 0 8 6zm-1 3h2v5H7v-5z" />
        </Svg>
      </TouchableOpacity>

      <Modal
        visible={tooltipVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideTooltip}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={hideTooltip}
        >
          <View style={[styles.tooltipContainer,{      maxWidth: width - 40,
}]}>
            <Text style={styles.tooltipText}>{tooltipText}</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default InfoIconCustom;