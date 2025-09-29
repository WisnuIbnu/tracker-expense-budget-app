import BackButton from '@/components/BackButton'
import Header from '@/components/Header'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import TransactionList from '@/components/TransactionList'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import useFetchData from '@/hooks/useFetchData'
import { TransactionType } from '@/types'
import { verticalScale } from '@/utils/styling'
import { orderBy, where } from 'firebase/firestore'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

const SearchModal = () => {

  const {user} = useAuth();
  const [search, setSearch] = useState("");

  const { 
    data: allTransactions, 
    loading: loadingtransaksi, 
    } = useFetchData<TransactionType>( "transactions", user?.uid ? [where("uid", "==", user.uid), 
    orderBy("date", "desc")] : []
  );

  const filteredTranscation = allTransactions.filter((item) => {
    if(search.length > 1){
      if(
        item.category?.toLowerCase().includes(search?.toLowerCase()) || 
        item.type?.toLowerCase().includes(search?.toLowerCase()) || 
        item.description?.toLowerCase().includes(search?.toLowerCase())
      ){
        return true;
      }
      return false;
    }
    return true;
  })

  return (
    <ModalWrapper style={{ backgroundColor: colors.neutral900 }}>
        <View style={styles.container}>
          <Header 
            title={"Search"} 
            leftIcon={<BackButton/>} style={{ marginBottom: spacingY._10 }} />

          {/* Form Update Data */}
          <ScrollView contentContainerStyle={styles.form}>
            <View style={styles.inputContainer}>
              <Typo color={colors.neutral200}>Wallet Name</Typo>
              <Input
                placeholder='Shoes..'
                value={search}
                containerStyle={{ backgroundColor: colors.neutral800 }}
                placeholderTextColor={colors.neutral400}
                onChangeText={(value) => setSearch(value)
                 }
              />
            </View>

            <View>
              <TransactionList
                loading={loadingtransaksi}
                data={filteredTranscation}
                emptyListMessage='No transactions match to this keyword'
              />
            </View>
          </ScrollView>
        </View>
    </ModalWrapper>
  )
}

export default SearchModal

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
  form: {
    gap: spacingY._30,
    marginTop:spacingY._15,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center'
  },
  inputContainer: {
    gap: spacingY._10
  }   
})