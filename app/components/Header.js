import React, { Component } from "react";
import {
  View,
  Dimensions,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ifIphoneX, getStatusBarHeight } from "react-native-iphone-x-helper";

import Colors from "../constants/colors";
import images from "@assets/images";

const { width, height } = Dimensions.get("window");

const HeaderChild = ({
  source,
  onPress,
  clickable,
  style = {},
  round = false,
  showLogout,
  onLogout,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!clickable}
    style={{ flexDirection: "row", alignItems: "center" }}
  >
    <Image
      style={[
        {
          height: 36,
          width: 36,
          resizeMode: round ? "cover" : "contain",
          marginHorizontal: 8,
          borderRadius: round ? 18 : 0,
        },
        style,
      ]}
      source={source}
    />
  </TouchableOpacity>
);

export class Header extends React.Component {
  render() {
    const { right, left, rightSecond, rightThird } = this.props;
    return (
      <View style={styles.container}>
        {left ? (
          <HeaderChild
            source={left.icon}
            onPress={left.onPress}
            clickable={!!left.onPress}
            style={left.style}
            round
          />
        ) : (
          <View />
        )}
        <View style={styles.row}>
          {rightThird && 
             <HeaderChild 
             source={rightThird.icon}
             onPress={rightThird.onPress}
             clickable={!!rightThird.onPress}
             style={rightThird.style}
           />}
          {rightSecond && (
            <HeaderChild
              source={rightSecond.icon}
              onPress={rightSecond.onPress}
              clickable={!!rightSecond.onPress}
              style={rightSecond.style}
            />
          )}
          {right ? (
            <HeaderChild
              source={right.icon}
              onPress={right.onPress}
              clickable={!!right.onPress}
              style={right.style}
            />
          ) : (
            <View />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.headerBackgroundColor,
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    ...ifIphoneX(
      {
        paddingTop: getStatusBarHeight() + 16,
      },
      {
        paddingTop: 16,
      }
    ),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Header;
