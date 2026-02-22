import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, useColorScheme, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import Colors from "@/constants/colors";

// ─── Native (Liquid Glass) Tab Layout ─────────────────────────────────────────

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass" }} />
        <Label>Explore</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="communities">
        <Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
        <Label>Communities</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="directory">
        <Icon sf={{ default: "building.2", selected: "building.2.fill" }} />
        <Label>Directory</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

// ─── Classic Tab Layout ────────────────────────────────────────────────────────

function ClassicTabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";
  const isAndroid = Platform.OS === "android";

  // Memoise screenOptions so the object reference is stable across renders,
  // preventing unnecessary tab bar re-mounts.
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.tabIconDefault,
      tabBarLabelStyle: {
        fontFamily: "Poppins_600SemiBold",
        fontSize: 10,
        letterSpacing: 0.2,
        marginTop: -2,
      },
      tabBarStyle: {
        position: "absolute" as const,
        // iOS uses a BlurView background, so the bar itself must be transparent
        backgroundColor: isIOS
          ? "transparent"
          : isDark
          ? "#000"
          : Colors.tabBar,
        borderTopWidth: isAndroid ? 1 : 0,
        borderTopColor: isAndroid ? Colors.tabBarBorder : undefined,
        elevation: 0,
        // Web needs an explicit height and border
        ...(isWeb
          ? {
              height: 84,
              borderTopWidth: 1,
              borderTopColor: Colors.tabBarBorder,
            }
          : {}),
      },
      tabBarItemStyle: {
        paddingVertical: 4,
      },
      // tabBarBackground must be a *function* that returns a React element (or null)
      tabBarBackground: () => {
        if (isIOS) {
          return (
            <BlurView
              intensity={98}
              tint={isDark ? "dark" : "light"}
              style={[
                StyleSheet.absoluteFill,
                { borderTopWidth: 0.5, borderTopColor: Colors.tabBarBorder },
              ]}
            />
          );
        }
        if (isWeb) {
          return (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark ? "#000" : Colors.tabBar,
                  ...Colors.shadow.medium,
                },
              ]}
            />
          );
        }
        // Android — no custom background (uses tabBarStyle backgroundColor)
        return null;
      },
    }),
    [isDark, isIOS, isWeb, isAndroid],
  );

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Ionicons
                name={focused ? "compass" : "compass-outline"}
                size={23}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: "Community",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={23}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="directory"
        options={{
          title: "Directory",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={21}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Ionicons
                name={focused ? "person-circle" : "person-circle-outline"}
                size={23}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  activeIconWrap: {
    backgroundColor: Colors.primary + "10",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function TabLayout() {
  // isLiquidGlassAvailable() is synchronous — safe to call at render time.
  // Only use NativeTabLayout on iOS 26+ where Liquid Glass is supported.
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}