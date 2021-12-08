import React, { Component } from "react";
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import RNFetchBlob from "rn-fetch-blob";
import * as mime from "react-native-mime-types";
import { BubblesLoader } from "react-native-indicator";

import generalStyles from "../constants/styles";

import Colors from "../constants/colors";
import images from "@assets/images";
import {
  getAttachmentFileName,
  getAttachmentFileAddress,
  checkFileExists,
} from "../utils";

let { width } = Dimensions.get("window");

class AttachmentsItem extends Component {
  constructor() {
    super();
    this.downloadTask = null;
    this.state = {
      progress: 0,
      done: false,
      downloading: false,
    };
  }

  componentDidMount() {
    this.setFileExistanceInStorage();
  }

  async setFileExistanceInStorage() {
    const { source, attachment } = this.props;
    const exist = await checkFileExists(attachment, source);
    this.setState({ done: exist });
  }

  setProgress(progress) {
    this.setState({ progress });
  }

  setDownloadTask(task) {
    this.downloadTask = task;
  }

  onDownloadingStart() {
    const {
      source,
      attachment,
      attachment: { id: attachmentId },
      onDownload,
    } = this.props;
    const fileName = getAttachmentFileName(attachment, source);
    this.setState({ downloading: true });
    this.props.onDownload(
      attachmentId,
      fileName,
      () => this.onDownloadingEnd(),
      () => this.onDownloadingCancel(false),
      (progress) => this.setProgress(progress),
      (task) => this.setDownloadTask(task)
    );
  }

  onDownloadingCancel(userInteraction = false) {
    if (userInteraction) {
      const self = this;
      const { source, attachment } = this.props;
      const fileAddress = getAttachmentFileAddress(attachment, source);
      if (!!this.downloadTask) {
        this.downloadTask.cancel((err) => {
          if (!err) {
            setTimeout(async function () {
              self.setState({ downloading: false, progress: 0, done: false });
              await RNFetchBlob.fs.unlink(fileAddress);
            }, 200);
          }
        });
      }
    } else {
      this.setState({ downloading: false, progress: 0, done: false });
    }
  }

  onDownloadingEnd() {
    this.setState({ done: true, downloading: false, progress: 100 });
  }

  onOpenFile() {
    console.warn("here");
    const { source, attachment, showErrorToast } = this.props;
    const fileAddress = getAttachmentFileAddress(attachment, source);
    console.warn(fileAddress);
    const mimeType = mime.lookup(attachment.fileName);
    console.warn(mimeType);
    if (!mimeType) {
      showErrorToast("Please review this form on web application!");
      return;
    }
    if (Platform.OS === "ios") {
      const address = fileAddress.replace("file://", "");
      RNFetchBlob.ios.openDocument(fileAddress.replace("file://", ""));
    } else {
      RNFetchBlob.android.actionViewIntent(fileAddress, mimeType);
    }
  }

  render() {
    const { source, attachment, onDownload, fullWidth } = this.props;
    const { downloading, done, progress } = this.state;

    console.warn(fullWidth);
    console.warn(attachment);
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 8,
          marginVertical: 8,
          width: fullWidth ? width / 1.2 : width / 2,
          borderRadius: 4,
          backgroundColor: "#EBEDEF",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            marginEnd: 8,
          }}
        >
          <Image
            style={{
              width: 16,
              height: 16,
              resizeMode: "contain",
              marginEnd: 4,
            }}
            source={images.icon_attachment}
          />
          <Text
            style={[
              generalStyles.englishText,
              { fontSize: 12, color: Colors.textLightColor },
            ]}
            numberOfLines={1}
          >
            {attachment.fileName}
          </Text>
        </View>

        {this.state.downloading && (
          <BubblesLoader color="#1F4466" size={10} dotRadius={2} />
        )}
        <TouchableOpacity
          style={{ paddingHorizontal: 8, paddingVertical: 4 }}
          onPress={() => {
            if (done) {
              this.onOpenFile();
            } else if (downloading) {
              this.onDownloadingCancel(true);
            } else {
              this.onDownloadingStart();
            }
          }}
        >
          <Icon
            name={done ? "folder" : downloading ? "cancel" : "get-app"}
            style={{ fontSize: 18, color: Colors.textLightColor }}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

export default AttachmentsItem;
