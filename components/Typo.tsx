import { colors } from '@/constants/theme'
import { TypoProps } from '@/types'
import { verticalScale } from '@/utils/styling'
import React from 'react'
import { StyleSheet, Text, TextStyle, View } from 'react-native'

const Typo = ({
  size,
  color = colors.text,
  fontWeight = '400',
  children,
  style,
  textProps = {}
}: TypoProps ) => {

  const texStyle: TextStyle = {
    fontSize: size? verticalScale(size) : verticalScale(18),
    color,
    fontWeight
  }
  return (
    <View>
      <Text style={[texStyle, style]} {...textProps}>{children}</Text>
    </View>
  )
}

export default Typo

const styles = StyleSheet.create({})