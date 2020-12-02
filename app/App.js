import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  AsyncStorage,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {StackNavigator, DrawerNavigator} from 'react-navigation';
import Orientation from 'react-native-orientation';

import * as components from '@components';
import * as screens from '@screens';
import {userStore} from './stores';

const {height, width} = Dimensions.get('window');
// console.disableYellowBox = true;
export default class EveApp extends Component {
  componentWillMount() {
    Orientation.lockToPortrait();
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
        }}>
        <View style={{...StyleSheet.absoluteFillObject, flex: 1}}>
          <TouchableWithoutFeedback
            style={{flex: 1}}
            onPress={() => {
              Keyboard.dismiss();
            }}
            pointerEvents="box-none">
            <View style={{flex: 1}} />
          </TouchableWithoutFeedback>
        </View>
        <MainNavigator />
      </View>
    );
  }
}

const MainScreenWithDrawer = DrawerNavigator(
  {
    Main: {screen: screens.Main},
  },
  {
    drawerPosition: 'right',
    drawerOpenRoute: 'DrawerOpen',
    drawerCloseRoute: 'DrawerClose',
    drawerBackgroundColor: '#c7c7c7',
    drawerWidth: width / 1.8,
    contentComponent: components.DrawerMenu,
    header: {
      visible: false,
    },
  },
);

const MailViewScreenWithDrawer = DrawerNavigator(
  {
    Main: {screen: screens.MailView},
  },
  {
    drawerPosition: 'right',
    drawerOpenRoute: 'DrawerOpen',
    drawerCloseRoute: 'DrawerClose',
    drawerBackgroundColor: '#c7c7c7',
    drawerWidth: width / 1.8,
    contentComponent: components.DrawerMenu,
    header: {
      visible: false,
    },
  },
);

const MainNavigator = StackNavigator(
  {
    Splash: {screen: screens.Splash},
    Login: {screen: screens.Login},
    Main: {screen: MainScreenWithDrawer},
    CartbotView: {screen: screens.CartbotView},
    MailView: {screen: MailViewScreenWithDrawer},
    MailCompose: {screen: screens.MailCompose},
    HistoryOfActions: {screen: screens.HistoryOfActions},
    AttachFile: {screen: screens.AttachFile},
    ToDoList: {screen: screens.ToDoList},
  },
  {headerMode: 'none'},
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
