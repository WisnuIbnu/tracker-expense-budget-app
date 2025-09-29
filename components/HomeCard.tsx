import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import useFetchData from '@/hooks/useFetchData'
import { WalletType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import { orderBy, where } from 'firebase/firestore'
import * as Icons from 'phosphor-react-native'
import React from 'react'
import { ImageBackground, StyleSheet, View } from 'react-native'
import Typo from './Typo'

const HomeCard = () => {

const { user } = useAuth();

const { 
  data: wallets,
  loading: walletLoading,
} = useFetchData<WalletType>(
  "wallets",
  user
    ? [where("uid", "==", user.uid), orderBy("created", "desc")]
    : [] 
);

  const getTotals = ()  => {
    return wallets.reduce((totals: any,item: WalletType ) => {
      totals.balance = totals.balance  + Number(item.amount);
      totals.income = totals.income  + Number(item.totalIncome);
      totals.expense = totals.expense + Number(item.totalExpenses);
      return totals;
    }, {balance:0, income: 0, expense: 0})
  }

  return (
    <ImageBackground
      source={require('../assets/images/card.png')}
      resizeMode='stretch'
      style={styles.bgImage}
    >
      <View style={styles.container}>
        <View>
          {/* Total Balance */}
          <View style={styles.totalBalanceRow}>
            <Typo color={colors.neutral800} size={17}>
              Total Balance
            </Typo>
            <Icons.DotsThreeOutlineIcon
              size={verticalScale(23)}
              color={colors.black}
              weight='fill'
            />
          </View>
          <Typo color={colors.black} size={30} fontWeight={"bold"}>
            {walletLoading? "-----" : new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
          }).format(Number(String(getTotals()?.balance ?? 0).replace(/[^0-9.-]+/g, '')))}
          </Typo>
        </View>

        {/* total expense and income */}
        <View style={styles.stats}>
          {/* Income */}
          <View style={{ gap:verticalScale(5) }}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <Icons.ArrowDownIcon 
                  size={verticalScale(15)}
                  color={colors.black}
                  weight='bold'
                />
              </View>
              <Typo size={16} color={colors.neutral700}>
                Income
              </Typo>
            </View>
            <View style={{ alignSelf: 'center' }}>
              <Typo size={17} color={colors.green} fontWeight={"600"}>
                {walletLoading? "-----" : new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                }).format(Number(String(getTotals()?.income ?? 0).replace(/[^0-9.-]+/g,'')))}
              </Typo>
            </View>
          </View>
          {/* Expense */}
          <View style={{ gap:verticalScale(5) }}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <Icons.ArrowUpIcon
                  size={verticalScale(15)}
                  color={colors.black}
                  weight='bold'
                />
              </View>
              <Typo size={16} color={colors.neutral700}>
                Expense
              </Typo>
            </View>
            <View style={{ alignSelf: 'center' }}>
              <Typo size={17} color={colors.rose} fontWeight={"600"}>
                {walletLoading? "-----" : new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                }).format(Number(String(getTotals()?.expense ?? 0).replace(/[^0-9.-]+/g,'')))}
              </Typo>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  )
}

export default HomeCard

const styles = StyleSheet.create({
  bgImage: {
    height: scale(210),
    width: '100%'
  },
  container: {
    padding: spacingX._20,
    paddingHorizontal: scale(23),
    height: '87%',
    width: '100%',
    justifyContent: 'space-between'
  },
  totalBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._5,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsIcon: {
    backgroundColor: colors.neutral350,
    borderRadius: 50,
    padding: spacingY._5,
  },
  incomeExpense: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingY._7
  }
})