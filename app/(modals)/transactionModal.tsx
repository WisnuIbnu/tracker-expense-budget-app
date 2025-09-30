import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { expenseCategories, transactionTypes } from '@/constants/data'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import useFetchData from '@/hooks/useFetchData'
import { createOrUpdateTransaction, deleteTransaction } from '@/services/transactionService'
import { TransactionType, WalletType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { orderBy, where } from 'firebase/firestore'
import * as Icons from 'phosphor-react-native'
import React, { useEffect, useState } from 'react'
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'

const TransactionModal = () => {

  const { user } = useAuth();
  const [transaction, setTransaction] = useState<TransactionType>({
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
    } = useFetchData<WalletType>( "wallets", user?.uid ? [where("uid", "==", user.uid), 
    orderBy("created", "desc")] : []
  );

  const oldTransaction: {
    id?: string
    type?: string
    amount?: string
    category?: string
    date?: string
    description?: string
    image?: string
    uid?: string
    walletId?: string
  } = useLocalSearchParams();

  const onDateChange = (event: any, selectedDate : any) => {
    const currentDate = selectedDate || transaction.date;
    setTransaction({...transaction, date:currentDate});
    setShowDatePicker(false)
  }

    useEffect(() => {
      if (oldTransaction?.id) {
        console.log('Editing transaction:', oldTransaction);
        setTransaction({
          type: oldTransaction?.type || 'expense',
          amount: Number(oldTransaction?.amount),
          description: oldTransaction?.description || "",
          category: oldTransaction?.category || "",
          date: oldTransaction?.date ? new Date(oldTransaction.date) : new Date(),
          walletId: oldTransaction?.walletId || oldTransaction?.walletId || "",
          image: oldTransaction?.image || null
        });
      } 
    }, [oldTransaction.id]);

  const onSubmit = async () => {
    const { type, amount, description, category, date, walletId, image } = transaction;

    if (!walletId || !date || !amount || (type === "expense" && !category)) {
      Alert.alert("Transaction", "Please fill all the fields");
      return;
    }

    let transactionData: TransactionType = {
      type,
      amount,
      description,
      category,
      date,
      walletId,
      image: image ? image : null,
      uid: user?.uid
    };


    if (oldTransaction?.id) {
      transactionData.id = oldTransaction.id;
    }

    setLoading(true);
    const res = await createOrUpdateTransaction(transactionData);

    setLoading(false);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Transaction", res.msg || "Something went wrong");
    }
  }
  const onDelete = async () => {
    if(!oldTransaction?.id) return;
    setLoading(true);
    const res = await deleteTransaction(
      oldTransaction?.id, 
      oldTransaction.walletId);
    setLoading(false);
    if (res.success) {
      router.back();
    } else{
      Alert.alert("Transaction", res.msg)
    }
  }

  const showDeleteAlert = () => {
    Alert.alert(
      "Confirm",
      "Apakah Kamu Yakin Ingin Menghapus Transaksi ini?",
      [
        {
          text: "Batal",
          onPress: () => console.log("Cancel delete"),
          style: "cancel",
        },
        {
          text: "Hapus",
          onPress: () => onDelete(),
          style: "destructive",
        },
      ],
    );
  };

  return (
    <ModalWrapper>
        <View style={styles.container}>
          <Header 
            title={oldTransaction?.id ? "Perbarui Transaksi" : "Transaksi Baru"} 
            leftIcon={<BackButton/>} style={{ marginBottom: spacingY._10 }} />

          {/* Form Update Data */}
          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            {/* transaction type */}
            <View style={styles.inputContainer}>
              <Typo color={colors.neutral200} size={16}>Tipe</Typo>
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
                  value={transaction.type}
                  onChange={(item) => {
                    setTransaction({...transaction, type: item.value})
                  }}
                />
            </View>
            {/* Type Wallet */}
            <View style={styles.inputContainer}>
              <Typo color={colors.neutral200} size={16}>Jenis Dompet</Typo>
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
                  placeholder={"Pilih Jenis Dompet"}
                  value={transaction.walletId}
                  onChange={(item) => {
                    setTransaction({...transaction, walletId: item.value || ""})
                  }}
                />
            </View>

            {/* Expense categories */}
            { transaction.type === 'expense' && (
                <View style={styles.inputContainer}>
                  <Typo color={colors.neutral200} size={16}>Kategori Pengeluaran</Typo>
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
                      placeholder={"Pilih Kategori"}
                      value={transaction.category}
                      onChange={(item) => {
                        setTransaction({...transaction, category: item.value || ""})
                      }}
                    />
                </View>
              )}

              {/* date picker */}

              <View style={styles.inputContainer}>
                <Typo color={colors.neutral200} size={16}>Tanggal</Typo>
                {
                  !showDatePicker && (
                    <Pressable
                      style={styles.dateInput}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Typo size={14}>
                        {(transaction.date as Date).toLocaleString()}
                      </Typo>
                    </Pressable>
                  )
                }

                {
                  showDatePicker && (
                    <View style={Platform.OS === 'ios' && styles.iosDatePicker}>
                      <DateTimePicker
                        themeVariant='dark'
                        value={transaction.date as Date}
                        textColor={colors.white}
                        mode='date'
                        display='spinner'
                        onChange={onDateChange}
                      />
                    </View>
                  )
                }
              </View>

              {/* amount */}

            <View style={styles.inputContainer}>
              <Typo color={colors.neutral200} size={16}>Jumlah</Typo>
              <Input
                placeholder='Salary'
                keyboardType='numeric'
                value={transaction.amount.toString()}
                onChangeText={(value) =>
                  setTransaction({...transaction, amount: Number(value.replace(/[^0-9]/g, ""))})
                 }
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.flexRow} >
                <Typo color={colors.neutral200} size={16}>Deskripsi</Typo>
                <Typo color={colors.neutral500} size={14}>(Opsional)</Typo>
              </View>
              <Input
                // placeholder='Salary'
                value={transaction.description}
                multiline
                containerStyle={{ 
                  flexDirection: 'row',
                  height: verticalScale(100),
                  alignItems: 'flex-start',
                  paddingVertical: 15,
                 }}
                onChangeText={(value) =>
                  setTransaction({...transaction, description: value})
                 }
              />
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
              {oldTransaction?.id ? "Perbarui" : "Simpan"}
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