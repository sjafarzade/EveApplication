import React, { Component } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import Colors from '../constants/colors';

export default class FooterLoading extends Component {
  render() {
    if (!this.props.loading) return null;

    return (
      <View style={styles.container}>
        <ActivityIndicator
          animating
          size="large"
          color={Colors.tabviewBorderColor}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    backgroundColor: 'white',
    alignItems: 'center',
  },
});
