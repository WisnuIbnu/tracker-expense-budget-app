import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import ImageUpload from '@/components/ImageUpload'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { expenseCategories, transactionTypes } from '@/constants/data'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import useFetchData from '@/hooks/useFetchData'
import { TransactionType, WalletType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { orderBy, where } from 'firebase/firestore'
import * as Icons from 'phosphor-react-native'
import React, { useState } from 'react'
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'

const TransactionModal = () => {

  const { user } = useAuth();
  const [transactions, setTransaction] = useState<TransactionType>({
    type: 'expense',
    amount: 0,
    description: "",
    category: "",
    date : new Date(),
    walletId: "",
    image: null
  })

  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const router = useRouter();

  const {
    data: wallet,
    error: walletError,
    loading: walletLoading,
  } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc")
  ]);

  const oldTransaction: {name: string, image: string, id: string} = useLocalSearchParams();

  const onDateChange = (event: any, selectedDate : any) => {
    const currentDate = selectedDate || transactions.date;
    setTransaction({...transactions, date:currentDate});
    setShowDatePicker(false)
  }

  // useEffect(()=> {
  //   if(oldTransaction?.id){
  //     setTransaction({
  //       name: oldTransaction?.name,
  //       image: oldTransaction?.image
  //     })
  //   }
  // }, [])

  const onSubmit = async () => {
  //   let {name, image} = transactions;
  //   if(!name.trim() || !image){
  //     Alert.alert("Wallet", "Please fill all the fields")
  //     return
  //   }

  //   const data: any = {
  //     name,
  //     uid: user?.uid,
  //   };
  //   if (oldTransaction?.id) data.id = oldTransaction?.id;

  //   // hanya tambah image kalau user benar2 pilih file baru
  //   if (wallet.image && typeof wallet.image !== 'string') {
  //     data.image = wallet.image;
  //   }

  //   // const data: WalletType ={
  //   //   name,
  //   //   image,
  //   //   uid: user?.uid
  //   // };
  //   // todo: include wallet id if update
  //   if(oldTransaction?.id) data.id = oldTransaction?.id;
     
  //   setLoading(true)
  //   const res = await createOrUpdateWallet(data);
  //   setLoading(false)
  //   console.log('result: ', res)
  //   if(res.success){
  //     router.back();

  //   } else{
  //     Alert.alert("Wallet", res.msg)
  //   }

  // }

  // const onDelete = async ()=> {
  //   if(!oldTransaction?.id) return;
  //   setLoading(true);
  //   const res = await deleteWallet(oldTransaction?.id);
  //   setLoading(false);
  //   if (res.success) {
  //     router.back();
  //   } else{
  //     Alert.alert("Wallet", res.msg)
  //   }
  }

  const showDeleteAlert = () => {
    Alert.alert(
      "Confirm",
      "Are you sure delete this wallet? \nThis action will remove all transactions related with this wallet",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel delete"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => onDelete(),
          style: "destructive",
        },
      ],
    );
  };

   const data = [
        {label: 'Item 1', value: '1'},
        {label: 'Item 2', value: '2'},
        {label: 'Item 3', value: '3'},
        {label: 'Item 4', value: '4'},
        {label: 'Item 5', value: '5'},
        {label: 'Item 6', value: '6'},
        {label: 'Item 7', value: '7'},
        {label: 'Item 8', value: '8'},
    ];

    const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false);

    const renderLabel = () => {
      if(value || isFocus) {
        return (
          <Typo>Dropdown Label</Typo>
        )
      }
    }
  return (
    <ModalWrapper>
        <View style={styles.container}>
          <Header 
            title={oldTransaction?.id ? "Update Transaction" : "New Transaction"} 
            leftIcon={<BackButton/>} style={{ marginBottom: spacingY._10 }} />

          {/* Form Update Data */}
          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            {/* transaction type */}
            <View style={styles.inputContainer}>
              <Typo color={colors.neutral200}>Type</Typo>
                {/* Dropdow  */}
                <Dropdown 
                  style={styles.dropdownContainer}
                  activeColor={colors.neutral700}
                  // placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  iconStyle={styles.dropdownIcon}
                  data={transactionTypes}
                  maxHeight={300}
                  labelField='label'
                  valueField='value'
                  itemTextStyle={styles.dropdownItemText}
                  itemContainerStyle={styles.dropdownItemContainer}
                  containerStyle={styles.dropdownListContainer}
                  // placeholder={isFocus ? "Selected" : " ..."}
                  value={transactions.type}
                  onChange={(item) => {
                    setTransaction({...transactions, type: item.value})
                  }}
                />
            </View>
            {/* Type Wallet */}
            <View style={styles.inputContainer}>
              <Typo color={colors.neutral200}>Wallet</Typo>
                {/* Dropdow  */}
                <Dropdown 
                  style={styles.dropdownContainer}
                  activeColor={colors.neutral700}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  iconStyle={styles.dropdownIcon}
                  data={wallet.map((wallet)=>({
                    label: `${wallet?.name} ($${wallet.amount})`,
                    value: wallet?.id
                  }))}
                  maxHeight={300}
                  labelField='label'
                  valueField='value'
                  itemTextStyle={styles.dropdownItemText}
                  itemContainerStyle={styles.dropdownItemContainer}
                  containerStyle={styles.dropdownListContainer}
                  placeholder={"Select wallet"}
                  value={transactions.walletId}
                  onChange={(item) => {
                    setTransaction({...transactions, walletId: item.value || ""})
                  }}
                />
            </View>

            {/* Expense categories */}
            { transactions.type == 'expense' && (
                <View style={styles.inputContainer}>
                  <Typo color={colors.neutral200}>Expense Categories</Typo>
                    {/* Dropdow  */}
                    <Dropdown 
                      style={styles.dropdownContainer}
                      activeColor={colors.neutral700}
                      placeholderStyle={styles.dropdownPlaceholder}
                      selectedTextStyle={styles.dropdownSelectedText}
                      iconStyle={styles.dropdownIcon}
                      data={Object.values(expenseCategories)}
                      maxHeight={300}
                      labelField='label'
                      valueField='value'
                      itemTextStyle={styles.dropdownItemText}
                      itemContainerStyle={styles.dropdownItemContainer}
                      containerStyle={styles.dropdownListContainer}
                      placeholder={"Select category"}
                      value={transactions.category}
                      onChange={(item) => {
                        setTransaction({...transactions, category: item.value || ""})
                      }}
                    />
                </View>
              )}

              {/* date picker */}

              <View style={styles.inputContainer}>
                <Typo color={colors.neutral200}>Date</Typo>
                {
                  !showDatePicker && (
                    <Pressable
                      style={styles.dateInput}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Typo size={14}>
                        {(transactions.date as Date).toLocaleString()}
                      </Typo>
                    </Pressable>
                  )
                }

                {
                  showDatePicker && (
                    <View style={Platform.OS == 'ios' && styles.iosDatePicker}>
                      <DateTimePicker
                        themeVariant='dark'
                        value={transactions.date as Date}
                        textColor={colors.white}
                        mode='date'
                        display='spinner'
                        onChange={onDateChange}
                      />
                    </View>
                  )
                }
              </View>
            
            <View style={styles.inputContainer}>
              <Typo color={colors.neutral200}>Wallet Icons</Typo>
                <ImageUpload 
                  file={transactions.image}
                  onClear={()=> setTransaction({...transactions, image: null})} 
                  onSelect={file=> setTransaction({...transactions, image: file})}  
                  placeholder='Upload Image'/>
            </View>
          </ScrollView>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {
            oldTransaction?.id && !loading && (
              <Button
              onPress={showDeleteAlert}
                style={{ 
                  backgroundColor: colors.rose,
                  paddingHorizontal: spacingX._15
                 }}
              >
                <Icons.TrashIcon
                  color={colors.white}
                  size={verticalScale(24)}
                  weight='bold'
                />
              </Button>
            )
          }
          <Button onPress={onSubmit} loading={loading} style={{ flex: 1 }}>
            <Typo color={colors.black} fontWeight={'700'}>
              {oldTransaction?.id ? "Update Wallet" : "Add Wallet"}
            </Typo>
          </Button>
        </View>
    </ModalWrapper>
  )
}

