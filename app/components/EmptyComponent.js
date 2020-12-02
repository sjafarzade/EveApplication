import React, { Component } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

import Colors from '../constants/colors';
import images from '@assets/images';

export default class EmptyComponent extends Component {
  render() {
    const { title, image } = this.props;
    return (
      <View style={styles.container}>
        <Image style={styles.image} source={image} />
        <Text style={styles.text}>{title}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: 120,
    width: 120,
    resizeMode: 'contain',
    tintColor: Colors.loginBackgroundColor,
  },
  text: {
    fontSize: 16,
    marginTop: 32,
    color: Colors.loginBackgroundColor,
  },
});
