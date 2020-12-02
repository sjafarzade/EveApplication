import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { CirclesLoader } from 'react-native-indicator';
import Colors from '../constants/colors';

export default class ListLoading extends Component {
  render() {
    const { style, message } = this.props;
    return (
      <View style={[styles.container, style]}>
        <CirclesLoader color={Colors.tabviewBorderColor} size={36} />
        <Text style={styles.text}>{message}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  text: {
    marginTop: 32,
    fontSize: 18,
    color: Colors.tabviewBorderColor,
  },
});
