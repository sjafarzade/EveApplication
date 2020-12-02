import React, { Component } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

import Colors from '../constants/colors';
import images from '@assets/images';

export default class LogoutModal extends Component {
  render() {
    const { image, onLogout, username } = this.props;
    return (
      <View style={{ flex: 1, paddingTop: 40 }} pointerEvents="box-none">
        <View style={styles.container}>
          <Image source={image} style={styles.image} />
          <Text style={styles.text}>{username}</Text>
          <TouchableOpacity onPress={onLogout}>
            <Image source={images.icon_logout} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    elevation: 2,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  image: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  text: {
    color: Colors.textLightColor,
    fontSize: 18,
    flex: 1,
    marginHorizontal: 8,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: Colors.lightGreyColor,
  },
});
