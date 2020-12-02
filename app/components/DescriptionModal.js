import React, { Component } from 'react';
import {
  TouchableOpacity,
  Image,
  Text,
  View,
  FlatList,
  Dimensions,
  TextInput,
  Platform
} from 'react-native';
import Modal from 'react-native-modal';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import Colors from '../constants/colors';
import { ModalButton } from '@components';


const { width, height } = Dimensions.get('window');

const ConfirmationDenyMessageModal = ({
  onChangeText,
  onPressButton,
  loading,
  disabled,
}) => {
  return (
    <View>
      <View
        style={{
          backgroundColor: 'white',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
          borderRadius: 5,
        }}
      >
        <View style={{ width: width / 1.5 }}>
          <Text style={{ marginBottom: 12 }}>Description </Text>
        </View>
        <View style={{
          flexDirection:'row',
          marginHorizontal: 32,
          borderColor: Colors.lightGreyColor,
          borderRadius: 4,
          borderWidth: 1,
          marginBottom: 12,
          alignItems: 'center'
        }}>
            <TextInput
              style={{
                flex:1,
                fontSize: 12,
                paddingVertical: Platform.OS=='ios' ? 16 : 8,
                paddingHorizontal: 8
              }}
              multiline={true}
              onChangeText={text => onChangeText(text)}
            />
        </View>
        <ModalButton
          onPress={onPressButton}
          loading={loading}
          disabled={disabled}
        />
      </View>
      {Platform.OS == 'ios' && <KeyboardSpacer/>}
    </View>
  );
};

export default class DescriptionModal extends Component {
  render() {
    const {
      isVisible,
      onBackPress,
      onBackdropPress,
      onChangeDescription,
      onSubmit,
      loading,
      disabled,
    } = this.props;
    return (
      <View>
        <Modal
          isVisible={isVisible}
          onBackButtonPress={onBackPress}
          onBackdropPress={onBackdropPress}
        >
          <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          pointerEvents="box-none"
          >
            <ConfirmationDenyMessageModal
              onChangeText={text => {
                onChangeDescription(text);
              }}
              onPressButton={onSubmit}
              loading={loading}
              disabled={disabled}
            />
          </View>
        </Modal>
      </View>
    );
  }
}
