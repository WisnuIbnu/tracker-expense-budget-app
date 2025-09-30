import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import Header from '@/components/Header';
import Input from '@/components/Input';
import ModalWrapper from '@/components/ModalWrapper';
import Typo from '@/components/Typo';

import { colors, spacingX, spacingY } from '@/constants/theme';
import { getExpenseLimit, setExpenseLimit } from '@/services/notificationService';
import { scale } from '@/utils/styling';

const ExpenseLimitModal = () => {
  const [limitInput, setLimitInput] = useState('');
  const [currentLimit, setCurrentLimit] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Format angka ke Rupiah (tanpa desimal)
  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  useEffect(() => {
    const loadLimit = async () => {
      try {
        const limit = await getExpenseLimit();
        setCurrentLimit(limit);
        setLimitInput(limit > 0 ? String(limit) : '');
      } catch (err) {
        console.error('Error getExpenseLimit:', err);
        Alert.alert('Error', 'Gagal memuat batas pengeluaran.');
      }
    };
    loadLimit();
  }, []);

  const handleSaveLimit = async () => {
    const numeric = Number(limitInput.replace(/[^0-9]/g, '')) || 0;

    if (numeric < 0) {
      Alert.alert('Input Tidak Valid', 'Batas pengeluaran harus angka positif.');
      return;
    }

    setLoading(true);
    try {
      await setExpenseLimit(numeric);
      setCurrentLimit(numeric);

      Alert.alert(
        'Berhasil',
        `Batas pengeluaran bulanan berhasil diatur menjadi ${
          numeric > 0 ? formatRupiah(numeric) : 'tidak aktif'
        }.`
      );

      router.back(); 
    } catch (err) {
      console.error('Error setExpenseLimit:', err);
      Alert.alert('Error', 'Gagal menyimpan batas pengeluaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title="Atur Batas"
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />

        <ScrollView contentContainerStyle={styles.form}>
          {/* Tampilan Batas Saat Ini */}
          <Text
            style={[
              { marginBottom: spacingY._10, color: colors.neutral200, fontWeight: '600' },
            ]}
          >
            Batas Saat Ini:{' '}
            <Text
              style={{
                color: currentLimit > 0 ? colors.primary : colors.rose,
                fontWeight: '700',
              }}
            >
              {currentLimit > 0 ? formatRupiah(currentLimit) : 'Tidak Aktif'}
            </Text>
          </Text>

          {/* Input Batas Pengeluaran */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Batas Bulanan (Rp)</Typo>
            <Input
              placeholder="Masukkan Batas Pengeluaran"
              keyboardType="numeric"
              value={limitInput}
              onChangeText={(value) => {
                const numericValue = value.replace(/[^0-9]/g, '');
                setLimitInput(numericValue);
              }}
            />
            <Typo color={colors.neutral500} size={scale(14)}>Untuk Menonaktifikan Batas, Harap Mengisi 0</Typo>
          </View>
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button onPress={handleSaveLimit} loading={loading} style={{ flex: 1 }}>
          <Typo color={colors.black} fontWeight="700">
            Simpan Batas
          </Typo>
        </Button>
      </View>
    </ModalWrapper>
  );
};

export default ExpenseLimitModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._30,
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
    marginTop: spacingY._15,
  },
  inputContainer: {
    gap: spacingY._10,
  },
});
