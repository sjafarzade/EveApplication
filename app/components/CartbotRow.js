import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import SwipeableView from 'react-native-swipeable-view';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Colors from '../constants/colors';
import images from '@assets/images';
import generalStyles from '../constants/styles';
import { textWrapper, timeFormatter } from '../utils';
import { CONFIRMATION_TYPE_TO_ICON } from '../constants/constants';
import { SwipeableViewButton } from '@components';

const { width, height } = Dimensions.get('window');

const cartbotRowButtons = (confirmation, onAccept, onDeny, onReturn) => {
  return [
    {
      onPress: () => onAccept(confirmation),
      component: (
        <SwipeableViewButton
          type="check"
          backgroundColor={Colors.approveColor}
          title="Approve"
        />
      ),
    },
    {
      onPress: () => onDeny(confirmation),
      component: (
        <SwipeableViewButton
          type="close"
          backgroundColor={Colors.denyColor}
          title="Deny"
        />
      ),
    },
    {
      onPress: () => onReturn(confirmation),
      component: (
        <SwipeableViewButton
          type="reply"
          backgroundColor={Colors.archiveColor}
          title="Return"
        />
      ),
    },
  ];
};

export default function CartbotRow({
  index,
  onPressConfirmation,
  onAccept,
  onDeny,
  onReturn,
  confirmation: {
    attachments,
    userId,
    username,
    id,
    resend,
    typeID,
    typeDescription,
    time_en,
    comment = 'No content to display ...',
    blocked,
    deleted,
    pending,
    description,
    fromUsername,
    creator,
    procedureName,
  },
  confirmation,
}) {
  const icon = CONFIRMATION_TYPE_TO_ICON[typeID];
  return (
    <SwipeableView
      key={index}
      btnsArray={cartbotRowButtons(confirmation, onAccept, onDeny, onReturn)}
      isRTL={false}
      autoClose={true}
    >
      <TouchableOpacity onPress={() => onPressConfirmation(confirmation)}>
        <View style={styles.container}>
          <View style={styles.subContainer}>
            <View style={{ paddingTop: 4 }}>
              <Image style={styles.icon} source={icon} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.upperView}>
                <Text style={[generalStyles.englishText, styles.stateText]}>
                  {textWrapper(typeDescription, 20)}
                </Text>
                <View style={styles.timeContainer}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[generalStyles.englishText]}>{id} -</Text>
                  </View>
                  <Text
                    style={[
                      generalStyles.englishText,
                      styles.number,
                      { marginStart: 4 },
                    ]}
                  >
                    {time_en}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[generalStyles.englishText, styles.sender]}>
                  {textWrapper(fromUsername, 20)}
                </Text>
              </View>
              <View style={styles.lowerView}>
                <Text style={[generalStyles.englishText, styles.content]}>
                  {procedureName
                    ? textWrapper(procedureName, height / 12)
                    : '[No Name]'}
                </Text>

                {attachments.length > 0 && (
                  <Icon name="attach-file" style={styles.attachment} />
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </SwipeableView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingVertical: 16,
    paddingStart: 24,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: Colors.listBorder,
  },
  subContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  icon: {
    width: width / 14,
    height: height / 20,
    resizeMode: 'contain',
    marginEnd: 8,
  },
  upperView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stateText: {
    flex: 1,
    color: 'black',
    fontSize: 17,
    textAlign: 'left',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  number: { color: Colors.lightGreyColor, fontSize: 15 },
  sender: { color: Colors.darkGreyColor, fontSize: 14, textAlign: 'left' },
  lowerView: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    color: Colors.lightGreyColor,
    fontSize: 14,
    textAlign: 'left',
  },
  attachment: {
    color: Colors.lightGreyColor,
    fontWeight: 'bold',
    fontSize: 24,
    marginEnd: 8,
  },
});
