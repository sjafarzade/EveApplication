import React, { Component } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Platform,
} from "react-native";

const { width, height } = Dimensions.get("window");
import Colors from "../constants/colors";
import images from "@assets/images";
import colors from "../constants/colors";

export default class Search extends Component {
  render() {
    const {
      onChangeText,
      onClear,
      placeholder,
      value,
      style = {},
    } = this.props;
    return (
      <View style={style}>
        <View style={styles.container}>
          <View style={styles.leftContainer}>
            <Image style={styles.image} source={images.icon_search} />
            <TextInput
              onChangeText={onChangeText}
              style={styles.input}
              placeholderTextColor={Colors.lightGreyColor}
              placeholder={placeholder}
              value={value}
              underlineColorAndroid={colors.transparent}
            />
          </View>
          <TouchableOpacity style={{ padding: 8 }} onPress={onClear}>
            <Image style={styles.image} source={images.icon_deny} />
          </TouchableOpacity>
        </View>
        <View style={styles.line} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    flexDirection: "row",
    backgroundColor: Colors.backgroundColor,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Platform.OS == "ios" ? 8 : 2,
  },
  image: {
    height: 12,
    width: 12,
    tintColor: Colors.lightGreyColor,
  },
  leftContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    color: Colors.textDarkColor,
    flex: 1,
    marginStart: 4,
  },
  line: {
    height: 1,
    backgroundColor: Colors.greyBorderColor,
  },
});
