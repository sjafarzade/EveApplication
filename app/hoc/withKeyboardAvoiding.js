import React, {Component} from 'react';
import {KeyboardAvoidingView, ScrollView, StyleSheet, Platform,Dimensions} from 'react-native';

const { width, height } = Dimensions.get('window');

export default class WithKeyboardAvoiding extends Component {


  render() {
    return(
      <KeyboardAvoidingView
        behavior="position"
        enabled={Platform.OS=='ios'}
        contentContainerStyle={styles.container}
        keyboardVerticalOffset={-height/6}
        style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.container}
            style={styles.container}>
              {this.props.children}
          </ScrollView>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  container : {
    flex : 1,
  }
})
