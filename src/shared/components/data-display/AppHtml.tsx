import React from 'react'
import { useWindowDimensions, View } from 'react-native'
import RenderHtml from 'react-native-render-html'
import { lightSemanticColors } from '@/shared/theme/semantic/colors'
import { AppText } from '../primitives/AppText'

export interface AppHtmlProps {
  content?: string | null
  contentWidth?: number
}

const tagsStyles = {
  p: {
    marginTop: 0,
    marginBottom: 8,
    fontSize: 16,
    lineHeight: 24,
    color: lightSemanticColors.foreground,
  },
  span: {
    fontSize: 16,
    lineHeight: 24,
    color: lightSemanticColors.foreground,
  },
  img: {
    marginVertical: 6,
    borderRadius: 8,
  },
}

export function AppHtml({ content, contentWidth }: AppHtmlProps) {
  const { width } = useWindowDimensions()
  const renderWidth = contentWidth || width - 32

  if (!content) return null

  // If simple text without HTML tags, render via AppText directly
  const hasHtml = /<[a-z][\s\S]*>/i.test(content)
  if (!hasHtml) {
    return <AppText variant="body">{content}</AppText>
  }

  return (
    <View className="w-full">
      <RenderHtml
        contentWidth={renderWidth}
        source={{ html: content }}
        tagsStyles={tagsStyles}
      />
    </View>
  )
}
