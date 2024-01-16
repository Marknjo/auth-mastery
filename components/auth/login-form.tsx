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
import { LoginSchema, TLoginSchema } from '@/schemas';
import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';
import FormError from '@/components/form-error';
import FormSuccess from '@/components/form-success';
import { login } from '@/actions/login';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const searchParams = useSearchParams();
  const urlError =
    searchParams.get('error') === 'OAuthAccountNotLinked'
      ? 'Email already in user with another provider!'
      : '';
  const callbackUrl = searchParams.get('callbackUrl');

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');

  const [isPending, startTransition] = useTransition();

  const form = useForm<TLoginSchema>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = (values: TLoginSchema) => {
    startTransition(() => {
      login(values, callbackUrl)
        .then((data) => {
          setShowTwoFactor(showTwoFactor);

          if (data?.error) {
            setError(data?.error);
          }

          if (data?.success) {
            setSuccess(data?.success);
            form.reset();
          }

          if (data?.twoFactor) {
            setShowTwoFactor(true);
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
      headerLabel='Welcome Back'
      backButtonLabel="Don't have an account?"
      backButtonHref='/auth/register'
      showSocial>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          <div className='space-y-4'>
            {showTwoFactor || (
              <>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='john.doe@example.com'
                          type='email'
                          required
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      <Button
                        size='sm'
                        variant='link'
                        className='px-0 font-normal'
                        asChild>
                        <Link href='/auth/reset'>Forgot Password?</Link>
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {showTwoFactor && (
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='123456'
                        type='text'
                        required
                        maxLength={6}
                        minLength={6}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <FormError message={urlError || error} />
          <FormSuccess message={success} />

          <Button type='submit' disabled={isPending} className='w-full'>
            {showTwoFactor ? 'Confirm' : 'Login'}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
export default LoginForm;
