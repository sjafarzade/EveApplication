import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Colors from '../constants/colors';

export default class ToastView extends Component {
  render() {
    const { message } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{message}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 300,
  },
  text: {
    color: Colors.white,
    textAlign: 'center',
  },
});
