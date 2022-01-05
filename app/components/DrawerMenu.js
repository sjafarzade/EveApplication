import React from 'react';
import {
  BackHandler,
  Image,
  ScrollView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { userStore } from '../stores';
import { observer } from 'mobx-react';
import Modal from 'react-native-modal';
import { DotsLoader } from 'react-native-indicator';
import {
  ifIphoneX,
  getStatusBarHeight,
  getBottomSpace,
} from 'react-native-iphone-x-helper';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import Colors from '../constants/colors';
import images from '@assets/images';
const { width } = Dimensions.get('window');
import {
  createNewFolder,
  getFolderCorrespondencesQuery,
  getCorrespondenceQuery,
} from '../network/queries';
import {
  FOLDER_OTHER_TYPE,
  FOLDER_INBOX_TYPE,
  FOLDER_DELETED_TYPE,
  FOLDER_SENT_TYPE,
  CORRESPONDENCE_DEFAULT_FILTER,
} from '../constants/constants';
import { FolderRowItem } from '@components';
import { ALL_CORRESPONDENCES_FOLDER_ID } from '../constants/constants';

const ModalContent = ({
  folderName,
  onChangeFolderName,
  onSubmit,
  loading,
}) => (
  <View>
    <View style={modalStyles.container}>
      <Text style={modalStyles.title}>Select folder name</Text>
      <TextInput
        style={[modalStyles.input, Platform.OS == 'ios' && { padding: 16 }]}
        placeholder="Example: Sent"
        placeholderTextColor={Colors.lightGreyColor}
        multiline={false}
        numberOfLines={1}
        onChangeText={folderName => onChangeFolderName(folderName)}
        value={folderName}
        onSubmitEditing={() => onSubmit()}
      />
      <TouchableOpacity onPress={() => onSubmit()}>
        <View style={modalStyles.button}>
          {loading ? (
            <DotsLoader color="white" />
          ) : (
            <Text style={{ color: Colors.white, fontSize: 16 }}>Submit</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
    {Platform.OS == 'ios' && <KeyboardSpacer />}
  </View>
);

const modalStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 2,
    elevation: 2,
    padding: 16,
    width: width / 1.2,
  },
  title: {
    color: Colors.textDarkColor,
    fontSize: 16,
  },
  input: {
    borderColor: Colors.lightGreyColor,
    borderWidth: 0.5,
    color: Colors.textColorBlack,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 4,
  },
  button: {
    backgroundColor: Colors.loginBackgroundColor,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
});

class DrawerMenu extends React.Component {
  state = {
    showModal: false,
    folderName: '',
    loading: false,
  };

  showModal() {
    this.setState({ showModal: true });
  }

  dismissModal() {
    this.setState({ showModal: false });
  }

  onChangeFolderName(folderName) {
    this.setState({ folderName });
  }

  async onSubmit() {
    this.setState({ loading: true });
    await createNewFolder(this.state.folderName);
    this.setState({ showModal: false, folderName: '', loading: false });
  }

  async onFolderPress(folderItem) {
    this.props.navigation.closeDrawer();
    userStore.setSelectedFolder(folderItem.id);
    userStore.toggleStoreUpdate();
    await getFolderCorrespondencesQuery(folderItem.id);
  }

  async showAllCorrespondences() {
    this.props.navigation.closeDrawer();
    userStore.setSelectedFolder(ALL_CORRESPONDENCES_FOLDER_ID);
    await getCorrespondenceQuery(0, '', true, CORRESPONDENCE_DEFAULT_FILTER);
  }

  render() {
    const _ = userStore.folders;
    const __ = userStore.selectedFolder;
    return (
      <ScrollView contentContainerStyle={{ flex: 1, backgroundColor: 'white' }}>
        <View
          style={{
            ...ifIphoneX(
              {
                paddingTop: getStatusBarHeight(),
                paddingBottom: getBottomSpace(),
              },
              {},
            ),
          }}
        >
          <ScrollView>
            <View>
              <FolderRowItem
                onPress={() => {
                  this.props.navigation.closeDrawer();
                  this.showAllCorrespondences();
                }}
                icon={images.icon_inbox}
                title="All Correspondences"
                unread={0}
                isImage
                selected={
                  userStore.selectedFolder == ALL_CORRESPONDENCES_FOLDER_ID
                }
              />
              <FlatList
                data={userStore.folders}
                extraData={userStore.storeUpdated}
                keyExtractor={(item, index) => index}
                renderItem={({ item }) => (
                  <FolderRowItem
                    onPress={() => this.onFolderPress(item)}
                    icon={
                      item.type == FOLDER_INBOX_TYPE
                        ? images.icon_inbox
                        : item.type == FOLDER_SENT_TYPE
                          ? 'send'
                          : item.type == FOLDER_DELETED_TYPE
                            ? 'delete'
                            : images.icon_label
                    }
                    isImage={
                      item.type == FOLDER_INBOX_TYPE ||
                      item.type == FOLDER_OTHER_TYPE
                    }
                    title={item.name}
                    unread={0}
                    scrollEnabled={false}
                    selected={userStore.selectedFolder == item.id}
                  />
                )}
              />
              <FolderRowItem
                onPress={() => {
                  this.props.navigation.closeDrawer();
                  this.showModal();
                }}
                icon={images.icon_label}
                isImage
                title="+ Create a new folder"
                lastItem
              />
            </View>
          </ScrollView>
          <Modal
            isVisible={this.state.showModal}
            onBackButtonPress={() => this.dismissModal()}
            onBackdropPress={() => this.dismissModal()}
          >
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              pointerEvents="box-none"
            >
              <ModalContent
                folderName={this.state.folderName}
                onChangeFolderName={folderName =>
                  this.onChangeFolderName(folderName)
                }
                onSubmit={() => this.onSubmit()}
                loading={this.state.loading}
              />
            </View>
          </Modal>
        </View>
      </ScrollView>
    );
  }
}

export default observer(DrawerMenu);
