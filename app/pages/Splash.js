import React, { Component } from 'react';
import { View, Text, Image, AsyncStorage, StyleSheet } from 'react-native';
import { BubblesLoader } from 'react-native-indicator';
import { NavigationActions, StackActions } from 'react-navigation';

import Colors from '../constants/colors';
import images from '@assets/images';
import {
  loginQuery,
  userInfoQuery,
  getPersonsLookupQuery,
} from '../network/queries';

const array = [0, 0, 0, 0];
export default class Splash extends Component {
  state = {
    counter: 0,
  };

  goToMain() {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Main' })],
    });
    this.props.navigation.dispatch(resetAction);
  }

  goToLogin() {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Login' })],
    });
    this.props.navigation.dispatch(resetAction);
  }

  async componentDidMount() {
    const self = this;
    setInterval(function() {
      self.setState({ counter: (self.state.counter + 1) % 4 });
    }, 500);

    const username = await AsyncStorage.getItem('username');
    const password = await AsyncStorage.getItem('password');
    const remember = JSON.parse(await AsyncStorage.getItem('remember'));
    if (!!remember) {
      if (!!username && !!password) {
        const loginStatus = await loginQuery(username, password);
        if (loginStatus) {
          await userInfoQuery();
          await getPersonsLookupQuery();
          this.goToMain();
        } else {
          this.goToLogin();
        }
      } else {
        this.goToLogin();
      }
    } else {
      this.goToLogin();
    }
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.headerBackgroundColor,
          paddingVertical: 64,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Image
          source={images.logo_eve}
          style={{ height: 128, width: 256, resizeMode: 'contain' }}
        />
        <View style={{ marginBottom: 64, alignItems: 'center' }}>
          <BubblesLoader color="white" size={48} />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 24,
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, marginEnd: 4 }}>
              Loading
            </Text>
            {array.slice(0, this.state.counter).map((item, index) => (
              <Text key={index} style={{ color: 'white', fontSize: 18 }}>
                .
              </Text>
            ))}
            {array.slice(this.state.counter, 4).map((item, index) => (
              <Text key={index} style={{ color: 'white', fontSize: 18 }}>
                {' '}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  }
}
