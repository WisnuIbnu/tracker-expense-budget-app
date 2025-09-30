import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Input from '@/components/Input'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import { verticalScale } from '@/utils/styling'
import { useRouter } from 'expo-router'
import * as Icons from 'phosphor-react-native'
import { useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'

const Register = () => {

  const router = useRouter();
  const emailRef = useRef("")
  const passwordRef = useRef("")
  const nameRef = useRef("")
  const [isLoading, setIsLoading] = useState(false)
  const { register: registerUser } = useAuth();

  const handleSubmit = async () => {
    if (!emailRef.current || !passwordRef.current || !nameRef.current){
      Alert.alert('Error', 'Harap Mengisi Semua Form')
      return
    }
    setIsLoading(true);
    const res = await registerUser(
      emailRef.current, 
      passwordRef.current, 
      nameRef.current
    );
    setIsLoading(false); 
    console.log('Registration Response:', res)
    if (!res.success) {
      Alert.alert('Register', res.msg);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={28} />

        <View
          style={{gap: 5, marginTop: spacingY._20}}
        >
          <Typo size={30} fontWeight={"800"}>
            Lets
          </Typo>
          <Typo size={30} fontWeight={"800"}>
            Get Started
          </Typo>
        </View>

        {/* <LoginForm /> */}
        <View style={styles.form}>
          <Typo size={16} color={colors.textLighter}>
            Buat akun sekarang untuk melacak semua pengeluaran dan pendapatan Anda.
          </Typo>
          {/* Input */}
          <Input
            placeholder='Ketik Nama Kamu'
            onChangeText={(value: string) => (nameRef.current = value)}
            icon={
              <Icons.User size={20} color={colors.neutral400} />
            }
          />
          <Input
            placeholder='Ketik Email Kamu'
            onChangeText={(value: string) => (emailRef.current = value)}
            icon={
              <Icons.At size={20} color={colors.neutral400} />
            }
          />
          <Input
            placeholder='Ketik Password'
            secureTextEntry
            onChangeText={(value: string) => (passwordRef.current = value)}
            icon={
              <Icons.Lock size={20} color={colors.neutral400} />
            }
          />

          {/* Forgot Password */}

          <Button loading={isLoading} onPress={handleSubmit}>
            <Typo fontWeight={"700"} color={colors.black} size={21}>
              Daftar
            </Typo>
          </Button>
        </View>

        {/* Forget Password */}
        <View
          style={styles.footer}
        >
          <Typo size={15}>Sudah punya akun ?</Typo>
          <Pressable
            onPress={()=> router.navigate('/(auth)/login')}
          >
            <Typo size={15} fontWeight={"700"} color={colors.primary}>
              Login
            </Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Register

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
  },
  welcomeText:  {
    fontSize: verticalScale(30),
    fontWeight: 'bold',
    color: colors.text,
  },
  form: {
    gap: spacingY._15,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    fontWeight: '500',
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    color: colors.text,
    textAlign: 'center',
    fontSize: verticalScale(15),
  },
})