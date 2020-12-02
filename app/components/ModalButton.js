import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { DotsLoader } from 'react-native-indicator';

import Colors from '../constants/colors';
import generalStyles from '../constants/styles';
const { width, height } = Dimensions.get('window');

export default (ModalButton = ({ onPress, loading, disabled, style = {} }) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      style={{
        backgroundColor: Colors.darkYellowColor,
        opacity: disabled ? 0.6 : 1,
        padding: 8,
        borderRadius: 5,
        width: width / 4,
        height: height / 20,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={onPress}
    >
      {!loading ? (
        <Text style={[generalStyles.englishText, { color: 'white' }]}>
          Submit
        </Text>
      ) : (
        <DotsLoader color="white" size={4} />
      )}
    </TouchableOpacity>
  );
});
