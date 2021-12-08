import React, { Component } from "react";
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-easy-toast";

import generalStyles from "../constants/styles";

import { Header, ToastView, AttachmentItem } from "@components";
import Colors from "../constants/colors";
import images from "@assets/images";
import { downloadAttachmentQuery } from "../network/queries";
import { userStore } from "../stores";

let { width, height } = Dimensions.get("window");

const AnnouncementItems = ({ data }) => {
  return <View style={{ flex: 1 }}></View>;
};

export default class Announcement extends Component {
  constructor(props) {
    super(props);
    const { attachments, cartbot } = this.props.navigation.state.params;
    this.attachments = attachments;
    this.cartbot = cartbot;
  }

  onBackPress() {
    this.props.navigation.pop();
  }

  render() {
    console.warn(this.attachments);
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
              Attachemnts
            </Text>
          </TouchableOpacity>

          <FlatList
            data={this.attachments}
            renderItem={({ item: attachment }) => (
              <AttachmentItem
                showErrorToast={(message) => this.showErrorToast(message)}
                source={this.cartbot}
                attachment={attachment}
                fullWidth
                onDownload={(
                  attachmentId,
                  fileName,
                  onDownloadEnd,
                  onDownloadCancel,
                  setProgress,
                  setTask
                ) =>
                  this.onDownloadAttachment(
                    attachmentId,
                    fileName,
                    onDownloadEnd,
                    onDownloadCancel,
                    setProgress,
                    setTask
                  )
                }
              />
            )}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
          />
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

  async onDownloadAttachment(
    attachmentId,
    fileName,
    onDownloadEnd,
    onDownloadCancel,
    setProgress,
    setTask
  ) {
    await this.requestFilePermission();
    await downloadAttachmentQuery(
      attachmentId,
      fileName,
      onDownloadEnd,
      onDownloadCancel,
      setProgress,
      setTask
    );
  }

  showErrorToast(message) {
    this.refs.errorToast.show(<ToastView message={message} />, 2000);
  }

  async requestFilePermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Cool Photo App Camera Permission",
          message:
            "Cool Photo App needs access to your camera " +
            "so you can take awesome pictures.",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the camera");
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {}
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
