import React, { Component } from 'react';
import { Text, View, Dimensions, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { observer } from 'mobx-react/native';
import Toast, { DURATION } from 'react-native-easy-toast';

import { CartbotRow, SearchBar, ListLoading, FooterLoading } from '@components';
import Colors from '../constants/colors';
import images from '@assets/images';
import {
  getConfirmationQuery,
  confirmationAprrove,
  confirmationDeny,
  confirmationArchive,
  returnBackfromApprove,
} from '../network/queries';
import { CONFIRMATION_DEFAULT_FILTER, PAGE_SIZE } from '../constants/constants';
import { userStore } from '../stores';
import { DescriptionModal, EmptyComponent } from '@components';

const keyExtractor = (item, index) => index;
const { width, height } = Dimensions.get('window');

class Cartbot extends Component {
  state = {
    searchText: '',
    loadingMore: false,
    refreshing: false,
    selectedItem: null,
    description: '',
    type: '',
    modalLoading: false,
  };

  async onPull() {
    this.setState({ refreshing: true });
    await getConfirmationQuery(0, '', true, CONFIRMATION_DEFAULT_FILTER);
    this.setState({ refreshing: false });
  }

  async onLoadMore() {
    if (!!this.state.searchText || this.state.loadingMore) return;
    this.setState({ loadingMore: true });
    if (userStore.confirmations.length % PAGE_SIZE == 0) {
      await getConfirmationQuery(
        Math.floor(userStore.confirmations.length / PAGE_SIZE),
        '',
        true,
        CONFIRMATION_DEFAULT_FILTER,
      );
    }
    this.setState({ loadingMore: false });
  }

  async changeSearchBarText(text) {
    await this.setState({ searchText: text });
  }

  clearSearchBarText() {
    this.setState({ searchText: '' });
  }

  async onAccept(confirmation) {
    const {
      description,
      formId,
      formName,
      historyId,
      recordId,
      userId,
      id,
    } = confirmation;

    const approveRes = await confirmationAprrove(
      description,
      formId,
      formName,
      historyId,
      id,
      userId,
    );
    if (!approveRes) {
      this.refs.errorToast.show('Approving Cartbot Failed', 2000);
      return;
    }
    userStore.removeConfirmationFromStore(id);
    this.refs.successToast.show('Successfully Approved', 2000);
  }

  async onDeny(confirmation) {
    this.setState({
      selectedItem: confirmation,
      description: '',
      type: 'Deny',
    });
    this.showModal();
  }

  async onReturn(confirmation) {
    this.setState({
      selectedItem: confirmation,
      description: '',
      type: 'Return',
    });
    this.showModal();
  }

  async denyConfirmation() {
    const {
      formId,
      formName,
      historyId,
      recordId,
      userId,
      id,
    } = this.state.selectedItem;
    this.setState({ modalLoading: true });
    const denyRes = await confirmationDeny(
      this.state.description,
      formId,
      formName,
      historyId,
      id,
      userId,
    );

    if (!denyRes) {
      this.setState({ modalLoading: false });
      this.refs.errorToast.show('Denying Cartbot Failed', 2000);
      this.dismissModal();

      return;
    }
    this.setState({ modalLoading: false });
    userStore.removeConfirmationFromStore(id);
    this.dismissModal();
    this.refs.successToast.show('Successfully Denied', 2000);
  }

  async returnConfirmation() {
    const {
      formId,
      formName,
      historyId,
      recordId,
      userId,
      id,
    } = this.state.selectedItem;
    this.setState({ modalLoading: true });
    const returnRes = await returnBackfromApprove(
      this.state.description,
      formId,
      formName,
      historyId,
      id,
      userId,
    );

    if (!returnRes) {
      this.setState({ modalLoading: false });

      this.refs.errorToast.show('Returning  Cartbot Failed', 2000);
      this.dismissModal();
      return;
    }
    this.setState({ modalLoading: false });

    userStore.removeConfirmationFromStore(id);
    this.dismissModal();
    this.refs.successToast.show('Successfully Returned', 2000);
  }

  showModal() {
    this.setState({
      showModal: true,
    });
  }

  dismissModal() {
    this.setState({
      showModal: false,
    });
  }

  onChangeDescription(text) {
    this.setState({ description: text });
  }

  render() {
    const { onPressConfirmation, loading } = this.props;

    const { refreshing } = this.state;
    const confirmations = userStore.confirmations;
    const sortedConfirmations = confirmations.sort(
      (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
    );
    const filteredMessages = !!this.state.searchText
      ? sortedConfirmations.filter(
          item =>
            item.id
              .toLowerCase()
              .includes(this.state.searchText.toLowerCase()) ||
            item.description
              .toLowerCase()
              .includes(this.state.searchText.toLowerCase()),
        )
      : sortedConfirmations;
    return (
      <View style={{ flex: 1 }}>
        <DescriptionModal
          isVisible={this.state.showModal}
          onBackPress={() => this.dismissModal()}
          onBackdropPress={() => this.dismissModal()}
          onChangeDescription={text => this.onChangeDescription(text)}
          onSubmit={() => {
            if (this.state.type == 'Deny') {
              this.denyConfirmation();
            } else this.returnConfirmation();
          }}
          loading={this.state.modalLoading}
          disabled={!this.state.description || this.state.modalLoading}
        />
        <SearchBar
          onChangeText={text => this.changeSearchBarText(text)}
          onClear={() => this.clearSearchBarText()}
          placeholder="Cartbot search"
          value={this.state.searchText}
        />
        {loading ? (
          <ListLoading
            message="Loading Cartbot"
            style={{ backgroundColor: 'white' }}
          />
        ) : (
          <FlatList
            data={filteredMessages}
            renderItem={confirmation => (
              <CartbotRow
                confirmation={confirmation.item}
                onPressConfirmation={onPressConfirmation}
                onAccept={confirmation => this.onAccept(confirmation)}
                onDeny={confirmation => this.onDeny(confirmation)}
                onReturn={confirmation => this.onReturn(confirmation)}
              />
            )}
            style={{ flex: 1 }}
            contentContainerStyle={[
              { backgroundColor: 'white' },
              filteredMessages.length == 0 && { flex: 1 },
            ]}
            onRefresh={() => this.onPull()}
            refreshing={refreshing}
            keyExtractor={keyExtractor}
            ListFooterComponent={() => (
              <FooterLoading loading={this.state.loadingMore} />
            )}
            onEndReached={() => this.onLoadMore()}
            disableVirtualization={true}
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
          />
        )}
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

export default observer(Cartbot);
