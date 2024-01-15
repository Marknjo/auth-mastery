'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import CardWrapper from '@/components/auth/card-wrapper';
import { NewPasswordSchema, TNewPasswordSchema } from '@/schemas';
import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';
import FormError from '@/components/form-error';
import FormSuccess from '@/components/form-success';
import { newPassword } from '@/actions/new-password';
import { useSearchParams } from 'next/navigation';

function NewPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');

  const [isPending, startTransition] = useTransition();

  const form = useForm<TNewPasswordSchema>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: '',
    },
  });

  const handleSubmit = (values: TNewPasswordSchema) => {
    startTransition(() => {
      newPassword(values, token)
        .then((data) => {
          setError(data?.error);
          setSuccess(data?.success);
          if (data?.success) {
            form.reset();
          }
        })
        .catch(() =>
          setError(
            'Something happened while trying to log you in! Please try again.'
          )
        );
    });
  };

  return (
    <CardWrapper
      headerLabel='Enter a New Password?'
      backButtonLabel='Back to login'
      backButtonHref='/auth/login'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='******'
                      type='password'
                      required
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />

          <Button type='submit' disabled={isPending} className='w-full'>
            Reset Your Password
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
export default NewPasswordForm;
