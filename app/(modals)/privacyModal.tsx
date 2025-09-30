import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { scale } from '@/utils/styling'
import { useRouter } from 'expo-router'
import React from 'react'
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

const PrivacyPolicyModal = () => {
  const router = useRouter();

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title="Privacy Policy"
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />

        {/* Isi Privacy Policy */}
        <ScrollView contentContainerStyle={styles.content}>
          <Typo fontWeight="700" size={18} color={colors.neutral100}>
            Money Tracker App
          </Typo>

          <Typo color={colors.neutral200}>
            Money Tracker App itu adalah aplikasi pencatat keuangan pribadi.
            Fungsinya untuk membantu pengguna melacak pemasukan (income) dan 
            pengeluaran (expense) supaya bisa lebih mudah mengatur keuangan.
          </Typo>

          <Typo fontWeight="700" color={colors.neutral100}>
            Fitur Utama:
          </Typo>

          <Typo color={colors.neutral200}>
            • Catat Utilities (transaksi harian) → misalnya bayar wifi, bayar listrik, bayar kos.{"\n\n"}
            • Kategorisasi transaksi → contoh: makanan, transportasi, tagihan, hiburan.{"\n\n"}
            • Ringkasan keuangan → laporan bulanan atau mingguan tentang berapa banyak uang masuk & keluar.{"\n\n"}
            • Grafik/visualisasi → biar gampang lihat pola keuangan.{"\n\n"}
            • Budgeting → bikin batas pengeluaran per kategori biar nggak boros.
          </Typo>

          <Typo fontWeight="700" color={colors.neutral100}>
            Semoga Kita Sehat Selalu
          </Typo>

          <TouchableOpacity onPress={() => Linking.openURL("https://wisnuibnu-dev.vercel.app/")}>
            <Typo style={{ color: colors.primaryLight }}>wisnuibnu-dev.vercel.app</Typo>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button onPress={() => router.back()} style={{ flex: 1 }}>
          <Typo color={colors.black} fontWeight="700">
            Tutup
          </Typo>
        </Button>
      </View>
    </ModalWrapper>
  )
}

export default PrivacyPolicyModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._30,
  },
  content: {
    gap: spacingY._20,
    marginTop: spacingY._10,
    paddingBottom: spacingY._25
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
})
