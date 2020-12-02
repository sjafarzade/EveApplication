import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Colors from '../constants/colors';
import generalStyles from '../constants/styles';

const FolderRowItem = ({
  onPress,
  isImage,
  icon,
  title,
  unread,
  lastItem,
  selected,
}) => {
  return (
    <TouchableOpacity
      iconRight
      style={[
        styles.container,
        lastItem && { borderBottomWidth: 0 },
        selected && { backgroundColor: Colors.lightGreyColor },
      ]}
      onPress={onPress}
    >
      <View style={{ marginStart: 8 }}>
        {isImage ? (
          <Image
            style={{ width: 20, height: 20, resizeMode: 'contain' }}
            source={icon}
          />
        ) : (
          <Icon name={icon} style={styles.icon} />
        )}
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[generalStyles.englishText, styles.title]}>
          {title.includes('رسیده')
            ? 'Received'
            : title.includes('ارسال')
              ? 'Sent'
              : title.includes('حذف')
                ? 'Deleted'
                : title}
        </Text>
      </View>
      {unread && unread > 0 ? (
        <View style={{ justifyContent: 'center' }}>
          <Text
            style={[
              generalStyles.englishText,
              styles.rightText,
              lastItem && { color: Colors.switchActiveColor },
            ]}
          >
            {unread}
          </Text>
        </View>
      ) : (
        <View />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: Colors.greyBorderColor,
    padding: 15,
  },
  image: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  title: {
    textAlign: 'center',
    color: Colors.headerBackgroundColor,
    fontSize: 12,
  },
  rightText: {
    color: Colors.lightGreyColor,
    fontSize: 11,
    textAlign: 'center',
  },
  icon: {
    color: Colors.headerBackgroundColor,
    fontSize: 22,
  },
});

export default FolderRowItem;
