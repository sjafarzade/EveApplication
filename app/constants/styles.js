import { StyleSheet, Dimensions } from 'react-native';
import { backgroundColor, emailContainerBackground } from '../constants/colors';
import Colors from './colors';

let { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    backgroundColor,
    flex: 1,
  },
  mailContainer: {
    flex: 1,
    backgroundColor: emailContainerBackground,
    padding: 16,
    justifyContent: 'space-between',
  },
  composeItemsStyle: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.disabledTextColor,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  composeInputTexts: {
    fontSize: 15,
    color: Colors.textLightColor,
  },
  englishText: {},
  persianText: {},
});
