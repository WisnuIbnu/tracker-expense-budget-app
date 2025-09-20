import { spacingY } from '@/constants/theme'
import { HeaderProps } from '@/types'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import Typo from './Typo'

const Header = ({
  title = "",
  leftIcon,
  style
}: HeaderProps) => {
  return (
    <View style={[styles.container, style]}>
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      {
        title && (
          <Typo
            size={22}
            fontWeight={"600"}
            style={{ 
              textAlign:'center', 
              paddingTop: spacingY._10,
              width : leftIcon ? "100%" : "100%",
            }}
          >
            {title}
          </Typo>
        )
      }
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingTop: spacingY._10
  },
  leftIcon: {
    position: 'absolute',     // selalu menempel kiri
    left: 0,
    paddingTop: spacingY._10
  }
})