import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { getProfileImage } from '@/services/imageService'
import { UserDataType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import { Image } from 'expo-image'
import * as Icons from 'phosphor-react-native'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

const ProfileModals = () => {

  const [userData, setUserData] = useState<UserDataType>({
    name: "",
    image: null,
  })

  const [loading, setLoading] = useState(false)

  const onsubmit = async ()=>{

  }
  return (
    <ModalWrapper>
        <View style={styles.container}>
          <Header title='Update Profile' leftIcon={<BackButton/>} style={{ marginBottom: spacingY._10 }} />

          {/* Form Update Data */}
          <ScrollView contentContainerStyle={styles.form}>
            <View style={styles.avatarContainer}>
              <Image
                style={styles.avatar}
                source={getProfileImage(userData.image)}
                contentFit='cover'
                transition={100}
              />

              <TouchableOpacity style={styles.editIcon}>
                <Icons.Pencil
                  size={verticalScale(20)}
                  color={colors.neutral800}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Typo color={colors.neutral200}>Name</Typo>
              <Input
                placeholder='Name'
                value={userData.name}
                onChangeText={(value) =>
                  setUserData({...userData, name: value})
                 }
              />
            </View>
          </ScrollView>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Button onPress={onsubmit} loading={loading} style={{ flex: 1 }}>
            <Typo color={colors.black} fontWeight={'700'}>
              Update
            </Typo>
          </Button>
        </View>
    </ModalWrapper>
  )
}

export default ProfileModals

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._30,
  },
  userInfo: {
    marginTop: verticalScale(30),
    alignItems: 'center',
    gap: spacingY._15
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
  form: {
    gap: spacingY._30,
    marginTop:spacingY._15,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center'
  },
  avatar: {
    alignSelf: 'center',
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    // overflow: 'hidden',
    // position: 'relative'
  },  
  inputContainer: {
    gap: spacingY._10
  },
  editIcon: {
    position: 'absolute',
    bottom: spacingY._5,
    right: spacingY._7,
    borderRadius: 100,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: spacingY._7,
  }
   
})