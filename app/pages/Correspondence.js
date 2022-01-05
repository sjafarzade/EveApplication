import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { observer } from 'mobx-react';
import Modal from 'react-native-modal';
import Toast, { DURATION } from 'react-native-easy-toast';

import Colors from '../constants/colors';
import images from '@assets/images';
import {
  getCorrespondenceQuery,
  moveCorrespondenceQuery,
  getFolderCorrespondencesQuery,
} from '../network/queries';
import {
  CORRESPONDENCE_DEFAULT_FILTER,
  PAGE_SIZE,
  ALL_CORRESPONDENCES_FOLDER_ID,
} from '../constants/constants';
import { userStore } from '../stores';
import {
  CorrespondenceRow,
  SearchBar,
  ListLoading,
  FooterLoading,
  MoveFolderModalContent,
  EmptyComponent,
  ToastView,
} from '@components';

const keyExtractor = (item, index) => index;
const { width, height } = Dimensions.get('window');

class Correspondence extends Component {
  state = {
    searchText: '',
    loadingMore: false,
    refreshing: false,
    showModal: false,
  };

  async onPull() {
    this.setState({ refreshing: true });
    let correspondenceRes;
    if (
      !!userStore.selectedFolder &&
      userStore.selectedFolder !== ALL_CORRESPONDENCES_FOLDER_ID
    ) {
      const correspondenceRes = await getFolderCorrespondencesQuery(
        userStore.selectedFolder,
        0,
      );
    } else {
      const correspondenceRes = await getCorrespondenceQuery(
        0,
        '',
        true,
        CORRESPONDENCE_DEFAULT_FILTER,
      );
    }
    if (!correspondenceRes) {
      this.props.toggleError(true);
    }
    this.props.toggleError(false);

    this.setState({ refreshing: false });
  }

  async onLoadMore() {
    if (!!this.state.searchText || this.state.loadingMore) return;
    this.setState({ loadingMore: true });
    if (userStore.correspondences.length % PAGE_SIZE == 0) {
      if (
        !!userStore.selectedFolder &&
        userStore.selectedFolder !== ALL_CORRESPONDENCES_FOLDER_ID
      ) {
        await getFolderCorrespondencesQuery(
          userStore.selectedFolder,
          Math.floor(userStore.correspondences.length / PAGE_SIZE),
        );
      } else {
        await getCorrespondenceQuery(
          Math.floor(userStore.correspondences.length / PAGE_SIZE),
          '',
          true,
          CORRESPONDENCE_DEFAULT_FILTER,
        );
      }
    }
    this.setState({ loadingMore: false });
  }

  async changeSearchBarText(text) {
    await this.setState({ searchText: text });
  }

  clearSearchBarText() {
    this.setState({ searchText: '' });
  }

  dismissModal() {
    this.setState({ showModal: false, selectedItem: null });
  }

  showModal(selectedItem) {
    this.setState({ showModal: true, selectedItem });
  }

  async onMove(folder) {
    const moveRes = await moveCorrespondenceQuery(
      this.state.selectedItem.number,
      folder,
    );
    if (!moveRes) {
      this.refs.errorToast.show(
        <ToastView message="Error in Moving to Folder!" />,
        2000,
      );
    }
    this.refs.successToast.show(
      <ToastView message="Successfully Moved!" />,
      2000,
    );
    this.dismissModal();
  }

  render() {
    const _ = userStore.storeUpdated;
    const { onPressCorrespondence, onPressCompose, loading } = this.props;
    const correspondences = userStore.correspondences;
    const { refreshing } = this.state;
    const sortedCorrespondences = correspondences.sort(
      (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
    );
    const filteredCorrespondences = !!this.state.searchText
      ? sortedCorrespondences.filter(
          item =>
            item.senderName
              .toLowerCase()
              .includes(this.state.searchText.toLowerCase()) |
            item.receivers
              .toLowerCase()
              .includes(this.state.searchText.toLowerCase()) |
            item.number
              .toLowerCase()
              .includes(this.state.searchText.toLowerCase()) |
            item.subject
              .toLowerCase()
              .includes(this.state.searchText.toLowerCase()),
        )
      : sortedCorrespondences;
    return (
      <View style={{ flex: 1 }}>
        <Modal
          isVisible={this.state.showModal}
          onBackButtonPress={() => this.dismissModal()}
          onBackdropPress={() => this.dismissModal()}
        >
          <MoveFolderModalContent
            data={userStore.folders}
            onSubmit={folder => this.onMove(folder)}
          />
        </Modal>
        <SearchBar
          onChangeText={text => this.changeSearchBarText(text)}
          onClear={() => this.clearSearchBarText()}
          placeholder="Correspondence search"
          value={this.state.searchText}
        />
        {loading ? (
          <ListLoading
            message="Loading Correspondences"
            style={{ backgroundColor: 'white' }}
          />
        ) : (
          <FlatList
            data={filteredCorrespondences}
            renderItem={(correspondence, index) => (
              <CorrespondenceRow
                correspondence={correspondence.item}
                onPress={onPressCorrespondence}
                attachment={Math.floor(Math.random() * 2) == 1}
                onMove={correspondence => this.showModal(correspondence)}
                index={index}
              />
            )}
            ListEmptyComponent={() => (
              <EmptyComponent
                title={
                  !!this.state.searchText
                    ? 'No Item Found!'
                    : this.state.error
                      ? 'No Internet Connection!'
                      : 'No content exist!'
                }
                image={
                  this.state.error
                    ? images.icon_network
                    : images.icon_empty_list
                }
              />
            )}
            contentContainerStyle={[
              { backgroundColor: 'white' },
              filteredCorrespondences.length == 0 && { flex: 1 },
            ]}
            onRefresh={() => this.onPull()}
            refreshing={refreshing}
            extraData={userStore.correspondences}
            keyExtractor={keyExtractor}
            ListFooterComponent={() => (
              <FooterLoading loading={this.state.loadingMore} />
            )}
            onEndReached={() => this.onLoadMore()}
            disableVirtualization={true}
          />
        )}
        <View style={correspondenceStyles.absoluteViewContainer}>
          <TouchableOpacity onPress={onPressCompose}>
            <Image
              style={correspondenceStyles.icon}
              source={images.icon_compose}
            />
          </TouchableOpacity>
        </View>
        <Toast
          ref="errorToast"
          style={{ backgroundColor: Colors.lightRed }}
          position="top"
          positionValue={32}
          textStyle={{ color: Colors.white }}
        />
        <Toast
          ref="successToast"
          style={{
            backgroundColor: Colors.lightGreen,
            width: 200,
            alignItems: 'center',
          }}
          position="top"
          positionValue={32}
          textStyle={{ color: Colors.white }}
        />
      </View>
    );
  }
}

const correspondenceStyles = StyleSheet.create({
  absoluteViewContainer: { position: 'absolute', end: 8, bottom: 8 },
  icon: {
    width: width / 8,
    height: height / 13.5,
    resizeMode: 'contain',
  },
});

export default observer(Correspondence);
