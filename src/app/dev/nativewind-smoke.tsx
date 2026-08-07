import React from 'react'
import { View, Text } from 'react-native'

export default function NativeWindSmokeScreen() {
  return (
    <View
      className="
        flex-1
        bg-background
        p-4
      "
    >
      <View
        className="
          flex-row
          items-center
          rounded-lg
          bg-primary
          p-4
        "
      >
        <Text
          className="
            text-lg
            font-bold
            text-primary-foreground
          "
        >
          NativeWind Active
        </Text>
      </View>

      <View
        className="
          mt-4
          rounded-xl
          border
          border-border
          bg-surface
          p-4
        "
      >
        <Text
          className="
            text-foreground
          "
        >
          Smoke Test
        </Text>
      </View>
    </View>
  )
}
