import React, { Component } from 'react';
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as R from 'ramda';

import generalStyles from '../constants/styles';

import { Header, ListLoading } from '@components';
import Colors from '../constants/colors';
import images from '@assets/images';
import { historyOfActions } from '../network/queries';
import { userStore } from '../stores';
import { base64ToString } from '../utils';

let { width, height } = Dimensions.get('window');
const status = ['Approved', 'Deny', 'Pending'];

const ActionView = ({ style = {}, data }) => {
  const confirmTime = R.pathOr(null, ['confirmTime'], data);
  const enterTime = R.pathOr(null, ['enterTime'], data);
  const status = R.pathOr(null, ['userAction'], data);

  return (
    <View
      style={[
        {
          height: 18,
          width: 18,
          borderRadius: 9,
          borderWidth: 0.5,
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: Colors.lightGreyColor,
          backgroundColor:
            status == base64ToString('2KrYp9im24zYrw==')
              ? Colors.approveColor
              : status == base64ToString('2LHYrw==')
                ? Colors.denyColor
                : !confirmTime && !!enterTime
                  ? Colors.headerBackgroundColor
                  : 'white',
        },
        style,
      ]}
    >
      {(!!status || (!!confirmTime || !!enterTime)) && (
        <Icon
          name={
            status == base64ToString('2KrYp9im24zYrw==')
              ? 'check'
              : !confirmTime && !!enterTime
                ? 'hourglass-empty'
                : 'close'
          }
          style={{
            height: 12,
            width: 12,
            color: 'white',
          }}
        />
      )}
    </View>
  );
};

const ActionsRow = ({ data }) => {
  return (
    <View>
      <View
        style={{
          backgroundColor: Colors.white,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <ActionView style={{ marginEnd: 16 }} data={data} />
        <Text
          style={[
            {
              color: !data.userAction
                ? Colors.textLightColor
                : Colors.textColorBlack,
              textAlign: 'left',
            },
            generalStyles.englishText,
          ]}
        >
          {data.userAction
            ? data.userAction + ' | ' + data.username + ' | ' + data.confirmTime
            : data.username + ' | Pending'}
        </Text>
      </View>
      <View
        style={{
          marginStart: 16,
          marginEnd: 8,
          height: 0.5,
          backgroundColor: Colors.greyBorderColor,
        }}
      />
    </View>
  );
};

const ActionsItems = ({ gridData }) => {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={gridData}
        renderItem={history => <ActionsRow data={history.item} />}
        style={{ flex: 1 }}
        contentContainerStyle={{ backgroundColor: 'white' }}
      />
    </View>
  );
};

export default class HistoryOfActions extends Component {
  constructor(props) {
    super(props);
    const { confirmation } = this.props.navigation.state.params;
    this.confirmation = confirmation;
    this.state = {
      history: null,
      loadingHistory: false,
    };
  }

  async componentDidMount() {
    this.setState({ loadingHistory: true });
    const {
      description,
      formId,
      formName,
      historyId,
      recordId,
      userId,
      id,
    } = this.confirmation;

    const response = await historyOfActions(
      '',
      formId,
      formName,
      historyId,
      id,
      userId,
    );
    this.setState({ history: response, loadingHistory: false });
  }

  onBackPress() {
    this.props.navigation.pop();
  }
  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.backgroundColor,
        }}
      >
        <Header
          left={{
            icon: userStore.userPicture
              ? { uri: `data:image/png;base64,${userStore.userPicture}` }
              : images.icon_user,
          }}
        />
        <View style={{ flex: 1, padding: 10 }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingBottom: 8,
            }}
            onPress={() => this.onBackPress()}
          >
            <Icon
              name="keyboard-arrow-left"
              style={{
                fontSize: 15,
                color: Colors.lightGreyColor,
              }}
            />
            <Text style={[generalStyles.englishText, styles.text, {}]}>
              HISTORY OF ACTIONS
            </Text>
          </TouchableOpacity>

          {this.state.loadingHistory ? (
            <ListLoading
              style={{ backgroundColor: 'white' }}
              message="Loading History"
            />
          ) : (
            <ActionsItems gridData={this.state.history} />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    color: Colors.lightGreyColor,
    fontWeight: 'bold',
    fontSize: 12,
  },
});
