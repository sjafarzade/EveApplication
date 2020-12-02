import React, { Component } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  WebView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Colors from '../constants/colors';
import { textWrapper, timeFormatter, extractContent } from '../utils';
import generalStyles from '../constants/styles';
import SwipeableView from 'react-native-swipeable-view';
import { SwipeableViewButton } from '@components';
import images from '@assets/images';

const { width, height } = Dimensions.get('window');
const correspondenceRowButtons = (correspondence, onMove) => {
  return [
    {
      onPress: () => onMove(correspondence),
      component: (
        <SwipeableViewButton
          image={images.icon_move}
          backgroundColor={Colors.loginBackgroundColor}
          title="Move to"
        />
      ),
    },
  ];
};

export default function CorrespondenceRow({
  onPress,
  index,
  correspondence: {
    number,
    fromID,
    fromName,
    senderName,
    toID,
    toName,
    receivers,
    subject,
    subjectCatagory,
    enDate,
    faDate,
    receiverCopy,
    urgencyType,
    letterNo,
    secure,
    seen,
    attachments,
    parentId,
    content,
    sent,
  },
  correspondence,
  onMove,
}) {
  let i = extractContent(content).length;
  return (
    <SwipeableView
      key={index}
      btnsArray={correspondenceRowButtons(correspondence, onMove)}
      isRTL={false}
      autoClose={true}
    >
      <TouchableOpacity onPress={() => onPress(correspondence)}>
        <View
          style={[
            styles.container,
            { backgroundColor: !seen ? 'white' : '#F3F3F3' },
          ]}
        >
          <View style={styles.leftContainer}>
            <View
              style={[
                {
                  backgroundColor:
                    secure == 1
                      ? Colors.confidentialIndentifierColor
                      : seen ? 'transparent' : Colors.normalIdentifierColor,
                },
                styles.identifier,
              ]}
            />

            <Text
              style={[
                generalStyles.englishText,
                styles.title,
                { fontWeight: seen ? 'normal' : 'bold' },
              ]}
            >
              {textWrapper(senderName, 20)}
            </Text>
            {!!urgencyType && (
              <View style={[styles.starContainer]}>
                <Icon
                  name="grade"
                  style={{
                    color:
                      urgencyType == 3
                        ? Colors.highPriorityColor
                        : urgencyType == 2
                          ? Colors.confidentialIndentifierColor
                          : Colors.disabledTextColor,
                    fontSize: 16,
                  }}
                />
              </View>
            )}
            <Text>{number} -</Text>
            <View style={styles.timeContainer}>
              <Text style={[generalStyles.englishText, styles.time]}>
                {enDate}
              </Text>
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            {sent ? (
              <Icon
                name="forward"
                style={{
                  fontSize: 12,
                  color: Colors.lightGreyColor,
                  marginTop: 4,
                }}
              />
            ) : (
              <View />
            )}
            <Text
              style={[
                generalStyles.englishText,
                styles.subject,
                {
                  fontWeight: seen ? 'normal' : 'bold',
                  marginStart: sent ? 4 : 16,
                },
              ]}
            >
              {textWrapper(subject, 20)}
            </Text>
          </View>
          <View style={styles.contentContainer}>
            <Text
              style={[
                styles.englishText,
                styles.content,
                {
                  marginEnd: 20,
                  fontWeight: seen ? 'normal' : 'bold',
                },
              ]}
              numberOfLines={2}
            >
              {extractContent(content) != 0
                ? extractContent(content)
                : '[No content]'}
            </Text>
            {attachments &&
              attachments.length > 0 && (
                <Icon name="attach-file" style={styles.icon} />
              )}
          </View>
        </View>
      </TouchableOpacity>
    </SwipeableView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingStart: 24,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: Colors.listBorder,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: 2.5,
    borderColor: '#DADFE4',
    paddingEnd: 3,
  },
  identifier: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginEnd: 8,
  },
  title: {
    flex: 1,
    marginBottom: 8,
    color: 'black',
    fontSize: 17,
    textAlign: 'left',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: width / 4,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: 2.5,
    borderColor: Colors.listBorder,
    paddingEnd: 4,
  },
  time: {
    color: Colors.lightGreyColor,
    fontSize: 15,
    marginStart: 4,
  },
  subject: {
    color: 'black',
    fontSize: 15,
  },
  contentContainer: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 4,
  },
  content: {
    flex: 1,
    color: Colors.lightGreyColor,
    fontSize: 14,
    marginStart: 24,
    height: height / 18,
    marginTop: 8,
  },
  icon: {
    color: Colors.lightGreyColor,
    fontWeight: 'bold',
    fontSize: 24,
    marginEnd: 8,
  },
});