export default TransactionModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingY._20,
    paddingVertical: spacingY._30,
  },
  form:{
    gap: spacingY._20,
    paddingVertical: spacingY._15,
    paddingBottom: spacingY._40
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
  inputContainer: {
    gap: spacingY._10
  },
  iosDropDown:{
    flexDirection: 'row',
    height: verticalScale(54),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    fontSize: verticalScale(14),
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: 'continuous',
    paddingHorizontal: spacingX._15,
  },
  androidDropDown:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    fontSize: verticalScale(14),
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: 'continuous',
    paddingHorizontal: spacingX._15,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._5,
  },
  dateInput:{
    flexDirection: 'row',
    height: verticalScale(54),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: 'continuous',
    paddingHorizontal: spacingX._15
  },
  iosDatePicker:{
    // backgroundColor: 'red'
  },
  datePickerButton: {
    backgroundColor: colors.neutral700,
    alignSelf: 'flex-end',
    padding: spacingY._7,
    marginRight: spacingX._7,
    paddingHorizontal: spacingY._15,
    borderRadius: radius._10
  },
  dropdownContainer:{
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    borderCurve: 'continuous'
  },
  dropdownItemContainer:{
  borderRadius: radius._15,
    marginHorizontal: spacingX._7,
  },
  dropdownItemText:{
    color: colors.white
  },
  dropdownSelectedText:{
    color: colors.white,
    fontSize: verticalScale(14)
  },
  dropdownListContainer: {
    backgroundColor: colors.neutral900,
    borderRadius: radius._15,
    borderCurve: 'continuous',
    paddingVertical: spacingY._7,
    top:5,
    borderColor: colors.neutral500,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  dropdownPlaceholder:{
    color: colors.white
  },
  dropdownIcon:{
    height: verticalScale(30),
    tintColor: colors.neutral300
  }
})