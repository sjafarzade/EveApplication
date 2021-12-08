import React, { Component } from "react";
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Keyboard,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as R from "ramda";
import Toast, { DURATION } from "react-native-easy-toast";

import generalStyles from "../constants/styles";

import { Header, ListLoading, AnnouncementModal } from "@components";
import Colors from "../constants/colors";
import images from "@assets/images";
import { announcementQuery, submitAnnouncementQuery } from "../network/queries";
import { userStore } from "../stores";

let { width, height } = Dimensions.get("window");

const AnnouncementRow = ({ data }) => {
  return (
    <View
      style={{
        padding: 16,
        elevation: 2,
        marginVertical: 4,
        backgroundColor: Colors.white,
        borderRadius: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
      }}
    >
      <Text
        style={{
          fontSize: 17,
          fontWeight: "bold",
          textAlign: "auto",
          marginBottom: 12,
        }}
      >
        {data.name}
      </Text>

      <Text style={{ fontSize: 15, textAlign: "auto" }}>{data.comment}</Text>
    </View>
  );
};

const AnnouncementItems = ({ data }) => {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        renderItem={(announcement) => (
          <AnnouncementRow data={announcement.item} />
        )}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default class Announcement extends Component {
  constructor(props) {
    super(props);
    const { confirmation } = this.props.navigation.state.params;
    this.confirmation = confirmation;
    this.state = {
      announcements: null,
      loading: false,
      showModal: false,
      announcementInfo: "",
      loadingSubmitAnnouncement: false,
    };
  }

  async componentDidMount() {
    await this.getAnnouncements();
  }

  async getAnnouncements() {
    const { formId, id } = this.confirmation;
    this.setState({ loading: true });
    const response = await announcementQuery(formId, id);
    this.setState({ announcements: response, loading: false });
  }

  onAdd() {
    this.setState({ showModal: true });
  }

  onBackPress() {
    this.props.navigation.pop();
  }

  dismissModal() {
    this.setState({
      showModal: false,
      announcementInfo: "",
    });
  }

  onChangeAnnouncement(text) {
    this.setState({ announcementInfo: text });
  }

  async onSubmitAnnouncement() {
    Keyboard.dismiss();
    const { formId, id } = this.confirmation;
    this.setState({ loadingSubmitAnnouncement: true });

    const submitRes = await submitAnnouncementQuery(
      this.state.announcementInfo,
      formId,
      id
    );
    this.setState({ loadingSubmitAnnouncement: false });
    if (!submitRes) {
      this.refs.errorToast.show(
        <ToastView message="Error in Submitting Announcement." />,
        2000
      );
      return;
    }
    this.dismissModal();
    await this.getAnnouncements();
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.backgroundColor,
        }}
      >
        <AnnouncementModal
          isVisible={this.state.showModal}
          onBackPress={() => {
            this.dismissModal();
          }}
          onBackdropPress={() => {
            this.dismissModal();
          }}
          onChangeDescription={(text) => this.onChangeAnnouncement(text)}
          onSubmit={() => this.onSubmitAnnouncement()}
          loading={this.state.loadingSubmitAnnouncement}
        />

        <Header
          left={{
            icon: userStore.userPicture
              ? { uri: `data:image/png;base64,${userStore.userPicture}` }
              : images.icon_user,
          }}
          right={{
            icon: images.icon_plus,
            onPress: () => this.onAdd(),
            style: styles.add,
          }}
        />
        <View style={{ flex: 1, padding: 10 }}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
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
              ANNOUNCEMENTS
            </Text>
          </TouchableOpacity>

          {this.state.loading ? (
            <ListLoading
              style={{ backgroundColor: "white" }}
              message="Loading Announcements"
            />
          ) : (
            <AnnouncementItems data={this.state.announcements} />
          )}
        </View>
        <Toast
          ref="errorToast"
          style={{ backgroundColor: Colors.lightRed }}
          position="top"
          positionValue={32}
          textStyle={{ color: Colors.white }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    color: Colors.lightGreyColor,
    fontWeight: "bold",
    fontSize: 12,
  },
  add: {
    height: 24,
    width: 24,
    tintColor: Colors.white,
  },
});
