import React from 'react';
import { View, Image, Text, Dimensions, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Colors from '../constants/colors';
import generalStyles from '../constants/styles';
const { width, height } = Dimensions.get('window');

const SwipeableViewButton = ({ type, backgroundColor, title, image }) => (
  <View style={[styles.container, { backgroundColor }]}>
    {image ? (
      <Image style={[styles.image, { tintColor: 'white' }]} source={image} />
    ) : (
      <Icon name={type} style={styles.icon} />
    )}
    <Text style={[generalStyles.englishText, styles.text]}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: 'white',
    fontSize: 25,
  },
  text: { color: 'white' },
  image: {
    width: width / 10,
    height: height / 20,
    resizeMode: 'contain',
  },
});

export default SwipeableViewButton;
