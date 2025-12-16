import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { hashPin, generateSalt } from '@/lib/crypto';
import SignupStep1 from './signup/SignupStep1';
import SignupStep2 from './signup/SignupStep2';
import SignupStep3 from './signup/SignupStep3';

interface SignupData {
  fullName: string;
  phone: string;
  password: string;
  pin?: string;
}

export default function Signup() {
  const [step, setStep] = useState(1);
  const [signupData, setSignupData] = useState<SignupData>({
    fullName: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStep1Complete = (data: { fullName: string; phone: string; password: string }) => {
    setSignupData(prev => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleStep2Complete = (pin: string) => {
    setSignupData(prev => ({ ...prev, pin }));
    setStep(3);
  };

  const handleStep3Complete = async (photoFile: File) => {
    setLoading(true);

    try {
      const phoneClean = signupData.phone.replace(/[^0-9]/g, '');
      const email = `${phoneClean}@firstpay.user`;
      const redirectUrl = `${window.location.origin}/dashboard`;

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signupData.fullName,
            phone_number: phoneClean,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('An account with this phone number already exists');
        } else {
          toast.error(authError.message);
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error('Failed to create account');
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      // 2. Upload identity photo
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${userId}/identity.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('identity-photos')
        .upload(fileName, photoFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Photo upload error:', uploadError);
        // Continue anyway - photo is optional for MVP
      }

      // 3. Hash the PIN securely with unique salt
      const pinSalt = signupData.pin ? generateSalt() : null;
      const hashedPin = signupData.pin && pinSalt ? await hashPin(signupData.pin, pinSalt) : null;

      // 4. Create profile with hashed PIN and salt
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: signupData.fullName,
          phone_number: phoneClean,
          pin_hash: hashedPin,
          pin_salt: pinSalt,
          identity_photo_url: uploadError ? null : fileName,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast.error('Account created but profile setup failed. Please contact support.');
        navigate('/dashboard');
        return;
      }

      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return <SignupStep1 onNext={handleStep1Complete} />;
  }

  if (step === 2) {
    return <SignupStep2 onNext={handleStep2Complete} onBack={() => setStep(1)} />;
  }

  return (
    <SignupStep3 
      onComplete={handleStep3Complete} 
      onBack={() => setStep(2)} 
      loading={loading}
    />
  );
}
