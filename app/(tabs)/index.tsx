import Header from '@/components/Header'
import ScreenWrapper from '@/components/ScreenWrapper'
import { useAuth } from '@/contexts/authContext'
import React from 'react'
import { StyleSheet } from 'react-native'

const Home = () => {

  const {user} = useAuth();

  // console.log('user: ', user);
  // const handleLogout = async () => {
  //   await signOut(auth);
  // }
  return (
    <ScreenWrapper>
      <Header title='Home' />
      {/* <Button onPress={handleLogout}>
        <Typo color={colors.black}>Logout</Typo>
      </Button> */}
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({})