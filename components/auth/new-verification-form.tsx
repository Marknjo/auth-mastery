'use client';

import { BeatLoader } from 'react-spinners';
import CardWrapper from './card-wrapper';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { newVerificationToken } from '@/actions/new-verification';
import FormError from '@/components/form-error';
import FormSuccess from '@/components/form-success';

function NewVerificationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');

  const handleOnSubmit = useCallback(() => {
    if (!token) {
      setError('Verification token missing!');
      return;
    }

    newVerificationToken(token)
      .then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
      })
      .catch((err) => {
        setError('Failed to process token! Please try again.');
      });
  }, [token]);

  useEffect(() => {
    handleOnSubmit();
  }, [handleOnSubmit]);

  return (
    <CardWrapper
      headerLabel='Hug In there! Verifying Your Token'
      backButtonLabel='Back to Login'
      backButtonHref='/auth/login'>
      <div className='flex flex-col items-center w-full justify-center'>
        {!success && !error && <BeatLoader />}

        <FormError message={error} />
        <FormSuccess message={success} />
      </div>
    </CardWrapper>
  );
}
export default NewVerificationForm;
