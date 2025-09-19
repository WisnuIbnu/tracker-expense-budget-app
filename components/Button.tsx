import { colors, radius } from '@/constants/theme'
import { CustomButtonProps } from '@/types'
import { verticalScale } from '@/utils/styling'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Loading from './Loading'

const Button = ({
  style,
  onPress,
  children,
  loading = false,
} : CustomButtonProps) => {

  if(loading) {
    return (
     <View style={[styles.button, style, {backgroundColor: 'transparent'}]}>
       {/*  */}
       <Loading />
     </View>
    )
  }
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]} disabled={loading}>
      {children}
    </TouchableOpacity>
  )
}

export default Button

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius._17,
    height: verticalScale(52),
    justifyContent: 'center',
    alignItems: 'center',
    borderCurve: 'continuous',
  }
})